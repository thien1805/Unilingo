/**
 * Leaderboard API service
 */
import apiClient from './client';
import { getCached, makeCacheKey } from './cache';

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
    const params = { period };
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
