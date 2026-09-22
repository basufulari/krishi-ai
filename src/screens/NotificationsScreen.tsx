import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppNotification, StorageNotifications } from '../utils/StorageNotifications';
import { AppLanguage } from '../i18n';

type Props = {
  username: string;
  language: AppLanguage;
  onBack: () => void;
};

export function NotificationsScreen({ username, onBack }: Props) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const data = await StorageNotifications.getNotifications(username);
    setNotifications(data);
    
    // Mark all as read seamlessly
    await StorageNotifications.markAllAsRead(username);
  };

  const renderNotification = ({ item }: { item: AppNotification }) => (
    <View style={[styles.card, !item.isRead && styles.cardUnread]}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{item.type === 'SYSTEM' ? '⚠️' : item.type === 'COMMENT' ? '💬' : '🔔'}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.timestamp}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('community.notifications', 'Notifications')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>{t('community.noNotifications', 'No new notifications right now.')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  backText: { fontSize: 24, color: '#16a34a' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  list: { padding: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardUnread: { backgroundColor: '#f0fdf4' },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: { fontSize: 20 },
  content: { flex: 1 },
  message: { fontSize: 16, color: '#1e293b', fontWeight: '500', marginBottom: 4 },
  time: { fontSize: 13, color: '#64748b' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#16a34a', marginLeft: 10 },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: '#64748b', fontSize: 16, textAlign: 'center' },
});
