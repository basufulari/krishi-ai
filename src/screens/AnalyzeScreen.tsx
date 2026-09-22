import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { useTranslation } from 'react-i18next';
import { LanguagePicker } from '../components/LanguagePicker';
import { AppLanguage } from '../i18n';
import { CropId, demoAnalyzeCrop } from '../demoAnalysis';
import type { AnalysisResult } from '../demoAnalysis';
import { analyzeCropWithApi } from '../aiClient';
import { AI_ALLOW_DEMO_FALLBACK } from '../config';
import { StorageDiseaseHistory, type DiseaseHistoryItem } from '../utils/StorageDiseaseHistory';
import { logActivity } from '../utils/logActivity';

type Props = {
  username: string;
  language: AppLanguage;
  onChangeLanguage: (lang: AppLanguage) => void;
  onBackHome: () => void;
};

export function AnalyzeScreen({ username: _username, language, onChangeLanguage, onBackHome }: Props) {
  const { t } = useTranslation();
  const headerIn = useRef(new Animated.Value(0)).current;
  const actionStagger = useRef(new Animated.Value(0)).current;
  const resultIn = useRef(new Animated.Value(0)).current;

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzePhase, setAnalyzePhase] = useState<'prepare' | 'upload' | null>(null);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const reportRef = useRef<View | null>(null);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(headerIn, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(actionStagger, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [actionStagger, headerIn]);

  React.useEffect(() => {
    if (!result) return;
    resultIn.setValue(0);
    Animated.timing(resultIn, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [result, resultIn]);

  async function pickFromCamera() {
    setError('');
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setError(t('analyze.permissionCameraDenied'));
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.75,
    });

    if (!res.canceled) {
      setPhotoUri(res.assets[0]?.uri ?? null);
      setResult(null);
    }
  }

  async function pickFromGallery() {
    setError('');
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError(t('analyze.permissionGalleryDenied'));
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.75,
    });

    if (!res.canceled) {
      setPhotoUri(res.assets[0]?.uri ?? null);
      setResult(null);
    }
  }

  const persistHistoryItem = (r: AnalysisResult) => {
    const photo = photoUri;
    if (!photo) return;

    const item: DiseaseHistoryItem = {
      id: Date.now().toString(),
      createdAt: new Date().toLocaleString(),
      language,
      photoUri: photo,
      cropId: r.cropId,
      diseaseId: r.diseaseId,
      confidence: r.confidence,
      plantName: r.plantName,
      diseaseName: r.diseaseName ?? undefined,
      preventionText: r.preventionText ?? undefined,
      stepsText: r.stepsText ?? undefined,
    };

    void StorageDiseaseHistory.addHistoryItem(_username, item);
    void logActivity(
      'SCAN',
      `Scanned ${r.cropId ?? 'crop'} — ${r.diseaseName || r.diseaseId || 'Result detected'}`,
      { confidence: Math.round(r.confidence * 100), cropId: r.cropId ?? '', diseaseId: r.diseaseId },
    );
  };

  async function onAnalyze() {
    setError('');
    if (!photoUri) {
      setError(t('analyze.chooseCropAndPhoto'));
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const r = await analyzeCropWithApi({
        language,
        photoUri,
        onProgress: (phase) => setAnalyzePhase(phase),
      });
      setResult(r);
      persistHistoryItem(r);
    } catch (e: any) {
      const msg = String(e?.message || '');
      // If API is not configured, optionally fall back to demo so the app stays usable.
      if (msg === 'AI_API_URL_NOT_CONFIGURED' && AI_ALLOW_DEMO_FALLBACK) {
        const r = demoAnalyzeCrop('rice', photoUri);
        setResult(r);
        persistHistoryItem(r);
        setError(t('analyze.demoFallbackUsed'));
      } else if (msg === 'AI_ANALYZE_TIMEOUT') {
        setError(t('analyze.analyzeTimeout'));
      } else {
        const trimmed = msg.length > 140 ? `${msg.slice(0, 140)}...` : msg;
        setError(trimmed ? `${t('analyze.apiError')}\n${trimmed}` : t('analyze.apiError'));
      }
    } finally {
      setAnalyzePhase(null);
      setIsAnalyzing(false);
    }
  }

  function escapeHtml(input: string): string {
    return input
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  async function shareAsImage() {
    if (!result) return;
    if (!reportRef.current) return;

    try {
      setIsSharing(true);

      const uri = await captureRef(reportRef.current, {
        format: 'png',
        quality: 0.95,
      });

      const available = await Sharing.isAvailableAsync();
      if (!available) throw new Error('Sharing not available');

      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: t('analyze.shareReport') });
    } catch {
      setError(t('analyze.shareError'));
    } finally {
      setIsSharing(false);
    }
  }

  async function shareAsPdf() {
    if (!result) return;

    try {
      setIsSharing(true);

      const plantName = result.plantName || 'Unknown';
      const diseaseName = result.diseaseName ?? t(`diseases.${result.diseaseId}.name`);
      const confidencePct = Math.round(result.confidence * 100);
      const prevention = result.preventionText ?? t(`diseases.${result.diseaseId}.prevention`);
      const stepsRaw = result.stepsText ?? t(`diseases.${result.diseaseId}.steps`);
      const steps = stepsRaw.split('\n');

      const stepsHtml = steps.map((s) => `<div>${escapeHtml(s)}</div>`).join('');

      const html = `
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial; padding: 18px; color: #111827;">
            <h2 style="text-align: center; margin-bottom: 6px;">Krishi-AI Report</h2>

            <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; margin-top: 10px;">
              <p style="margin: 0; font-weight: 800;">${escapeHtml(t('analyze.plant'))}: ${escapeHtml(plantName)}</p>
              <p style="margin: 0; font-weight: 800;">${escapeHtml(t('analyze.disease'))}: ${escapeHtml(diseaseName)}</p>
              <p style="margin: 6px 0 0 0; font-weight: 800;">${escapeHtml(t('analyze.confidence'))}: ${confidencePct}%</p>

              <h3 style="margin-top: 14px; margin-bottom: 6px; color: #14532d;">${escapeHtml(t('analyze.prevention'))}</h3>
              <p style="margin: 0; line-height: 1.4; font-weight: 600;">${escapeHtml(prevention)}</p>

              <h3 style="margin-top: 14px; margin-bottom: 6px; color: #14532d;">${escapeHtml(t('analyze.steps'))}</h3>
              <div style="font-weight: 600; line-height: 1.35;">${stepsHtml}</div>
            </div>

            <p style="margin-top: 14px; font-size: 12px; color: #6b7280; text-align: center;">
              ${escapeHtml(t('analyze.note'))}
            </p>
          </body>
        </html>
      `;

      const printResult = await Print.printToFileAsync({ html });
      const pdfUri = printResult.uri;
      if (!pdfUri) throw new Error('PDF generation failed');

      const available = await Sharing.isAvailableAsync();
      if (!available) throw new Error('Sharing not available');

      await Sharing.shareAsync(pdfUri, { mimeType: 'application/pdf', dialogTitle: t('analyze.shareReport') });
    } catch {
      setError(t('analyze.shareError'));
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View
          style={[
            styles.topRow,
            {
              opacity: headerIn,
              transform: [
                {
                  translateY: headerIn.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.title}>{t('analyze.title')}</Text>
          <TouchableOpacity style={styles.topBackBtn} onPress={onBackHome}>
            <Text style={styles.topBackBtnText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </Animated.View>

        <LanguagePicker language={language} onChange={onChangeLanguage} />

        <Animated.View
          style={[
            styles.card,
            {
              opacity: actionStagger,
              transform: [{ translateY: actionStagger.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          <Text style={styles.sectionLabel}>{t('common.analyze')}</Text>
          <View style={styles.photoRow}>
            <Animated.View
              style={{
                flex: 1,
                marginRight: 12,
                opacity: actionStagger.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0.7, 1] }),
                transform: [{ translateY: actionStagger.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
              }}
            >
            <TouchableOpacity style={styles.photoButton} onPress={pickFromCamera}>
              <Text style={styles.photoButtonText}>{t('common.takePhoto')}</Text>
            </TouchableOpacity>
            </Animated.View>
            <Animated.View
              style={{
                flex: 1,
                opacity: actionStagger.interpolate({ inputRange: [0, 0.75, 1], outputRange: [0, 0.65, 1] }),
                transform: [{ translateY: actionStagger.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
              }}
            >
            <TouchableOpacity style={styles.photoButton} onPress={pickFromGallery}>
              <Text style={styles.photoButtonText}>{t('common.chooseGallery')}</Text>
            </TouchableOpacity>
            </Animated.View>
          </View>

          {photoUri ? (
            <View style={styles.preview}>
              <Image source={{ uri: photoUri }} style={styles.previewImage} />
              <Text style={styles.previewHint}>{t('analyze.photoSelected')}</Text>
              <TouchableOpacity
                style={styles.clearPhotoBtn}
                onPress={() => {
                  setPhotoUri(null);
                  setResult(null);
                }}
                disabled={isAnalyzing}
              >
                <Text style={styles.clearPhotoBtnText}>Remove photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.previewHint}>{t('analyze.chooseCropAndPhoto')}</Text>
          )}

          {isAnalyzing ? (
            <View style={styles.analyzeBusy}>
              <ActivityIndicator size="large" color="#16a34a" />
              <Text style={styles.busyText}>
                {analyzePhase === 'prepare' ? t('analyze.optimizingPhoto') : t('common.analyzing')}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.primaryButton, !photoUri ? styles.primaryButtonDisabled : null]}
              onPress={onAnalyze}
              disabled={!photoUri}
            >
              <Text style={styles.primaryButtonText}>{t('common.analyze')}</Text>
            </TouchableOpacity>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </Animated.View>

        {result ? (
          <Animated.View
            style={[
              styles.resultCard,
              {
                opacity: resultIn,
                transform: [{ translateY: resultIn.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
              },
            ]}
          >
            <View ref={reportRef} collapsable={false}>
              <Text style={styles.resultTitle}>{t('analyze.resultTitle')}</Text>
              <Text style={styles.diseaseLine}>
                {t('analyze.plant')}: {result.plantName || 'Unknown'}
              </Text>
              <Text style={styles.diseaseLine}>
                {t('analyze.disease')}: {result.diseaseName ?? t(`diseases.${result.diseaseId}.name`)}
              </Text>
              <Text style={styles.confidenceLine}>
                {t('analyze.confidence')}: {Math.round(result.confidence * 100)}%
              </Text>

              <Text style={styles.note}>{t('analyze.note')}</Text>

              <Text style={styles.subTitle}>{t('analyze.prevention')}</Text>
              <Text style={styles.paragraph}>{result.preventionText ?? t(`diseases.${result.diseaseId}.prevention`)}</Text>

              <Text style={styles.subTitle}>{t('analyze.steps')}</Text>
              <Text style={styles.paragraph}>{result.stepsText ?? t(`diseases.${result.diseaseId}.steps`)}</Text>
            </View>

            <TouchableOpacity style={styles.backButton} onPress={onBackHome}>
              <Text style={styles.backButtonText}>{t('common.back')}</Text>
            </TouchableOpacity>

            <View style={styles.shareSection}>
              <Text style={styles.shareTitle}>{t('analyze.shareReport')}</Text>
              <View style={styles.shareRow}>
                <TouchableOpacity style={[styles.shareButton, styles.shareButtonImage]} onPress={shareAsImage} disabled={isSharing}>
                  <Text style={styles.shareButtonText}>{t('analyze.shareAsImage')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.shareButton, styles.shareButtonPdf]} onPress={shareAsPdf} disabled={isSharing}>
                  <Text style={styles.shareButtonText}>{t('analyze.shareAsPdf')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 18 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 22, fontWeight: '900', color: '#14532d', textAlign: 'center' },
  topBackBtn: {
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  topBackBtnText: { color: '#0f172a', fontWeight: '800', fontSize: 12 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#e5e7eb', marginTop: 12 },
  sectionLabel: { fontSize: 14, fontWeight: '900', color: '#111827', marginBottom: 10 },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoRow: { flexDirection: 'row', marginTop: 10 },
  photoButton: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  photoButtonText: { fontWeight: '900', color: '#0f766e' },
  preview: { marginTop: 12, alignItems: 'center' },
  previewImage: { width: '100%', height: 200, borderRadius: 12 },
  previewHint: { marginTop: 10, color: '#64748b', fontWeight: '600', textAlign: 'center' },
  clearPhotoBtn: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fee2e2',
  },
  clearPhotoBtnText: { color: '#b91c1c', fontWeight: '800', fontSize: 12 },
  primaryButton: { marginTop: 14, backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  primaryButtonDisabled: { backgroundColor: '#9be7b0' },
  primaryButtonText: { color: 'white', fontWeight: '900', fontSize: 16 },
  analyzeBusy: { marginTop: 14, alignItems: 'center' },
  busyText: { marginTop: 10, fontWeight: '800', color: '#166534' },
  error: { marginTop: 10, color: '#dc2626', fontWeight: '700', textAlign: 'center' },
  resultCard: { backgroundColor: 'white', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#e5e7eb', marginTop: 16 },
  resultTitle: { fontSize: 18, fontWeight: '900', color: '#14532d' },
  diseaseLine: { marginTop: 10, fontWeight: '900', color: '#111827' },
  confidenceLine: { marginTop: 6, fontWeight: '800', color: '#111827' },
  note: { marginTop: 10, color: '#6b7280', fontWeight: '700' },
  subTitle: { marginTop: 14, fontWeight: '900', color: '#0f766e' },
  paragraph: { marginTop: 6, color: '#111827', lineHeight: 20, fontWeight: '600' },
  backButton: { marginTop: 16, backgroundColor: '#0ea5e9', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  backButtonText: { color: 'white', fontWeight: '900' },

  shareSection: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  shareTitle: { fontWeight: '900', color: '#14532d', marginBottom: 10, textAlign: 'center' },
  shareRow: { flexDirection: 'row' },
  shareButton: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginRight: 8 },
  shareButtonPdf: { marginRight: 0, backgroundColor: '#334155' },
  shareButtonImage: { backgroundColor: '#16a34a' },
  shareButtonText: { color: 'white', fontWeight: '900', fontSize: 13 },
});

