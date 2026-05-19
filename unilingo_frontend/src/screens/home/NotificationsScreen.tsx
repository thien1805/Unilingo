import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { notificationsAPI, UserNotification } from '../../api/notifications';
import { Typography } from '../../theme';
import AppBackground from '../../components/common/AppBackground';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
];

export default function NotificationsScreen({ navigation }: any) {
  const { colors } = useThemeStore();
  const [items, setItems] = useState<UserNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationsAPI.list(1, 50, filter === 'unread');
      setItems(data.items || []);
      setUnread(data.unread || 0);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadNotifications().catch(() => setLoading(false));
  }, [loadNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications().catch(() => {});
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    await notificationsAPI.markAllRead();
    await loadNotifications();
  };

  const openNotification = async (notification: UserNotification) => {
    if (!notification.is_read) {
      await notificationsAPI.markRead(notification.id).catch(() => {});
      setItems((current) => current.map((item) => (
        item.id === notification.id ? { ...item, is_read: true } : item
      )));
      setUnread((current) => Math.max(0, current - 1));
    }

    const route = String(notification.data?.route || '');
    if (route.startsWith('blog/')) {
      navigation.navigate('BlogDetail', { slug: route.replace('blog/', '') });
      return;
    }
    if (route.startsWith('practice')) {
      navigation.getParent()?.navigate('PracticeTab', { screen: 'PracticeMain' });
      return;
    }
    if (route.startsWith('vocabulary')) {
      navigation.getParent()?.navigate('VocabTab');
    }
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.h3, { color: colors.textPrimary }]}>Notifications</Text>
          <Text style={[Typography.caption, { color: colors.textMuted }]}>
            {unread} unread updates
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
          onPress={handleMarkAllRead}
          disabled={unread === 0}
        >
          <Ionicons name="checkmark-done" size={20} color={unread === 0 ? colors.textMuted : colors.accent} />
        </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
        {FILTERS.map((item) => {
          const selected = filter === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.filterChip,
                {
                  backgroundColor: selected ? colors.accent : colors.bgCard,
                  borderColor: selected ? colors.accent : colors.border,
                },
              ]}
              onPress={() => setFilter(item.key)}
            >
              <Text style={[styles.filterText, { color: selected ? '#fff' : colors.textSecondary }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
          >
          <View>
            {items.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                <Ionicons name="notifications-off-outline" size={28} color={colors.textMuted} />
                <Text style={[Typography.bodyMedium, { color: colors.textPrimary, textAlign: 'center' }]}>
                  No notifications yet
                </Text>
                <Text style={[Typography.caption, { color: colors.textMuted, textAlign: 'center' }]}>
                  New blog posts, events, and practice reminders will appear here.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.notificationCard,
                      {
                        backgroundColor: item.is_read ? colors.bgCard : colors.accentBg,
                        borderColor: item.is_read ? colors.border : colors.borderAccent,
                      },
                    ]}
                    activeOpacity={0.82}
                    onPress={() => openNotification(item)}
                  >
                    <View style={[styles.typeIcon, { backgroundColor: typeColor(item.notification_type, colors).bg }]}>
                      <Ionicons name={typeIcon(item.notification_type)} size={18} color={typeColor(item.notification_type, colors).color} />
                    </View>
                    <View style={{ flex: 1, gap: 5 }}>
                      <View style={styles.cardTop}>
                        <Text style={[styles.notificationTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                          {item.title}
                        </Text>
                        {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />}
                      </View>
                      <Text style={[Typography.caption, { color: colors.textSecondary, lineHeight: 19 }]} numberOfLines={3}>
                        {item.body}
                      </Text>
                      <View style={styles.metaRow}>
                        <Text style={[styles.categoryText, { color: typeColor(item.notification_type, colors).color }]}>
                          {(item.category || item.notification_type).toUpperCase()}
                        </Text>
                        <Text style={[Typography.captionSm, { color: colors.textMuted }]}>
                          {timeAgo(item.created_at)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </AppBackground>
  );
}

function typeIcon(type: string): keyof typeof Ionicons.glyphMap {
  if (type === 'event') return 'megaphone-outline';
  if (type === 'forecast') return 'calendar-outline';
  if (type === 'tips') return 'bulb-outline';
  if (type === 'news') return 'newspaper-outline';
  if (type === 'vocabulary') return 'library-outline';
  if (type === 'streak') return 'flame-outline';
  if (type === 'leaderboard') return 'trophy-outline';
  return 'notifications-outline';
}

function typeColor(type: string, colors: any) {
  if (type === 'event') return { color: colors.rose, bg: colors.roseBg };
  if (type === 'forecast') return { color: colors.sky, bg: colors.skyBg };
  if (type === 'tips') return { color: colors.accent2, bg: colors.accent2Bg };
  if (type === 'news') return { color: colors.accent3, bg: colors.accent3Bg };
  if (type === 'streak') return { color: colors.rose, bg: colors.roseBg };
  return { color: colors.accent, bg: colors.accentBg };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  iconButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1 },
  filterText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 12 },
  content: { paddingHorizontal: 20, paddingBottom: 110 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyCard: { minHeight: 190, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 1, padding: 24, gap: 10 },
  notificationCard: { flexDirection: 'row', gap: 13, padding: 14, borderRadius: 16, borderWidth: 1 },
  typeIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  notificationTitle: { flex: 1, fontFamily: 'PlusJakartaSans-Bold', fontSize: 15, lineHeight: 20 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 2 },
  categoryText: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 10, letterSpacing: 0.5 },
});
