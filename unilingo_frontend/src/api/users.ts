/**
 * Users & Profile API service
 */
import apiClient from './client';
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
    const { data } = await apiClient.get('/users/me');
    return data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<UserProfile> => {
    const { data } = await apiClient.patch('/users/me', payload);
    return data;
  },

  getDashboard: async (): Promise<DashboardData> => {
    const { data } = await apiClient.get('/users/me/dashboard');
    return data;
  },

  getStreaks: async () => {
    const { data } = await apiClient.get('/users/me/streaks');
    return data;
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
    const { data } = await apiClient.get('/leaderboard', { params: { period, limit } });
    return data;
  },
  getMyRank: async (period: string = 'weekly') => {
    const { data } = await apiClient.get('/leaderboard/me', { params: { period } });
    return data;
  },
};
