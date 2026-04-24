/**
 * Leaderboard API service
 */
import apiClient from './client';

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

export interface LeaderboardData {
  period: string;
  entries: LeaderboardEntry[];
  my_rank: LeaderboardEntry;
}

export const leaderboardAPI = {
  get: async (period: 'weekly' | 'monthly' | 'all_time' = 'weekly'): Promise<LeaderboardData> => {
    const { data } = await apiClient.get('/leaderboard', { params: { period } });
    return data;
  },

  getMyRank: async (period: string = 'weekly') => {
    const { data } = await apiClient.get('/leaderboard/me', { params: { period } });
    return data;
  },
};
