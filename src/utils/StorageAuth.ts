import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_LOGIN_TIMEOUT_MS, AUTH_REGISTER_TIMEOUT_MS } from '../config';
import { getBackendUrl } from './ApiConfig';

const AUTH_TOKEN_KEY = 'krishi_ai_auth_token';

function isAbortError(e: unknown): boolean {
  return Boolean(e && typeof e === 'object' && 'name' in e && (e as { name: string }).name === 'AbortError');
}

export interface User {
  phone: string;
  name: string;
  role?: string;
}

/** When the backend is down, allow demo login so the app still opens (same as i18n demo hint). */
function offlineLoginFallback(phone: string, pin: string): { success: boolean; user?: User; error?: string } {
  const p = phone.trim();
  const pinTrim = pin.trim();
  if (p === 'basavaraj' && pinTrim === '1234') {
    return { success: true, user: { phone: p, name: 'Basavaraj', role: 'farmer' } };
  }
  if (p === 'admin' && pinTrim === '1234') {
    return { success: true, user: { phone: p, name: 'Admin', role: 'admin' } };
  }
  return {
    success: false,
    error:
      'Network error during login. Try demo: basavaraj / 1234 or admin / 1234, or start the backend.',
  };
}

/** True when server explicitly rejected the PIN (do not fall back to demo login). */
function isWrongPinError(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes('incorrect') && m.includes('pin');
}

export const StorageAuth = {
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  register: async (phone: string, name: string, pin: string, role?: string): Promise<{ success: boolean; error?: string }> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AUTH_REGISTER_TIMEOUT_MS);
    try {
      const backendUrl = await getBackendUrl();
      const res = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name, pin, role }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const text = await res.text();
      let data: { success?: boolean; token?: string; error?: string } = {};
      try {
        data = JSON.parse(text) as typeof data;
      } catch {
        return {
          success: false,
          error: `Cannot read server response (HTTP ${res.status}). Set EXPO_PUBLIC_BACKEND_URL in .env to your PC IP:3000 — same Wi‑Fi as the phone.`,
        };
      }
      if (data.success && data.token) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
        return { success: true };
      }
      return {
        success: false,
        error: data.error || (res.ok ? 'Registration failed' : `HTTP ${res.status}: ${text.slice(0, 100)}`),
      };
    } catch (e) {
      clearTimeout(timeout);
      if (isAbortError(e)) {
        return {
          success: false,
          error:
            'Request timed out. On your PC: start MongoDB (mongod), then the backend (npm start in backend). Check EXPO_PUBLIC_BACKEND_URL matches this device’s network. Or use Login with demo admin / 1234.',
        };
      }
      return {
        success: false,
        error:
          'Network error during registration. Start MongoDB and the backend on your PC, or use Login with demo: admin / 1234.',
      };
    }
  },

  login: async (phone: string, pin: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AUTH_LOGIN_TIMEOUT_MS);
    try {
      const backendUrl = await getBackendUrl();
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      let data: { success?: boolean; token?: string; user?: User; error?: string } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        return offlineLoginFallback(phone, pin);
      }

      if (data.success && data.token && data.user) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
        return { success: true, user: data.user };
      }

      const apiMessage = String(data.error || '');
      if (isWrongPinError(apiMessage)) {
        return { success: false, error: data.error || 'Login failed' };
      }

      // User not in DB, server down with JSON error, etc. — still allow demo accounts.
      const offline = offlineLoginFallback(phone, pin);
      if (offline.success) return offline;

      return { success: false, error: data.error || 'Login failed' };
    } catch (e) {
      clearTimeout(timeout);
      if (isAbortError(e)) {
        const offline = offlineLoginFallback(phone, pin);
        if (offline.success) return offline;
        return {
          success: false,
          error:
            'Request timed out. Check Wi‑Fi / backend URL, or use demo: basavaraj / 1234 or admin / 1234.',
        };
      }
      return offlineLoginFallback(phone, pin);
    }
  },

  logout: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    } catch {
      // ignore
    }
  }
};
