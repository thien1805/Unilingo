/**
 * Vocabulary API service
 */
import apiClient from './client';

export interface VocabularyItem {
  id: string;
  word: string;
  phonetic: string | null;
  audio_url: string | null;
  definitions: any;
  examples: any;
  user_note: string | null;
  source_context: string | null;
  mastery_level: 'new' | 'learning' | 'reviewing' | 'mastered';
  review_count: number;
  next_review_at: string | null;
  tags: string[];
  created_at: string;
}

export interface AddVocabularyPayload {
  word: string;
  phonetic?: string;
  audio_url?: string;
  definitions?: any;
  examples?: any;
  user_note?: string;
  source_context?: string;
  source_attempt_id?: string;
  tags?: string[];
}

export interface DictionaryResult {
  word: string;
  phonetic: string | null;
  audio_url: string | null;
  meanings: {
    part_of_speech: string;
    definitions: {
      definition: string;
      example: string | null;
      synonyms: string[];
      antonyms: string[];
    }[];
  }[];
}

export const vocabularyAPI = {
  list: async (params?: {
    page?: number;
    per_page?: number;
    mastery_level?: string;
    search?: string;
    sort_by?: string;
    order?: string;
  }): Promise<{ items: VocabularyItem[]; total: number; page: number; per_page: number }> => {
    const { data } = await apiClient.get('/vocabulary', { params });
    return data;
  },

  add: async (payload: AddVocabularyPayload): Promise<VocabularyItem> => {
    const { data } = await apiClient.post('/vocabulary', payload);
    return data;
  },

  update: async (id: string, payload: Partial<AddVocabularyPayload>) => {
    const { data } = await apiClient.patch(`/vocabulary/${id}`, payload);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/vocabulary/${id}`);
  },

  getReviewDue: async () => {
    const { data } = await apiClient.get('/vocabulary/review-due');
    return data;
  },

  lookupDictionary: async (word: string): Promise<DictionaryResult> => {
    const { data } = await apiClient.get('/vocabulary/dictionary/lookup', {
      params: { word },
    });
    return data;
  },
};
