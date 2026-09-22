import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AnalysisResult } from '../demoAnalysis';
import type { AppLanguage } from '../i18n';

export type DiseaseHistoryItem = {
  id: string;
  createdAt: string;
  language: AppLanguage;
  photoUri?: string | null;
  cropId: AnalysisResult['cropId'];
  diseaseId: string;
  confidence: number;
  plantName?: string;
  diseaseName?: string;
  preventionText?: string;
  stepsText?: string;
};

const getKey = (username: string) => `krishi_ai_disease_history_${username}`;

async function readHistory(username: string): Promise<DiseaseHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(getKey(username));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DiseaseHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeHistory(username: string, list: DiseaseHistoryItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(getKey(username), JSON.stringify(list));
  } catch {
    // ignore persistence errors
  }
}

export const StorageDiseaseHistory = {
  getHistory: async (username: string): Promise<DiseaseHistoryItem[]> => {
    return await readHistory(username);
  },

  addHistoryItem: async (username: string, item: DiseaseHistoryItem): Promise<void> => {
    const list = await readHistory(username);
    list.unshift(item);
    await writeHistory(username, list);
  },

  clearHistory: async (username: string): Promise<void> => {
    await writeHistory(username, []);
  },
};

