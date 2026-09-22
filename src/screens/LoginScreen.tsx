import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { StorageAuth } from '../utils/StorageAuth';
import { BACKEND_URL } from '../config';
import { LanguagePicker } from '../components/LanguagePicker';
import { AppLanguage } from '../i18n';

const { width: SCREEN_W } = Dimensions.get('window');

type Props = {
  language: AppLanguage;
  onChangeLanguage: (lang: AppLanguage) => void;
  onLoginSuccess: (username: string, role?: string) => void;
};

// ─── Animated Input with icon + focus glow ───────────────────────────────────
function GlassInput({
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: {
  icon: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'numeric';
  autoCapitalize?: 'none' | 'words' | 'sentences';
}) {
  const borderAnim = useRef(new Animated.Value(0)).current;
  const [isFocused, setIsFocused] = useState(false);

  function onFocus() {
    setIsFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }
  function onBlur() {
    setIsFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.12)', '#4ade80'],
  });
  const bgColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.07)', 'rgba(74,222,128,0.08)'],
  });

  return (
    <Animated.View style={[inputStyles.wrap, { borderColor, backgroundColor: bgColor }]}>
      <Text style={[inputStyles.icon, isFocused && inputStyles.iconFocused]}>{icon}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.3)"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'none'}
        style={inputStyles.field}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </Animated.View>
  );
}

const inputStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 14,
  },
  icon: { fontSize: 18, marginRight: 10, opacity: 0.5 },
  iconFocused: { opacity: 1 },
  field: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 12,
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
export function LoginScreen({ language, onChangeLanguage, onLoginSuccess }: Props) {
  const { t } = useTranslation();

  // ── Farm scene animations
  const tractorX    = useRef(new Animated.Value(-120)).current;
  const sunFloat    = useRef(new Animated.Value(0)).current;
  const cloudX      = useRef(new Animated.Value(0)).current;
  const cloudX2     = useRef(new Animated.Value(0)).current;
  const cropWave    = useRef(new Animated.Value(0)).current;
  const sunGlow     = useRef(new Animated.Value(0.55)).current;
  const rainProgress = useRef(new Animated.Value(0)).current;
  const rainOpacity  = useRef(new Animated.Value(0)).current;

  // ── UI animations
  const cardSlide   = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const tabIndicator = useRef(new Animated.Value(0)).current;
  const btnShimmer  = useRef(new Animated.Value(0)).current;
  const btnScale    = useRef(new Animated.Value(1)).current;
  const btnRipple   = useRef(new Animated.Value(0)).current;
  const heroScale   = useRef(new Animated.Value(1.05)).current;

  // ── Form state
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName]   = useState('');
  const [pin, setPin]     = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Scene toggles
  const [isNight, setIsNight] = useState(false);
  const [isRainOn, setIsRainOn] = useState(false);

  // ── Entry animation
  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardSlide, { toValue: 0, useNativeDriver: true, friction: 9, tension: 50 }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(heroScale, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [cardSlide, cardOpacity, heroScale]);

  // ── Button shimmer loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(btnShimmer, { toValue: 1, duration: 1800, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(btnShimmer, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [btnShimmer]);

  // ── Farm scene loops
  useEffect(() => {
    const t1 = Animated.loop(Animated.sequence([
      Animated.timing(tractorX,  { toValue: SCREEN_W + 40, duration: 6000, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(tractorX,  { toValue: -120, duration: 0, useNativeDriver: true }),
    ]));
    const t2 = Animated.loop(Animated.sequence([
      Animated.timing(sunFloat,  { toValue: -8, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(sunFloat,  { toValue: 0,  duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    const t3 = Animated.loop(Animated.sequence([
      Animated.timing(cloudX,   { toValue: 40,  duration: 3500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(cloudX,   { toValue: 0,   duration: 3500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    const t4 = Animated.loop(Animated.sequence([
      Animated.timing(cloudX2,  { toValue: -30, duration: 4200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(cloudX2,  { toValue: 0,   duration: 4200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    const t5 = Animated.loop(Animated.sequence([
      Animated.timing(cropWave, { toValue: 1, duration: 820, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(cropWave, { toValue: 0, duration: 820, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    const t6 = Animated.loop(Animated.sequence([
      Animated.timing(sunGlow,  { toValue: 0.9,  duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      Animated.timing(sunGlow,  { toValue: 0.45, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
    ]));
    [t1,t2,t3,t4,t5,t6].forEach(a => a.start());
    return () => [t1,t2,t3,t4,t5,t6].forEach(a => a.stop());
  }, [tractorX, sunFloat, cloudX, cloudX2, cropWave, sunGlow]);

  // ── Rain loop
  useEffect(() => {
    let rainLoop: Animated.CompositeAnimation | null = null;
    if (isRainOn) {
      rainProgress.setValue(0);
      rainLoop = Animated.loop(
        Animated.timing(rainProgress, { toValue: 1, duration: 1100, easing: Easing.linear, useNativeDriver: true })
      );
      rainLoop.start();
      Animated.timing(rainOpacity, { toValue: 0.85, duration: 220, useNativeDriver: true }).start();
    } else {
      Animated.timing(rainOpacity, { toValue: 0, duration: 280, useNativeDriver: true }).start();
    }
    return () => rainLoop?.stop();
  }, [isRainOn, rainOpacity, rainProgress]);

  // ── Tab switch
  function switchTab(toRegister: boolean) {
    Animated.spring(tabIndicator, {
      toValue: toRegister ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 60,
    }).start();
    setIsRegister(toRegister);
    setError('');
  }

  const canSubmit = useMemo(() => {
    if (isRegister) return phone.trim().length > 0 && name.trim().length > 0 && pin.trim().length > 0;
    return phone.trim().length > 0 && pin.trim().length > 0;
  }, [phone, name, pin, isRegister]);

  async function handleSubmit() {
    setError('');
    if (!canSubmit || isSubmitting) return;

    // Button press animation
    btnRipple.setValue(0);
    Animated.timing(btnScale, { toValue: 0.97, duration: 100, useNativeDriver: true }).start();
    Animated.timing(btnRipple, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    setTimeout(() => Animated.timing(btnScale, { toValue: 1, duration: 150, useNativeDriver: true }).start(), 120);

    setIsSubmitting(true);
    try {
      if (isRegister) {
        const roleToPass = isAdmin ? 'admin' : 'farmer';
        const res = await StorageAuth.register(phone.trim(), name.trim(), pin.trim(), roleToPass);
        if (res.success) {
          onLoginSuccess(name.trim(), roleToPass);
        } else {
          setError(res.error || 'Registration failed. Try a different username.');
        }
      } else {
        const res = await StorageAuth.login(phone.trim(), pin.trim());
        if (res.success && res.user) {
          onLoginSuccess(res.user.name, res.user.role);
        } else {
          setError(res.error || t('login.invalid'));
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const tabIndicatorX = tabIndicator.interpolate({
    inputRange: [0, 1],
    outputRange: [2, (SCREEN_W - 48 - 4) / 2],
  });

  const shimmerX = btnShimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_W, SCREEN_W],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* ── HERO FARM BANNER ─────────────────────────────────── */}
          <Animated.View style={[styles.hero, { transform: [{ scale: heroScale }] }]}>
            {/* Sky gradient layer */}
            <View style={[styles.sky, isNight && styles.skyNight]} />

            {/* Sun / Moon */}
            <Animated.View
              style={[styles.sunGlowRing, {
                opacity: sunGlow,
                backgroundColor: isNight ? '#7c3aed' : '#fde68a',
              }]}
            />
            <Animated.Text style={[styles.sun, { transform: [{ translateY: sunFloat }] }]}>
              {isNight ? '🌙' : '☀️'}
            </Animated.Text>

            {/* Clouds */}
            <Animated.Text style={[styles.cloud1, { transform: [{ translateX: cloudX }] }]}>☁️</Animated.Text>
            <Animated.Text style={[styles.cloud2, { transform: [{ translateX: cloudX2 }] }]}>☁️</Animated.Text>

            {/* Hills */}
            <View style={[styles.hillBack, isNight && styles.hillBackNight]} />
            <View style={[styles.hillFront, isNight && styles.hillFrontNight]} />

            {/* Village + crops */}
            <Text style={styles.village}>{isNight ? '🏠 🌴 ⭐' : '🏡 🌴 🏡'}</Text>
            <Animated.Text style={[styles.cropRow, {
              transform: [{ translateY: cropWave.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }],
            }]}>
              🌾 🌾 🌾 🌾 🌾 🌾
            </Animated.Text>

            {/* Tractor */}
            <Animated.Text style={[styles.tractor, { transform: [{ translateX: tractorX }] }]}>🚜</Animated.Text>

            {/* Road */}
            <View style={[styles.road, isNight && styles.roadNight]} />

            {/* Rain */}
            <Animated.View style={[styles.rainLayer, { opacity: rainOpacity }]}>
              {Array.from({ length: 20 }, (_, i) => (
                <Animated.View
                  key={i}
                  style={[styles.raindrop, {
                    left: `${(i * 5.2) % 97}%` as any,
                    transform: [{
                      translateY: rainProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [(-40 - (i % 6) * 10), 160],
                      }),
                    }, { rotate: '-15deg' }],
                    opacity: 0.45 + (i % 5) * 0.1,
                  }]}
                />
              ))}
            </Animated.View>

            {/* Scene controls */}
            <View style={styles.sceneControls}>
              <TouchableOpacity
                style={[styles.sceneChip, isNight && styles.sceneChipNight]}
                onPress={() => setIsNight(v => !v)}
              >
                <Text style={styles.sceneChipText}>{isNight ? '🌙 Night' : '☀️ Day'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sceneChip, isRainOn && styles.sceneChipRain]}
                onPress={() => setIsRainOn(v => !v)}
              >
                <Text style={styles.sceneChipText}>{isRainOn ? '🌧️ Rain' : '🌤️ Clear'}</Text>
              </TouchableOpacity>
            </View>

            {/* App branding overlay */}
            <View style={styles.heroOverlay}>
              <Text style={styles.heroAppName}>🌿 Krishi AI</Text>
              <Text style={styles.heroTagline}>Smart Farming Assistant</Text>
            </View>
          </Animated.View>

          {/* ── GLASS CARD ───────────────────────────────────────── */}
          <Animated.View
            style={[styles.glassCard, {
              opacity: cardOpacity,
              transform: [{ translateY: cardSlide }],
            }]}
          >
            {/* Language Picker */}
            <View style={styles.langRow}>
              <Text style={styles.langLabel}>🌐 Language</Text>
              <LanguagePicker language={language} onChange={onChangeLanguage} />
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabWrap}>
              <Animated.View style={[styles.tabIndicator, { transform: [{ translateX: tabIndicatorX }] }]} />
              <TouchableOpacity
                style={styles.tabBtn}
                onPress={() => switchTab(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, !isRegister && styles.tabTextActive]}>
                  🔑 Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tabBtn}
                onPress={() => switchTab(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isRegister && styles.tabTextActive]}>
                  ✨ Register
                </Text>
              </TouchableOpacity>
            </View>

            {/* Welcome text */}
            <Text style={styles.welcomeTitle}>
              {isRegister ? 'Create Account' : 'Welcome Back!'}
            </Text>
            <Text style={styles.welcomeSub}>
              {isRegister
                ? 'Join thousands of smart farmers'
                : 'Sign in to your farm dashboard'}
            </Text>

            {/* Form Fields */}
            <View style={styles.formWrap}>
              <GlassInput
                icon="👤"
                value={phone}
                onChangeText={v => { setPhone(v); setError(''); }}
                placeholder={t('login.phone', 'Username or Phone')}
                autoCapitalize="none"
              />

              {isRegister && (
                <GlassInput
                  icon="📛"
                  value={name}
                  onChangeText={v => { setName(v); setError(''); }}
                  placeholder={t('login.name', 'Your Full Name')}
                  autoCapitalize="words"
                />
              )}

              <GlassInput
                icon="🔒"
                value={pin}
                onChangeText={v => { setPin(v); setError(''); }}
                placeholder={t('login.password', 'PIN / Password')}
                secureTextEntry
              />

              {isRegister && (
                <TouchableOpacity
                  style={styles.roleToggle}
                  onPress={() => setIsAdmin(v => !v)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.roleToggleBox, isAdmin && styles.roleToggleBoxActive]}>
                    {isAdmin && <Text style={styles.roleToggleCheck}>✓</Text>}
                  </View>
                  <Text style={styles.roleToggleLabel}>
                    {isAdmin ? '🛡️ Register as Admin' : '👨‍🌾 Register as Farmer'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Error */}
            {error ? (
              <View style={styles.errorBadge}>
                <Text style={styles.errorText}>⚠️  {error}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity
                style={[styles.ctaBtn, !canSubmit && styles.ctaBtnDisabled]}
                disabled={!canSubmit || isSubmitting}
                onPress={handleSubmit}
                activeOpacity={0.9}
              >
                {/* Shimmer effect */}
                {!isSubmitting && canSubmit && (
                  <Animated.View
                    pointerEvents="none"
                    style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]}
                  />
                )}
                {/* Ripple */}
                <Animated.View
                  pointerEvents="none"
                  style={[styles.btnRipple, {
                    opacity: btnRipple.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] }),
                    transform: [{ scale: btnRipple.interpolate({ inputRange: [0, 1], outputRange: [0.3, 2.5] }) }],
                  }]}
                />
                {isSubmitting ? (
                  <View style={styles.ctaBtnInner}>
                    <ActivityIndicator color="#0a1628" size="small" />
                    <Text style={styles.ctaBtnText}>
                      {isRegister ? '  Creating account...' : '  Signing in...'}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.ctaBtnText}>
                    {isRegister ? '🌱  Create Account' : '🚀  Sign In'}
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Switch mode link */}
            <TouchableOpacity
              style={styles.switchLink}
              onPress={() => switchTab(!isRegister)}
              disabled={isSubmitting}
            >
              <Text style={styles.switchLinkText}>
                {isRegister
                  ? 'Already a member? '
                  : "Don't have an account? "}
                <Text style={styles.switchLinkAccent}>
                  {isRegister ? 'Sign In →' : 'Register →'}
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Footer hint */}
            <Text style={styles.footerHint}>
              🔒 Your data is stored securely on your device
            </Text>
          </Animated.View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#070d17' },
  scroll: { flexGrow: 1 },

  // ── HERO
  hero: {
    height: 220,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  sky: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#a8d8a8',
  },
  skyNight: { backgroundColor: '#0f172a' },
  sunGlowRing: {
    position: 'absolute', top: 8, right: 16,
    width: 56, height: 56, borderRadius: 28,
  },
  sun: { position: 'absolute', top: 14, right: 22, fontSize: 26 },
  cloud1: { position: 'absolute', top: 22, left: 14, fontSize: 26, opacity: 0.9 },
  cloud2: { position: 'absolute', top: 48, right: 58, fontSize: 20, opacity: 0.75 },
  hillBack: {
    position: 'absolute', bottom: 26, left: -28,
    width: 200, height: 80,
    borderTopLeftRadius: 130, borderTopRightRadius: 130,
    backgroundColor: '#6ee7b7',
  },
  hillBackNight: { backgroundColor: '#1e3a5f' },
  hillFront: {
    position: 'absolute', bottom: 16, right: -24,
    width: 230, height: 90,
    borderTopLeftRadius: 140, borderTopRightRadius: 140,
    backgroundColor: '#34d399',
  },
  hillFrontNight: { backgroundColor: '#0f2e47' },
  village: { position: 'absolute', bottom: 42, left: 18, fontSize: 18 },
  cropRow: { position: 'absolute', bottom: 12, left: 10, fontSize: 20 },
  tractor: { position: 'absolute', bottom: 30, left: -120, fontSize: 36 },
  road: {
    position: 'absolute', left: 0, right: 0, bottom: 20,
    height: 3, backgroundColor: '#1e293b', opacity: 0.3,
  },
  roadNight: { backgroundColor: '#94a3b8', opacity: 0.2 },
  rainLayer: { ...StyleSheet.absoluteFillObject },
  raindrop: {
    position: 'absolute', top: -30,
    width: 2, height: 13, borderRadius: 2,
    backgroundColor: '#bfdbfe',
  },

  // Scene controls
  sceneControls: {
    position: 'absolute', top: 10, left: 10,
    flexDirection: 'row', gap: 8, zIndex: 10,
  },
  sceneChip: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
  },
  sceneChipNight: { backgroundColor: 'rgba(30,41,59,0.85)', borderColor: '#475569' },
  sceneChipRain: { backgroundColor: 'rgba(6,182,212,0.7)', borderColor: '#0e7490' },
  sceneChipText: { fontSize: 11, fontWeight: '800', color: '#1e293b' },

  // Branding overlay
  heroOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(7,13,23,0.55)',
    paddingVertical: 10, paddingHorizontal: 18,
    alignItems: 'center',
  },
  heroAppName: {
    fontSize: 22, fontWeight: '900', color: '#ffffff',
    letterSpacing: 0.5,
    textShadowColor: '#4ade80', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12,
  },
  heroTagline: { fontSize: 12, color: '#86efac', fontWeight: '600', marginTop: 2 },

  // ── GLASS CARD
  glassCard: {
    marginHorizontal: 16,
    marginTop: -24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 22,
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },

  // Language row
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  langLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '700' },

  // ── TAB SWITCHER
  tabWrap: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 2,
    marginBottom: 22,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 2, bottom: 2,
    width: '50%',
    backgroundColor: '#16a34a',
    borderRadius: 14,
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  tabBtn: {
    flex: 1, alignItems: 'center',
    paddingVertical: 11, zIndex: 1,
  },
  tabText: { fontSize: 13, fontWeight: '800', color: 'rgba(255,255,255,0.45)' },
  tabTextActive: { color: '#ffffff' },

  // ── WELCOME
  welcomeTitle: {
    fontSize: 24, fontWeight: '900', color: '#ffffff',
    marginBottom: 5, letterSpacing: 0.3,
  },
  welcomeSub: {
    fontSize: 13, color: 'rgba(255,255,255,0.45)',
    fontWeight: '600', marginBottom: 22,
  },

  // ── FORM
  formWrap: { marginBottom: 4 },

  // Role toggle
  roleToggle: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 14, gap: 10,
  },
  roleToggleBox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  roleToggleBoxActive: {
    backgroundColor: '#16a34a', borderColor: '#4ade80',
  },
  roleToggleCheck: { color: '#fff', fontSize: 13, fontWeight: '900' },
  roleToggleLabel: { color: 'rgba(255,255,255,0.7)', fontWeight: '700', fontSize: 14 },

  // ── ERROR
  errorBadge: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)',
    borderRadius: 12, padding: 12, marginBottom: 14,
  },
  errorText: { color: '#fca5a5', fontSize: 13, fontWeight: '700', textAlign: 'center' },

  // ── CTA BUTTON
  ctaBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  ctaBtnDisabled: {
    backgroundColor: '#166534',
    shadowOpacity: 0.1,
  },
  ctaBtnInner: { flexDirection: 'row', alignItems: 'center' },
  ctaBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: 0.3 },
  shimmer: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    transform: [{ skewX: '-20deg' }],
  },
  btnRipple: {
    position: 'absolute',
    width: 200, height: 200,
    borderRadius: 100,
    backgroundColor: '#86efac',
    alignSelf: 'center',
  },

  // ── DIVIDER
  dividerRow: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: 18, gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { color: 'rgba(255,255,255,0.3)', fontWeight: '700', fontSize: 12 },

  // ── SWITCH LINK
  switchLink: { alignItems: 'center', paddingVertical: 4 },
  switchLinkText: { color: 'rgba(255,255,255,0.45)', fontSize: 14, fontWeight: '600' },
  switchLinkAccent: { color: '#4ade80', fontWeight: '800' },

  // ── FOOTER
  footerHint: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 11, fontWeight: '600',
    textAlign: 'center', marginTop: 16,
  },
});
