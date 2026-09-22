import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert as RNAlert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BACKEND_URL } from '../config';

type Props = {
  onBack: () => void;
};

export function AdminAlertScreen({ onBack }: Props) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alerts, setAlerts] = useState<Array<{ _id: string; message: string; timestamp: string }>>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const refreshAlerts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/alerts`);
      if (!res.ok) return;
      const data = (await res.json()) as Array<{ _id: string; message: string; timestamp: string }>;
      setAlerts(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    void refreshAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBroadcast = async () => {
    if (!message.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() })
      });
      if (res.ok) {
        RNAlert.alert('Success', 'Alert broadcasted to all farmers!');
        setMessage('');
        await refreshAlerts();
      } else {
        RNAlert.alert('Error', 'Failed to send alert.');
      }
    } catch {
      RNAlert.alert('Error', 'Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/alerts/${alertId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('DELETE_FAILED');
      await refreshAlerts();
    } catch {
      RNAlert.alert('Error', 'Failed to delete alert.');
    }
  };

  const startEdit = (alertId: string, currentMessage: string) => {
    setEditingId(alertId);
    setEditMessage(currentMessage);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditMessage('');
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const trimmed = editMessage.trim();
    if (!trimmed) {
      RNAlert.alert('Error', 'Message cannot be empty.');
      return;
    }
    setIsSavingEdit(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/alerts/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });
      if (!res.ok) throw new Error('PUT_FAILED');
      RNAlert.alert('Success', 'Alert message updated.');
      cancelEdit();
      await refreshAlerts();
    } catch {
      RNAlert.alert('Error', 'Failed to update alert.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Admin Control Panel</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.container}>
            <Text style={styles.label}>Broadcast Disaster Warning ⚠️</Text>
            <TextInput
              style={styles.input}
              placeholder="Type your emergency message here..."
              placeholderTextColor="#94a3b8"
              multiline
              autoFocus={!isEditing}
              value={message}
              onChangeText={setMessage}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.castBtn, !message.trim() && styles.castBtnDisabled]}
              onPress={handleBroadcast}
              disabled={!message.trim() || isLoading}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.castText}>Broadcast to All Farmers</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.container}>
            <Text style={styles.label}>Edit / Delete Existing Alerts</Text>

            {isEditing && (
              <View style={styles.editBox}>
                <Text style={styles.editTitle}>Editing Alert</Text>
                <TextInput
                  style={styles.input}
                  value={editMessage}
                  onChangeText={setEditMessage}
                  multiline
                  textAlignVertical="top"
                />
                <View style={styles.editRow}>
                  <TouchableOpacity style={[styles.smallBtn, styles.smallBtnCancel]} onPress={cancelEdit} disabled={isSavingEdit}>
                    <Text style={styles.smallBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.smallBtn, styles.smallBtnSave]} onPress={handleSaveEdit} disabled={isSavingEdit}>
                    {isSavingEdit ? <ActivityIndicator color="#fff" /> : <Text style={styles.smallBtnText}>Save</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {alerts.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No alerts yet.</Text>
              </View>
            ) : (
              alerts.map((a) => (
                <View key={a._id} style={styles.alertRow}>
                  <Text style={styles.alertMessage} numberOfLines={3}>
                    {a.message}
                  </Text>
                  <Text style={styles.alertTime}>{a.timestamp}</Text>

                  <View style={styles.alertActions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnEdit]}
                      onPress={() => startEdit(a._id, a.message)}
                    >
                      <Text style={styles.actionBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnDelete]}
                      onPress={() => RNAlert.alert('Delete alert', 'Are you sure you want to delete this alert?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => void handleDeleteAlert(a._id) },
                      ])}
                    >
                      <Text style={styles.actionBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  backText: { fontSize: 24, color: '#dc2626' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, fontWeight: '700', color: '#dc2626', marginBottom: 12 },
  input: { flex: 1, backgroundColor: '#fff', fontSize: 16, color: '#1e293b', lineHeight: 24, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  castBtn: { backgroundColor: '#dc2626', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  castBtnDisabled: { backgroundColor: '#fca5a5' },
  castText: { color: 'white', fontWeight: '800', fontSize: 16 },

  scrollContent: { paddingBottom: 40, paddingHorizontal: 16 },
  editBox: { marginTop: 10, padding: 14, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  editTitle: { fontWeight: '900', color: '#1e293b', marginBottom: 10, fontSize: 16 },
  editRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },

  smallBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  smallBtnCancel: { backgroundColor: '#64748b', marginRight: 10 },
  smallBtnSave: { backgroundColor: '#dc2626' },
  smallBtnText: { color: '#fff', fontWeight: '900' },

  emptyBox: { padding: 18, borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  emptyText: { color: '#64748b', fontWeight: '700', textAlign: 'center' },

  alertRow: { marginTop: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  alertMessage: { fontSize: 15, fontWeight: '800', color: '#1e293b', marginBottom: 6 },
  alertTime: { fontSize: 12, fontWeight: '700', color: '#94a3b8', marginBottom: 12 },
  alertActions: { flexDirection: 'row', justifyContent: 'space-between' },

  actionBtn: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  actionBtnEdit: { backgroundColor: '#0284c7', marginRight: 10 },
  actionBtnDelete: { backgroundColor: '#dc2626' },
  actionBtnText: { color: '#fff', fontWeight: '900' },
});
