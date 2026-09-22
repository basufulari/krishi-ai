import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppLanguage, languages } from '../i18n';

type Props = {
  language: AppLanguage;
  onChange: (lang: AppLanguage) => void;
};

export function LanguagePicker({ language, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>🌐 {t('common.language')}</Text>
      <View style={styles.row}>
        {languages.map((l) => {
          const active = l.code === language;
          return (
            <TouchableOpacity
              key={l.code}
              style={[styles.langButton, active ? styles.langButtonActive : null]}
              onPress={() => onChange(l.code)}
              accessibilityRole="button"
              accessibilityLabel={`Set language to ${l.label}`}
              activeOpacity={0.75}
            >
              {active && <View style={styles.activeDot} />}
              <Text style={[styles.langText, active ? styles.langTextActive : null]}>
                {l.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 10, color: '#64748b', letterSpacing: 0.3 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langButton: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langButtonActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
  langText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  langTextActive: { color: '#15803d', fontWeight: '800' },
});
