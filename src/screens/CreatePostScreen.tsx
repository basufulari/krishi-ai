import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppLanguage } from '../i18n';

type Props = {
  language: AppLanguage;
  onBack: () => void;
  onPublish: (text: string) => void;
};

export function CreatePostScreen({ onBack, onPublish }: Props) {
  const { t } = useTranslation();
  const [content, setContent] = useState('');

  const handlePublish = () => {
    if (content.trim().length > 0) {
      onPublish(content.trim());
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>{t('common.close', 'Close')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('community.newPost', 'New Post')}</Text>
          <TouchableOpacity onPress={handlePublish} disabled={content.trim().length === 0} style={[styles.publishBtn, content.trim().length === 0 && styles.publishBtnDisabled]}>
            <Text style={styles.publishText}>{t('community.publish', 'Publish')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('community.placeholder', 'Ask a question or share advice...')}
            placeholderTextColor="#94a3b8"
            multiline
            autoFocus
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: { },
  backText: { fontSize: 16, color: '#64748b' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  publishBtn: { backgroundColor: '#16a34a', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  publishBtnDisabled: { backgroundColor: '#a7f3d0' },
  publishText: { color: 'white', fontWeight: '700', fontSize: 14 },
  inputContainer: { flex: 1, padding: 20 },
  input: { flex: 1, fontSize: 18, color: '#1e293b', lineHeight: 28 },
});
