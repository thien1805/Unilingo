import apiClient from './client';
import { getCached, makeCacheKey } from './cache';

export interface ForecastItem {
  id: string;
  title: string;
  skill_category: string;
  content: string;
  excerpt?: string;
  cover_image_url?: string;
  created_at: string;
}

export interface ForecastResponse {
  items: ForecastItem[];
  page: number;
  per_page: number;
}

export const forecastAPI = {
  getForecasts: async (page = 1, perPage = 10, skill?: string): Promise<ForecastResponse> => {
    const params = { page, perPage, skill };
    return getCached(makeCacheKey('forecast:list', params), async () => {
      let url = `/forecast/?page=${page}&per_page=${perPage}`;
      if (skill) {
        url += `&skill=${skill}`;
      }
      const response = await apiClient.get(url);
      return response.data;
    }, 60_000);
  },

  getForecastDetail: async (id: string): Promise<ForecastItem> => {
    return getCached(makeCacheKey('forecast:detail', { id }), async () => {
      const response = await apiClient.get(`/forecast/${id}`);
      return response.data;
    }, 5 * 60_000);
  },
};
