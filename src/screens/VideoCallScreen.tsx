import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';
import { AppLanguage } from '../i18n';

type Props = {
  language: AppLanguage;
  currentUsername: string;
  onEndCall: () => void;
  route: any; // expects { targetUser: string }
};

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function VideoCallScreen({ onEndCall, route, currentUsername }: Props) {
  const { t } = useTranslation();
  const targetUser = route.params?.targetUser || 'Farmer';
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  const roomName = useMemo(() => {
    const a = slugify(currentUsername || 'farmer');
    const b = slugify(targetUser || 'target');
    const sorted = [a, b].sort().join('-');
    return `krishi-ai-${sorted}`;
  }, [currentUsername, targetUser]);

  const jitsiUrl = `https://meet.jit.si/${roomName}`;

  async function joinCall() {
    setJoinError('');
    try {
      setJoining(true);
      await WebBrowser.openBrowserAsync(jitsiUrl);
    } catch {
      setJoinError('Unable to open video call. Please try again.');
    } finally {
      setJoining(false);
    }
  }

  async function shareCallLink() {
    try {
      await Share.share({
        message: `Join my Krishi-AI video call: ${jitsiUrl}`,
      });
    } catch {
      // no-op
    }
  }

  return (
    <SafeAreaView style={styles.ringingContainer}>
      <View style={styles.callerInfoBox}>
        <View style={styles.avatarPlaceholderLarge}>
          <Text style={styles.avatarTextLarge}>{targetUser.charAt(0)}</Text>
        </View>
        <Text style={styles.callerName}>{targetUser}</Text>
        <Text style={styles.ringingStatus}>Room: {roomName}</Text>
      </View>

      <View style={styles.actionsBox}>
        <TouchableOpacity style={styles.joinBtn} onPress={joinCall} disabled={joining}>
          {joining ? <ActivityIndicator color="#fff" /> : <Text style={styles.joinBtnText}>Join Video Call</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareBtn} onPress={shareCallLink}>
          <Text style={styles.shareBtnText}>Share Link</Text>
        </TouchableOpacity>

        {joinError ? <Text style={styles.errorText}>{joinError}</Text> : null}
      </View>

      <TouchableOpacity style={styles.endCallButton} onPress={onEndCall}>
        <Text style={styles.endCallIcon}>Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ringingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callerInfoBox: {
    alignItems: 'center',
    marginBottom: 60,
  },
  avatarPlaceholderLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  avatarTextLarge: { fontSize: 48, fontWeight: '800', color: '#ffffff' },
  callerName: { fontSize: 32, fontWeight: '800', color: '#ffffff', marginBottom: 8 },
  ringingStatus: { fontSize: 18, color: '#94a3b8' },
  loadingBox: { marginBottom: 100 },
  actionsBox: { width: '85%', alignItems: 'center', gap: 12 },
  joinBtn: {
    width: '100%',
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  joinBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  shareBtn: {
    width: '100%',
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  errorText: { color: '#fecaca', textAlign: 'center', fontWeight: '700' },
  
  endCallButton: {
    marginTop: 24,
    width: 120,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#ef4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  endCallIcon: { fontSize: 18, color: '#fff', fontWeight: '800' },
});
