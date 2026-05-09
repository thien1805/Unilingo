/**
 * Auth store — JWT token management + user state + persistence
 * Uses expo-secure-store for encrypted token storage
 */
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  full_name: string;
  avatar_url: string | null;
  auth_provider: string;
  target_band_score: number | null;
  target_exam_date: string | null;
  current_level: string | null;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  created_at: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setTokens: (access: string, refresh: string) => void;
  setUser: (user: UserProfile) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => Promise<void>;
}

const TOKEN_KEY = 'unilingo_tokens';

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start true for hydration

  setTokens: (access, refresh) => {
    set({ accessToken: access, refreshToken: refresh });
    // Persist tokens securely
    SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify({ access, refresh })).catch(() => { });
  },

  setUser: (user) => set({ user, isAuthenticated: true }), 

  logout: () => {
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => { });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  hydrate: async () => {
    try {
      const stored = await SecureStore.getItemAsync(TOKEN_KEY);
      if (stored) {
        const { access, refresh } = JSON.parse(stored);
        if (access && refresh) {
          set({ accessToken: access, refreshToken: refresh });

          const { usersAPI } = await import('../api/users');
          const { authAPI } = await import('../api/auth');

          const loadUser = async () => {
            const user = await usersAPI.getMe();
            set({ user, isAuthenticated: true });
          };

          try {
            await loadUser();
          } catch {
            try {
              const refreshed = await authAPI.refreshToken(refresh);
              set({ accessToken: refreshed.access_token, refreshToken: refreshed.refresh_token });
              await SecureStore.setItemAsync(
                TOKEN_KEY,
                JSON.stringify({ access: refreshed.access_token, refresh: refreshed.refresh_token })
              );
              await loadUser();
            } catch {
              await get().logout();
            }
          }
        }
      }
    } catch {
      // Storage error, ignore
    } finally {
      set({ isLoading: false });
    }
  },
}));
