import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useIsFocused } from '@react-navigation/native';
import { AppLanguage } from '../i18n';
import { type Equipment } from '../data/agriShareData';
import { EquipmentCard } from '../components/EquipmentCard';
import { StorageAgriShare } from '../utils/StorageAgriShare';

type Props = {
  language: AppLanguage;
  onBackHome: () => void;
  onGoDetails: (id: string) => void;
  onGoAdd: () => void;
  role: string;
  onGoEdit: (id: string) => void;
};

export function AgriShareHomeScreen({ onBackHome, onGoDetails, onGoAdd, role, onGoEdit }: Props) {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const isAdmin = role === 'admin';

  useEffect(() => {
    if (isFocused) {
      void StorageAgriShare.getEquipments().then(setEquipments);
    }
  }, [isFocused]);

  const handleDelete = (equipmentId: string) => {
    Alert.alert('Delete listing', 'Are you sure you want to delete this listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await StorageAgriShare.deleteEquipment(equipmentId);
          setEquipments((prev) => prev.filter((e) => e.id !== equipmentId));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackHome}>
          <Text style={styles.backButtonText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('agriShare.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.subheader}>
        <Text style={styles.subtitle}>{t('agriShare.subtitle')}</Text>
      </View>

      <FlatList
        data={equipments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <EquipmentCard
            equipment={item}
            onPress={() => onGoDetails(item.id)}
            isAdmin={isAdmin}
            onDelete={handleDelete}
            onEdit={isAdmin ? onGoEdit : undefined}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fab} onPress={onGoAdd} activeOpacity={0.8}>
        <Text style={styles.fabIcon}>+</Text>
        <Text style={styles.fabText}>{t('agriShare.addEquipment')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#14532d',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: { width: 70 },
  subheader: {
    padding: 16,
    backgroundColor: '#ecfdf5',
    borderBottomWidth: 1,
    borderBottomColor: '#d1fae5',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065f46',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#16a34a',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  fabIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: '400',
    marginRight: 8,
    marginTop: -2,
  },
  fabText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
  },
});
