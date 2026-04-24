/**
 * LeaderboardScreen — Real rankings from API
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { leaderboardAPI, LeaderboardEntry, LeaderboardResponse } from '../../api/users';
import { Gradients } from '../../theme';

const PERIODS = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'all_time', label: 'All Time' },
];

export default function LeaderboardScreen() {
  const { colors } = useThemeStore();
  const { user } = useAuthStore();

  const [period, setPeriod] = useState('weekly');
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const result = await leaderboardAPI.get(period);
      setData(result);
    } catch {
      // Keep existing data
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { setLoading(true); loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const getMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const rankColors = ['#F59E0B', '#94A3B8', '#F97316']; // gold, silver, bronze

  const renderItem = ({ item }: { item: LeaderboardEntry }) => {
    const isMe = item.user_id === user?.id;
    const medal = getMedal(item.rank);

    return (
      <View style={[
        styles.row,
        {
          backgroundColor: isMe ? colors.accentBg : colors.bgCard,
          borderColor: isMe ? colors.borderAccent : colors.border,
        },
      ]}>
        <View style={styles.rankCol}>
          {medal ? (
            <Text style={{ fontSize: 20 }}>{medal}</Text>
          ) : (
            <Text style={[styles.rankNum, { color: colors.textMuted }]}>{item.rank}</Text>
          )}
        </View>
        <View style={[styles.rowAvatar, { backgroundColor: item.rank <= 3 ? rankColors[item.rank - 1] : colors.accent }]}>
          <Text style={styles.rowAvatarText}>{getInitials(item.full_name)}</Text>
        </View>
        <View style={styles.rowInfo}>
          <Text style={[styles.rowName, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.full_name} {isMe ? '(You)' : ''}
          </Text>
          <Text style={[styles.rowMeta, { color: colors.textMuted }]}>
            Band {item.avg_band_score.toFixed(1)} · {item.total_tests} tests
          </Text>
        </View>
        <View style={styles.rowXp}>
          <Text style={[styles.xpValue, { color: colors.accent }]}>⭐ {item.total_xp}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgBody }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Leaderboard</Text>
      </View>

      {/* Period tabs */}
      <View style={styles.tabs}>
        {PERIODS.map(p => (
          <TouchableOpacity
            key={p.key}
            style={[
              styles.tab,
              {
                backgroundColor: period === p.key ? colors.accent : colors.bgCard,
                borderColor: period === p.key ? colors.accent : colors.border,
              },
            ]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[styles.tabText, { color: period === p.key ? '#fff' : colors.textSecondary }]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* My rank banner */}
      {data?.my_rank && (
        <LinearGradient colors={Gradients.hero} style={styles.myRank}>
          <View>
            <Text style={styles.myRankLabel}>Your Rank</Text>
            <Text style={styles.myRankValue}>#{data.my_rank.rank}</Text>
          </View>
          <View style={styles.myRankStats}>
            <View style={styles.myStatItem}>
              <Text style={styles.myStatValue}>⭐ {data.my_rank.total_xp}</Text>
              <Text style={styles.myStatLabel}>Total XP</Text>
            </View>
            <View style={styles.myStatItem}>
              <Text style={styles.myStatValue}>📈 {data.my_rank.avg_band_score.toFixed(1)}</Text>
              <Text style={styles.myStatLabel}>Avg Band</Text>
            </View>
          </View>
        </LinearGradient>
      )}

      {/* List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={data?.entries || []}
          renderItem={renderItem}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 40 }}>🏆</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No rankings yet. Start practicing!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 },
  title: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 24 },
  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  tabText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13 },
  myRank: { marginHorizontal: 20, borderRadius: 16, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  myRankLabel: { fontFamily: 'PlusJakartaSans-Regular', color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  myRankValue: { fontFamily: 'PlusJakartaSans-ExtraBold', color: '#fff', fontSize: 28 },
  myRankStats: { flexDirection: 'row', gap: 20 },
  myStatItem: { alignItems: 'center' },
  myStatValue: { fontFamily: 'PlusJakartaSans-Bold', color: '#fff', fontSize: 14 },
  myStatLabel: { fontFamily: 'PlusJakartaSans-Regular', color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 },
  list: { paddingHorizontal: 20, paddingBottom: 100, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1 },
  rankCol: { width: 32, alignItems: 'center' },
  rankNum: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 14 },
  rowAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowAvatarText: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 13, color: '#fff' },
  rowInfo: { flex: 1 },
  rowName: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14, marginBottom: 2 },
  rowMeta: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 11 },
  rowXp: { marginLeft: 8 },
  xpValue: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 14 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, marginTop: 12 },
});
