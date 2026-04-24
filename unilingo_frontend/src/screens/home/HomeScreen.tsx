/**
 * HomeScreen — Dashboard with REAL data from API
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { usersAPI, DashboardData } from '../../api/users';
import { practiceAPI, PracticeHistoryItem } from '../../api/practice';
import { vocabularyAPI } from '../../api/vocabulary';
import { Gradients } from '../../theme';

export default function HomeScreen({ navigation }: any) {
  const { colors } = useThemeStore();
  const { user } = useAuthStore();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [recentActivity, setRecentActivity] = useState<PracticeHistoryItem[]>([]);
  const [reviewDue, setReviewDue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [dash, history, reviewWords] = await Promise.allSettled([
        usersAPI.getDashboard(),
        practiceAPI.getHistory({ per_page: 5 }),
        vocabularyAPI.getReviewDue(),
      ]);
      if (dash.status === 'fulfilled') setDashboard(dash.value);
      if (history.status === 'fulfilled') setRecentActivity(history.value.items);
      if (reviewWords.status === 'fulfilled') {
        setReviewDue(Array.isArray(reviewWords.value) ? reviewWords.value.length : 0);
      }
    } catch {
      // Silently fail, use whatever data we got
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Data from dashboard or user profile
  const userName = user?.full_name || 'Student';
  const streak = dashboard?.user?.current_streak ?? user?.current_streak ?? 0;
  const totalXp = dashboard?.user?.total_xp ?? user?.total_xp ?? 0;
  const todayTests = dashboard?.today_stats?.tests_completed ?? 0;
  const avgBand = dashboard?.skill_breakdown
    ? ((dashboard.skill_breakdown.fluency + dashboard.skill_breakdown.lexical +
      dashboard.skill_breakdown.grammar + dashboard.skill_breakdown.pronunciation) / 4).toFixed(1)
    : '0.0';

  // Initials for avatar
  const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning! 👋';
    if (hr < 17) return 'Good afternoon! 👋';
    return 'Good evening! 👋';
  };

  // Progress ring
  const progressPct = Math.min(todayTests / 3, 1);
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressPct);

  const parts = [
    { key: 'part1', label: 'Part 1', desc: 'Interview', emoji: '💬' },
    { key: 'part2', label: 'Part 2', desc: 'Long Turn', emoji: '🎤' },
    { key: 'part3', label: 'Part 3', desc: 'Discussion', emoji: '🗣️' },
  ];

  const getPartColor = (part: string) => {
    if (part === 'part1') return { bg: colors.accentBg, text: colors.accent };
    if (part === 'part3') return { bg: colors.skyBg, text: colors.sky };
    return { bg: colors.roseBg, text: colors.rose };
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgBody }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgBody }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient colors={Gradients.primary} style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
            <View>
              <Text style={[styles.greetingTitle, { color: colors.textPrimary }]}>{getGreeting()}</Text>
              <Text style={[styles.greetingSub, { color: colors.textSecondary }]}>Let's practice IELTS today</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.notifBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
            {reviewDue > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{reviewDue > 9 ? '9+' : reviewDue}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Daily Goal Card */}
        <LinearGradient colors={Gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.dailyCard}>
          <View style={styles.dailyTop}>
            <View style={styles.ringContainer}>
              <Svg width={76} height={76}>
                <Circle cx={38} cy={38} r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={6} />
                <Circle
                  cx={38} cy={38} r={radius}
                  fill="none" stroke="#fff" strokeWidth={6}
                  strokeLinecap="round"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  rotation={-90} origin="38,38"
                />
              </Svg>
              <Text style={styles.ringText}>{todayTests}/{3}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dailyTitle}>Daily Goal</Text>
              <Text style={styles.dailySub}>{todayTests} of 3 practices done today</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>🔥 {streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⭐ {totalXp}</Text>
              <Text style={styles.statLabel}>XP Today</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>📈 {avgBand}</Text>
              <Text style={styles.statLabel}>Avg Band</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Practice */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Practice</Text>
        <View style={styles.quickRow}>
          {parts.map(part => (
            <TouchableOpacity
              key={part.key}
              style={[styles.quickCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('PracticeTab', {
                screen: 'PracticeMain',
                params: { selectedPart: part.key },
              })}
            >
              <View style={[styles.quickIcon, { backgroundColor: colors.bgSecondary }]}>
                <Text style={{ fontSize: 22 }}>{part.emoji}</Text>
              </View>
              <Text style={[styles.quickLabel, { color: colors.textPrimary }]}>{part.label}</Text>
              <Text style={[styles.quickDesc, { color: colors.textMuted }]}>{part.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Review Banner */}
        {reviewDue > 0 && (
          <TouchableOpacity
            style={[styles.reviewBanner, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('VocabTab')}
          >
            <View style={styles.reviewLeft}>
              <View style={[styles.reviewIcon, { backgroundColor: colors.accent2Bg }]}>
                <Text style={{ fontSize: 18 }}>📚</Text>
              </View>
              <View>
                <Text style={[styles.reviewTitle, { color: colors.textPrimary }]}>{reviewDue} words to review</Text>
                <Text style={[styles.reviewSub, { color: colors.textSecondary }]}>Don't lose your progress!</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PracticeTab', { screen: 'PracticeHistory' })}>
            <Text style={[styles.seeAll, { color: colors.accent }]}>See all</Text>
          </TouchableOpacity>
        </View>

        {recentActivity.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activityScroll}>
            {recentActivity.map((item, i) => {
              const pc = getPartColor(item.ielts_part);
              return (
                <View key={i} style={[styles.activityCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                  <View style={styles.activityTop}>
                    <View style={[styles.partBadge, { backgroundColor: pc.bg }]}>
                      <Text style={[styles.partBadgeText, { color: pc.text }]}>
                        {item.ielts_part?.replace('part', 'Part ') || 'Part 2'}
                      </Text>
                    </View>
                    <Text style={[styles.bandScore, { color: colors.accent }]}>
                      {item.overall_band?.toFixed(1) || '—'}
                    </Text>
                  </View>
                  <Text style={[styles.activityTitle, { color: colors.textPrimary }]} numberOfLines={1}>{item.topic_title}</Text>
                  <Text style={[styles.activityTime, { color: colors.textMuted }]}>
                    {item.started_at ? timeAgo(item.started_at) : 'Recently'}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>📝</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No activity yet. Start your first practice!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 15, color: '#fff' },
  greetingTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 16 },
  greetingSub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, marginTop: 1 },
  notifBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notifBadge: { position: 'absolute', top: -4, right: -4, width: 18, height: 18, backgroundColor: '#EF4444', borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  notifBadgeText: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 9, color: '#fff' },
  dailyCard: { borderRadius: 20, padding: 22, marginBottom: 24 },
  dailyTop: { flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 16 },
  ringContainer: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center' },
  ringText: { position: 'absolute', fontFamily: 'PlusJakartaSans-Bold', fontSize: 14, color: '#fff' },
  dailyTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 18, color: '#fff', marginBottom: 4 },
  dailySub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 16 },
  statItem: { alignItems: 'center' },
  statValue: { fontFamily: 'PlusJakartaSans-ExtraBold', fontSize: 16, color: '#fff', marginBottom: 2 },
  statLabel: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  sectionTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 18, marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  seeAll: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14 },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickCard: { flex: 1, alignItems: 'center', paddingVertical: 18, paddingHorizontal: 8, borderRadius: 16, borderWidth: 1, gap: 8 },
  quickIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 14 },
  quickDesc: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 11 },
  reviewBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  reviewLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  reviewIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  reviewTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 15, marginBottom: 2 },
  reviewSub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12 },
  activityScroll: { gap: 12, paddingBottom: 8 },
  activityCard: { width: 185, padding: 16, borderRadius: 16, borderWidth: 1 },
  activityTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  partBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  partBadgeText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 11 },
  bandScore: { fontFamily: 'PlusJakartaSans-ExtraBold', fontSize: 22 },
  activityTitle: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14, marginBottom: 6 },
  activityTime: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 11 },
  emptyCard: { alignItems: 'center', padding: 32, borderRadius: 16, borderWidth: 1 },
  emptyText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, textAlign: 'center' },
});
