import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = 'krishi_notifications_db';

export interface AppNotification {
  id: string;
  targetUser: string;
  type: 'COMMENT' | 'SYSTEM';
  message: string;
  timestamp: string;
  isRead: boolean;
}

export const StorageNotifications = {
  getNotifications: async (targetUser: string): Promise<AppNotification[]> => {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (data) {
        const all: AppNotification[] = JSON.parse(data);
        return all.filter(n => n.targetUser === targetUser).sort((a, b) => b.id.localeCompare(a.id)); // sort descending id
      }
      return [];
    } catch {
      return [];
    }
  },

  getUnreadCount: async (targetUser: string): Promise<number> => {
    const list = await StorageNotifications.getNotifications(targetUser);
    return list.filter(n => !n.isRead).length;
  },

  addNotification: async (notification: Omit<AppNotification, 'id' | 'isRead'>): Promise<void> => {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      const all: AppNotification[] = data ? JSON.parse(data) : [];
      
      const newNotif: AppNotification = {
        ...notification,
        id: Date.now().toString(),
        isRead: false,
      };
      
      all.push(newNotif);
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
    } catch {
      // ignore
    }
  },

  markAllAsRead: async (targetUser: string): Promise<void> => {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (!data) return;
      let all: AppNotification[] = JSON.parse(data);
      all = all.map(n => n.targetUser === targetUser ? { ...n, isRead: true } : n);
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
    } catch {
      // ignore
    }
  }
};
