/**
 * PracticeHistoryScreen — Full practice history with filtering
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { practiceAPI, PracticeHistoryItem } from '../../api/practice';

const PARTS = ['all', 'part1', 'part2', 'part3'] as const;

const MOCK_HISTORY: PracticeHistoryItem[] = [
  { attempt_id: 'h1', topic_title: 'Describe a place you visited', ielts_part: 'part2', overall_band: 6.5, status: 'completed', duration_seconds: 180, started_at: new Date(Date.now() - 3600000).toISOString(), completed_at: new Date().toISOString() },
  { attempt_id: 'h2', topic_title: 'Talk about your hometown', ielts_part: 'part1', overall_band: 7.0, status: 'completed', duration_seconds: 120, started_at: new Date(Date.now() - 86400000).toISOString(), completed_at: new Date(Date.now() - 86400000 + 300000).toISOString() },
  { attempt_id: 'h3', topic_title: 'Discuss environmental issues', ielts_part: 'part3', overall_band: 6.0, status: 'completed', duration_seconds: 240, started_at: new Date(Date.now() - 172800000).toISOString(), completed_at: new Date(Date.now() - 172800000 + 300000).toISOString() },
  { attempt_id: 'h4', topic_title: 'Describe a skill you learned', ielts_part: 'part2', overall_band: null, status: 'scoring', duration_seconds: null, started_at: new Date(Date.now() - 259200000).toISOString(), completed_at: null },
  { attempt_id: 'h5', topic_title: 'Talk about technology', ielts_part: 'part1', overall_band: 7.5, status: 'completed', duration_seconds: 95, started_at: new Date(Date.now() - 345600000).toISOString(), completed_at: new Date(Date.now() - 345600000 + 200000).toISOString() },
];

export default function PracticeHistoryScreen({ navigation }: any) {
  const { colors } = useThemeStore();
  const [items, setItems] = useState<PracticeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activePart, setActivePart] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadHistory = useCallback(async (reset = false) => {
    const p = reset ? 1 : page;
    try {
      const result = await practiceAPI.getHistory({
        page: p,
        per_page: 20,
        ielts_part: activePart === 'all' ? undefined : activePart,
      });
      if (reset) {
        setItems(result.items);
      } else {
        setItems(prev => [...prev, ...result.items]);
      }
      setHasMore(result.items.length === 20);
      setPage(p + 1);
    } catch {
      if (reset) setItems(MOCK_HISTORY);
    } finally {
      setLoading(false);
    }
  }, [activePart, page]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    loadHistory(true);
  }, [activePart]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await loadHistory(true);
    setRefreshing(false);
  }, [loadHistory]);

  const getPartStyle = (part: string) => {
    switch (part) {
      case 'part1': return { bg: colors.accentBg, text: colors.accent, label: 'Part 1' };
      case 'part2': return { bg: colors.roseBg, text: colors.rose, label: 'Part 2' };
      case 'part3': return { bg: colors.skyBg, text: colors.sky, label: 'Part 3' };
      default: return { bg: colors.accentBg, text: colors.accent, label: part };
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return { bg: colors.successBg, text: colors.success, label: 'Completed', icon: 'checkmark-circle' as const };
      case 'scoring': return { bg: colors.warningBg, text: colors.warning, label: 'Scoring...', icon: 'hourglass' as const };
      case 'in_progress': return { bg: colors.skyBg, text: colors.sky, label: 'In Progress', icon: 'play-circle' as const };
      default: return { bg: colors.errorBg, text: colors.error, label: status, icon: 'alert-circle' as const };
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '—';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const renderItem = ({ item }: { item: PracticeHistoryItem }) => {
    const part = getPartStyle(item.ielts_part);
    const status = getStatusStyle(item.status);

    return (
      <TouchableOpacity
        style={[styles.historyCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
        activeOpacity={0.7}
        onPress={() => {
          if (item.status === 'completed') {
            navigation.navigate('PracticeTab', {
              screen: 'Results',
              params: { attemptId: item.attempt_id },
            });
          }
        }}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.partBadge, { backgroundColor: part.bg }]}>
            <Text style={[styles.partBadgeText, { color: part.text }]}>{part.label}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={12} color={status.text} />
            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={[styles.topicTitle, { color: colors.textPrimary }]} numberOfLines={2}>
          {item.topic_title}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              {formatDate(item.started_at)}
            </Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              {formatDuration(item.duration_seconds)}
            </Text>
          </View>
          {item.overall_band && (
            <Text style={[styles.bandScore, { color: colors.accent }]}>
              {item.overall_band.toFixed(1)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgBody }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Practice History</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Part Filter */}
      <View style={styles.filterRow}>
        {PARTS.map(part => (
          <TouchableOpacity
            key={part}
            style={[
              styles.filterChip,
              {
                backgroundColor: activePart === part ? colors.accent : colors.bgCard,
                borderColor: activePart === part ? colors.accent : colors.border,
              },
            ]}
            onPress={() => setActivePart(part)}
          >
            <Text
              style={[
                styles.filterText,
                { color: activePart === part ? '#fff' : colors.textSecondary },
              ]}
            >
              {part === 'all' ? 'All' : part.replace('part', 'Part ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* History List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.attempt_id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          onEndReached={() => hasMore && loadHistory()}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No history yet</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                Complete a practice session to see it here
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 20 },
  filterRow: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
  },
  filterText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13 },
  list: { paddingHorizontal: 20, paddingBottom: 100, gap: 12 },
  historyCard: {
    padding: 16, borderRadius: 16, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10,
  },
  partBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  partBadgeText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 11 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
  },
  statusText: { fontFamily: 'PlusJakartaSans-Medium', fontSize: 10 },
  topicTitle: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 15, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12 },
  bandScore: { fontFamily: 'PlusJakartaSans-ExtraBold', fontSize: 22, marginLeft: 'auto' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 20, marginBottom: 8 },
  emptyDesc: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, textAlign: 'center' },
});
