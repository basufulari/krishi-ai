import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../config';

const BACKEND_URL_KEY = 'krishi_backend_url';

function tidyUrl(input: string): string {
  const raw = String(input || '').trim();
  if (!raw) return '';
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
  return withProtocol.replace(/\/+$/, '');
}

export async function getBackendUrl(): Promise<string> {
  try {
    const saved = await AsyncStorage.getItem(BACKEND_URL_KEY);
    const normalized = tidyUrl(saved || '');
    return normalized || BACKEND_URL;
  } catch {
    return BACKEND_URL;
  }
}

export async function setBackendUrl(next: string): Promise<string> {
  const normalized = tidyUrl(next);
  if (!normalized) {
    await AsyncStorage.removeItem(BACKEND_URL_KEY);
    return BACKEND_URL;
  }
  await AsyncStorage.setItem(BACKEND_URL_KEY, normalized);
  return normalized;
}
