/**
 * ProfileScreen — User profile with real data
 */
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { Gradients } from '../../theme';

export default function ProfileScreen({ navigation }: any) {
  const { colors } = useThemeStore();
  const { user } = useAuthStore();

  const initials = (user?.full_name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const stats = [
    { label: 'Total XP', value: `⭐ ${user?.total_xp || 0}`, icon: 'star' },
    { label: 'Current Streak', value: `🔥 ${user?.current_streak || 0}`, icon: 'flame' },
    { label: 'Longest Streak', value: `🏆 ${user?.longest_streak || 0}`, icon: 'trophy' },
    { label: 'Target Band', value: `🎯 ${user?.target_band_score?.toFixed(1) || '—'}`, icon: 'flag' },
  ];

  const menuItems = [
    { label: 'Settings', icon: 'settings-outline' as const, onPress: () => navigation.navigate('Settings') },
    { label: 'My Level', icon: 'school-outline' as const, value: user?.current_level?.replace('_', ' ') || 'Not set' },
    { label: 'Account', icon: 'person-outline' as const, value: user?.auth_provider || 'email' },
    { label: 'Member Since', icon: 'calendar-outline' as const, value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgBody }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Profile</Text>
          <TouchableOpacity
            style={[styles.editBtn, { borderColor: colors.border }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="create-outline" size={18} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Avatar + Info */}
        <View style={styles.profileCard}>
          <LinearGradient colors={Gradients.primary} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.full_name || 'User'}</Text>
          {user?.username && <Text style={[styles.userHandle, { color: colors.accent }]}>@{user.username}</Text>}
          <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user?.email}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={[styles.menuCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuRow, i < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
              onPress={item.onPress}
              disabled={!item.onPress}
              activeOpacity={item.onPress ? 0.7 : 1}
            >
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon} size={20} color={colors.accent} />
                <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{item.label}</Text>
              </View>
              {item.value ? (
                <Text style={[styles.menuValue, { color: colors.textMuted }]}>{item.value}</Text>
              ) : (
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, paddingBottom: 14 },
  title: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 24 },
  editBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  profileCard: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 28, color: '#fff' },
  userName: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 22, marginBottom: 4 },
  userHandle: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14, marginBottom: 4 },
  userEmail: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: { width: '47%', padding: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  statValue: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 18, marginBottom: 4 },
  statLabel: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12 },
  menuCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { fontFamily: 'PlusJakartaSans-Medium', fontSize: 15 },
  menuValue: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, textTransform: 'capitalize' },
});
