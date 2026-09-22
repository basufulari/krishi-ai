import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppLanguage } from '../i18n';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { StorageAgriShare } from '../utils/StorageAgriShare';

type Props = {
  language: AppLanguage;
  onBack: () => void;
  onSave: () => void;
};

export function AddEquipmentScreen({ onBack, onSave }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [locationLatitude, setLocationLatitude] = useState<number | null>(null);
  const [locationLongitude, setLocationLongitude] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickFromCamera = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Camera permission denied', 'Please allow camera access to take equipment photo.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.75,
      });
      if (!res.canceled) {
        setImageUri(res.assets[0]?.uri ?? null);
      }
    } catch {
      Alert.alert('Error', 'Could not open camera. Please try again.');
    }
  };

  const pickFromGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Gallery permission denied', 'Please allow photo access to choose equipment image.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.75,
      });
      if (!res.canceled) {
        setImageUri(res.assets[0]?.uri ?? null);
      }
    } catch {
      Alert.alert('Error', 'Could not open gallery. Please try again.');
    }
  };

  const useCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Location permission denied', 'Please enable location access to use current GPS.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      const { latitude, longitude } = loc.coords;

      // Reverse geocode for a readable location name.
      const [revGeo] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const place = [revGeo?.city, revGeo?.district, revGeo?.region, revGeo?.country].filter(Boolean).join(', ');

      setLocation(place || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
      setLocationLatitude(latitude);
      setLocationLongitude(longitude);
    } catch {
      Alert.alert('Error', 'Unable to fetch your current location. Try again.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!name || !price || !contact) {
      Alert.alert('Error', 'Please fill in all core details (Name, Price, Contact).');
      return;
    }

    // Location must come from GPS ("Use Current Location").
    if (!locationLatitude || !locationLongitude) {
      Alert.alert('Error', 'Please add your location using "Use Current Location" (GPS).');
      return;
    }
    
    const equipment = {
      id: Math.random().toString(),
      rawName: name,
      typeKey: 'agriShare.types.tool', // Default
      pricePerDay: parseInt(price) || 0,
      ownerName: 'You',
      contactNumber: contact,
      locationName: location,
      locationLatitude: locationLatitude ?? undefined,
      locationLongitude: locationLongitude ?? undefined,
      distanceKm: 0,
      imageUrl: imageUri || 'https://images.unsplash.com/photo-1592982537447-6f23f66ee155?auto=format&fit=crop&q=80&w=800',
      rawDescription: desc || 'No description provided.',
    };
    await StorageAgriShare.addEquipment(equipment);

    Alert.alert('Success', 'Equipment listed successfully!');
    onSave();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('agriShare.addScreenTitle')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        
        <View style={styles.imagePlaceholder}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <Text style={styles.imagePlaceholderText}>📷 Add Equipment Photo</Text>
          )}
        </View>
        <View style={styles.photoButtonsRow}>
          <TouchableOpacity style={[styles.photoActionBtn, { marginRight: 10 }]} onPress={pickFromCamera}>
            <Text style={styles.photoActionBtnText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoActionBtn} onPress={pickFromGallery}>
            <Text style={styles.photoActionBtnText}>Choose Gallery</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('agriShare.addNameLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Mahindra Tractor 575 DI"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('agriShare.addPriceLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 1500"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location / Village</Text>
          <View style={styles.row}>
            <View style={styles.rowInputWrap}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Pune, Maharashtra"
                value={location}
                onChangeText={setLocation}
                editable={false}
              />
            </View>
          </View>
          <TouchableOpacity
            style={[styles.locationBtn, isGettingLocation && styles.locationBtnDisabled]}
            onPress={useCurrentLocation}
            disabled={isGettingLocation}
          >
            <Text style={styles.locationBtnText}>
              {isGettingLocation ? 'Getting GPS...' : 'Use Current Location'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. +91 9876543210"
            keyboardType="phone-pad"
            value={contact}
            onChangeText={setContact}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('agriShare.addDescLabel')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Condition, year, extra attachments..."
            multiline
            numberOfLines={4}
            value={desc}
            onChangeText={setDesc}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{t('agriShare.addSubmit')}</Text>
        </TouchableOpacity>
        
      </ScrollView>
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  imagePlaceholder: {
    height: 160,
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  imagePlaceholderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
  },
  photoButtonsRow: { flexDirection: 'row', marginTop: -10, marginBottom: 18 },
  photoActionBtn: {
    flex: 1,
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  photoActionBtnText: { color: '#fff', fontWeight: '800' },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
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
  row: { flexDirection: 'row', alignItems: 'center' },
  rowInputWrap: { flex: 1 },
  locationBtn: {
    marginTop: 10,
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  locationBtnDisabled: { backgroundColor: '#94a3b8' },
  locationBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 15 },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#16a34a',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
});
