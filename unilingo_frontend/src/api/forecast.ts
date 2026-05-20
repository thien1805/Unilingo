import { api } from './index';

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
    let url = `/forecast/?page=${page}&per_page=${perPage}`;
    if (skill) {
      url += `&skill=${skill}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  getForecastDetail: async (id: string): Promise<ForecastItem> => {
    const response = await api.get(`/forecast/${id}`);
    return response.data;
  },
};
