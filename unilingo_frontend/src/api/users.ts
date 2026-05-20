/**
 * Users & Profile API service
 */
import apiClient from './client';
import { getCached, makeCacheKey } from './cache';
import { UserProfile } from '../store/authStore';

export interface DashboardData {
  user: UserProfile;
  today_stats: {
    tests_completed: number;
    xp_earned: number;
    words_learned: number;
    study_minutes: number;
    daily_goal_met: boolean;
  };
  weekly_band_trend: { date: string; band_score: number }[];
  skill_breakdown: {
    fluency: number;
    lexical: number;
    grammar: number;
    pronunciation: number;
  };
  vocabulary_stats: {
    total: number;
    mastered: number;
    learning: number;
    new: number;
  };
  total_practice_hours: number;
  total_tests: number;
}

export interface UpdateProfilePayload {
  full_name?: string;
  username?: string;
  target_band_score?: number;
  target_exam_date?: string;
  current_level?: string;
}

export const usersAPI = {
  getMe: async (): Promise<UserProfile> => {
    return getCached('users:me', async () => {
      const { data } = await apiClient.get('/users/me');
      return data;
    }, 60_000);
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<UserProfile> => {
    const { data } = await apiClient.patch('/users/me', payload);
    return data;
  },

  getDashboard: async (): Promise<DashboardData> => {
    return getCached('users:dashboard', async () => {
      const { data } = await apiClient.get('/users/me/dashboard');
      return data;
    }, 30_000);
  },

  getStreaks: async () => {
    return getCached('users:streaks', async () => {
      const { data } = await apiClient.get('/users/me/streaks');
      return data;
    }, 30_000);
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await apiClient.post('/users/me/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return data;
  },
};

// ─── Leaderboard API ───
export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string | null;
  full_name: string;
  avatar_url: string | null;
  avg_band_score: number;
  total_tests: number;
  total_xp: number;
}

export interface LeaderboardResponse {
  period: string;
  entries: LeaderboardEntry[];
  my_rank: LeaderboardEntry;
}

export const leaderboardAPI = {
  get: async (period: string = 'weekly', limit: number = 50): Promise<LeaderboardResponse> => {
    const params = { period, limit };
    return getCached(makeCacheKey('leaderboard:list', params), async () => {
      const { data } = await apiClient.get('/leaderboard', { params });
      return data;
    }, 30_000);
  },
  getMyRank: async (period: string = 'weekly') => {
    const params = { period };
    return getCached(makeCacheKey('leaderboard:me', params), async () => {
      const { data } = await apiClient.get('/leaderboard/me', { params });
      return data;
    }, 30_000);
  },
};
