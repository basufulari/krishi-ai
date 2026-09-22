import { Image } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { AppLanguage } from './i18n';
import type { AnalysisResult } from './demoAnalysis';
import { CropId } from './demoAnalysis';
import { AI_ANALYZE_TIMEOUT_MS, AI_API_KEY, AI_API_URL } from './config';

type AnalyzeRequest = {
  cropId?: CropId;
  language: AppLanguage;
  photoUri: string;
  /** Called before upload so UI can show "optimizing photo" vs "analyzing". */
  onProgress?: (phase: 'prepare' | 'upload') => void;
};

/** Longest edge cap — enough for leaf detail, much smaller uploads than full camera resolution. */
const ANALYZE_MAX_EDGE = 1024;
const ANALYZE_JPEG_QUALITY = 0.82;

function guessMimeTypeFromUri(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  return 'image/jpeg';
}

function getFileNameFromUri(uri: string): string {
  const parts = uri.split('/');
  const last = parts[parts.length - 1] || 'crop-photo.jpg';
  return last.includes('.') ? last : `${last}.jpg`;
}

function normalizeConfidence(confidence: unknown): number {
  const n = typeof confidence === 'number' ? confidence : Number(confidence);
  if (!Number.isFinite(n)) return 0.72;
  return n > 1 ? Math.min(1, Math.max(0, n / 100)) : Math.min(1, Math.max(0, n));
}

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (err) => reject(err)
    );
  });
}

/**
 * Resize (if needed) and JPEG-compress before upload — cuts transfer time and Gemini latency.
 */
export async function prepareImageForAnalyze(photoUri: string): Promise<{ uri: string; mimeType: string; fileName: string }> {
  let uri = photoUri;
  try {
    const { width, height } = await getImageSize(photoUri);
    const maxDim = Math.max(width, height);
    if (maxDim > ANALYZE_MAX_EDGE) {
      const action =
        width >= height
          ? ({ resize: { width: ANALYZE_MAX_EDGE } } as const)
          : ({ resize: { height: ANALYZE_MAX_EDGE } } as const);
      const out = await ImageManipulator.manipulateAsync(photoUri, [action], {
        compress: ANALYZE_JPEG_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      uri = out.uri;
    } else {
      const out = await ImageManipulator.manipulateAsync(photoUri, [], {
        compress: ANALYZE_JPEG_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      uri = out.uri;
    }
  } catch {
    const out = await ImageManipulator.manipulateAsync(photoUri, [{ resize: { width: ANALYZE_MAX_EDGE } }], {
      compress: ANALYZE_JPEG_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    uri = out.uri;
  }

  return {
    uri,
    mimeType: 'image/jpeg',
    fileName: 'crop-analyze.jpg',
  };
}

function isAbortError(e: unknown): boolean {
  return Boolean(e && typeof e === 'object' && 'name' in e && (e as { name: string }).name === 'AbortError');
}

export async function analyzeCropWithApi(req: AnalyzeRequest): Promise<AnalysisResult> {
  if (!AI_API_URL) {
    throw new Error('AI_API_URL_NOT_CONFIGURED');
  }

  req.onProgress?.('prepare');
  const { uri, mimeType, fileName } = await prepareImageForAnalyze(req.photoUri);

  const form = new FormData();
  if (req.cropId) form.append('cropId', req.cropId);
  form.append('language', req.language);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form.append('image', { uri, name: fileName, type: mimeType } as any);

  const headers: Record<string, string> = {};
  if (AI_API_KEY) headers['Authorization'] = `Bearer ${AI_API_KEY}`;

  req.onProgress?.('upload');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_ANALYZE_TIMEOUT_MS);

  try {
    const res = await fetch(AI_API_URL, {
      method: 'POST',
      headers,
      body: form,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`AI_API_ERROR_${res.status}:${text}`);
    }

    const data = (await res.json().catch(() => ({}))) as any;

    const plantName: string | undefined =
      data.plantName ?? data.detectedCropName ?? data.cropName ?? data.crop_name ?? data.crop?.name;
    const diseaseId: string = data.diseaseId ?? data.disease_id ?? data.disease?.id ?? data.disease_name?.id ?? '';
    const diseaseName: string | undefined = data.diseaseName ?? data.disease_name ?? data.disease?.name ?? data.disease?.label;
    const preventionText: string | undefined = data.prevention ?? data.preventionText ?? data.prevention_text;
    const stepsText: string | undefined = data.steps ?? data.stepsText ?? data.steps_text;

    const confidence = normalizeConfidence(data.confidence ?? data.confidence_score ?? data.score);

    return {
      cropId: req.cropId || 'rice',
      diseaseId: diseaseId || 'unknown',
      plantName,
      diseaseName,
      confidence,
      preventionText,
      stepsText,
    };
  } catch (e) {
    clearTimeout(timeout);
    if (isAbortError(e)) {
      throw new Error('AI_ANALYZE_TIMEOUT');
    }
    throw e;
  }
}
