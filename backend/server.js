import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import dns from 'node:dns';
import authRoutes from './routes/auth.js';
import communityRoutes from './routes/community.js';
import alertsRoutes from './routes/alerts.js';
import adminRoutes from './routes/admin.js';

dotenv.config();
// On some Windows networks, Node's default DNS resolver fails SRV lookups for Atlas.
// Use public resolvers to make mongodb+srv URI resolution reliable.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();
app.use(cors());

// Multer keeps the uploaded file in memory so we can send bytes to Gemini.
const upload = multer({ storage: multer.memoryStorage() });

// Connect to MongoDB (fail faster when mongod is not running — avoids long hangs on register/login)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krishiapp';
mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  })
  .then(() => console.log('Connected to MongoDB via mongoose'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Register Routes
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/posts', communityRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || '';
const CHAT_MAX_HISTORY = process.env.CHAT_MAX_HISTORY ? Number(process.env.CHAT_MAX_HISTORY) : 8;

if (!GEMINI_API_KEY) {
  // Don't crash immediately; we return a clear message on request.
  console.warn('WARN: GEMINI_API_KEY is not set in backend/.env');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const chatModelCache = new Map();
const DEFAULT_GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-flash-latest'];
const GEMINI_COOLDOWN_MS = process.env.GEMINI_COOLDOWN_MS ? Number(process.env.GEMINI_COOLDOWN_MS) : 60_000;
let geminiCooldownUntil = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableGeminiStatus(status) {
  return [429, 500, 502, 503, 504].includes(Number(status));
}

function isGeminiCoolingDown() {
  return Date.now() < geminiCooldownUntil;
}

function getGeminiRetryAfterSeconds() {
  const leftMs = Math.max(0, geminiCooldownUntil - Date.now());
  return Math.max(1, Math.ceil(leftMs / 1000));
}

function openGeminiCooldown() {
  geminiCooldownUntil = Date.now() + GEMINI_COOLDOWN_MS;
}

function extractJson(text) {
  const raw = String(text || '').trim();

  // 1) Common Gemini format: ```json ... ```
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    const fencedInner = fenced[1].trim();
    try {
      return JSON.parse(fencedInner);
    } catch {
      // Fall through to brace extraction.
    }
  }

  // 2) Try to find a JSON object block inside any surrounding text.
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const maybe = raw.slice(firstBrace, lastBrace + 1);
    return JSON.parse(maybe);
  }

  // 3) Final attempt: parse as-is.
  try {
    return JSON.parse(raw);
  } catch (e) {
    // Bubble up with more context; the caller will catch and return INTERNAL_ERROR.
    throw new Error(`JSON_PARSE_FAILED:${String(e?.message || e)}`);
  }
}

function normalizeConfidence(confidence) {
  const n = typeof confidence === 'number' ? confidence : Number(confidence);
  if (!Number.isFinite(n)) return 0.72;
  // Accept 0..1 or 0..100
  const v = n > 1 ? n / 100 : n;
  return Math.min(1, Math.max(0, v));
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'NO_MESSAGE' });
    }

    if (!genAI) {
      return res.status(500).json({ error: 'GEMINI_API_KEY_NOT_SET' });
    }
    if (isGeminiCoolingDown()) {
      const retryAfter = getGeminiRetryAfterSeconds();
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        error: 'GEMINI_RATE_LIMIT',
        message: 'Gemini quota temporarily exhausted. Please retry shortly.',
        retryAfterSeconds: retryAfter,
      });
    }

    const systemInstruction = `You are Krishi AI, an expert agriculture assistant dedicated to helping farmers in India.
You answer questions about:
- Crop cultivation, sowing, harvesting techniques
- Fertilizers, pesticides, and organic farming
- Soil health, irrigation, and water management
- Pest and disease identification and control
- Weather impact on crops
- Government schemes and subsidies for farmers (PM-KISAN, etc.)
- Mandi prices and market advice
- Animal husbandry and dairy farming
- Crop storage and post-harvest management

Always give practical, easy-to-understand advice suitable for farmers.
If asked in Hindi or other Indian languages, respond in that same language.
If the user asks something unrelated to farming/agriculture, politely redirect them by saying you are a Krishi (farming) assistant.
Keep answers concise but complete.`;

    // Keep fallback list short to reduce latency when a model alias fails.
    const candidates = GEMINI_MODEL ? [GEMINI_MODEL] : DEFAULT_GEMINI_MODELS;

    const generationConfig = {
      maxOutputTokens: 512,
      temperature: 0.2,
    };

    const safeHistory = Array.isArray(history) ? history.slice(-CHAT_MAX_HISTORY) : [];

    let responseText = null;
    let lastErr = null;

    for (const modelName of candidates) {
      const maxAttempts = 2;
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          let model = chatModelCache.get(modelName);
          if (!model) {
            model = genAI.getGenerativeModel({ model: modelName, systemInstruction, generationConfig });
            chatModelCache.set(modelName, model);
          }
          const chat = model.startChat({ history: safeHistory });
          const result = await chat.sendMessage(message);
          responseText = result.response.text();
          lastErr = null;
          break;
        } catch (err) {
          lastErr = err;
          const status = Number(err?.status || 0);
          const retryable = isRetryableGeminiStatus(status);
          console.warn(
            'CHAT_MODEL_FAILED',
            modelName,
            `attempt=${attempt}`,
            status || err?.message || err,
          );
          if (retryable && attempt < maxAttempts) {
            await sleep(600 * attempt);
            continue;
          }
          break;
        }
      }
      if (responseText) break;
    }

    if (!responseText) {
      const status = Number(lastErr?.status || 0);
      if (status === 429) {
        openGeminiCooldown();
        const retryAfter = getGeminiRetryAfterSeconds();
        res.set('Retry-After', String(retryAfter));
        return res.status(429).json({
          error: 'GEMINI_RATE_LIMIT',
          message: 'Gemini quota exceeded. Please retry after cooldown.',
          retryAfterSeconds: retryAfter,
        });
      }
      if (status === 503) {
        return res.status(503).json({ error: 'GEMINI_UNAVAILABLE', message: 'Gemini service temporarily unavailable. Retry shortly.' });
      }
      throw lastErr || new Error('GEMINI_CHAT_FAILED');
    }

    return res.json({ response: responseText });
  } catch (err) {
    console.error('CHAT_ERROR', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: String(err?.message || err) });
  }
});

app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    const cropId = String(req.body.cropId || '').trim();
    const language = String(req.body.language || 'en');
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'NO_IMAGE' });
    }

    if (!genAI) {
      return res.status(500).json({ error: 'GEMINI_API_KEY_NOT_SET' });
    }
    if (isGeminiCoolingDown()) {
      const retryAfter = getGeminiRetryAfterSeconds();
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        error: 'GEMINI_RATE_LIMIT',
        message: 'Gemini quota temporarily exhausted. Please retry shortly.',
        retryAfterSeconds: retryAfter,
      });
    }

    const imageBase64 = file.buffer.toString('base64');
    const mimeType = file.mimetype || 'image/jpeg';

    const allowedDiseases = ['healthy', 'powdery_mildew', 'leaf_spot', 'late_blight', 'root_rot', 'yellow_rust', 'unknown'];

    const prompt = `
You are an expert crop disease assistant for farmers.
Analyze the provided crop leaf image and respond with STRICT JSON only (no extra text).

Return exactly this schema:
{
  "isCropImage": boolean,
  "cropImageConfidence": number (0 to 1),
  "detectedCropName": string,
  "detectedCropConfidence": number (0 to 1),
  "diseaseId": one of ${JSON.stringify(allowedDiseases)},
  "diseaseName": string,
  "confidence": number (0 to 1),
  "prevention": string (short, farmer-friendly),
  "steps": string (suggested steps separated by new lines)
}

SelectedCropId (optional): ${cropId || 'not_provided'}
Language requested: ${language}

Important rules:
- First decide if this is truly a crop plant/leaf image.
- If SelectedCropId is missing or wrong, still infer actual crop type and disease from image evidence.
- If image is not a crop plant/leaf (book, person, object, building, unclear, meme, etc):
  - set isCropImage = false
  - set cropImageConfidence appropriately
  - set detectedCropName = "Unknown"
  - set detectedCropConfidence <= 0.2
  - set diseaseId = "unknown"
  - diseaseName = "Not a crop image"
  - confidence <= 0.2
  - prevention/steps should politely ask user to upload a clear crop leaf/plant photo.
- diseaseId must be from the allowed list.
- prevention and steps should be in the requested language when possible.
- If no obvious disease is detected, use diseaseId = "healthy".
    `.trim();

    // Fewer fallbacks = faster failures; set GEMINI_MODEL in .env to skip probing entirely.
    const candidates = GEMINI_MODEL ? [GEMINI_MODEL] : DEFAULT_GEMINI_MODELS;

    const generationConfig = {
      maxOutputTokens: 768,
      temperature: 0.2,
    };

    let result = null;
    let lastErr = null;

    for (const modelName of candidates) {
      const maxAttempts = 2;
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName, generationConfig });
          result = await model.generateContent([
            { text: prompt },
            { inlineData: { mimeType, data: imageBase64 } },
          ]);
          lastErr = null;
          break;
        } catch (err) {
          lastErr = err;
          const status = Number(err?.status || 0);
          const retryable = isRetryableGeminiStatus(status);
          console.warn(
            'GEMINI_MODEL_FAILED',
            modelName,
            `attempt=${attempt}`,
            status || err?.message || err,
          );
          if (retryable && attempt < maxAttempts) {
            await sleep(600 * attempt);
            continue;
          }
          break;
        }
      }
      if (result) break;
    }

    if (!result) {
      const status = Number(lastErr?.status || 0);
      if (status === 429) {
        openGeminiCooldown();
        const retryAfter = getGeminiRetryAfterSeconds();
        res.set('Retry-After', String(retryAfter));
        return res.status(429).json({
          error: 'GEMINI_RATE_LIMIT',
          message: 'Gemini quota exceeded. Please retry after cooldown.',
          retryAfterSeconds: retryAfter,
        });
      }
      if (status === 503) {
        return res.status(503).json({ error: 'GEMINI_UNAVAILABLE', message: 'Gemini service temporarily unavailable. Retry shortly.' });
      }
      throw lastErr || new Error('GEMINI_GENERATION_FAILED');
    }

    const responseText = result.response.text();
    const parsed = extractJson(responseText);

    const isCropImage = Boolean(parsed.isCropImage);
    const cropImageConfidence = normalizeConfidence(parsed.cropImageConfidence);
    let detectedCropName = String(parsed.detectedCropName || '').trim();
    let detectedCropConfidence = normalizeConfidence(parsed.detectedCropConfidence);
    let diseaseId = String(parsed.diseaseId || '').trim();
    let diseaseName = String(parsed.diseaseName || '').trim();
    let prevention = String(parsed.prevention || '').trim();
    let steps = String(parsed.steps || '').trim();
    let confidence = normalizeConfidence(parsed.confidence);

    // Safety gate: do not force disease prediction on non-crop/random images.
    if (!isCropImage || cropImageConfidence < 0.45) {
      detectedCropName = detectedCropName || 'Unknown';
      detectedCropConfidence = Math.min(detectedCropConfidence || 0.2, 0.2);
      diseaseId = 'unknown';
      diseaseName = diseaseName || 'Not a crop image';
      confidence = Math.min(confidence, 0.2);
      prevention =
        prevention ||
        'Please upload a clear photo of a crop leaf/plant in good lighting. Avoid books, people, or background objects.';
      steps =
        steps ||
        '1) Keep camera close to leaf/plant\n2) Use daylight\n3) Avoid blur\n4) Capture only the crop area';
    }

    if (!diseaseId) {
      return res.status(500).json({ error: 'INVALID_RESPONSE_NO_DISEASE_ID', raw: responseText });
    }

    return res.json({
      diseaseId,
      diseaseName,
      confidence,
      plantName: detectedCropName,
      plantConfidence: detectedCropConfidence,
      prevention,
      steps,
      isCropImage,
      cropImageConfidence,
    });
  } catch (err) {
    console.error('ANALYZE_ERROR', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: String(err?.message || err) });
  }
});

app.get('/', (_req, res) => res.send('Krishi-AI backend running'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend listening on port ${PORT} (LAN: use this PC's IP, e.g. http://192.168.x.x:${PORT})`);
});

