import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppLanguage } from '../i18n';
import { BACKEND_URL } from '../config';
import { getBackendUrl, setBackendUrl } from '../utils/ApiConfig';

type Props = {
  language: AppLanguage;
  onBackHome: () => void;
};

export function DeveloperScreen({ onBackHome }: Props) {
  const { t } = useTranslation();

  // ── Entry animations
  const fadeAnim      = useRef(new Animated.Value(0)).current;
  const scaleAnim     = useRef(new Animated.Value(0.88)).current;
  const photoScale    = useRef(new Animated.Value(0.5)).current;
  const serverCardIn  = useRef(new Animated.Value(0)).current;
  const saveBtnScale  = useRef(new Animated.Value(1)).current;
  const testBtnScale  = useRef(new Animated.Value(1)).current;

  // ── Server config state
  const [urlInput, setUrlInput]           = useState('');
  const [activeUrl, setActiveUrl]         = useState(BACKEND_URL);
  const [isSaving, setIsSaving]           = useState(false);
  const [isTesting, setIsTesting]         = useState(false);
  const [saveStatus, setSaveStatus]       = useState<'idle' | 'saved' | 'error'>('idle');
  const [testStatus, setTestStatus]       = useState<'' | 'ok' | 'warn' | 'err'>('');
  const [testMessage, setTestMessage]     = useState('');
  const [urlFocused, setUrlFocused]       = useState(false);

  useEffect(() => {
    void (async () => {
      const url = await getBackendUrl();
      setActiveUrl(url);
      setUrlInput(url);
    })();
  }, []);

  useEffect(() => {
    Animated.stagger(80, [
      Animated.parallel([
        Animated.timing(fadeAnim,   { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(scaleAnim,  { toValue: 1, friction: 8, tension: 45, useNativeDriver: true }),
        Animated.spring(photoScale, { toValue: 1, friction: 6, tension: 55, useNativeDriver: true }),
      ]),
      Animated.spring(serverCardIn, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, scaleAnim, photoScale, serverCardIn]);

  function pressAnim(ref: Animated.Value, in_: boolean) {
    Animated.timing(ref, { toValue: in_ ? 0.95 : 1, duration: 100, useNativeDriver: true }).start();
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveStatus('idle');
    setTestStatus('');
    setTestMessage('');
    try {
      const saved = await setBackendUrl(urlInput);
      setActiveUrl(saved);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTest() {
    setIsTesting(true);
    setTestStatus('');
    setTestMessage('');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
      const res = await fetch(activeUrl, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) {
        setTestStatus('warn');
        setTestMessage(`Server reached but returned HTTP ${res.status}.`);
        return;
      }
      const txt = await res.text().catch(() => '');
      if (txt.toLowerCase().includes('krishi-ai backend running')) {
        setTestStatus('ok');
        setTestMessage('✅ Krishi backend is live and reachable!');
      } else {
        setTestStatus('warn');
        setTestMessage('Connected — but this may not be the Krishi backend.');
      }
    } catch {
      clearTimeout(timeout);
      setTestStatus('err');
      setTestMessage('Cannot reach server. Check: same Wi-Fi, backend running, and correct IP:port.');
    } finally {
      setIsTesting(false);
    }
  }

  const testColors = { ok: '#4ade80', warn: '#fbbf24', err: '#f87171' };
  const testBg     = { ok: 'rgba(74,222,128,0.1)', warn: 'rgba(251,191,36,0.1)', err: 'rgba(248,113,113,0.1)' };
  const testBorder = { ok: 'rgba(74,222,128,0.3)', warn: 'rgba(251,191,36,0.3)', err: 'rgba(248,113,113,0.3)' };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Back button ── */}
        <TouchableOpacity style={styles.backRow} onPress={onBackHome} activeOpacity={0.75}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>{t('common.back')}</Text>
        </TouchableOpacity>

        {/* ── Profile Card ── */}
        <Animated.View
          style={[styles.profileCard, {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }]}
        >
          {/* Glow ring behind avatar */}
          <View style={styles.avatarGlowWrap}>
            <View style={styles.avatarGlow} />
            <Animated.View style={[styles.photoWrapper, { transform: [{ scale: photoScale }] }]}>
              <Image
                source={require('../../assets/developer-profile.png')}
                style={styles.photo}
                resizeMode="cover"
              />
            </Animated.View>
          </View>

          <View style={styles.badgeRow}>
            <View style={styles.badge}><Text style={styles.badgeText}>👨‍💻 Developer</Text></View>
            <View style={[styles.badge, { backgroundColor: 'rgba(74,222,128,0.15)', borderColor: 'rgba(74,222,128,0.3)' }]}>
              <Text style={[styles.badgeText, { color: '#4ade80' }]}>🌿 KrishiAI</Text>
            </View>
          </View>

          <Text style={styles.devName}>Basavaraj Dundappa Fulari</Text>
          <Text style={styles.devRole}>{t('developer.role')}</Text>
          <Text style={styles.devHandle}>@{t('developer.username')}</Text>

          <View style={styles.divider} />

          {/* Stats row */}
          <View style={styles.statsRow}>
            {[
              { label: 'Screens', value: '22+' },
              { label: 'Languages', value: '3' },
              { label: 'AI Models', value: '2' },
            ].map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statVal}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>{t('developer.aboutTitle')}</Text>
          <Text style={styles.aboutText}>{t('developer.aboutText')}</Text>

          {/* Tech stack pills */}
          <View style={styles.techWrap}>
            {['React Native', 'Expo', 'Node.js', 'MongoDB', 'Gemini AI', 'TypeScript'].map((tech, i) => (
              <View key={i} style={styles.techPill}>
                <Text style={styles.techPillText}>{tech}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── Server Config Card ── */}
        <Animated.View
          style={[styles.serverCard, {
            opacity: serverCardIn,
            transform: [{
              translateY: serverCardIn.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }),
            }],
          }]}
        >
          {/* Card header */}
          <View style={styles.serverCardHeader}>
            <View style={styles.serverIconWrap}>
              <Text style={styles.serverIcon}>🔌</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serverTitle}>Server Configuration</Text>
              <Text style={styles.serverSub}>Backend URL for APK / mobile</Text>
            </View>
            {/* Live indicator */}
            <View style={styles.liveDot} />
          </View>

          {/* Current URL display */}
          <View style={styles.currentUrlBar}>
            <Text style={styles.currentUrlLabel}>Current</Text>
            <Text style={styles.currentUrlValue} numberOfLines={1}>{activeUrl}</Text>
          </View>

          {/* Input */}
          <Text style={styles.inputLabel}>Backend URL</Text>
          <View style={[styles.urlInputWrap, urlFocused && styles.urlInputWrapFocus]}>
            <Text style={styles.urlInputIcon}>🌐</Text>
            <TextInput
              value={urlInput}
              onChangeText={v => { setUrlInput(v); setSaveStatus('idle'); }}
              style={styles.urlInput}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="http://192.168.1.10:3000"
              placeholderTextColor="rgba(255,255,255,0.2)"
              onFocus={() => setUrlFocused(true)}
              onBlur={() => setUrlFocused(false)}
            />
          </View>
          <Text style={styles.inputHint}>
            💡 Use your PC's local IP — keep phone & PC on same Wi-Fi
          </Text>

          {/* Buttons */}
          <View style={styles.serverBtnRow}>
            {/* Save button */}
            <Animated.View style={[{ flex: 1 }, { transform: [{ scale: saveBtnScale }] }]}>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  saveStatus === 'saved' && styles.saveBtnSuccess,
                  saveStatus === 'error' && styles.saveBtnError,
                ]}
                onPress={handleSave}
                disabled={isSaving}
                onPressIn={() => pressAnim(saveBtnScale, true)}
                onPressOut={() => pressAnim(saveBtnScale, false)}
                activeOpacity={0.85}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {saveStatus === 'saved' ? '✅ Saved!' : saveStatus === 'error' ? '❌ Error' : '💾  Save URL'}
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Test button */}
            <Animated.View style={[{ flex: 1 }, { transform: [{ scale: testBtnScale }] }]}>
              <TouchableOpacity
                style={styles.testBtn}
                onPress={handleTest}
                disabled={isTesting}
                onPressIn={() => pressAnim(testBtnScale, true)}
                onPressOut={() => pressAnim(testBtnScale, false)}
                activeOpacity={0.85}
              >
                {isTesting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.testBtnText}>🔌  Test Ping</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Test result */}
          {testStatus !== '' && testMessage ? (
            <View style={[
              styles.testResult,
              { backgroundColor: testBg[testStatus], borderColor: testBorder[testStatus] },
            ]}>
              <Text style={[styles.testResultText, { color: testColors[testStatus] }]}>
                {testMessage}
              </Text>
            </View>
          ) : null}

          {/* Default hint */}
          <View style={styles.defaultBar}>
            <Text style={styles.defaultBarLabel}>Default API</Text>
            <Text style={styles.defaultBarValue} numberOfLines={1}>{BACKEND_URL}</Text>
          </View>
        </Animated.View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#070d17' },
  scroll: { padding: 18, paddingBottom: 32 },

  // ── Back
  backRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 20, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  backIcon: { color: '#94a3b8', fontSize: 16, fontWeight: '800' },
  backText: { color: '#94a3b8', fontWeight: '800', fontSize: 14 },

  // ── Profile Card
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },

  avatarGlowWrap: { position: 'relative', marginBottom: 16, alignItems: 'center', justifyContent: 'center' },
  avatarGlow: {
    position: 'absolute',
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: '#4ade80', opacity: 0.15,
    transform: [{ scale: 1.1 }],
  },
  photoWrapper: {
    width: 130, height: 130, borderRadius: 65,
    overflow: 'hidden',
    borderWidth: 3, borderColor: '#4ade80',
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
  },
  photo: { width: '100%', height: '100%' },

  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  badge: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderColor: 'rgba(99,102,241,0.3)',
  },
  badgeText: { color: '#a5b4fc', fontSize: 12, fontWeight: '800' },

  devName: { fontSize: 22, fontWeight: '900', color: '#f1f5f9', textAlign: 'center', marginBottom: 4 },
  devRole: { fontSize: 14, fontWeight: '700', color: '#4ade80', marginBottom: 4 },
  devHandle: { fontSize: 13, color: '#64748b', fontWeight: '600' },

  divider: { width: '60%', height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 18, borderRadius: 1 },

  statsRow: { flexDirection: 'row', gap: 24, marginBottom: 4 },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '900', color: '#4ade80' },
  statLabel: { fontSize: 11, color: '#64748b', fontWeight: '700', marginTop: 2 },

  sectionTitle: { fontSize: 15, fontWeight: '900', color: '#e2e8f0', alignSelf: 'flex-start', marginBottom: 8 },
  aboutText: { fontSize: 14, lineHeight: 22, color: '#94a3b8', textAlign: 'left', fontWeight: '500', alignSelf: 'flex-start' },

  techWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, justifyContent: 'center' },
  techPill: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderColor: 'rgba(99,102,241,0.25)',
  },
  techPillText: { color: '#a5b4fc', fontSize: 12, fontWeight: '700' },

  // ── Server Config Card
  serverCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(14,165,233,0.25)',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
  serverCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16,
  },
  serverIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(14,165,233,0.15)',
    borderWidth: 1, borderColor: 'rgba(14,165,233,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  serverIcon: { fontSize: 20 },
  serverTitle: { fontSize: 16, fontWeight: '900', color: '#f1f5f9' },
  serverSub: { fontSize: 12, color: '#64748b', fontWeight: '600', marginTop: 2 },
  liveDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#4ade80',
    shadowColor: '#4ade80', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 4,
  },

  currentUrlBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 16,
  },
  currentUrlLabel: { color: '#64748b', fontSize: 11, fontWeight: '800', minWidth: 48 },
  currentUrlValue: { flex: 1, color: '#94a3b8', fontSize: 12, fontWeight: '600' },

  inputLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '800', marginBottom: 8 },
  urlInputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 8,
  },
  urlInputWrapFocus: { borderColor: '#0ea5e9' },
  urlInputIcon: { fontSize: 16, marginRight: 10, opacity: 0.6 },
  urlInput: {
    flex: 1, color: '#f1f5f9', fontSize: 14,
    fontWeight: '600', paddingVertical: 13,
  },
  inputHint: { color: '#475569', fontSize: 11, fontWeight: '600', marginBottom: 16 },

  serverBtnRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },

  saveBtn: {
    backgroundColor: '#0ea5e9',
    borderRadius: 14, paddingVertical: 13,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  saveBtnSuccess: { backgroundColor: '#16a34a' },
  saveBtnError:   { backgroundColor: '#dc2626' },
  saveBtnText: { color: '#fff', fontWeight: '900', fontSize: 13 },

  testBtn: {
    backgroundColor: '#334155',
    borderRadius: 14, paddingVertical: 13,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  testBtnText: { color: '#fff', fontWeight: '900', fontSize: 13 },

  testResult: {
    marginTop: 14, borderRadius: 12, padding: 12,
    borderWidth: 1,
  },
  testResultText: { fontSize: 13, fontWeight: '700', textAlign: 'center' },

  defaultBar: {
    marginTop: 14, flexDirection: 'row', alignItems: 'center',
    gap: 8, backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  defaultBarLabel: { color: '#475569', fontSize: 11, fontWeight: '800' },
  defaultBarValue: { flex: 1, color: '#475569', fontSize: 11, fontWeight: '600' },
});
