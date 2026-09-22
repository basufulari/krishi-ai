import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { StorageDiseaseHistory, type DiseaseHistoryItem } from '../utils/StorageDiseaseHistory';
import { StorageUserHistory, type ActivityEvent } from '../utils/StorageUserHistory';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Types ─────────────────────────────────────────────────────────────────
type Props = {
  username: string;
  onBackHome: () => void;
};

type DashData = {
  totalScans: number;
  uniqueCrops: number;
  diseasesFound: number;
  daysActive: number;
  topDiseases: { name: string; count: number }[];
  cropCounts: { name: string; count: number; color: string }[];
  recentEvents: ActivityEvent[];
  scanHistory: DiseaseHistoryItem[];
};

// ─── Crop colours ──────────────────────────────────────────────────────────
const CROP_COLORS: Record<string, string> = {
  rice: '#16a34a',
  wheat: '#d97706',
  maize: '#ea580c',
  cotton: '#7c3aed',
  soybean: '#0ea5e9',
  tomato: '#dc2626',
  potato: '#78716c',
  default: '#6366f1',
};

// ─── Activity type config ──────────────────────────────────────────────────
const ACTIVITY_CONFIG: Record<string, { emoji: string; color: string }> = {
  SCAN:       { emoji: '🔬', color: '#16a34a' },
  WEATHER:    { emoji: '⛅', color: '#0284c7' },
  MANDI:      { emoji: '📈', color: '#d97706' },
  CHATBOT:    { emoji: '🤖', color: '#db2777' },
  LOAN:       { emoji: '🏦', color: '#1e40af' },
  GEO:        { emoji: '📍', color: '#7c3aed' },
  COMMUNITY:  { emoji: '💬', color: '#059669' },
  AGRISHARE:  { emoji: '🚜', color: '#92400e' },
  LOGIN:      { emoji: '✅', color: '#475569' },
  GOV_SCHEME: { emoji: '🏛️', color: '#0f766e' },
};

// ─── Animated counter component ────────────────────────────────────────────
function AnimatedCounter({ value, delay = 0, style }: { value: number; delay?: number; style?: object }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const listener = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    Animated.timing(anim, {
      toValue: value,
      duration: 1200,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(listener);
  }, [value, delay, anim]);

  return <Animated.Text style={style}>{display}</Animated.Text>;
}

// ─── Time-ago helper ───────────────────────────────────────────────────────
function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Main Screen ──────────────────────────────────────────────────────────
export function FarmerDashboardScreen({ username, onBackHome }: Props) {
  const isFocused = useIsFocused();

  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  // Animation refs
  const headerAnim   = useRef(new Animated.Value(0)).current;
  const statsAnim    = useRef(new Animated.Value(0)).current;
  const chartAnim    = useRef(new Animated.Value(0)).current;
  const feedAnim     = useRef(new Animated.Value(0)).current;
  const insightAnim  = useRef(new Animated.Value(0)).current;
  const pulse        = useRef(new Animated.Value(1)).current;

  // Pulse the hero icon
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0,  duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const runEntryAnims = useCallback(() => {
    [headerAnim, statsAnim, chartAnim, feedAnim, insightAnim].forEach(a => a.setValue(0));
    Animated.stagger(120, [
      Animated.spring(headerAnim,  { toValue: 1, useNativeDriver: true, friction: 8 }),
      Animated.spring(statsAnim,   { toValue: 1, useNativeDriver: true, friction: 8 }),
      Animated.spring(chartAnim,   { toValue: 1, useNativeDriver: true, friction: 8 }),
      Animated.spring(feedAnim,    { toValue: 1, useNativeDriver: true, friction: 8 }),
      Animated.spring(insightAnim, { toValue: 1, useNativeDriver: true, friction: 8 }),
    ]).start();
  }, [headerAnim, statsAnim, chartAnim, feedAnim, insightAnim]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [scans, summary] = await Promise.all([
      StorageDiseaseHistory.getHistory(username),
      StorageUserHistory.getSummary(username),
    ]);

    // Build disease frequency
    const diseaseMap: Record<string, number> = {};
    const cropMap: Record<string, number> = {};
    for (const s of scans) {
      const dk = s.diseaseName || s.diseaseId || 'Unknown';
      diseaseMap[dk] = (diseaseMap[dk] ?? 0) + 1;
      const ck = s.cropId || 'Unknown';
      cropMap[ck] = (cropMap[ck] ?? 0) + 1;
    }

    const topDiseases = Object.entries(diseaseMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const cropCounts = Object.entries(cropMap)
      .map(([name, count]) => ({
        name,
        count,
        color: CROP_COLORS[name.toLowerCase()] ?? CROP_COLORS.default,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const uniqueCrops = Object.keys(cropMap).length;

    // Merge scan events into the recent feed
    const diseaseEvents: ActivityEvent[] = scans.slice(0, 5).map(s => ({
      id: s.id,
      type: 'SCAN' as const,
      timestamp: new Date(s.createdAt).getTime() || Date.now() - 3600000,
      label: `Scanned ${s.cropId ?? 'crop'} — ${s.diseaseName || s.diseaseId || 'Result'}`,
    }));

    // Merge with user events (already have scans from StorageUserHistory too)
    const merged = [...summary.recentEvents, ...diseaseEvents]
      .filter((e, i, arr) => arr.findIndex(x => x.id === e.id) === i)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 12);

    setData({
      totalScans: scans.length,
      uniqueCrops,
      diseasesFound: Object.keys(diseaseMap).length,
      daysActive: summary.daysActive || 1,
      topDiseases,
      cropCounts,
      recentEvents: merged,
      scanHistory: scans,
    });
    setLoading(false);
    runEntryAnims();
  }, [username, runEntryAnims]);

  useEffect(() => {
    if (isFocused) {
      void loadData();
    }
  }, [isFocused, loadData]);

  // ── Generate AI insight based on scan data ──────────────────────────────
  function getInsight(d: DashData): { emoji: string; title: string; body: string } {
    if (d.totalScans === 0) {
      return {
        emoji: '💡',
        title: 'Start Your First Scan',
        body: 'Use the 🔬 Crop Scanner to scan your crop leaves. Your farm insights will appear here after your first analysis.',
      };
    }
    if (d.topDiseases.length > 0) {
      const top = d.topDiseases[0];
      const pct = Math.round((top.count / d.totalScans) * 100);
      return {
        emoji: '⚠️',
        title: `Watch Out: ${top.name}`,
        body: `${pct}% of your scans detected ${top.name}. Consider consulting an agronomist and using preventive fungicide or pesticide treatment.`,
      };
    }
    return {
      emoji: '✅',
      title: 'Crops Looking Healthy!',
      body: `You've done ${d.totalScans} scan${d.totalScans > 1 ? 's' : ''} across ${d.uniqueCrops} crop type${d.uniqueCrops > 1 ? 's' : ''}. Keep up the regular monitoring to catch issues early.`,
    };
  }

  // ─── Bar chart helpers ─────────────────────────────────────────────────
  const maxDiseaseCount = data?.topDiseases[0]?.count ?? 1;
  const BAR_MAX_W = SCREEN_W - 48 - 80; // leave room for label

  // ── LOADING STATE ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingEmoji}>📊</Text>
          <Text style={styles.loadingText}>Loading your farm data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) return null;
  const insight = getInsight(data);

  const animStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── HEADER ── */}
      <Animated.View style={[styles.topBar, animStyle(headerAnim)]}>
        <TouchableOpacity onPress={onBackHome} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>📊 Farm Analytics</Text>
        <View style={{ width: 64 }} />
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO BANNER ── */}
        <Animated.View style={[styles.heroBanner, animStyle(headerAnim)]}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroGreet}>Welcome back, 🙏</Text>
            <Text style={styles.heroName}>{username}</Text>
            <Text style={styles.heroSub}>Here's your farm performance overview</Text>
          </View>
          <Animated.Text style={[styles.heroEmoji, { transform: [{ scale: pulse }] }]}>
            📊
          </Animated.Text>
        </Animated.View>

        {/* ── STATS GRID ── */}
        <Animated.View style={[styles.statsGrid, animStyle(statsAnim)]}>
          {[
            { label: 'Total Scans',     value: data.totalScans,    emoji: '🔬', bg: '#f0fdf4', border: '#bbf7d0', num: '#16a34a' },
            { label: 'Crops Scanned',   value: data.uniqueCrops,   emoji: '🌾', bg: '#fffbeb', border: '#fde68a', num: '#d97706' },
            { label: 'Diseases Found',  value: data.diseasesFound, emoji: '🏥', bg: '#fef2f2', border: '#fecaca', num: '#dc2626' },
            { label: 'Days Active',     value: data.daysActive,    emoji: '📅', bg: '#eff6ff', border: '#bfdbfe', num: '#2563eb' },
          ].map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: stat.bg, borderColor: stat.border }]}>
              <Text style={styles.statEmoji}>{stat.emoji}</Text>
              <AnimatedCounter
                value={stat.value}
                delay={i * 120}
                style={[styles.statNum, { color: stat.num }]}
              />
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ── DISEASE BAR CHART ── */}
        <Animated.View style={[styles.card, animStyle(chartAnim)]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🦠 Top Diseases Detected</Text>
            <Text style={styles.cardSub}>{data.topDiseases.length > 0 ? `${data.totalScans} total scans` : 'No data yet'}</Text>
          </View>

          {data.topDiseases.length === 0 ? (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyChartEmoji}>🔬</Text>
              <Text style={styles.emptyChartText}>Scan your crops to see disease trends here</Text>
            </View>
          ) : (
            <View style={styles.barChart}>
              {data.topDiseases.map((d, i) => {
                const barW = (d.count / maxDiseaseCount) * BAR_MAX_W;
                const pct = Math.round((d.count / data.totalScans) * 100);
                const hue = [0, 24, 142, 200, 270][i % 5];
                return (
                  <View key={i} style={styles.barRow}>
                    <Text style={styles.barLabel} numberOfLines={1}>{d.name}</Text>
                    <View style={styles.barTrack}>
                      <Animated.View
                        style={[
                          styles.barFill,
                          {
                            width: chartAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, barW],
                            }),
                            backgroundColor: `hsl(${hue}, 72%, 48%)`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barPct, { color: `hsl(${hue}, 60%, 40%)` }]}>{pct}%</Text>
                  </View>
                );
              })}
            </View>
          )}
        </Animated.View>

        {/* ── CROP BREAKDOWN ── */}
        {data.cropCounts.length > 0 && (
          <Animated.View style={[styles.card, animStyle(chartAnim)]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>🌾 Crop Breakdown</Text>
              <Text style={styles.cardSub}>{data.uniqueCrops} crop type{data.uniqueCrops !== 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.cropGrid}>
              {data.cropCounts.map((c, i) => {
                const pct = data.totalScans > 0 ? Math.round((c.count / data.totalScans) * 100) : 0;
                return (
                  <View key={i} style={styles.cropItem}>
                    <View style={[styles.cropDot, { backgroundColor: c.color }]} />
                    <View style={styles.cropBarWrap}>
                      <View style={styles.cropBarTrack}>
                        <Animated.View
                          style={[
                            styles.cropBarFill,
                            {
                              width: chartAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', `${pct}%`],
                              }),
                              backgroundColor: c.color,
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={styles.cropName} numberOfLines={1}>
                      {c.name} <Text style={{ color: '#94a3b8', fontSize: 11 }}>({c.count})</Text>
                    </Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* ── AI INSIGHT CARD ── */}
        <Animated.View style={[styles.insightCard, animStyle(insightAnim)]}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightEmoji}>{insight.emoji}</Text>
            <Text style={styles.insightTitle}>{insight.title}</Text>
          </View>
          <Text style={styles.insightBody}>{insight.body}</Text>
          <View style={styles.insightBadge}>
            <Text style={styles.insightBadgeText}>🤖 AI Insight</Text>
          </View>
        </Animated.View>

        {/* ── RECENT ACTIVITY FEED ── */}
        <Animated.View style={[styles.card, animStyle(feedAnim)]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🕐 Recent Activity</Text>
            <Text style={styles.cardSub}>{data.recentEvents.length} events</Text>
          </View>

          {data.recentEvents.length === 0 ? (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyChartEmoji}>📋</Text>
              <Text style={styles.emptyChartText}>Start using the app — your activity will appear here</Text>
            </View>
          ) : (
            <View style={styles.feedList}>
              {data.recentEvents.map((event, i) => {
                const cfg = ACTIVITY_CONFIG[event.type] ?? { emoji: '📌', color: '#64748b' };
                return (
                  <Animated.View
                    key={event.id}
                    style={[
                      styles.feedRow,
                      {
                        opacity: feedAnim.interpolate({
                          inputRange: [0, Math.min(i * 0.08 + 0.1, 0.9), 1],
                          outputRange: [0, 0, 1],
                        }),
                        transform: [{
                          translateX: feedAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                          }),
                        }],
                      },
                    ]}
                  >
                    {/* Timeline dot */}
                    <View style={styles.feedDotWrap}>
                      <View style={[styles.feedDot, { backgroundColor: cfg.color }]} />
                      {i < data.recentEvents.length - 1 && <View style={styles.feedLine} />}
                    </View>
                    {/* Event card */}
                    <View style={[styles.feedEventCard, { borderLeftColor: cfg.color }]}>
                      <View style={styles.feedEventTop}>
                        <Text style={styles.feedEmoji}>{cfg.emoji}</Text>
                        <Text style={styles.feedLabel} numberOfLines={2}>{event.label}</Text>
                      </View>
                      <Text style={styles.feedTime}>{timeAgo(event.timestamp)}</Text>
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          )}
        </Animated.View>

        {/* ── SCAN HISTORY MINI LIST ── */}
        {data.scanHistory.length > 0 && (
          <Animated.View style={[styles.card, animStyle(feedAnim)]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>🔬 Recent Scans</Text>
              <Text style={styles.cardSub}>{data.totalScans} total</Text>
            </View>
            {data.scanHistory.slice(0, 5).map((s, i) => {
              const conf = Math.round(s.confidence * 100);
              const color = conf >= 80 ? '#dc2626' : conf >= 60 ? '#d97706' : '#16a34a';
              return (
                <View key={s.id} style={[styles.scanRow, i === 0 && { borderTopWidth: 0 }]}>
                  <View style={[styles.scanConfBadge, { backgroundColor: color + '22' }]}>
                    <Text style={[styles.scanConfText, { color }]}>{conf}%</Text>
                  </View>
                  <View style={styles.scanInfo}>
                    <Text style={styles.scanCrop}>{s.cropId ?? 'Unknown crop'}</Text>
                    <Text style={styles.scanDisease} numberOfLines={1}>
                      {s.diseaseName || s.diseaseId || 'Unknown disease'}
                    </Text>
                  </View>
                  <Text style={styles.scanTime}>{s.createdAt}</Text>
                </View>
              );
            })}
          </Animated.View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingEmoji: { fontSize: 52, marginBottom: 16 },
  loadingText: { color: '#94a3b8', fontSize: 16, fontWeight: '700' },

  // ── TOP BAR
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backBtnText: { color: '#94a3b8', fontWeight: '800', fontSize: 13 },
  topBarTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '900', letterSpacing: 0.2 },

  scroll: { flex: 1, backgroundColor: '#0f172a' },
  scrollContent: { paddingBottom: 24 },

  // ── HERO BANNER
  heroBanner: {
    margin: 14,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    backgroundColor: '#166534',
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  heroLeft: { flex: 1 },
  heroGreet: { color: '#bbf7d0', fontSize: 13, fontWeight: '600', marginBottom: 3 },
  heroName: { color: '#ffffff', fontSize: 24, fontWeight: '900', marginBottom: 5 },
  heroSub: { color: '#86efac', fontSize: 12, fontWeight: '500', lineHeight: 17 },
  heroEmoji: { fontSize: 54, marginLeft: 10 },

  // ── STATS GRID
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 10,
    gap: 10,
    marginBottom: 4,
  },
  statCard: {
    width: (SCREEN_W - 20 - 10) / 2,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  statEmoji: { fontSize: 28, marginBottom: 8 },
  statNum: { fontSize: 32, fontWeight: '900', marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', textAlign: 'center' },

  // ── GENERIC CARD
  card: {
    marginHorizontal: 14,
    marginTop: 14,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: { color: '#f1f5f9', fontSize: 15, fontWeight: '900' },
  cardSub: { color: '#64748b', fontSize: 12, fontWeight: '600' },

  emptyChart: { alignItems: 'center', paddingVertical: 24 },
  emptyChartEmoji: { fontSize: 36, marginBottom: 10 },
  emptyChartText: { color: '#64748b', fontWeight: '600', textAlign: 'center', fontSize: 13 },

  // ── BAR CHART
  barChart: { gap: 12 },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    width: 80,
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#334155',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  barPct: {
    width: 36,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
  },

  // ── CROP GRID
  cropGrid: { gap: 10 },
  cropItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cropDot: { width: 12, height: 12, borderRadius: 6 },
  cropBarWrap: { flex: 1 },
  cropBarTrack: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  cropBarFill: { height: '100%', borderRadius: 4 },
  cropName: { width: 90, color: '#94a3b8', fontSize: 12, fontWeight: '700' },

  // ── AI INSIGHT
  insightCard: {
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#1a1a2e',
    borderWidth: 1.5,
    borderColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  insightEmoji: { fontSize: 26 },
  insightTitle: { color: '#e0e7ff', fontSize: 15, fontWeight: '900', flex: 1 },
  insightBody: { color: '#a5b4fc', fontSize: 13, fontWeight: '600', lineHeight: 20 },
  insightBadge: {
    marginTop: 14,
    alignSelf: 'flex-start',
    backgroundColor: '#312e81',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  insightBadgeText: { color: '#c7d2fe', fontSize: 11, fontWeight: '800' },

  // ── ACTIVITY FEED
  feedList: { gap: 0 },
  feedRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  feedDotWrap: { alignItems: 'center', width: 24, paddingTop: 4 },
  feedDot: { width: 10, height: 10, borderRadius: 5, zIndex: 1 },
  feedLine: { width: 2, flex: 1, backgroundColor: '#334155', marginTop: 2, minHeight: 20 },
  feedEventCard: {
    flex: 1,
    marginLeft: 10,
    marginBottom: 12,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 12,
    borderLeftWidth: 3,
  },
  feedEventTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  feedEmoji: { fontSize: 16, marginTop: 1 },
  feedLabel: { flex: 1, color: '#cbd5e1', fontSize: 13, fontWeight: '700', lineHeight: 18 },
  feedTime: { color: '#475569', fontSize: 11, fontWeight: '600', marginTop: 6 },

  // ── SCAN HISTORY
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 12,
  },
  scanConfBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanConfText: { fontSize: 14, fontWeight: '900' },
  scanInfo: { flex: 1 },
  scanCrop: { color: '#f1f5f9', fontSize: 14, fontWeight: '800', textTransform: 'capitalize' },
  scanDisease: { color: '#94a3b8', fontSize: 12, fontWeight: '600', marginTop: 2 },
  scanTime: { color: '#475569', fontSize: 10, fontWeight: '600', textAlign: 'right', maxWidth: 80 },
});
