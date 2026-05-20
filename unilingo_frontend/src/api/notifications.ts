import apiClient from './client';
import { getCached, makeCacheKey } from './cache';

export interface NotificationSettings {
  daily_reminder: boolean;
  reminder_time: string;
  new_words_reminder: boolean;
  streak_reminder: boolean;
  leaderboard_update: boolean;
  event_notifications: boolean;
  blog_notifications: boolean;
  forecast_notifications: boolean;
  tips_notifications: boolean;
  news_notifications: boolean;
}

export type NotificationSettingsPatch = Partial<NotificationSettings>;

export interface UserNotification {
  id: string;
  campaign_id: string | null;
  title: string;
  body: string;
  notification_type: string;
  category: string | null;
  data: Record<string, unknown> | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  items: UserNotification[];
  total: number;
  unread: number;
  page: number;
  per_page: number;
}

export const notificationsAPI = {
  getSettings: async (): Promise<NotificationSettings> => {
    return getCached('notifications:settings', async () => {
      const { data } = await apiClient.get('/notifications/settings');
      return data;
    }, 60_000);
  },

  updateSettings: async (payload: NotificationSettingsPatch): Promise<NotificationSettings> => {
    const { data } = await apiClient.patch('/notifications/settings', payload);
    return data;
  },

  registerDevice: async (payload: { fcm_token: string; device_type: 'ios' | 'android' | 'web'; device_name?: string }) => {
    const { data } = await apiClient.post('/notifications/devices/register', payload);
    return data;
  },

  getUnreadCount: async (): Promise<number> => {
    return getCached('notifications:unread-count', async () => {
      const { data } = await apiClient.get('/notifications/unread-count');
      return data.unread || 0;
    }, 20_000);
  },

  list: async (page = 1, perPage = 20, unreadOnly = false): Promise<NotificationListResponse> => {
    const params = { page, per_page: perPage, unread_only: unreadOnly };
    return getCached(makeCacheKey('notifications:list', params), async () => {
      const { data } = await apiClient.get('/notifications', { params });
      return data;
    }, 20_000);
  },

  markRead: async (notificationId: string): Promise<UserNotification> => {
    const { data } = await apiClient.patch(`/notifications/${notificationId}/read`);
    return data;
  },

  markAllRead: async () => {
    const { data } = await apiClient.patch('/notifications/read-all');
    return data;
  },
};
