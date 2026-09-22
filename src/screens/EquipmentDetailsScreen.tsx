import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppLanguage } from '../i18n';
import { type Equipment } from '../data/agriShareData';
import { StorageAgriShare } from '../utils/StorageAgriShare';

type Props = {
  language: AppLanguage;
  equipmentId: string;
  onBack: () => void;
};

export function EquipmentDetailsScreen({ equipmentId, onBack }: Props) {
  const { t } = useTranslation();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    void StorageAgriShare.getEquipmentById(equipmentId).then((e) => {
      setEquipment(e);
      setIsLoading(false);
    });
  }, [equipmentId]);

  const handleCallOwner = () => {
    if (!equipment?.contactNumber) {
      Alert.alert('Error', 'Contact number not available.');
      return;
    }
    const url = `tel:${equipment.contactNumber}`;
    Linking.openURL(url).catch((err) => {
      console.error('Error opening dialer', err);
      Alert.alert('Error', 'Could not open phone dialer on this device.');
    });
  };

  const openLocationInMaps = () => {
    if (!equipment?.locationLatitude || !equipment?.locationLongitude) return;
    const lat = equipment.locationLatitude;
    const lng = equipment.locationLongitude;
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open map on this device.');
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.error}>Loading...</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← {t('common.back')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!equipment) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.error}>Equipment not found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← {t('common.back')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('agriShare.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} bounces={false}>
        <Image source={{ uri: equipment.imageUrl }} style={styles.image} resizeMode="cover" />
        
        <View style={styles.content}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{t(equipment.typeKey)}</Text>
          </View>
          
          <Text style={styles.title}>{equipment.nameKey ? t(equipment.nameKey) : equipment.rawName}</Text>
          
          <Text style={styles.price}>
            ₹{equipment.pricePerDay} <Text style={styles.perDay}>{t('agriShare.perDay')}</Text>
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>{t('agriShare.distance')}</Text>
          <Text style={styles.ownerText}>{equipment.distanceKm} km • {equipment.locationName}</Text>
          {equipment.locationLatitude && equipment.locationLongitude && (
            <Text style={styles.ownerTextSub}>
              GPS: {equipment.locationLatitude.toFixed(5)}, {equipment.locationLongitude.toFixed(5)}
            </Text>
          )}
          <Text style={styles.ownerTextSub}>Owner: {equipment.ownerName}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{equipment.descriptionKey ? t(equipment.descriptionKey) : equipment.rawDescription}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {equipment.locationLatitude && equipment.locationLongitude && (
          <TouchableOpacity style={styles.mapButton} onPress={openLocationInMaps}>
            <Text style={styles.mapButtonText}>📍 Open in Maps</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.callButton} onPress={handleCallOwner}>
          <Text style={styles.callButtonText}>📞 {t('agriShare.callOwner')}</Text>
        </TouchableOpacity>
      </View>
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
    zIndex: 10,
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
  scroll: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#e2e8f0',
  },
  content: {
    padding: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  typeBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  typeText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: '#16a34a',
    marginBottom: 16,
  },
  perDay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 8,
  },
  ownerText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
  ownerTextSub: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '400',
  },
  description: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  mapButton: {
    backgroundColor: '#0284c7',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  mapButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  callButton: {
    backgroundColor: '#16a34a',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  callButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  error: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
});
