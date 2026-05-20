import apiClient from './client';
import { getCached, makeCacheKey } from './cache';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author_name: string;
  author_avatar: string | null;
  category: string;
  tags: string[] | null;
  read_time_minutes: number;
  is_published: boolean;
  is_featured: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
}

export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author_name: string;
  category: string;
  tags: string[] | null;
  read_time_minutes: number;
  is_featured: boolean;
  view_count: number;
  published_at: string | null;
}

export const blogAPI = {
  getPosts: async (page = 1, perPage = 10, category?: string) => {
    const params = { page, perPage, category };
    return getCached(makeCacheKey('blog:list', params), async () => {
      let url = `/blog?page=${page}&per_page=${perPage}`;
      if (category) url += `&category=${category}`;
      const { data } = await apiClient.get(url);
      return data as { items: BlogPostSummary[]; total: number; page: number; per_page: number };
    }, 60_000);
  },

  getFeatured: async (limit = 5) => {
    return getCached(makeCacheKey('blog:featured', { limit }), async () => {
      const { data } = await apiClient.get(`/blog/featured?limit=${limit}`);
      return data as BlogPostSummary[];
    }, 60_000);
  },

  getPostBySlug: async (slug: string) => {
    return getCached(makeCacheKey('blog:detail', { slug }), async () => {
      const { data } = await apiClient.get(`/blog/${slug}`);
      return data as BlogPost;
    }, 5 * 60_000);
  },
};
