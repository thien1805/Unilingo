/**
 * API Client — Axios instance with JWT interceptors
 */
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';

const DEFAULT_API_URL = 'http://localhost:8000/api/v1';

const isLoopbackUrl = (url?: string) => !!url && /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(url);

const getDebuggerHost = () => {
  const manifest: any = Constants.manifest;
  const manifest2: any = (Constants as any).manifest2;

  return (
    Constants.expoConfig?.hostUri ||
    manifest?.hostUri ||
    manifest?.debuggerHost ||
    manifest2?.extra?.expoGo?.debuggerHost ||
    null
  );
};

const getPackagerHostUrl = () => {
  const hostUri = getDebuggerHost();
  if (!hostUri) return null;

  const host = hostUri.split(':')[0];
  if (!host || isLoopbackUrl(host)) return null;

  return `http://${host}:8000/api/v1`;
};

const getHostFromUrl = (url?: string) => {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

const getDefaultBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  // If explicit non-loopback env URL is set, always use it (e.g. production)
  if (envUrl && !isLoopbackUrl(envUrl)) return envUrl;

  // For physical devices (Android & iOS), auto-detect the dev machine IP
  // from the Metro bundler connection — no hardcoded IPs needed
  const packagerUrl = getPackagerHostUrl();
  if (packagerUrl) return packagerUrl;

  // Emulator fallbacks
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000/api/v1';

  return envUrl || DEFAULT_API_URL;
};

const BASE_URL = getDefaultBaseUrl();

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const response = await axios.post(`${BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = response.data;
          useAuthStore.getState().setTokens(access_token, refresh_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          useAuthStore.getState().logout();
          return Promise.reject(refreshError);
        }
      }

      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { BASE_URL };
