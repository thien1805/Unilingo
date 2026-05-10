import apiClient from './client';

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
    let url = `/blog?page=${page}&per_page=${perPage}`;
    if (category) url += `&category=${category}`;
    const { data } = await apiClient.get(url);
    return data as { items: BlogPostSummary[]; total: number; page: number; per_page: number };
  },

  getFeatured: async (limit = 5) => {
    const { data } = await apiClient.get(`/blog/featured?limit=${limit}`);
    return data as BlogPostSummary[];
  },

  getPostBySlug: async (slug: string) => {
    const { data } = await apiClient.get(`/blog/${slug}`);
    return data as BlogPost;
  },
};
