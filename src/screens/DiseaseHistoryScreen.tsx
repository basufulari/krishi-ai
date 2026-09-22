import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { AppLanguage } from '../i18n';
import type { DiseaseHistoryItem } from '../utils/StorageDiseaseHistory';
import { StorageDiseaseHistory } from '../utils/StorageDiseaseHistory';
import type { CropId } from '../demoAnalysis';

type Props = {
  username: string;
  language: AppLanguage;
  onBackHome: () => void;
};

export function DiseaseHistoryScreen({ username, onBackHome }: Props) {
  const { t } = useTranslation();
  const [items, setItems] = useState<DiseaseHistoryItem[]>([]);
  const [selected, setSelected] = useState<DiseaseHistoryItem | null>(null);

  useEffect(() => {
    void StorageDiseaseHistory.getHistory(username).then((list) => {
      setItems(list);
      setSelected((prev) => prev ?? list[0] ?? null);
    });
  }, [username]);

  const selectedCropLabel = useMemo(() => {
    if (!selected) return '';
    return t(`crops.${selected.cropId as CropId}.label`, String(selected.cropId));
  }, [selected, t]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBackHome} style={styles.backButton}>
            <Text style={styles.backText}>← {t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crop Disease History</Text>
          <View style={{ width: 90 }} />
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No detection history found.</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Detections</Text>

            {items.map((item) => {
              const diseaseLabel = t(`diseases.${item.diseaseId}.name`, item.diseaseId);
              const confidencePct = Math.round(item.confidence * 100);
              const isActive = selected?.id === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.historyRow, isActive && styles.historyRowActive]}
                  onPress={() => setSelected(item)}
                >
                  <View style={styles.historyRowLeft}>
                    <Text style={styles.historyRowTitle}>{selected?.id === item.id ? '• ' : ''}{t(`crops.${item.cropId as CropId}.label`, String(item.cropId))}</Text>
                    <Text style={styles.historyRowSub}>{diseaseLabel}</Text>
                  </View>
                  <View style={styles.historyRowRight}>
                    <Text style={styles.confidenceText}>{confidencePct}%</Text>
                    <Text style={styles.timeText}>{item.createdAt}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {selected ? (
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>Latest Result</Text>

            {selected.photoUri ? (
              <Image source={{ uri: selected.photoUri }} style={styles.photo} resizeMode="cover" />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>No photo saved</Text>
              </View>
            )}

            <Text style={styles.detailLine}>
              Plant: {selectedCropLabel}
            </Text>
            <Text style={styles.detailLine}>
              Disease: {t(`diseases.${selected.diseaseId}.name`, selected.diseaseId)}
            </Text>
            <Text style={styles.detailLine}>
              Confidence: {Math.round(selected.confidence * 100)}%
            </Text>

            <View style={styles.divider} />

            <Text style={styles.detailSubtitle}>{t('analyze.prevention')}</Text>
            <Text style={styles.detailParagraph}>
              {selected.preventionText ?? t(`diseases.${selected.diseaseId}.prevention`)}
            </Text>

            <Text style={[styles.detailSubtitle, { marginTop: 12 }]}>{t('analyze.steps')}</Text>
            <Text style={styles.detailParagraph}>
              {selected.stepsText ?? t(`diseases.${selected.diseaseId}.steps`).toString()}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backButton: { paddingVertical: 8 },
  backText: { fontWeight: '800', color: '#059669' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#14532d' },
  emptyCard: { padding: 28, borderRadius: 16, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { color: '#64748b', fontWeight: '700', textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#111827', marginBottom: 10 },
  historyRow: {
    backgroundColor: 'white',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyRowActive: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  historyRowLeft: { flex: 1, paddingRight: 10 },
  historyRowTitle: { fontWeight: '900', color: '#1e293b' },
  historyRowSub: { fontWeight: '700', color: '#059669', marginTop: 4 },
  historyRowRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  confidenceText: { fontWeight: '900', color: '#16a34a' },
  timeText: { color: '#94a3b8', fontWeight: '600', fontSize: 12, marginTop: 6 },
  detailCard: {
    marginTop: 12,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailTitle: { fontSize: 16, fontWeight: '900', color: '#14532d', marginBottom: 12 },
  photo: { width: '100%', height: 220, borderRadius: 14, backgroundColor: '#e2e8f0', marginBottom: 12 },
  photoPlaceholder: { width: '100%', height: 220, borderRadius: 14, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  photoPlaceholderText: { color: '#64748b', fontWeight: '700' },
  detailLine: { marginTop: 6, fontWeight: '800', color: '#111827' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginTop: 14, marginBottom: 12 },
  detailSubtitle: { fontWeight: '900', color: '#14532d' },
  detailParagraph: { marginTop: 6, color: '#334155', fontWeight: '600', lineHeight: 22 },
});

