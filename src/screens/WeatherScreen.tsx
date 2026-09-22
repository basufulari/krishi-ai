import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Easing, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { WEATHER_API_KEY } from '../config';
import { logActivity } from '../utils/logActivity';

type Props = {
  onBackHome: () => void;
};

type WeatherData = {
  temperature: number;
  windSpeed: number;
  weatherText: string;
  rainChanceToday: number;
  maxTempToday: number;
  minTempToday: number;
};

function farmerAdvice(data: WeatherData): string {
  if (data.rainChanceToday >= 70) {
    return 'High rain chance today. Avoid spraying pesticides/fertilizers now.';
  }
  if (data.temperature >= 36) {
    return 'High heat stress likely. Irrigate in early morning or evening.';
  }
  if (data.windSpeed >= 20) {
    return 'Strong wind expected. Avoid foliar spraying to reduce drift loss.';
  }
  if (data.temperature <= 12) {
    return 'Low temperature alert. Monitor sensitive crops for cold stress.';
  }
  return 'Weather is moderate. Good day for regular field operations.';
}

export function WeatherScreen({ onBackHome }: Props) {
  const { t } = useTranslation();
  const cardFloat = React.useRef(new Animated.Value(0)).current;
  const contentIn = React.useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cityLine, setCityLine] = useState('');
  const [data, setData] = useState<WeatherData | null>(null);

  async function loadWeather() {
    setLoading(true);
    setError('');
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        setError(t('weather.permissionDenied'));
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;

      const [revGeo] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const place = [revGeo?.city, revGeo?.region, revGeo?.country].filter(Boolean).join(', ');
      setCityLine(place || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
      void logActivity('WEATHER', `Checked weather for ${place || 'current location'}`);

      if (!WEATHER_API_KEY) {
        throw new Error('WEATHER_API_KEY_MISSING');
      }

      const currentUrl =
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}` +
        `&appid=${WEATHER_API_KEY}&units=metric`;
      const forecastUrl =
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}` +
        `&appid=${WEATHER_API_KEY}&units=metric`;

      const [currentRes, forecastRes] = await Promise.all([fetch(currentUrl), fetch(forecastUrl)]);
      if (!currentRes.ok || !forecastRes.ok) throw new Error('WEATHER_API_FAILED');

      const current = await currentRes.json();
      const forecast = await forecastRes.json();

      const rainChanceToday = Math.max(
        0,
        ...(Array.isArray(forecast?.list) ? forecast.list.slice(0, 8).map((item: any) => Number(item?.pop ?? 0) * 100) : [0])
      );

      const w: WeatherData = {
        temperature: Number(current?.main?.temp ?? 0),
        windSpeed: Number(current?.wind?.speed ?? 0) * 3.6, // m/s to km/h
        weatherText: String(current?.weather?.[0]?.description ?? 'Unknown'),
        rainChanceToday,
        maxTempToday: Number(current?.main?.temp_max ?? 0),
        minTempToday: Number(current?.main?.temp_min ?? 0),
      };
      setData(w);
    } catch {
      setError(t('weather.loadError'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWeather();
  }, []);

  useEffect(() => {
    Animated.timing(contentIn, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(cardFloat, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(cardFloat, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    floatLoop.start();
    return () => floatLoop.stop();
  }, [cardFloat, contentIn]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('weather.title')}</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={styles.loadingText}>{t('weather.loading')}</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadWeather}>
              <Text style={styles.retryText}>{t('weather.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : data ? (
          <Animated.View
            style={[
              styles.card,
              {
                opacity: contentIn,
                transform: [
                  {
                    translateY: cardFloat.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -6],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.location}>{cityLine}</Text>
            <Text style={styles.temp}>{Math.round(data.temperature)} deg C</Text>
            <Text style={styles.code}>{data.weatherText}</Text>

            <View style={styles.row}>
              <Text style={styles.metric}>{t('weather.max')}: {Math.round(data.maxTempToday)} deg C</Text>
              <Text style={styles.metric}>{t('weather.min')}: {Math.round(data.minTempToday)} deg C</Text>
            </View>
            <Text style={styles.metric}>{t('weather.wind')}: {Math.round(data.windSpeed)} km/h</Text>
            <Text style={styles.metric}>{t('weather.rainChance')}: {Math.round(data.rainChanceToday)}%</Text>

            <View style={styles.adviceBox}>
              <Text style={styles.adviceTitle}>{t('weather.prediction')}</Text>
              <Text style={styles.adviceText}>{farmerAdvice(data)}</Text>
            </View>
          </Animated.View>
        ) : null}

        <TouchableOpacity style={styles.backButton} onPress={onBackHome}>
          <Text style={styles.backText}>{t('common.back')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 18, paddingBottom: 30 },
  title: { fontSize: 22, fontWeight: '900', color: '#14532d', textAlign: 'center' },
  center: { alignItems: 'center', marginTop: 30 },
  loadingText: { marginTop: 10, color: '#166534', fontWeight: '700' },
  errorCard: { backgroundColor: 'white', borderRadius: 14, padding: 16, marginTop: 14, borderWidth: 1, borderColor: '#fecaca' },
  errorText: { color: '#b91c1c', fontWeight: '700', textAlign: 'center' },
  retryButton: { marginTop: 12, backgroundColor: '#ef4444', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  retryText: { color: 'white', fontWeight: '800' },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginTop: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  location: { color: '#166534', fontWeight: '700', textAlign: 'center' },
  temp: { fontSize: 38, fontWeight: '900', color: '#111827', textAlign: 'center', marginTop: 6 },
  code: { textAlign: 'center', color: '#0f766e', fontWeight: '800', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  metric: { color: '#111827', fontWeight: '700', marginBottom: 6 },
  adviceBox: { marginTop: 12, backgroundColor: '#ecfdf5', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#bbf7d0' },
  adviceTitle: { color: '#14532d', fontWeight: '900', marginBottom: 6 },
  adviceText: { color: '#166534', fontWeight: '700', lineHeight: 20 },
  backButton: { marginTop: 16, backgroundColor: '#0ea5e9', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  backText: { color: 'white', fontWeight: '900' },
});

