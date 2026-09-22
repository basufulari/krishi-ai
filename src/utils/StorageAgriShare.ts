import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockEquipments, type Equipment } from '../data/agriShareData';

const AGI_SHARE_DB_KEY = 'krishi_ai_agri_share_db';

function cloneEquipments(list: Equipment[]): Equipment[] {
  // Avoid mutating the exported mock array.
  return list.map((e) => ({ ...e }));
}

async function readAll(): Promise<Equipment[]> {
  try {
    const raw = await AsyncStorage.getItem(AGI_SHARE_DB_KEY);
    if (!raw) return cloneEquipments(mockEquipments);
    const parsed = JSON.parse(raw) as Equipment[];
    if (!Array.isArray(parsed)) return cloneEquipments(mockEquipments);
    return cloneEquipments(parsed);
  } catch {
    return cloneEquipments(mockEquipments);
  }
}

async function writeAll(list: Equipment[]): Promise<void> {
  try {
    await AsyncStorage.setItem(AGI_SHARE_DB_KEY, JSON.stringify(list));
  } catch {
    // ignore persistence errors for now
  }
}

export const StorageAgriShare = {
  getEquipments: async (): Promise<Equipment[]> => {
    return await readAll();
  },

  addEquipment: async (equipment: Equipment): Promise<void> => {
    const list = await readAll();
    list.unshift(equipment);
    await writeAll(list);
  },

  deleteEquipment: async (equipmentId: string): Promise<void> => {
    const list = await readAll();
    const next = list.filter((e) => e.id !== equipmentId);
    await writeAll(next);
  },

  updateEquipment: async (equipmentId: string, updates: Partial<Equipment>): Promise<void> => {
    const list = await readAll();
    const idx = list.findIndex((e) => e.id === equipmentId);
    if (idx === -1) return;
    list[idx] = { ...list[idx], ...updates, id: list[idx].id };
    await writeAll(list);
  },

  getEquipmentById: async (equipmentId: string): Promise<Equipment | null> => {
    const list = await readAll();
    return list.find((e) => e.id === equipmentId) ?? null;
  },
};

