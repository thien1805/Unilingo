/**
 * API Client — Axios instance with JWT interceptors
 */
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';

const DEFAULT_API_URL = 'http://localhost:8000/api/v1';

const isLoopbackUrl = (url?: string) => !!url && /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(url);
const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

const getExplicitBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  const extraUrl = (Constants.expoConfig?.extra as any)?.apiUrl?.trim?.();
  return envUrl || extraUrl || '';
};

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

const getDefaultBaseUrl = () => {
  const explicitUrl = getExplicitBaseUrl();

  // If explicit non-loopback env URL is set, always use it (e.g. Railway production)
  if (explicitUrl && !isLoopbackUrl(explicitUrl)) return normalizeBaseUrl(explicitUrl);

  if (!__DEV__) {
    throw new Error('EXPO_PUBLIC_API_URL is required for release builds.');
  }

  // For physical devices (Android & iOS), auto-detect the dev machine IP
  // from the Metro bundler connection — no hardcoded IPs needed
  const packagerUrl = getPackagerHostUrl();
  if (packagerUrl) return packagerUrl;

  // Emulator fallbacks
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000/api/v1';

  return explicitUrl || DEFAULT_API_URL;
};

const BASE_URL = getDefaultBaseUrl();

if (__DEV__) {
  console.log(`[API] BASE_URL=${BASE_URL}`);
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
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
