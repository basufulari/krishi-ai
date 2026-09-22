import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as NavigationBar from 'expo-navigation-bar';

import i18n, { initI18n, AppLanguage } from './src/i18n';
import { HomeScreen } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { AnalyzeScreen } from './src/screens/AnalyzeScreen';
import { DeveloperScreen } from './src/screens/DeveloperScreen';
import { GovSchemeScreen } from './src/screens/GovSchemeScreen';
import { WeatherScreen } from './src/screens/WeatherScreen';
import { StorageAuth } from './src/utils/StorageAuth';
import { AgriShareHomeScreen } from './src/screens/AgriShareScreen';
import { EquipmentDetailsScreen } from './src/screens/EquipmentDetailsScreen';
import { AddEquipmentScreen } from './src/screens/AddEquipmentScreen';
import { MandiScreen } from './src/screens/MandiScreen';
import { GeoFencingScreen } from './src/screens/GeoFencingScreen';
import { KisanLoanScreen } from './src/screens/KisanLoanScreen';
import { CommunityScreen } from './src/screens/CommunityScreen';
import { CreatePostScreen } from './src/screens/CreatePostScreen';
import { PostCommentsScreen } from './src/screens/PostCommentsScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { VideoCallScreen } from './src/screens/VideoCallScreen';
import { ChatbotScreen } from './src/screens/ChatbotScreen';
import { AdminAlertScreen } from './src/screens/AdminAlertScreen';
import { AdminUserListScreen } from './src/screens/AdminUserListScreen';
import { DiseaseHistoryScreen } from './src/screens/DiseaseHistoryScreen';
import { EditEquipmentScreen } from './src/screens/EditEquipmentScreen';
import { FarmerDashboardScreen } from './src/screens/FarmerDashboardScreen';

initI18n();

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Analyze: undefined;
  Developer: undefined;
  GovScheme: undefined;
  Weather: undefined;
  AgriShare: undefined;
  EquipmentDetails: { id: string };
  AddEquipment: undefined;
  Mandi: undefined;
  GeoFencing: undefined;
  KisanLoan: undefined;
  Community: { newPost?: string } | undefined;
  CreatePost: undefined;
  PostComments: { postId: string };
  Notifications: undefined;
  VideoCall: { targetUser: string };
  Chatbot: undefined;
  AdminAlert: undefined;
  AdminUserList: undefined;
  DiseaseHistory: undefined;
  EditEquipment: { id: string };
  FarmerDashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AUTH_KEY = 'krishi_ai_auth';
const LANG_KEY = 'krishi_ai_lang';
const USER_KEY = 'krishi_ai_user';
const ROLE_KEY = 'krishi_ai_role';

function isAppLanguage(v: string | null): v is AppLanguage {
  return v === 'en' || v === 'mr' || v === 'kn';
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [username, setUsername] = useState<string>('');
  const [role, setRole] = useState<string>('farmer');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Hide Android system navigation bar (Back / Home / Recents buttons)
  useEffect(() => {
    if (Platform.OS === 'android') {
      void NavigationBar.setVisibilityAsync('hidden');
      void NavigationBar.setBehaviorAsync('overlay-swipe');
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [storedLang, storedAuth, storedUser, storedRole] = await Promise.all([
          AsyncStorage.getItem(LANG_KEY),
          AsyncStorage.getItem(AUTH_KEY),
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(ROLE_KEY),
        ]);

        if (isAppLanguage(storedLang)) {
          setLanguage(storedLang);
          await i18n.changeLanguage(storedLang);
        }
        if (storedAuth === '1' && storedUser) {
          setIsLoggedIn(true);
          setUsername(storedUser);
          if (storedRole) setRole(storedRole);
        }
      } catch {
        // ignore storage errors, app can still run
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  async function changeLanguage(next: AppLanguage) {
    setLanguage(next);
    try {
      await AsyncStorage.setItem(LANG_KEY, next);
    } catch {
      // ignore
    }
    try {
      await i18n.changeLanguage(next);
    } catch {
      // ignore language switch errors
    }
  }

  async function handleLoginSuccess(name: string, userRole?: string) {
    setIsLoggedIn(true);
    setUsername(name);
    setRole(userRole || 'farmer');
    try {
      await Promise.all([
        AsyncStorage.setItem(AUTH_KEY, '1'), 
        AsyncStorage.setItem(USER_KEY, name),
        AsyncStorage.setItem(ROLE_KEY, userRole || 'farmer')
      ]);
    } catch {
      // ignore
    }
  }

  async function handleLogout(navigateToLogin: () => void) {
    setIsLoggedIn(false);
    setUsername('');
    try {
      await Promise.all([
        AsyncStorage.removeItem(AUTH_KEY), 
        AsyncStorage.removeItem(USER_KEY),
        AsyncStorage.removeItem(ROLE_KEY),
        StorageAuth.logout()
      ]);
    } catch {
      // ignore
    } finally {
      navigateToLogin();
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#16a34a" />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 260,
            gestureEnabled: true,
            contentStyle: { backgroundColor: '#f8fafc' },
          }}
        >
          {!isLoggedIn ? (
            <Stack.Screen
              name="Login"
              options={{ animation: 'fade_from_bottom' }}
            >
              {(props) => (
                <LoginScreen
                  language={language}
                  onChangeLanguage={changeLanguage}
                  onLoginSuccess={(name, userRole) => {
                    void props.navigation;
                    void handleLoginSuccess(name, userRole);
                  }}
                />
              )}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen
                name="Home"
                options={{ animation: 'fade', animationDuration: 220 }}
              >
                {(props) => (
                  <HomeScreen
                    username={username}
                    role={role}
                    language={language}
                    onChangeLanguage={changeLanguage}
                    onLogout={() => handleLogout(() => props.navigation.reset({ index: 0, routes: [{ name: 'Login' }] }))}
                    onGoAnalyze={() => props.navigation.navigate('Analyze')}
                    onGoDeveloper={() => props.navigation.navigate('Developer')}
                    onGoGovScheme={() => props.navigation.navigate('GovScheme')}
                    onGoWeather={() => props.navigation.navigate('Weather')}
                    onGoAgriShare={() => props.navigation.navigate('AgriShare')}
                    onGoMandi={() => props.navigation.navigate('Mandi')}
                    onGoGeoFencing={() => props.navigation.navigate('GeoFencing')}
                    onGoKisanLoan={() => props.navigation.navigate('KisanLoan')}
                    onGoCommunity={() => props.navigation.navigate('Community')}
                    onGoNotifications={() => props.navigation.navigate('Notifications')}
                    onGoChatbot={() => props.navigation.navigate('Chatbot')}
                    onGoAdmin={() => props.navigation.navigate('AdminAlert')}
                    onGoAdminUserList={() => props.navigation.navigate('AdminUserList')}
                    onGoHistory={() => props.navigation.navigate('DiseaseHistory')}
                    onGoDashboard={() => props.navigation.navigate('FarmerDashboard')}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="Weather"
                options={{ animation: 'slide_from_bottom', animationDuration: 300 }}
              >
                {(props) => (
                  <WeatherScreen
                    onBackHome={() => props.navigation.navigate('Home')}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="GovScheme"
                options={{ animation: 'slide_from_right', animationDuration: 280 }}
              >
                {(props) => (
                  <GovSchemeScreen
                    language={language}
                    onBackHome={() => props.navigation.navigate('Home')}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="Developer"
                options={{ animation: 'fade_from_bottom', animationDuration: 260 }}
              >
                {(props) => (
                  <DeveloperScreen
                    language={language}
                    onBackHome={() => props.navigation.navigate('Home')}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="Analyze"
                options={{ animation: 'slide_from_bottom', animationDuration: 320 }}
              >
                {(props) => (
                  <AnalyzeScreen
                    username={username}
                    language={language}
                    onChangeLanguage={changeLanguage}
                    onBackHome={() => props.navigation.navigate('Home')}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="AgriShare"
                options={{ animation: 'slide_from_right', animationDuration: 280 }}
              >
                {(props) => (
                  <AgriShareHomeScreen
                    language={language}
                    onBackHome={() => props.navigation.navigate('Home')}
                    onGoDetails={(id) => props.navigation.navigate('EquipmentDetails', { id })}
                    onGoAdd={() => props.navigation.navigate('AddEquipment')}
                    role={role}
                    onGoEdit={(id) => props.navigation.navigate('EditEquipment', { id })}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="DiseaseHistory"
                options={{ animation: 'slide_from_left', animationDuration: 280 }}
              >
                {(props) => (
                  <DiseaseHistoryScreen
                    username={username}
                    language={language}
                    onBackHome={() => props.navigation.navigate('Home')}
                  />
                )}
              </Stack.Screen>
              
              <Stack.Screen
                name="EquipmentDetails"
                options={{ animation: 'slide_from_right', animationDuration: 240 }}
              >
                {(props) => (
                  <EquipmentDetailsScreen
                    language={language}
                    equipmentId={props.route.params.id}
                    onBack={() => props.navigation.goBack()}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="AddEquipment"
                options={{ animation: 'slide_from_bottom', animationDuration: 260 }}
              >
                {(props) => (
                  <AddEquipmentScreen
                    language={language}
                    onBack={() => props.navigation.goBack()}
                    onSave={() => props.navigation.goBack()}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="Mandi"
                options={{ animation: 'slide_from_right', animationDuration: 260 }}
              >
                {(props) => (
                  <MandiScreen
                    language={language}
                    onBackHome={() => props.navigation.navigate('Home')}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="GeoFencing"
                options={{ animation: 'slide_from_bottom', animationDuration: 320 }}
              >
                {(props) => (
                  <GeoFencingScreen
                    language={language}
                    onBackHome={() => props.navigation.navigate('Home')}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="KisanLoan"
                options={{ animation: 'slide_from_right', animationDuration: 280 }}
              >
                {(props) => (
                  <KisanLoanScreen
                    onBackHome={() => props.navigation.navigate('Home')}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="Community"
                options={{ animation: 'slide_from_right', animationDuration: 280 }}
              >
                {(props) => (
                  <CommunityScreen
                    username={username}
                    language={language}
                    onBackHome={() => props.navigation.navigate('Home')}
                    onGoCreatePost={() => props.navigation.navigate('CreatePost')}
                    onGoComments={(postId) => props.navigation.navigate('PostComments', { postId })}
                    route={props.route}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="CreatePost"
                options={{ animation: 'fade_from_bottom', animationDuration: 220 }}
              >
                {(props) => (
                  <CreatePostScreen
                    language={language}
                    onBack={() => props.navigation.goBack()}
                    onPublish={(text) => props.navigation.navigate({ name: 'Community', params: { newPost: text }, merge: true } as never)}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="PostComments"
                options={{ animation: 'slide_from_right', animationDuration: 240 }}
              >
                {(props) => (
                  <PostCommentsScreen
                    username={username}
                    language={language}
                    onBack={() => props.navigation.goBack()}
                    onGoVideoCall={(targetUser) => props.navigation.navigate('VideoCall', { targetUser })}
                    route={props.route}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="VideoCall"
                options={{ animation: 'fade_from_bottom', animationDuration: 200 }}
              >
                {(props) => (
                  <VideoCallScreen
                    language={language}
                    currentUsername={username}
                    onEndCall={() => props.navigation.goBack()}
                    route={props.route}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="Notifications"
                options={{ animation: 'slide_from_left', animationDuration: 240 }}
              >
                {(props) => (
                  <NotificationsScreen
                    username={username}
                    language={language}
                    onBack={() => props.navigation.goBack()}
                  />
                )}
              </Stack.Screen>
              
              <Stack.Screen
                name="Chatbot"
                options={{ animation: 'slide_from_bottom', animationDuration: 300 }}
              >
                {(props) => (
                  <ChatbotScreen
                    language={language}
                    onBackHome={() => props.navigation.goBack()}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="AdminAlert"
                options={{ animation: 'fade', animationDuration: 220 }}
              >
                {(props) => (
                  <AdminAlertScreen
                    onBack={() => props.navigation.goBack()}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="AdminUserList"
                options={{ animation: 'slide_from_right', animationDuration: 260 }}
              >
                {(props) => (
                  <AdminUserListScreen
                    onBack={() => props.navigation.goBack()}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="EditEquipment"
                options={{ animation: 'slide_from_bottom', animationDuration: 260 }}
              >
                {(props) => (
                  <EditEquipmentScreen
                    equipmentId={props.route.params.id}
                    onBack={() => props.navigation.goBack()}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="FarmerDashboard"
                options={{ animation: 'slide_from_bottom', animationDuration: 320 }}
              >
                {(props) => (
                  <FarmerDashboardScreen
                    username={username}
                    onBackHome={() => props.navigation.navigate('Home')}
                  />
                )}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' },
});
