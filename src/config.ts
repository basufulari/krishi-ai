import Constants from 'expo-constants';

function isLikelyLanIPv4(host: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
}

/** Expo Go sets debuggerHost to your PC's LAN IP — use it so the phone hits the same machine as Metro. */
function debuggerHostToLanIp(): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const C = Constants as any;
  const raw =
    C.expoGoConfig?.debuggerHost ||
    C.manifest2?.extra?.expoGo?.debuggerHost ||
    C.manifest?.debuggerHost;
  if (typeof raw !== 'string' || !raw) return undefined;
  const host = raw.split(':')[0]?.trim();
  if (!host || host === 'localhost' || host === '127.0.0.1') return undefined;
  if (!isLikelyLanIPv4(host)) return undefined;
  return host;
}

// Optional: set EXPO_PUBLIC_BACKEND_URL in project root .env — e.g. http://10.0.2.2:3000 (Android emulator → PC).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const envUrl = typeof process !== 'undefined' ? String((process as any).env?.EXPO_PUBLIC_BACKEND_URL || '').trim() : '';

const inferredLan = debuggerHostToLanIp();
const fallbackUrl = 'http://10.21.170.175:3000';

export const BACKEND_URL = envUrl || (inferredLan ? `http://${inferredLan}:3000` : fallbackUrl);
export const AI_API_URL = `${BACKEND_URL}/api/analyze`;
export const CHAT_API_URL = `${BACKEND_URL}/api/chat`;

/** Login: shorter timeout; register hits DB + bcrypt — allow more time. */
export const AUTH_LOGIN_TIMEOUT_MS = 15_000;
export const AUTH_REGISTER_TIMEOUT_MS = 60_000;

// If your backend needs an API key/token, put it here.
// Keep empty if not required.
export const AI_API_KEY = '';

// If AI_API_URL is empty/unconfigured, should we fall back to the demo analyzer?
export const AI_ALLOW_DEMO_FALLBACK = true;

/** Max time for disease analysis (upload + Gemini). Increase on very slow networks. */
export const AI_ANALYZE_TIMEOUT_MS = 120_000;
/** Max wait for chatbot response before showing a timeout message. */
export const CHAT_REQUEST_TIMEOUT_MS = 45_000;

// Weather API (OpenWeatherMap)
export const WEATHER_API_KEY = '31cd32ec61f7d1bbcda435ca9222d3e2';
