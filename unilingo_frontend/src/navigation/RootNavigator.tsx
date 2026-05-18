/**
 * Navigation configuration — Auth + Main Tab + Practice Stack + Flashcard Stack
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, Platform } from 'react-native';
import { registerDeviceForPush } from '../services/NotificationService';

import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { FontFamily } from '../theme';

// Splash Screen
import SplashScreen from '../screens/SplashScreen';

// Auth Screens
import AuthChoiceScreen from '../screens/auth/AuthChoiceScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import HomeScreen from '../screens/home/HomeScreen';
import BlogDetailScreen from '../screens/home/BlogDetailScreen';
import NotificationsScreen from '../screens/home/NotificationsScreen';
import PracticeScreen from '../screens/practice/PracticeScreen';
import VirtualRoomScreen from '../screens/practice/VirtualRoomScreen';
import RecordingScreen from '../screens/practice/RecordingScreen';
import ResultsScreen from '../screens/practice/ResultsScreen';
import PracticeHistoryScreen from '../screens/practice/PracticeHistoryScreen';
import VocabularyScreen from '../screens/vocabulary/VocabularyScreen';
import LeaderboardScreen from '../screens/leaderboard/LeaderboardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

// Flashcard Screens
import FlashcardDecksScreen from '../screens/flashcards/FlashcardDecksScreen';
import FlashcardDeckDetailScreen from '../screens/flashcards/FlashcardDeckDetailScreen';
import FlashcardStudyScreen from '../screens/flashcards/FlashcardStudyScreen';

export type RootStackParamList = {
  Splash: undefined;
  AuthChoice: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const PracticeStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const VocabStack = createNativeStackNavigator();

// ─── Home Stack Navigator ───
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="BlogDetail" component={BlogDetailScreen} />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
    </HomeStack.Navigator>
  );
}

// ─── Practice Stack Navigator ───
function PracticeStackNavigator() {
  return (
    <PracticeStack.Navigator screenOptions={{ headerShown: false }}>
      <PracticeStack.Screen name="PracticeMain" component={PracticeScreen} />
      <PracticeStack.Screen name="VirtualRoom" component={VirtualRoomScreen} />
      <PracticeStack.Screen name="Recording" component={RecordingScreen} />
      <PracticeStack.Screen name="Results" component={ResultsScreen} />
      <PracticeStack.Screen name="PracticeHistory" component={PracticeHistoryScreen} />
    </PracticeStack.Navigator>
  );
}

// ─── Profile Stack Navigator ───
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

// ─── Vocabulary + Flashcards Stack Navigator ───
function VocabStackNavigator() {
  return (
    <VocabStack.Navigator screenOptions={{ headerShown: false }}>
      <VocabStack.Screen name="VocabMain" component={VocabularyScreen} />
      <VocabStack.Screen name="FlashcardDecks" component={FlashcardDecksScreen} />
      <VocabStack.Screen name="FlashcardDeckDetail" component={FlashcardDeckDetailScreen} />
      <VocabStack.Screen name="FlashcardStudy" component={FlashcardStudyScreen} />
    </VocabStack.Navigator>
  );
}

// ─── Main Tab Navigator ───
function MainTabNavigator() {
  const { colors } = useThemeStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'HomeTab') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'PracticeTab') iconName = focused ? 'create' : 'create-outline';
          else if (route.name === 'VocabTab') iconName = focused ? 'book' : 'book-outline';
          else if (route.name === 'RankTab') iconName = focused ? 'trophy' : 'trophy-outline';
          else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          paddingTop: 8,
          position: 'absolute',
          borderTopWidth: 1,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontFamily: FontFamily.medium,
          fontSize: 10,
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="PracticeTab" component={PracticeStackNavigator} options={{ tabBarLabel: 'Practice' }} />
      <Tab.Screen name="VocabTab" component={VocabStackNavigator} options={{ tabBarLabel: 'Vocab' }} />
      <Tab.Screen name="RankTab" component={LeaderboardScreen} options={{ tabBarLabel: 'Rank' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ───
export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { colors } = useThemeStore();

  React.useEffect(() => {
    if (isAuthenticated) {
      registerDeviceForPush();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgPrimary }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Splash"
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AuthChoice" component={AuthChoiceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
