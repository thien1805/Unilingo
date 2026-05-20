/**
 * API Client — Axios instance with JWT interceptors
 */
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { clearApiCache } from './cache';

const DEFAULT_API_URL = 'http://localhost:8000/api/v1';

const extractHostname = (uri?: string | null) => {
  if (!uri) return null;

  const trimmed = uri.trim();
  if (!trimmed) return null;

  const withoutProtocol = trimmed.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
  const hostWithPort = withoutProtocol.split('/')[0].split('?')[0];

  if (hostWithPort.startsWith('[')) {
    const bracketEnd = hostWithPort.indexOf(']');
    return bracketEnd > 0 ? hostWithPort.slice(1, bracketEnd) : null;
  }

  return hostWithPort.split(':')[0] || null;
};

const isLoopbackHost = (host?: string | null) => {
  const normalized = host?.trim().toLowerCase();
  return (
    normalized === 'localhost' ||
    normalized === '0.0.0.0' ||
    normalized === '::1' ||
    !!normalized?.startsWith('127.')
  );
};

const isAndroidEmulatorHost = (host?: string | null) => {
  const normalized = host?.trim();
  return normalized === '10.0.2.2' || normalized === '10.0.3.2';
};

const isLoopbackUrl = (url?: string) => isLoopbackHost(extractHostname(url));
const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

const getExplicitBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  const extraUrl = (Constants.expoConfig?.extra as any)?.apiUrl?.trim?.();
  return envUrl || extraUrl || '';
};

const getDebuggerHost = () => {
  const constants: any = Constants;
  const manifest: any = Constants.manifest;
  const manifest2: any = constants.manifest2;
  const expoConfig: any = Constants.expoConfig;

  return [
    expoConfig?.hostUri,
    constants.linkingUri,
    constants.debuggerHost,
    manifest?.hostUri,
    manifest?.debuggerHost,
    manifest2?.extra?.expoGo?.debuggerHost,
    manifest2?.extra?.expoClient?.hostUri,
  ].find((value) => typeof value === 'string' && value.trim().length > 0) ?? null;
};

const getPackagerHostUrl = () => {
  const hostUri = getDebuggerHost();
  if (!hostUri) return null;

  const host = extractHostname(hostUri);
  if (!host || isLoopbackHost(host)) return null;

  return `http://${host}:8000/api/v1`;
};

const getDefaultBaseUrl = () => {
  const explicitUrl = getExplicitBaseUrl();
  const explicitHost = extractHostname(explicitUrl);

  if (__DEV__ && Platform.OS !== 'web') {
    const packagerUrl = getPackagerHostUrl();
    if (packagerUrl && (!explicitUrl || isLoopbackUrl(explicitUrl) || isAndroidEmulatorHost(explicitHost))) {
      return packagerUrl;
    }
  }

  // If explicit non-loopback env URL is set, always use it (e.g. Railway production)
  if (explicitUrl && !isLoopbackUrl(explicitUrl)) return normalizeBaseUrl(explicitUrl);

  if (!__DEV__) {
    throw new Error('EXPO_PUBLIC_API_URL is required for release builds.');
  }

  // For physical devices (Android & iOS), auto-detect the dev machine IP
  // from the Metro bundler connection — no hardcoded IPs needed
  const packagerUrl = Platform.OS === 'web' ? null : getPackagerHostUrl();
  if (packagerUrl) return packagerUrl;

  // Emulator fallbacks
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000/api/v1';

  return explicitUrl || DEFAULT_API_URL;
};

if (__DEV__) {
  console.log(`[API] BASE_URL=${getDefaultBaseUrl()}`);
}

const apiClient = axios.create({
  baseURL: getDefaultBaseUrl(),
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const baseURL = getDefaultBaseUrl();
    config.baseURL = baseURL;

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
  (response) => {
    const method = response.config?.method?.toLowerCase();
    if (method && method !== 'get') {
      clearApiCache();
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const baseURL = getDefaultBaseUrl();
          const response = await axios.post(`${baseURL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = response.data;
          useAuthStore.getState().setTokens(access_token, refresh_token);

          originalRequest.baseURL = baseURL;
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
export { getDefaultBaseUrl as getApiBaseUrl };
