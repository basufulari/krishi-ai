import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import MapView, { Polygon, Polyline, Marker, PROVIDER_DEFAULT, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { polygon } from '@turf/helpers';
import turfArea from '@turf/area';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppLanguage } from '../i18n';
import { logActivity } from '../utils/logActivity';

type Props = {
  language: AppLanguage;
  onBackHome: () => void;
};

type Coordinate = {
  latitude: number;
  longitude: number;
};

type SavedLand = {
  id: string;
  name: string;
  acres: string;
  guntha: string;
  sqMeters: number;
  date: string;
  pointsCount: number;
};

const SAVED_LANDS_KEY = 'krishi_ai_saved_lands';

// Helper distance calculation (Haversine Formula) in meters
function getDistanceMeters(p1: Coordinate, p2: Coordinate): number {
  const R = 6371000;
  const dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180;
  const dLon = ((p2.longitude - p1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.latitude * Math.PI) / 180) *
      Math.cos((p2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculatePerimeterMeters(coords: Coordinate[]): number {
  if (coords.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    total += getDistanceMeters(coords[i], coords[i + 1]);
  }
  if (coords.length >= 3) {
    total += getDistanceMeters(coords[coords.length - 1], coords[0]);
  }
  return total;
}

export function GeoFencingScreen({ onBackHome }: Props) {
  const { t } = useTranslation();

  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [mode, setMode] = useState<'walk' | 'pin'>('walk');
  const [mapType, setMapType] = useState<'hybrid' | 'satellite' | 'standard'>('hybrid');

  const [path, setPath] = useState<Coordinate[]>([]);
  const [areaSqMeters, setAreaSqMeters] = useState<number | null>(null);

  // Save Modal & Saved Records
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [savedLands, setSavedLands] = useState<SavedLand[]>([]);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  const mapRef = useRef<MapView>(null);
  const watchSubscription = useRef<Location.LocationSubscription | null>(null);
  const gpsFixSubscription = useRef<Location.LocationSubscription | null>(null);

  // Track screen visit
  useEffect(() => {
    void logActivity('GEO', 'Opened GPS land measurement tool');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void initLocation();
    void loadSavedLands();

    return () => {
      if (watchSubscription.current) {
        watchSubscription.current.remove();
      }
      stopGpsFixWatch();
    };
  }, []);

  const loadSavedLands = async () => {
    try {
      const data = await AsyncStorage.getItem(SAVED_LANDS_KEY);
      if (data) {
        setSavedLands(JSON.parse(data));
      }
    } catch {
      // ignore
    }
  };

  const saveLandRecord = async () => {
    if (!fieldName.trim()) {
      Alert.alert('Required', 'Please enter a name for this field.');
      return;
    }
    if (!areaSqMeters) return;

    const acresVal = (areaSqMeters * 0.000247105).toFixed(2);
    const gunthaVal = (areaSqMeters * 0.00988422).toFixed(1);

    const newRecord: SavedLand = {
      id: Date.now().toString(),
      name: fieldName.trim(),
      acres: acresVal,
      guntha: gunthaVal,
      sqMeters: Math.round(areaSqMeters),
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      pointsCount: path.length,
    };

    const updated = [newRecord, ...savedLands];
    setSavedLands(updated);
    try {
      await AsyncStorage.setItem(SAVED_LANDS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setFieldName('');
    setSaveModalVisible(false);
    Alert.alert('Saved!', 'Field measurement saved to history.');
  };

  const deleteSavedLand = async (id: string) => {
    const updated = savedLands.filter((item) => item.id !== id);
    setSavedLands(updated);
    try {
      await AsyncStorage.setItem(SAVED_LANDS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const stopGpsFixWatch = () => {
    if (gpsFixSubscription.current) {
      gpsFixSubscription.current.remove();
      gpsFixSubscription.current = null;
    }
  };

  const startGpsFixWatch = async () => {
    if (gpsFixSubscription.current) return;
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) return;

    gpsFixSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 1,
        timeInterval: 1000,
      },
      (loc) => {
        const coord = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setCurrentLocation(coord);
        if (loc.coords.accuracy) {
          setGpsAccuracy(Math.round(loc.coords.accuracy));
        }
      }
    );
  };

  const initLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location access is required for land measurement.');
        setHasPermission(false);
        return;
      }
      setHasPermission(true);
      await startGpsFixWatch();
    } catch {
      // ignore
    }
  };

  // Re-calculate Area automatically whenever path changes
  useEffect(() => {
    if (path.length >= 3) {
      const closedPath = [...path, path[0]];
      try {
        const poly = polygon([closedPath.map((p) => [p.longitude, p.latitude])]);
        const area = turfArea(poly);
        setAreaSqMeters(area);
      } catch {
        setAreaSqMeters(null);
      }
    } else {
      setAreaSqMeters(null);
    }
  }, [path]);

  const startTracking = async () => {
    if (!hasPermission) {
      await initLocation();
      return;
    }
    stopGpsFixWatch();

    if (!currentLocation) {
      Alert.alert('GPS Waiting', 'Obtaining initial GPS signal. Please try in a moment.');
      return;
    }

    setPath([currentLocation]);
    setIsTracking(true);

    watchSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 2, // Every 2 meters
        timeInterval: 1200,
      },
      (loc) => {
        const coord = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setCurrentLocation(coord);
        if (loc.coords.accuracy) setGpsAccuracy(Math.round(loc.coords.accuracy));

        setPath((prev) => {
          // Avoid adding redundant duplicate points
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const d = getDistanceMeters(last, coord);
            if (d < 1.5) return prev; // Ignore micro jitter under 1.5m
          }
          return [...prev, coord];
        });
      }
    );
  };

  const stopTracking = () => {
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }
    setIsTracking(false);
    if (hasPermission) {
      void startGpsFixWatch();
    }
  };

  const handleMapPress = (e: MapPressEvent) => {
    if (mode === 'pin') {
      const newCoord = e.nativeEvent.coordinate;
      setPath((prev) => [...prev, newCoord]);
    }
  };

  const addCurrentLocationPoint = () => {
    if (currentLocation) {
      setPath((prev) => [...prev, currentLocation]);
      recenterMap();
    } else {
      Alert.alert('GPS Error', 'Current GPS location not available.');
    }
  };

  const undoLastPoint = () => {
    setPath((prev) => (prev.length > 0 ? prev.slice(0, prev.length - 1) : []));
  };

  const clearTracking = () => {
    setPath([]);
    setAreaSqMeters(null);
    if (isTracking && watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }
    setIsTracking(false);
    if (hasPermission) {
      void startGpsFixWatch();
    }
  };

  const recenterMap = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.0012,
          longitudeDelta: 0.0012,
        },
        500
      );
    }
  };

  // Unit Calculations
  const acres = areaSqMeters ? (areaSqMeters * 0.000247105).toFixed(2) : '0.00';
  const guntha = areaSqMeters ? (areaSqMeters * 0.00988422).toFixed(1) : '0.0';
  const bigha = areaSqMeters ? (areaSqMeters * 0.000395368).toFixed(2) : '0.00'; // Standard Bigha
  const sqFeet = areaSqMeters ? Math.round(areaSqMeters * 10.7639).toLocaleString('en-IN') : '0';
  const perimeterMeters = Math.round(calculatePerimeterMeters(path));
  const perimeterFeet = Math.round(perimeterMeters * 3.28084);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackHome} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>GPS Land Measurement</Text>
          <View style={styles.accuracyBadge}>
            <Text style={styles.accuracyDot}>●</Text>
            <Text style={styles.accuracyText}>
              {gpsAccuracy !== null ? `Accuracy: ±${gpsAccuracy}m` : 'Locating GPS...'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.historyHeaderBtn} onPress={() => setHistoryModalVisible(true)}>
          <Text style={styles.historyHeaderBtnText}>📜 History</Text>
        </TouchableOpacity>
      </View>

      {/* Mode Switcher & Map Type bar */}
      <View style={styles.toolbar}>
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'walk' && styles.modeTabActive]}
            onPress={() => {
              setMode('walk');
            }}
          >
            <Text style={[styles.modeTabText, mode === 'walk' && styles.modeTabTextActive]}>🚶 Walk GPS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, mode === 'pin' && styles.modeTabActive]}
            onPress={() => {
              if (isTracking) stopTracking();
              setMode('pin');
            }}
          >
            <Text style={[styles.modeTabText, mode === 'pin' && styles.modeTabTextActive]}>📍 Map Tap Pin</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.mapTypeBtn}
          onPress={() => {
            setMapType((prev) => (prev === 'hybrid' ? 'satellite' : prev === 'satellite' ? 'standard' : 'hybrid'));
          }}
        >
          <Text style={styles.mapTypeBtnText}>
            🗺️ {mapType === 'hybrid' ? 'Hybrid' : mapType === 'satellite' ? 'Satellite' : 'Road'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map View Area */}
      <View style={styles.mapContainer}>
        {currentLocation ? (
          <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}
            mapType={mapType}
            style={styles.map}
            initialRegion={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.0015,
              longitudeDelta: 0.0015,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
            followsUserLocation={isTracking}
            onPress={handleMapPress}
          >
            {/* Draw Path Lines */}
            {path.length > 0 && <Polyline coordinates={path} strokeColor="#f59e0b" strokeWidth={4} />}

            {/* Draw Polygon Overlay when 3+ points exist */}
            {path.length >= 3 && (
              <Polygon
                coordinates={path}
                fillColor="rgba(245, 158, 11, 0.35)"
                strokeColor="#d97706"
                strokeWidth={2}
              />
            )}

            {/* Render Markers for Points */}
            {path.map((pt, idx) => (
              <Marker
                key={`pt-${idx}`}
                coordinate={pt}
                title={`Point #${idx + 1}`}
                pinColor={idx === 0 ? 'green' : idx === path.length - 1 ? 'red' : 'gold'}
              />
            ))}
          </MapView>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={styles.loadingText}>Acquiring High-Precision GPS Signal...</Text>
            <Text style={styles.loadingSubText}>Please ensure Location / GPS services are turned ON.</Text>
            <TouchableOpacity style={styles.retryGpsBtn} onPress={initLocation}>
              <Text style={styles.retryGpsText}>Retry GPS Connection</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Floating Map Controls */}
        {currentLocation && (
          <View style={styles.floatingControls}>
            <TouchableOpacity style={styles.floatBtn} onPress={recenterMap}>
              <Text style={styles.floatBtnText}>🎯 Recenter</Text>
            </TouchableOpacity>

            {mode === 'pin' && (
              <TouchableOpacity style={[styles.floatBtn, { backgroundColor: '#10b981' }]} onPress={addCurrentLocationPoint}>
                <Text style={styles.floatBtnText}>📍 Add Current Pin</Text>
              </TouchableOpacity>
            )}

            {path.length > 0 && (
              <TouchableOpacity style={[styles.floatBtn, { backgroundColor: '#eab308' }]} onPress={undoLastPoint}>
                <Text style={styles.floatBtnText}>↩️ Undo Point</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {mode === 'pin' && (
          <View style={styles.pinHintBanner}>
            <Text style={styles.pinHintText}>💡 Tap anywhere on the Satellite map to place boundary pins.</Text>
          </View>
        )}
      </View>

      {/* Dashboard Result Panel */}
      <View style={styles.dashboard}>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>ACRES</Text>
            <Text style={styles.statValueAcres}>{acres}</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>GUNTHA (गुंठा)</Text>
            <Text style={styles.statValueGuntha}>{guntha}</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>BIGHA (बीघा)</Text>
            <Text style={styles.statValue}>{bigha}</Text>
          </View>
        </View>

        <View style={styles.subStatsRow}>
          <Text style={styles.subStatText}>📐 Area: <Text style={styles.boldText}>{sqFeet} sq ft</Text> ({Math.round(areaSqMeters || 0)} m²)</Text>
          <Text style={styles.subStatText}>📏 Perimeter: <Text style={styles.boldText}>{perimeterMeters} m</Text> ({perimeterFeet} ft)</Text>
        </View>

        {/* Main Action Buttons */}
        <View style={styles.actionRow}>
          {mode === 'walk' ? (
            !isTracking ? (
              <TouchableOpacity style={styles.startBtn} onPress={startTracking}>
                <Text style={styles.startBtnText}>▶️ Start GPS Tracking</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.stopBtn} onPress={stopTracking}>
                <Text style={styles.stopBtnText}>⏹️ Stop Tracking</Text>
              </TouchableOpacity>
            )
          ) : (
            <View style={styles.pinCountBox}>
              <Text style={styles.pinCountText}>📍 {path.length} Boundary Points Placed</Text>
            </View>
          )}

          {areaSqMeters !== null && areaSqMeters > 0 && (
            <TouchableOpacity style={styles.saveBtn} onPress={() => setSaveModalVisible(true)}>
              <Text style={styles.saveBtnText}>💾 Save Field</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.clearBtn} onPress={clearTracking}>
            <Text style={styles.clearBtnText}>🗑️ Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Save Modal */}
      <Modal visible={saveModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Land Measurement</Text>
            <Text style={styles.modalSubtitle}>Measured Area: {acres} Acres ({guntha} Guntha)</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Sugarcane Plot #1, North Field"
              placeholderTextColor="#94a3b8"
              value={fieldName}
              onChangeText={setFieldName}
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setSaveModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalConfirmBtn} onPress={saveLandRecord}>
                <Text style={styles.modalConfirmText}>Save to History</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* History Modal */}
      <Modal visible={historyModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Saved Fields History</Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <Text style={styles.modalCloseX}>✕</Text>
              </TouchableOpacity>
            </View>

            {savedLands.length === 0 ? (
              <View style={styles.emptyHistoryBox}>
                <Text style={styles.emptyHistoryText}>No saved land measurements yet.</Text>
              </View>
            ) : (
              <ScrollView style={styles.historyList}>
                {savedLands.map((item) => (
                  <View key={item.id} style={styles.historyItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyItemName}>{item.name}</Text>
                      <Text style={styles.historyItemDetails}>
                        🌾 <Text style={styles.boldText}>{item.acres} Acres</Text> ({item.guntha} Guntha) • {item.sqMeters.toLocaleString('en-IN')} m²
                      </Text>
                      <Text style={styles.historyItemDate}>Date: {item.date} • {item.pointsCount} Points</Text>
                    </View>

                    <TouchableOpacity style={styles.deleteHistoryBtn} onPress={() => deleteSavedLand(item.id)}>
                      <Text style={styles.deleteHistoryText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#334155',
    borderRadius: 8,
  },
  backText: { fontSize: 14, fontWeight: '700', color: '#f8fafc' },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#f8fafc' },
  accuracyBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  accuracyDot: { color: '#22c55e', fontSize: 10, marginRight: 4 },
  accuracyText: { color: '#94a3b8', fontSize: 11, fontWeight: '500' },
  historyHeaderBtn: { backgroundColor: '#059669', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  historyHeaderBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },

  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
  },
  modeTabs: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 8, padding: 3 },
  modeTab: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  modeTabActive: { backgroundColor: '#059669' },
  modeTabText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  modeTabTextActive: { color: '#ffffff', fontWeight: '700' },
  mapTypeBtn: { backgroundColor: '#334155', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  mapTypeBtnText: { color: '#cbd5e1', fontSize: 11, fontWeight: '700' },

  mapContainer: { flex: 1, backgroundColor: '#1e293b', position: 'relative' },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { color: '#f8fafc', fontSize: 15, fontWeight: '700', marginTop: 14 },
  loadingSubText: { color: '#94a3b8', fontSize: 12, marginTop: 6, textAlign: 'center' },
  retryGpsBtn: { marginTop: 16, backgroundColor: '#059669', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  retryGpsText: { color: '#ffffff', fontWeight: '700' },

  floatingControls: { position: 'absolute', top: 12, right: 12, gap: 8 },
  floatBtn: {
    backgroundColor: '#0f172a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 4,
  },
  floatBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },

  pinHintBanner: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  pinHintText: { color: '#fbbf24', fontSize: 11, textAlign: 'center', fontWeight: '600' },

  dashboard: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  statsGrid: { flexDirection: 'row', gap: 10 },
  statBox: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '700' },
  statValueAcres: { color: '#34d399', fontSize: 20, fontWeight: '800', marginTop: 2 },
  statValueGuntha: { color: '#fbbf24', fontSize: 20, fontWeight: '800', marginTop: 2 },
  statValue: { color: '#38bdf8', fontSize: 20, fontWeight: '800', marginTop: 2 },

  subStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    backgroundColor: '#0f172a',
    padding: 8,
    borderRadius: 8,
  },
  subStatText: { color: '#94a3b8', fontSize: 11 },
  boldText: { color: '#f8fafc', fontWeight: '700' },

  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' },
  startBtn: { flex: 2, backgroundColor: '#059669', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  startBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  stopBtn: { flex: 2, backgroundColor: '#dc2626', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  stopBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  pinCountBox: { flex: 2, backgroundColor: '#0f172a', paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  pinCountText: { color: '#fbbf24', fontSize: 13, fontWeight: '700' },
  saveBtn: { backgroundColor: '#3b82f6', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  clearBtn: { backgroundColor: '#334155', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center' },
  clearBtnText: { color: '#cbd5e1', fontSize: 13, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, width: '100%', borderWidth: 1, borderColor: '#334155' },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#f8fafc' },
  modalSubtitle: { fontSize: 13, color: '#34d399', marginTop: 4, marginBottom: 16, fontWeight: '600' },
  modalCloseX: { fontSize: 18, color: '#94a3b8', padding: 4 },
  modalInput: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 12, color: '#f8fafc', fontSize: 14, marginBottom: 20 },
  modalActionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalCancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#334155' },
  modalCancelText: { color: '#e2e8f0', fontSize: 13, fontWeight: '600' },
  modalConfirmBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#059669' },
  modalConfirmText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },

  emptyHistoryBox: { padding: 30, alignItems: 'center' },
  emptyHistoryText: { color: '#94a3b8', fontSize: 14 },
  historyList: { marginTop: 10 },
  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  historyItemName: { color: '#f8fafc', fontSize: 15, fontWeight: '700' },
  historyItemDetails: { color: '#34d399', fontSize: 12, marginTop: 3 },
  historyItemDate: { color: '#64748b', fontSize: 11, marginTop: 2 },
  deleteHistoryBtn: { padding: 8, backgroundColor: '#334155', borderRadius: 6, marginLeft: 10 },
  deleteHistoryText: { fontSize: 14 },
});
