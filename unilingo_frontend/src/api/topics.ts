/**
 * Topics & Questions API service
 */
import apiClient from './client';

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
    const { data } = await apiClient.get('/topics', { params });
    return data;
  },

  getDetail: async (topicId: string) => {
    const { data } = await apiClient.get(`/topics/${topicId}`);
    return data;
  },

  getQuestions: async (topicId: string): Promise<Question[]> => {
    const { data } = await apiClient.get(`/topics/${topicId}/questions`);
    return data;
  },

  getRecommended: async (): Promise<Topic[]> => {
    const { data } = await apiClient.get('/topics/recommended');
    return data;
  },
};
