import React, { useRef, useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LanguagePicker } from '../components/LanguagePicker';
import { HamburgerButton } from '../components/HamburgerButton';
import { AppLanguage } from '../i18n';
import { cropOptions } from '../demoAnalysis';
import { StorageNotifications } from '../utils/StorageNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../config';
import * as Speech from 'expo-speech';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = 280;

type Props = {
  username: string;
  role: string;
  language: AppLanguage;
  onChangeLanguage: (lang: AppLanguage) => void;
  onLogout: () => void;
  onGoAnalyze: () => void;
  onGoDeveloper: () => void;
  onGoGovScheme: () => void;
  onGoWeather: () => void;
  onGoAgriShare: () => void;
  onGoMandi: () => void;
  onGoGeoFencing: () => void;
  onGoKisanLoan: () => void;
  onGoCommunity: () => void;
  onGoNotifications: () => void;
  onGoChatbot: () => void;
  onGoAdmin: () => void;
  onGoAdminUserList: () => void;
  onGoHistory: () => void;
  onGoDashboard: () => void;
};



export function HomeScreen({
  username, role, language, onChangeLanguage, onLogout,
  onGoAnalyze, onGoDeveloper, onGoGovScheme, onGoWeather,
  onGoAgriShare, onGoMandi, onGoGeoFencing, onGoKisanLoan, onGoCommunity,
  onGoNotifications, onGoChatbot, onGoAdmin, onGoAdminUserList, onGoHistory,
  onGoDashboard,
}: Props) {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);


  const slideAnim    = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const drawerItemsAnim = useRef(new Animated.Value(0)).current;
  const farmerBounce = useRef(new Animated.Value(0)).current;
  const sunPulse     = useRef(new Animated.Value(0)).current;
  const headerShimmer = useRef(new Animated.Value(0)).current;

  const isFocused = useIsFocused();
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeAlertMessage, setActiveAlertMessage] = useState<string | null>(null);
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);

  useEffect(() => {
    if (isFocused) {
      StorageNotifications.getUnreadCount(username).then(setUnreadCount);
      const fetchAlerts = async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/alerts`);
          if (res.ok) {
            const alerts = await res.json();
            if (alerts.length > 0) {
              const latest = alerts[0];
              const seenKey = `seen_alert_${username}_${latest._id}`;
              const seenMessage = await AsyncStorage.getItem(seenKey);
              const shouldShow = seenMessage !== latest.message;
              if (shouldShow) {
                setActiveAlertId(latest._id);
                setActiveAlertMessage(latest.message);
                await StorageNotifications.addNotification({
                  targetUser: username,
                  type: 'SYSTEM',
                  message: `DISASTER ALERT: ${latest.message}`,
                  timestamp: latest.timestamp,
                });
                await AsyncStorage.setItem(seenKey, latest.message);
                StorageNotifications.getUnreadCount(username).then(setUnreadCount);
                Speech.stop();
                const msg = String(latest?.message || '');
                const trimmedMsg = msg.length > 90 ? `${msg.slice(0, 87)}...` : msg;
                const speakText = trimmedMsg ? `Emergency alert. ${trimmedMsg}` : 'Emergency alert.';
                const locale = language === 'mr' ? 'mr-IN' : language === 'kn' ? 'kn-IN' : 'en-IN';
                void Speech.speak(speakText, { language: locale, pitch: 1.1, rate: 0.9 });
              } else {
                setActiveAlertId(null);
                setActiveAlertMessage(null);
              }
            }
          }
        } catch {}
      };
      fetchAlerts();
    }
  }, [isFocused, username, language]);

  useEffect(() => {
    const bounce = Animated.loop(Animated.sequence([
      Animated.timing(farmerBounce, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(farmerBounce, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    const sun = Animated.loop(Animated.sequence([
      Animated.timing(sunPulse, { toValue: 1, duration: 950, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(sunPulse, { toValue: 0, duration: 950, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    const shimmer = Animated.loop(Animated.sequence([
      Animated.timing(headerShimmer, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(headerShimmer, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]));
    bounce.start(); sun.start(); shimmer.start();
    return () => { bounce.stop(); sun.stop(); shimmer.stop(); };
  }, []);

  function openDrawer() {
    setDrawerOpen(true);
    drawerItemsAnim.setValue(0);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, friction: 8, tension: 60 }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 260, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(drawerItemsAnim, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }

  function closeDrawer() {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 220, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  }

  function navTo(fn: () => void) {
    closeDrawer();
    setTimeout(fn, 280);
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 15,
      onPanResponderRelease: (_, g) => { if (g.dx < -50 || g.vx < -0.3) closeDrawer(); },
    })
  ).current;

  // Feature cards for farmers
  const farmerCards = [
    { emoji: '🔬', label: t('home.analyzeBtn') || 'Crop Scanner',   sub: 'AI Disease Detection', color: '#166534', bg: '#f0fdf4', border: '#bbf7d0', fn: onGoAnalyze },
    { emoji: '⛅', label: t('home.weather') || 'Weather',           sub: 'Live Forecast',        color: '#075985', bg: '#f0f9ff', border: '#bae6fd', fn: onGoWeather },
    { emoji: '📈', label: t('home.mandiBhav') || 'Mandi Bhav',      sub: 'Market Prices',        color: '#9a3412', bg: '#fff7ed', border: '#fed7aa', fn: onGoMandi },
    { emoji: '🏛️', label: t('home.govSchemes') || 'Gov Schemes',    sub: 'Subsidies & Yojanas',  color: '#115e59', bg: '#f0fdfa', border: '#99f6e4', fn: onGoGovScheme },
    { emoji: '🚜', label: t('home.agriShare') || 'Agri-Share',      sub: 'Rent Equipment',       color: '#92400e', bg: '#fffbeb', border: '#fde68a', fn: onGoAgriShare },
    { emoji: '📍', label: t('home.geoFencing') || 'Measure Land',   sub: 'GPS Land Area',        color: '#4c1d95', bg: '#faf5ff', border: '#ddd6fe', fn: onGoGeoFencing },
    { emoji: '🏦', label: 'Kisan Loan Finder',                       sub: 'Official Govt. Loans',  color: '#1e3a5f', bg: '#eff6ff', border: '#bfdbfe', fn: onGoKisanLoan },
    { emoji: '💬', label: t('home.community') || 'Samvad Forum',    sub: 'Farmer Community',     color: '#065f46', bg: '#ecfdf5', border: '#a7f3d0', fn: onGoCommunity },
    { emoji: '🧾', label: t('home.diseaseHistory') || 'History',    sub: 'Past Diagnoses',       color: '#0369a1', bg: '#eff6ff', border: '#bfdbfe', fn: onGoHistory },
    { emoji: '📊', label: 'Farm Dashboard',                           sub: 'Analytics & Insights', color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe', fn: onGoDashboard },
  ];

  const adminCards = [
    { emoji: '⚠️', label: 'Broadcast Alerts', sub: 'Send emergency alerts', color: '#991b1b', bg: '#fef2f2', border: '#fecaca', fn: onGoAdmin },
    { emoji: '🛡️', label: 'DB Users Vault',   sub: 'Manage all users',      color: '#1e1b4b', bg: '#eef2ff', border: '#c7d2fe', fn: onGoAdminUserList },
  ];

  const cards = role === 'admin' ? adminCards : farmerCards;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ─── HEADER ─── */}
      <View style={styles.header}>
        <HamburgerButton onPress={openDrawer} color="#fff" />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🌿 {t('app.name')}</Text>
          <Text style={styles.headerSub}>Krishi AI</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn} onPress={onGoNotifications}>
          <Text style={styles.bellIcon}>🔔</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ─── ALERT BANNER ─── */}
      {activeAlertMessage && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertIcon}>🚨</Text>
          <Text style={styles.alertBannerText} numberOfLines={2}>{activeAlertMessage}</Text>
          <TouchableOpacity
            onPress={async () => {
              if (activeAlertId) {
                await AsyncStorage.setItem(`seen_alert_${username}_${activeAlertId}`, '1');
              }
              setActiveAlertMessage(null);
              setActiveAlertId(null);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.alertBannerClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ─── MAIN SCROLL ─── */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroGreet}>Namaste, 🙏</Text>
            <Text style={styles.heroName}>{username}</Text>
            <Text style={styles.heroSub}>Your smart farm dashboard is ready</Text>
          </View>
          <Animated.Text
            style={[
              styles.heroFarmerEmoji,
              {
                transform: [{
                  translateY: farmerBounce.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }),
                }],
              },
            ]}
          >
            👨‍🌾
          </Animated.Text>
        </View>

        {/* Quick Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
            <Text style={styles.statEmoji}>🌱</Text>
            <Text style={styles.statLabel}>Farmer</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#f0f9ff' }]}>
            <Animated.Text
              style={[styles.statEmoji, {
                transform: [{ scale: sunPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }],
              }]}
            >
              ☀️
            </Animated.Text>
            <Text style={styles.statLabel}>Good Day</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#fffbeb' }]}>
            <Text style={styles.statEmoji}>🌾</Text>
            <Text style={styles.statLabel}>Season</Text>
          </View>
        </View>

        {/* Language Picker */}
        <View style={styles.langSection}>
          <LanguagePicker language={language} onChange={onChangeLanguage} />
        </View>

        {/* Section: Features */}
        <Text style={styles.sectionTitle}>
          {role === 'admin' ? '⚙️  Admin Tools' : '🛠️  Farm Tools'}
        </Text>
        <View style={styles.cardsGrid}>
          {cards.map((card, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.featureCard, { backgroundColor: card.bg, borderColor: card.border }]}
              onPress={card.fn}
              activeOpacity={0.78}
            >
              <View style={[styles.cardIconCircle, { backgroundColor: card.border }]}>
                <Text style={styles.cardEmoji}>{card.emoji}</Text>
              </View>
              <Text style={[styles.cardLabel, { color: card.color }]}>{card.label}</Text>
              <Text style={styles.cardSub}>{card.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Crops Section */}
        {role !== 'admin' && (
          <View style={styles.cropsSection}>
            <Text style={styles.sectionTitle}>🌿 Supported Crops</Text>
            <View style={styles.pillWrap}>
              {cropOptions.map((c) => (
                <View key={c.id} style={styles.pillRow}>
                  <Text style={styles.pill}>{t(`crops.${c.id}.label`)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Developer Menu */}
        {role !== 'admin' && (
          <TouchableOpacity style={styles.devCard} onPress={onGoDeveloper} activeOpacity={0.8}>
            <Text style={styles.devCardEmoji}>🧑‍💻</Text>
            <View>
              <Text style={styles.devCardTitle}>{t('home.developer')}</Text>
              <Text style={styles.devCardSub}>App info & developer tools</Text>
            </View>
            <Text style={styles.devCardArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.8}>
          <Text style={styles.logoutButtonText}>🚪  {t('common.logout')}</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>



      {/* ─── SLIDE-OUT DRAWER ─── */}
      <Modal visible={drawerOpen} transparent animationType="none" statusBarTranslucent>
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {/* Backdrop */}
          <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer}>
            <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} />
          </Pressable>

          {/* Drawer Panel */}
          <Animated.View
            {...panResponder.panHandlers}
            style={[styles.drawer, { width: DRAWER_WIDTH, transform: [{ translateX: slideAnim }] }]}
          >
            {/* Drawer Header */}
            <View style={styles.drawerProfileSection}>
              <View style={styles.drawerAvatar}>
                <Text style={styles.drawerAvatarText}>
                  {username ? username.charAt(0).toUpperCase() : 'F'}
                </Text>
              </View>
              <Text style={styles.drawerUsername}>{username}</Text>
              <View style={styles.drawerRoleBadge}>
                <Text style={styles.drawerRoleText}>
                  {role === 'admin' ? '🛡️ Admin' : '👨‍🌾 Farmer'}
                </Text>
              </View>
            </View>

            <View style={styles.drawerDivider} />

            <ScrollView showsVerticalScrollIndicator={false}>
              {role !== 'admin' && (
                <>
                  {[
                    { emoji: '🧑‍💻', label: t('home.developer'),                  fn: onGoDeveloper,   bg: '#1d4ed8' },
                    { emoji: '🏛️', label: t('home.govSchemes'),                   fn: onGoGovScheme,  bg: '#0f766e' },
                    { emoji: '⛅', label: t('home.weather'),                       fn: onGoWeather,    bg: '#0284c7' },
                    { emoji: '🚜', label: t('home.agriShare', 'Agri-Share'),       fn: onGoAgriShare,  bg: '#d97706' },
                    { emoji: '📈', label: t('home.mandiBhav', 'Mandi Bhav'),       fn: onGoMandi,      bg: '#ea580c' },
                    { emoji: '🧾', label: t('home.diseaseHistory', 'Disease History'), fn: onGoHistory, bg: '#0ea5e9' },
                    { emoji: '📍', label: t('home.geoFencing', 'Measure Land'),    fn: onGoGeoFencing, bg: '#7c3aed' },
                    { emoji: '🏦', label: 'Kisan Loan Finder',                       fn: onGoKisanLoan,  bg: '#1e3a8a' },
                    { emoji: '💬', label: t('home.community', 'Krishi Samvad'),    fn: onGoCommunity,  bg: '#059669' },
                    { emoji: '🤖', label: t('home.chatbot', 'Krishi Chatbot'),     fn: onGoChatbot,    bg: '#db2777' },
                    { emoji: '📊', label: 'Farm Dashboard',                          fn: onGoDashboard,  bg: '#7c3aed' },
                  ].map((item, i) => (
                    <Animated.View
                      key={i}
                      style={{
                        opacity: drawerItemsAnim.interpolate({ inputRange: [0, Math.min(i * 0.1, 0.8), 1], outputRange: [0, 0, 1] }),
                        transform: [{
                          translateX: drawerItemsAnim.interpolate({ inputRange: [0, 1], outputRange: [-28, 0] }),
                        }],
                        marginBottom: 8,
                      }}
                    >
                      <TouchableOpacity
                        style={[styles.drawerItem, { backgroundColor: item.bg }]}
                        onPress={() => navTo(item.fn)}
                        activeOpacity={0.82}
                      >
                        <Text style={styles.drawerItemEmoji}>{item.emoji}</Text>
                        <Text style={styles.drawerItemText}>{item.label}</Text>
                        <Text style={styles.drawerItemArrow}>›</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </>
              )}

              {role === 'admin' && (
                <>
                  {[
                    { emoji: '⚠️', label: 'Broadcast Alerts', fn: onGoAdmin,         bg: '#dc2626' },
                    { emoji: '🛡️', label: 'DB Users Vault',   fn: onGoAdminUserList, bg: '#1e293b' },
                  ].map((item, i) => (
                    <Animated.View
                      key={i}
                      style={{ opacity: drawerItemsAnim, transform: [{ translateX: drawerItemsAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }], marginBottom: 8 }}
                    >
                      <TouchableOpacity
                        style={[styles.drawerItem, { backgroundColor: item.bg }]}
                        onPress={() => navTo(item.fn)}
                        activeOpacity={0.82}
                      >
                        <Text style={styles.drawerItemEmoji}>{item.emoji}</Text>
                        <Text style={styles.drawerItemText}>{item.label}</Text>
                        <Text style={styles.drawerItemArrow}>›</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </>
              )}

              {/* Notifications drawer link */}
              <Animated.View style={{ opacity: drawerItemsAnim, marginBottom: 8 }}>
                <TouchableOpacity
                  style={[styles.drawerItem, { backgroundColor: '#475569' }]}
                  onPress={() => navTo(onGoNotifications)}
                  activeOpacity={0.82}
                >
                  <Text style={styles.drawerItemEmoji}>🔔</Text>
                  <Text style={styles.drawerItemText}>Notifications</Text>
                  {unreadCount > 0 && (
                    <View style={styles.drawerBadge}>
                      <Text style={styles.drawerBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
                  )}
                  <Text style={styles.drawerItemArrow}>›</Text>
                </TouchableOpacity>
              </Animated.View>

              <View style={styles.drawerDivider} />

              {/* Logout */}
              <TouchableOpacity style={styles.drawerLogout} onPress={onLogout} activeOpacity={0.8}>
                <Text style={styles.drawerLogoutText}>🚪  {t('common.logout')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f1f5f0' },

  // ── HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#166534',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 8,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#ffffff', letterSpacing: 0.3 },
  headerSub: { fontSize: 10, color: '#bbf7d0', fontWeight: '600', letterSpacing: 1.2 },
  bellBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bellIcon: { fontSize: 22 },
  badge: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: '#ef4444', borderRadius: 10,
    minWidth: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#166534',
  },
  badgeText: { color: 'white', fontSize: 9, fontWeight: '800' },

  // ── ALERT BANNER
  alertBanner: {
    backgroundColor: '#7f1d1d',
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#991b1b',
  },
  alertIcon: { fontSize: 18 },
  alertBannerText: { color: '#fef2f2', fontWeight: '700', flex: 1, fontSize: 13, lineHeight: 18 },
  alertBannerClose: { color: '#fca5a5', fontSize: 18, fontWeight: 'bold', paddingHorizontal: 4 },

  // ── SCROLL
  mainScroll: { flex: 1 },
  mainContent: { paddingBottom: 24 },

  // ── HERO BANNER
  heroBanner: {
    margin: 14,
    backgroundColor: '#166534',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  heroLeft: { flex: 1 },
  heroGreet: { fontSize: 13, color: '#bbf7d0', fontWeight: '600', marginBottom: 2 },
  heroName: { fontSize: 22, fontWeight: '900', color: '#ffffff', marginBottom: 4 },
  heroSub: { fontSize: 12, color: '#86efac', fontWeight: '500', lineHeight: 16 },
  heroFarmerEmoji: { fontSize: 52, marginLeft: 10 },

  // ── STATS ROW
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 14,
    marginBottom: 4,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '700', color: '#475569' },

  // ── LANGUAGE
  langSection: {
    marginHorizontal: 14,
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  // ── SECTION TITLE
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 18,
    marginBottom: 10,
    marginHorizontal: 14,
    letterSpacing: 0.2,
  },

  // ── FEATURE CARDS GRID
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 10,
    gap: 10,
  },
  featureCard: {
    width: (SCREEN_WIDTH - 20 - 30) / 2,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardEmoji: { fontSize: 22 },
  cardLabel: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  cardSub: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },

  // ── CROPS
  cropsSection: {
    marginHorizontal: 14,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    marginTop: 4,
  },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  pillRow: {},
  pill: {
    backgroundColor: '#f0fdf4',
    color: '#166534',
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },

  // ── DEV CARD
  devCard: {
    marginHorizontal: 14,
    marginTop: 12,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  devCardEmoji: { fontSize: 24 },
  devCardTitle: { color: '#f1f5f9', fontWeight: '800', fontSize: 14 },
  devCardSub: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  devCardArrow: { color: '#64748b', fontSize: 24, marginLeft: 'auto' },

  // ── LOGOUT
  logoutButton: {
    marginHorizontal: 14,
    marginTop: 14,
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fecaca',
  },
  logoutButtonText: { color: '#dc2626', fontSize: 15, fontWeight: '800' },



  // ── DRAWER
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawer: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    backgroundColor: '#0f172a',
    paddingTop: 52,
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: '#1e293b',
  },
  drawerProfileSection: {
    alignItems: 'center',
    paddingBottom: 18,
    paddingTop: 6,
  },
  drawerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#166534',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#4ade80',
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  drawerAvatarText: { color: '#ffffff', fontSize: 28, fontWeight: '900' },
  drawerUsername: { color: '#f1f5f9', fontSize: 16, fontWeight: '800', marginBottom: 6 },
  drawerRoleBadge: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  drawerRoleText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  drawerDivider: { height: 1, backgroundColor: '#1e293b', marginVertical: 12 },
  drawerItem: {
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  drawerItemEmoji: { fontSize: 17 },
  drawerItemText: { color: '#ffffff', fontSize: 14, fontWeight: '700', flex: 1 },
  drawerItemArrow: { color: 'rgba(255,255,255,0.4)', fontSize: 20 },
  drawerBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  drawerBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  drawerLogout: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  drawerLogoutText: { color: '#f87171', fontWeight: '800', fontSize: 14 },
});
