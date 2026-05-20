/**
 * Topics & Questions API service
 */
import apiClient from './client';
import { getCached, makeCacheKey } from './cache';
import { MockTestData, normalizeMockTestData } from '../data/mockSpeakingTest';

export interface Topic {
  id: string;
  title: string;
  title_vi: string | null;
  description: string | null;
  category: string;
  ielts_part: string;
  difficulty: string;
  is_active: boolean;
  order_index: number;
  question_count?: number;
}

export interface Question {
  id: string;
  topic_id: string;
  question_text: string;
  question_text_vi: string | null;
  ielts_part: string;
  cue_card_content: string | null;
  follow_up_questions: any;
  difficulty: string;
  sample_answer: any;
  key_vocabulary: any;
}

export const topicsAPI = {
  list: async (params?: {
    ielts_part?: string;
    category?: string;
    difficulty?: string;
  }): Promise<{ items: Topic[]; total: number }> => {
    return getCached(makeCacheKey('topics:list', params), async () => {
      const { data } = await apiClient.get('/topics', { params });
      return data;
    }, 5 * 60_000);
  },

  getDetail: async (topicId: string) => {
    return getCached(makeCacheKey('topics:detail', { topicId }), async () => {
      const { data } = await apiClient.get(`/topics/${topicId}`);
      return data;
    }, 5 * 60_000);
  },

  getQuestions: async (topicId: string): Promise<Question[]> => {
    return getCached(makeCacheKey('topics:questions', { topicId }), async () => {
      const { data } = await apiClient.get(`/topics/${topicId}/questions`);
      return data;
    }, 5 * 60_000);
  },

  getRecommended: async (): Promise<Topic[]> => {
    return getCached('topics:recommended', async () => {
      const { data } = await apiClient.get('/topics/recommended');
      return data;
    }, 60_000);
  },

  getMockTest: async (): Promise<MockTestData> => {
    return getCached('topics:mock-test', async () => {
      const { data } = await apiClient.get('/topics/mock-test', { timeout: 8000 });
      return normalizeMockTestData(data);
    }, 60_000);
  },
};
