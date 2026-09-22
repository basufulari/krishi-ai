import React from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppLanguage } from '../i18n';
import { govSchemes } from '../data/govSchemes';

type Props = {
  language: AppLanguage;
  onBackHome: () => void;
};

function getSchemeText(scheme: (typeof govSchemes)[0], lang: AppLanguage) {
  const name = lang === 'mr' ? scheme.nameMr : lang === 'kn' ? scheme.nameKn : scheme.nameEn;
  const desc = lang === 'mr' ? scheme.descMr : lang === 'kn' ? scheme.descKn : scheme.descEn;
  return { name, desc };
}

export function GovSchemeScreen({ language, onBackHome }: Props) {
  const { t } = useTranslation();

  async function openLink(url: string) {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(t('govScheme.openError'), t('govScheme.cannotOpen'));
      }
    } catch {
      Alert.alert(t('govScheme.openError'), t('govScheme.cannotOpen'));
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('govScheme.title')}</Text>
        <Text style={styles.subtitle}>{t('govScheme.subtitle')}</Text>

        {govSchemes.map((scheme) => {
          const { name, desc } = getSchemeText(scheme, language);
          return (
            <TouchableOpacity
              key={scheme.id}
              style={styles.card}
              onPress={() => openLink(scheme.url)}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <Text style={styles.schemeName}>{name}</Text>
                <Text style={styles.schemeDesc}>{desc}</Text>
                <Text style={styles.linkText}>{scheme.url}</Text>
                <View style={styles.openBadge}>
                  <Text style={styles.openBadgeText}>{t('govScheme.openLink')}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.backButton} onPress={onBackHome}>
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0fdf4' },
  scroll: { padding: 18, paddingBottom: 30 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#14532d',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    overflow: 'hidden',
  },
  cardContent: { padding: 16 },
  schemeName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#14532d',
  },
  schemeDesc: {
    fontSize: 13,
    color: '#166534',
    marginTop: 6,
    lineHeight: 20,
  },
  linkText: {
    fontSize: 12,
    color: '#15803d',
    marginTop: 8,
    fontWeight: '600',
  },
  openBadge: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: '#16a34a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  openBadgeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '800',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#16a34a',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backButtonText: { color: 'white', fontSize: 16, fontWeight: '800' },
});
