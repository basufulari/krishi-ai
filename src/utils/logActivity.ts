/**
 * Lightweight helper to log a user activity without needing to pass username as a prop.
 * Reads the stored username from AsyncStorage and logs to StorageUserHistory.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageUserHistory, type ActivityType } from './StorageUserHistory';

const USER_KEY = 'krishi_ai_user';

export async function logActivity(
  type: ActivityType,
  label: string,
  meta?: Record<string, string | number | boolean>,
): Promise<void> {
  try {
    const username = await AsyncStorage.getItem(USER_KEY);
    if (!username) return;
    await StorageUserHistory.log(username, type, label, meta);
  } catch {
    // never crash the app for analytics
  }
}
