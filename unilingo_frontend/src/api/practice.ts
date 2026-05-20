/**
 * Practice API service
 */
import apiClient from './client';

export interface StartPracticePayload {
  topic_id?: string;
  ielts_part: string;
  question_id?: string;
}

export interface PracticeAttempt {
  attempt_id: string;
  topic_title: string;
  ielts_part: string;
  question: {
    id: string;
    topic_id?: string | null;
    question_text: string;
    question_text_vi: string | null;
    ielts_part: string;
    cue_card_content: string | null;
    follow_up_questions: any;
    difficulty: string;
    sample_answer: any;
    key_vocabulary: any;
  };
  status: string;
}

export interface ScoringResult {
  attempt_id: string;
  status: string;
  overall_band: number | null;
  fluency_score: number | null;
  lexical_score: number | null;
  grammar_score: number | null;
  pronunciation_score: number | null;
  duration_seconds: number | null;
  xp_earned: number | null;
  parts: {
    part_id: string;
    part_number: number;
    question_text?: string | null;
    has_audio?: boolean;
    transcript: string | null;
    duration_seconds: number | null;
    scoring: {
      fluency_band: number;
      lexical_band: number;
      grammar_band: number;
      pronunciation_band: number;
      overall_band: number;
      feedback: {
        summary: string;
        detailed: string;
      } | null;
      strengths: string[];
      weaknesses: string[];
      suggested_improvements: string[];
      sample_better_answer: {
        text: string;
        explanation: string;
      } | null;
      grammar_errors: {
        original: string;
        corrected: string;
        rule: string;
      }[];
      vocabulary_suggestions: {
        basic_word: string;
        better_alternatives: string[];
      }[];
    } | null;
  }[];
}

export interface PracticeHistoryItem {
  attempt_id: string;
  topic_title: string;
  ielts_part: string;
  overall_band: number | null;
  status: string;
  duration_seconds: number | null;
  started_at: string;
  completed_at: string | null;
}

export interface PracticeStats {
  total_tests: number;
  total_hours: number;
  avg_band_score: number;
  best_band_score: number;
  part1_avg: number | null;
  part2_avg: number | null;
  part3_avg: number | null;
  tests_this_week: number;
  improvement_pct: number;
}

export interface SubmitPracticeOptions {
  waitForResult?: boolean;
  timeoutSeconds?: number;
}

export interface SubmitPracticeResponse {
  attempt_id: string;
  status: string;
  message: string;
  result?: ScoringResult | null;
}

export const practiceAPI = {
  start: async (payload: StartPracticePayload): Promise<PracticeAttempt> => {
    const { data } = await apiClient.post('/practice/start', payload);
    return data;
  },

  generateQuestions: async (ieltsPart: string, count: number = 3, topicId?: string): Promise<{ questions: any[]; count: number }> => {
    let url = `/practice/generate-questions?ielts_part=${ieltsPart}&count=${count}`;
    if (topicId) {
      url += `&topic_id=${topicId}`;
    }
    const { data } = await apiClient.post(url);
    return data;
  },

  uploadAudio: async (attemptId: string, audioFile: FormData, partNumber: number = 1, questionId?: string) => {
    let url = `/practice/${attemptId}/upload-audio?part_number=${partNumber}`;
    if (questionId && !questionId.startsWith('mock')) {
      url += `&question_id=${questionId}`;
    }
    const { data } = await apiClient.post(
      url,
      audioFile,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000, // 120s for audio upload
        transformRequest: (data) => data, // Prevent Axios from transforming FormData
      }
    );
    return data;
  },

  transcribeAudio: async (audioFile: FormData): Promise<{ transcript: string }> => {
    const { data } = await apiClient.post(
      '/practice/transcribe-audio',
      audioFile,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
        transformRequest: (data) => data,
      }
    );
    return data;
  },

  submit: async (attemptId: string, options: SubmitPracticeOptions = {}): Promise<SubmitPracticeResponse> => {
    const waitForResult = options.waitForResult ?? true;
    const timeoutSeconds = options.timeoutSeconds ?? 150;
    const { data } = await apiClient.post(
      `/practice/${attemptId}/submit`,
      undefined,
      {
        params: {
          wait_for_result: waitForResult,
          timeout_seconds: timeoutSeconds,
        },
        timeout: (timeoutSeconds + 20) * 1000,
      }
    );
    return data;
  },

  getResult: async (attemptId: string): Promise<ScoringResult> => {
    const { data } = await apiClient.get(`/practice/${attemptId}/result`);
    return data;
  },

  getHistory: async (params?: {
    page?: number;
    per_page?: number;
    ielts_part?: string;
  }): Promise<{ items: PracticeHistoryItem[]; total: number; page: number; per_page: number }> => {
    const { data } = await apiClient.get('/practice/history', { params });
    return data;
  },

  getStats: async (): Promise<PracticeStats> => {
    const { data } = await apiClient.get('/practice/stats');
    return data;
  },

  getTTSUrl: (text: string): string => {
    // Assuming apiClient.defaults.baseURL is something like 'http://localhost:8000/api/v1'
    const baseURL = apiClient.defaults.baseURL || 'http://localhost:8000/api/v1';
    return `${baseURL}/practice/tts?text=${encodeURIComponent(text)}`;
  },
};
