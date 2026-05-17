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
  Image,
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
import { blogAPI, BlogPostSummary } from '../../api/blog';
import { Gradients } from '../../theme';
import { StreakModal } from '../../components/common/StreakModal';
import AppBackground from '../../components/common/AppBackground';
import * as SecureStore from 'expo-secure-store';

export default function HomeScreen({ navigation }: any) {
  const { colors } = useThemeStore();
  const { user } = useAuthStore();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [recentActivity, setRecentActivity] = useState<PracticeHistoryItem[]>([]);
  const [reviewDue, setReviewDue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [featuredBlogs, setFeaturedBlogs] = useState<BlogPostSummary[]>([]);

  const checkStreakModal = (currentUserData: any) => {
    // Show onboarding modal if user hasn't set a goal target
    if (currentUserData && currentUserData.goal_target == null) {
      setShowStreakModal(true);
    }
  };

  const loadData = useCallback(async () => {
    try {
      const [dash, history, reviewWords, blogs] = await Promise.allSettled([
        usersAPI.getDashboard(),
        practiceAPI.getHistory({ per_page: 5 }),
        vocabularyAPI.getReviewDue(),
        blogAPI.getFeatured(3),
      ]);
      if (dash.status === 'fulfilled') {
        setDashboard(dash.value);
        checkStreakModal(dash.value.user);
      }
      if (history.status === 'fulfilled') setRecentActivity(history.value?.items || []);
      if (reviewWords.status === 'fulfilled') {
        const val = reviewWords.value;
        setReviewDue(Array.isArray(val) ? val.length : 0);
      }
      if (blogs.status === 'fulfilled') {
        setFeaturedBlogs(blogs.value || []);
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

  // Progress ring
  const progressPct = Math.min(todayTests / 3, 1);
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressPct);

  // Initials for avatar
  const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning! ';
    if (hr < 17) return 'Good afternoon!';
    return 'Good evening! 👋';
  };

  const dailyGoalColors = ['#FFF8D6', '#FFEFA8'] as const;

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

  const formatBlogCategory = (category?: string | null) => {
    if (!category?.trim()) return 'GENERAL';
    return category.trim().replace(/_/g, ' ').toUpperCase();
  };

  if (loading) {
    return (
      <AppBackground>
        <SafeAreaView style={[styles.safe, { backgroundColor: 'transparent' }]}> 
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <SafeAreaView style={[styles.safe, { backgroundColor: 'transparent' }]}> 
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          style={{ backgroundColor: 'transparent' }}
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
        <LinearGradient colors={dailyGoalColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.dailyCard}>
          <View style={styles.dailyTop}>
            <View style={styles.ringContainer}>
              <Svg width={76} height={76}>
                <Circle cx={38} cy={38} r={radius} fill="rgba(255,255,255,0.45)" stroke="none" />
                <Circle cx={38} cy={38} r={radius} fill="none" stroke="rgba(246,216,95,0.38)" strokeWidth={6} />
                <Circle
                  cx={38} cy={38} r={radius}
                  fill="none" stroke="#F6D85F" strokeWidth={6}
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
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalXp}</Text>
              <Text style={styles.statLabel}>XP Today</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{avgBand}</Text>
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
                <Text style={{ fontSize: 18 }}></Text>
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
                <TouchableOpacity
                  key={i}
                  style={[styles.activityCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
                  activeOpacity={0.7}
                  onPress={() => {
                    // Navigate to results or practice depending on status
                    if (item.status === 'completed' && item.attempt_id) {
                      navigation.navigate('PracticeTab', {
                        screen: 'Results',
                        params: {
                          attemptId: item.attempt_id,
                          ieltsPart: item.ielts_part,
                          topicTitle: item.topic_title,
                          duration: item.duration_seconds || 0,
                        }
                      });
                    }
                  }}
                >
                  <View style={styles.activityTop}>
                    <View style={[styles.partBadge, { backgroundColor: pc.bg }]}>
                      <Text style={[styles.partBadgeText, { color: pc.text }]}>
                        {item.ielts_part?.replace('part', 'Part ') || 'Part 2'}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { 
                      backgroundColor: item.status === 'completed' ? colors.successBg : colors.warningBg,
                      paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8
                    }]}>
                      <Text style={{ 
                        fontSize: 10, fontFamily: 'PlusJakartaSans-SemiBold',
                        color: item.status === 'completed' ? colors.success : colors.warning
                      }}>
                        {item.status === 'completed' ? 'Done' : 'Scoring'}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.activityTitle, { color: colors.textPrimary }]} numberOfLines={2}>{item.topic_title}</Text>
                  
                  <View style={styles.activityBottom}>
                    <View style={styles.activityMeta}>
                      <Text style={[styles.activityTime, { color: colors.textMuted }]}>
                        {item.started_at ? timeAgo(item.started_at) : 'Recently'}
                      </Text>
                      {item.duration_seconds ? (
                        <Text style={[styles.activityTime, { color: colors.textMuted }]}>
                          • {Math.floor(item.duration_seconds / 60)}:{(item.duration_seconds % 60).toString().padStart(2, '0')}
                        </Text>
                      ) : null}
                    </View>
                    
                    <Text style={[styles.bandScore, { color: colors.accent }]}>
                      {item.overall_band ? item.overall_band.toFixed(1) : '—'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}></Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No activity yet. Start your first practice!</Text>
          </View>
        )}

        {/* Blog Posts */}
        {featuredBlogs.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>Tips & Insights</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.blogScroll}>
              {featuredBlogs.map(blog => (
                <TouchableOpacity
                  key={blog.id}
                  style={[styles.blogCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('BlogDetail', { slug: blog.slug })}
                >
                  <View style={[styles.blogImagePlaceholder, { backgroundColor: colors.bgInput }]}>
                    {blog.cover_image_url ? (
                      <Image source={{ uri: blog.cover_image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                      <Text style={{ fontSize: 24 }}></Text>
                    )}
                  </View>
                  <View style={styles.blogContent}>
                    <Text style={[styles.blogCategory, { color: colors.accent }]}>{formatBlogCategory(blog.category)}</Text>
                    <Text style={[styles.blogTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                      {blog.title}
                    </Text>
                    <Text style={[styles.blogMeta, { color: colors.textMuted }]}>
                      {blog.read_time_minutes} min read • {blog.view_count} views
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        </ScrollView>

        <StreakModal 
          visible={showStreakModal} 
          onClose={() => setShowStreakModal(false)} 
        />
      </SafeAreaView>
    </AppBackground>
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
  dailyCard: {
    borderRadius: 20,
    padding: 22,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  dailyTop: { flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 16 },
  ringContainer: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center' },
  ringText: { position: 'absolute', fontFamily: 'PlusJakartaSans-Bold', fontSize: 14, color: '#111827' },
  dailyTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 18, color: '#1F2937', marginBottom: 4 },
  dailySub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, color: '#4B5563' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#E8DFA8', paddingTop: 16 },
  statItem: { alignItems: 'center' },
  statValue: { fontFamily: 'PlusJakartaSans-ExtraBold', fontSize: 16, color: '#111827', marginBottom: 2 },
  statLabel: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 11, color: '#6B7280' },
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
  statusBadge: { alignSelf: 'flex-start' },
  partBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  partBadgeText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 11 },
  bandScore: { fontFamily: 'PlusJakartaSans-ExtraBold', fontSize: 22 },
  activityTitle: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14, marginBottom: 12 },
  activityBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  activityMeta: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  activityTime: { fontFamily: 'PlusJakartaSans-Medium', fontSize: 11 },
  emptyCard: { alignItems: 'center', padding: 32, borderRadius: 16, borderWidth: 1 },
  emptyText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, textAlign: 'center' },
  blogScroll: { gap: 16, paddingBottom: 8, paddingTop: 4 },
  blogCard: { width: 240, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  blogImagePlaceholder: { height: 120, alignItems: 'center', justifyContent: 'center' },
  blogContent: { padding: 14 },
  blogCategory: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 10, letterSpacing: 0.5, marginBottom: 6 },
  blogTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 14, lineHeight: 20, marginBottom: 8 },
  blogMeta: { fontFamily: 'PlusJakartaSans-Medium', fontSize: 11 },
});
