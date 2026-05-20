/**
 * HomeScreen — Dashboard with REAL data from API
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
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
import { notificationsAPI } from '../../api/notifications';
import { Gradients } from '../../theme';
import { StreakModal } from '../../components/common/StreakModal';
import AppBackground from '../../components/common/AppBackground';
import MascotIcon from '../../components/common/MascotIcon';
import { formatBand } from '../../utils/bandScore';

const BLOG_CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'forecast', label: 'Forecast' },
  { key: 'tips', label: 'Tips' },
  { key: 'news', label: 'News' },
];

const FORECAST_SKILLS = [
  { key: 'listening', label: 'Listening', icon: 'headset-outline', color: '#2563EB' },
  { key: 'reading', label: 'Reading', icon: 'book-outline', color: '#059669' },
  { key: 'writing', label: 'Writing', icon: 'create-outline', color: '#D97706' },
  { key: 'speaking', label: 'Speaking', icon: 'mic-outline', color: '#E11D48' },
] as const;

const dailyMascotImage = require('../../../assets/mascot/mascot_lie.png');
const partImages = {
  part1: require('../../../assets/mascot/part1.png'),
  part2: require('../../../assets/mascot/part2.png'),
  part3: require('../../../assets/mascot/part3.png'),
};

export default function HomeScreen({ navigation }: any) {
  const { colors } = useThemeStore();
  const { user, setUser } = useAuthStore();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [recentActivity, setRecentActivity] = useState<PracticeHistoryItem[]>([]);
  const [reviewDue, setReviewDue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [featuredBlogs, setFeaturedBlogs] = useState<BlogPostSummary[]>([]);
  const [categoryBlogs, setCategoryBlogs] = useState<BlogPostSummary[]>([]);
  const [selectedBlogCategory, setSelectedBlogCategory] = useState('all');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const streakModalShownRef = useRef(false);
  const lastLoadAtRef = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const checkStreakModal = (currentUserData: any) => {
    // Show onboarding modal if user hasn't set a goal target
    if (currentUserData && currentUserData.goal_target == null && !streakModalShownRef.current) {
      streakModalShownRef.current = true;
      setShowStreakModal(true);
    }
  };

  const loadData = useCallback(async (showInitialLoader = false, force = false) => {
    const now = Date.now();
    if (!force && now - lastLoadAtRef.current < 10_000) {
      return;
    }
    lastLoadAtRef.current = now;

    const revealTimer = showInitialLoader ? setTimeout(() => setLoading(false), 1200) : null;

    try {
      const dashboardRequest = usersAPI.getDashboard()
        .then((dash) => {
          setDashboard(dash);
          setUser(dash.user);
          checkStreakModal(dash.user);
        })
        .catch(() => {});

      const secondaryRequests = [
        practiceAPI.getHistory({ per_page: 5 })
          .then((history) => setRecentActivity(history?.items || []))
          .catch(() => {}),
        vocabularyAPI.getReviewDue()
          .then((val) => setReviewDue(Array.isArray(val) ? val.length : 0))
          .catch(() => {}),
        blogAPI.getFeatured(3)
          .then((blogs) => setFeaturedBlogs(blogs || []))
          .catch(() => {}),
        notificationsAPI.getUnreadCount()
          .then((unread) => setUnreadNotifications(unread || 0))
          .catch(() => {}),
      ];

      await Promise.allSettled([dashboardRequest, ...secondaryRequests]);
    } catch {
      // Silently fail, use whatever data we got
    } finally {
      if (revealTimer) clearTimeout(revealTimer);
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => { loadData(true, true); }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData(false);
      const interval = setInterval(() => loadData(false), 30000);
      return () => clearInterval(interval);
    }, [loadData])
  );

  useEffect(() => {
    const category = selectedBlogCategory === 'all' ? undefined : selectedBlogCategory;
    blogAPI.getPosts(1, 6, category)
      .then((data) => setCategoryBlogs(data.items || []))
      .catch(() => setCategoryBlogs([]));
  }, [selectedBlogCategory]);

  // Data from dashboard or user profile
  const userName = user?.full_name || 'Student';
  const streak = dashboard?.user?.current_streak ?? user?.current_streak ?? 0;
  const totalXp = dashboard?.user?.total_xp ?? user?.total_xp ?? 0;
  const todayTests = dashboard?.today_stats?.tests_completed ?? 0;
  const avgBand = dashboard?.skill_breakdown
    ? formatBand((dashboard.skill_breakdown.fluency + dashboard.skill_breakdown.lexical +
      dashboard.skill_breakdown.grammar + dashboard.skill_breakdown.pronunciation) / 4)
    : '0.0';
  const notificationBadge = unreadNotifications;

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
    return 'Good evening!';
  };

  const dailyGoalColors = ['#FFF8D6', '#FFEFA8'] as const;

  const parts = [
    { key: 'part1', label: 'Part 1', desc: 'Interview', image: partImages.part1 },
    { key: 'part2', label: 'Part 2', desc: 'Long Turn', image: partImages.part2 },
    { key: 'part3', label: 'Part 3', desc: 'Discussion', image: partImages.part3 },
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

  if (loading && !dashboard) {
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
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          style={{ backgroundColor: 'transparent' }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => loadData(true, true)}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
        >
        <View>
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
          <TouchableOpacity
            style={[styles.notifBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
            {notificationBadge > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{notificationBadge > 9 ? '9+' : notificationBadge}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Daily Goal Card */}
        <LinearGradient colors={dailyGoalColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.dailyCard}>
          <View style={styles.dailyTop}>
            <View style={styles.ringContainer}>
              <Svg width={76} height={76}>
                <Circle cx={38} cy={38} r={radius} fill="#fffb926f" stroke="none" />
                <Circle cx={38} cy={38} r={radius} fill="none" stroke="#FDE68A" strokeWidth={6} />
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
            <View style={styles.dailyMascotWrap}>
              <Image source={dailyMascotImage} style={styles.dailyMascot} contentFit="contain" />
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
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>Quick Practice</Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('PracticeTab', { screen: 'PracticeMain' })}
          >
            <Text style={[styles.seeAll, { color: colors.accent }]}>View all</Text>
            <Ionicons name="chevron-forward" size={15} color={colors.accent} />
          </TouchableOpacity>
        </View>
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
                <Image source={part.image} style={styles.quickPartImage} contentFit="contain" />
              </View>
              <Text style={[styles.quickLabel, { color: colors.textPrimary }]}>{part.label}</Text>
              <Text style={[styles.quickDesc, { color: colors.textMuted }]}>{part.desc}</Text>
              <View style={styles.quickArrow}>
                <Ionicons name="arrow-forward" size={15} color={colors.accent} />
              </View>
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
                <MascotIcon mood="confused" size={24} />
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
            <MascotIcon mood="idle" size={36} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No activity yet. Start your first practice!</Text>
          </View>
        )}

        {/* Daily Forecast */}
        <View style={styles.forecastSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>Daily Forecast</Text>
          </View>
          <View style={styles.forecastGrid}>
            {FORECAST_SKILLS.map((skill) => {
              return (
                <TouchableOpacity
                  key={skill.key}
                  style={[
                    styles.forecastCard,
                    {
                      backgroundColor: colors.bgCard,
                      borderColor: colors.border,
                      opacity: 1,
                    },
                  ]}
                  activeOpacity={0.75}
                  onPress={() => navigation.navigate('ForecastList', { skill: skill.key, title: skill.label, icon: skill.icon, color: skill.color })}
                >
                  <View style={[styles.forecastIcon, { backgroundColor: `${skill.color}18` }]}>
                    <Ionicons name={skill.icon} size={20} color={skill.color} />
                  </View>
                  <View style={styles.forecastTextWrap}>
                    <Text style={[styles.forecastSkill, { color: colors.textPrimary }]}>{skill.label}</Text>
                    <Text style={[styles.forecastTitle, { color: colors.textSecondary }]} numberOfLines={2}>
                      Tap to view {skill.label.toLowerCase()} forecasts
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Blog Posts */}
        {(featuredBlogs.length > 0 || categoryBlogs.length > 0) && (
          <View style={{ marginTop: 24 }}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>IELTS Updates</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
              {BLOG_CATEGORIES.map((category) => {
                const selected = selectedBlogCategory === category.key;
                return (
                  <TouchableOpacity
                    key={category.key}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: selected ? colors.accent : colors.bgCard,
                        borderColor: selected ? colors.accent : colors.border,
                      },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedBlogCategory(category.key);
                      if (category.key === 'forecast') {
                        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                      }
                    }}
                  >
                    <Text style={[styles.categoryChipText, { color: selected ? '#fff' : colors.textSecondary }]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.blogScroll}>
              {(() => {
                const blogsToShow = selectedBlogCategory === 'all' && categoryBlogs.length === 0 ? featuredBlogs : categoryBlogs;
                if (selectedBlogCategory !== 'all' && blogsToShow.length === 0) {
                  return (
                    <View style={{ paddingHorizontal: 20, paddingVertical: 30, width: 300, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 14, color: colors.textMuted }}>
                        No posts found for this category.
                      </Text>
                    </View>
                  );
                }
                return blogsToShow.map(blog => (
                  <TouchableOpacity
                  key={blog.id}
                  style={[styles.blogCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
                  activeOpacity={0.75}
                  onPress={() => navigation.navigate('BlogDetail', { slug: blog.slug })}
                >
                  <View style={[styles.blogImagePlaceholder, { backgroundColor: colors.bgInput }]}>
                    {blog.cover_image_url ? (
                      <Image source={{ uri: blog.cover_image_url }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={300} />
                    ) : (
                      <MascotIcon mood="idle" size={32} />
                    )}
                  </View>
                  <View style={styles.blogContent}>
                    <Text style={[styles.blogCategory, { color: colors.accent }]}>{formatBlogCategory(blog.category)}</Text>
                    <Text style={[styles.blogTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                      {blog.title}
                    </Text>
                    <Text style={[styles.blogMeta, { color: colors.textMuted }]}>
                      {blog.read_time_minutes} min read | {blog.view_count} views
                    </Text>
                  </View>
                </TouchableOpacity>
                ));
              })()}
            </ScrollView>
          </View>
        )}
        </View>
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
  dailyMascotWrap: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
  },
  dailyMascot: {
    width: 112,
    height: 112,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#E8DFA8', paddingTop: 16 },
  statItem: { alignItems: 'center' },
  statValue: { fontFamily: 'PlusJakartaSans-ExtraBold', fontSize: 16, color: '#111827', marginBottom: 2 },
  statLabel: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 11, color: '#6B7280' },
  sectionTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 18, marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  viewAllButton: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAll: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14 },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickCard: {
    flex: 3,
    aspectRatio: 4/5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickIcon: {
    width: 50,
    height: 50,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    overflow: 'hidden',
  },
  quickPartImage: {
    width: 65,
    height: 65,
  },
  quickLabel: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 13, marginBottom: 1 },
  quickDesc: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 10, marginBottom: 5 },
  quickArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff4d662',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  reviewLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  reviewIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  reviewTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 15, marginBottom: 2 },
  reviewSub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12 },
  activityScroll: { gap: 12, paddingBottom: 8 },
  activityCard: { width: 185, padding: 16, borderRadius: 16, borderWidth: 1 },
  activityTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  partBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  partBadgeText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 11 },
  bandScore: { fontFamily: 'PlusJakartaSans-ExtraBold', fontSize: 22 },
  activityTitle: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14, marginBottom: 12 },
  activityBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  activityMeta: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  activityTime: { fontFamily: 'PlusJakartaSans-Medium', fontSize: 11 },
  emptyCard: { alignItems: 'center', padding: 32, borderRadius: 16, borderWidth: 1 },
  emptyText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, textAlign: 'center' },
  forecastSection: { marginTop: 18, marginBottom: 24 },
  forecastSource: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 12 },
  forecastGrid: { gap: 10 },
  forecastCard: {
    minHeight: 76,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  forecastIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forecastTextWrap: { flex: 1 },
  forecastSkill: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 14, marginBottom: 3 },
  forecastTitle: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, lineHeight: 17 },
  categoryScroll: { gap: 8, paddingBottom: 12 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1 },
  categoryChipText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 12 },
  blogScroll: { gap: 16, paddingBottom: 8, paddingTop: 4 },
  blogCard: { width: 240, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  blogImagePlaceholder: { height: 120, alignItems: 'center', justifyContent: 'center' },
  blogContent: { padding: 14 },
  blogCategory: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 10, letterSpacing: 0.5, marginBottom: 6 },
  blogTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 14, lineHeight: 20, marginBottom: 8 },
  blogMeta: { fontFamily: 'PlusJakartaSans-Medium', fontSize: 11 },
});
