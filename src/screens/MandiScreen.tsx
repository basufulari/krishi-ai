import React, { useState, useMemo, useEffect } from 'react';
import { Animated, Easing, View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppLanguage } from '../i18n';
import { mockMarketPrices, MarketPrice } from '../data/mandiData';
import { logActivity } from '../utils/logActivity';

type Props = {
  language: AppLanguage;
  onBackHome: () => void;
};

export function MandiScreen({ onBackHome }: Props) {
  const { t } = useTranslation();
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const tickerX = React.useRef(new Animated.Value(0)).current;
  const chipPulse = React.useRef(new Animated.Value(0)).current;

  // Track screen visit
  useEffect(() => {
    void logActivity('MANDI', 'Checked mandi market prices');
  }, []);

  // Extract unique filters from mock data
  const crops = useMemo(() => Array.from(new Set(mockMarketPrices.map((m) => m.cropKey))), []);
  const markets = useMemo(() => Array.from(new Set(mockMarketPrices.map((m) => m.marketKey))), []);

  const filteredData = useMemo(() => {
    return mockMarketPrices.filter((item) => {
      if (selectedCrop && item.cropKey !== selectedCrop) return false;
      if (selectedMarket && item.marketKey !== selectedMarket) return false;
      return true;
    });
  }, [selectedCrop, selectedMarket]);

  React.useEffect(() => {
    const tickerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(tickerX, { toValue: 1, duration: 5400, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(tickerX, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    const chipLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(chipPulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(chipPulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    tickerLoop.start();
    chipLoop.start();
    return () => {
      tickerLoop.stop();
      chipLoop.stop();
    };
  }, [chipPulse, tickerX]);

  const renderFilterChips = (data: string[], selected: string | null, onSelect: (val: string | null) => void, clearLabel: string) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
      <Animated.View
        style={!selected ? { transform: [{ scale: chipPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }] } : undefined}
      >
        <TouchableOpacity
          style={[styles.chip, !selected && styles.chipActive]}
          onPress={() => onSelect(null)}
        >
          <Text style={[styles.chipText, !selected && styles.chipTextActive]}>{clearLabel}</Text>
        </TouchableOpacity>
      </Animated.View>
      {data.map((key) => (
        <Animated.View
          key={key}
          style={selected === key ? { transform: [{ scale: chipPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }] } : undefined}
        >
          <TouchableOpacity
            style={[styles.chip, selected === key && styles.chipActive]}
            onPress={() => onSelect(key)}
          >
            <Text style={[styles.chipText, selected === key && styles.chipTextActive]}>{t(key)}</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </ScrollView>
  );

  const renderItem = ({ item }: { item: MarketPrice }) => {
    const isUp = item.trend === 'up';
    const isDown = item.trend === 'down';
    const trendColor = isUp ? '#059669' : isDown ? '#dc2626' : '#64748b';
    const trendIcon = isUp ? '▲' : isDown ? '▼' : '▬';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cropName}>{t(item.cropKey)}</Text>
          <View style={[styles.trendBadge, { backgroundColor: `${trendColor}1A` }]}>
            <Text style={[styles.trendIcon, { color: trendColor }]}>{trendIcon}</Text>
            <Text style={[styles.trendValue, { color: trendColor }]}>
              ₹{item.trendValue} {t('mandi.trendPrefix')}
            </Text>
          </View>
        </View>

        <Text style={styles.marketName}>📍 {t(item.marketKey)}</Text>
        
        <View style={styles.priceContainer}>
          <View>
            <Text style={styles.priceLabel}>{t('mandi.todayModal')}</Text>
            <Text style={styles.modalPrice}>₹{item.modalPrice}</Text>
            <Text style={styles.quintalText}>{t('mandi.pricePerQuintal')}</Text>
          </View>
          <View style={styles.minMaxContainer}>
            <Text style={styles.minMaxLabel}>{t('mandi.minMax')}</Text>
            <Text style={styles.minMaxValues}>₹{item.minPrice} - ₹{item.maxPrice}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackHome} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{t('mandi.title')}</Text>
          <Text style={styles.headerSub}>{t('mandi.subtitle')}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tickerWrap}>
        <Animated.Text
          style={[
            styles.tickerText,
            {
              transform: [
                {
                  translateX: tickerX.interpolate({
                    inputRange: [0, 1],
                    outputRange: [250, -420],
                  }),
                },
              ],
            },
          ]}
        >
          {t('mandi.subtitle')}  •  {t('mandi.todayModal')}  •  {t('mandi.minMax')}
        </Animated.Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <Text style={styles.filterTitle}>{t('mandi.filterCrop')}</Text>
        {renderFilterChips(crops, selectedCrop, setSelectedCrop, t('mandi.allCrops'))}
        
        <Text style={styles.filterTitle}>{t('mandi.filterMarket')}</Text>
        {renderFilterChips(markets, selectedMarket, setSelectedMarket, t('mandi.allMarkets'))}
      </View>

      {/* Data List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No data available for this filter.</Text>}
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', textAlign: 'center' },
  headerSub: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 2 },
  tickerWrap: {
    height: 28,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#bbf7d0',
  },
  tickerText: { color: '#166534', fontWeight: '800', fontSize: 12 },
  filtersSection: { paddingVertical: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  filterTitle: { fontSize: 13, fontWeight: '600', color: '#94a3b8', marginLeft: 16, marginBottom: 8, textTransform: 'uppercase' },
  chipContainer: { paddingHorizontal: 16, marginBottom: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  chipText: { fontSize: 14, color: '#475569', fontWeight: '500' },
  chipTextActive: { color: '#ffffff' },
  listContent: { padding: 16 },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontSize: 16 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cropName: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  trendIcon: { fontSize: 12, marginRight: 4 },
  trendValue: { fontSize: 12, fontWeight: '600' },
  marketName: { fontSize: 15, color: '#475569', marginBottom: 16, fontWeight: '500' },
  priceContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12 },
  priceLabel: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  modalPrice: { fontSize: 24, fontWeight: '800', color: '#16a34a' },
  quintalText: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  minMaxContainer: { alignItems: 'flex-end' },
  minMaxLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  minMaxValues: { fontSize: 14, fontWeight: '600', color: '#475569' },
});
