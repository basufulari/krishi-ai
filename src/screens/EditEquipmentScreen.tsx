import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { StorageAgriShare } from '../utils/StorageAgriShare';
import type { Equipment } from '../data/agriShareData';

type Props = {
  equipmentId: string;
  onBack: () => void;
};

export function EditEquipmentScreen({ equipmentId, onBack }: Props) {
  const { t } = useTranslation();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [pricePerDay, setPricePerDay] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('');
  const [rawDescription, setRawDescription] = useState<string>('');

  useEffect(() => {
    setIsLoading(true);
    void StorageAgriShare.getEquipmentById(equipmentId).then((e) => {
      setEquipment(e);
      setPricePerDay(e ? String(e.pricePerDay) : '');
      setContactNumber(e?.contactNumber ?? '');
      setLocationName(e?.locationName ?? '');
      setRawDescription(e?.rawDescription ?? '');
      setIsLoading(false);
    });
  }, [equipmentId]);

  const handleSave = async () => {
    if (!equipment) return;
    const price = parseInt(pricePerDay, 10);
    if (!Number.isFinite(price) || price < 0) {
      Alert.alert('Error', 'Please enter a valid price per day.');
      return;
    }
    if (!contactNumber.trim()) {
      Alert.alert('Error', 'Contact number is required.');
      return;
    }
    if (!locationName.trim()) {
      Alert.alert('Error', 'Location is required.');
      return;
    }

    await StorageAgriShare.updateEquipment(equipment.id, {
      pricePerDay: price,
      contactNumber: contactNumber.trim(),
      locationName: locationName.trim(),
      rawDescription: rawDescription.trim() || undefined,
    });

    Alert.alert('Success', 'Listing updated.');
    onBack();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading...</Text>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>← {t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!equipment) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Equipment not found.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>← {t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Agri-Share Listing</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Price per Day</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={pricePerDay}
            onChangeText={setPricePerDay}
          />

          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={contactNumber}
            onChangeText={setContactNumber}
          />

          <Text style={styles.label}>Location / Village</Text>
          <TextInput style={styles.input} value={locationName} onChangeText={setLocationName} />

          <Text style={styles.label}>Message / Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={rawDescription}
            onChangeText={setRawDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholder="Edit rent details / notes..."
          />

          {equipment.locationLatitude && equipment.locationLongitude && (
            <Text style={styles.gpsHint}>
              GPS: {equipment.locationLatitude.toFixed(5)}, {equipment.locationLongitude.toFixed(5)}
            </Text>
          )}

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onBack}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSave}>
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { fontWeight: '800', color: '#334155' },
  backBtn: { backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 18 },
  backBtnText: { color: '#fff', fontWeight: '900' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  backText: { fontSize: 24, color: '#059669', fontWeight: '900' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#14532d' },

  card: { backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 14 },
  label: { fontWeight: '800', color: '#334155', marginTop: 12, marginBottom: 8 },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  textArea: { height: 110, textAlignVertical: 'top' },
  gpsHint: { marginTop: 10, color: '#64748b', fontWeight: '700', fontSize: 12 },

  buttonsRow: { flexDirection: 'row', marginTop: 16 },
  btn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnCancel: { backgroundColor: '#64748b' },
  btnSave: { backgroundColor: '#16a34a' },
  btnText: { color: '#fff', fontWeight: '900' },
});

