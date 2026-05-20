import { useCallback, useEffect, useMemo, useState } from 'react';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { authAPI } from '../api/auth';
import { usersAPI } from '../api/users';
import { useAuthStore } from '../store/authStore';

WebBrowser.maybeCompleteAuthSession();

const trimEnv = (value?: string) => value?.trim() || undefined;
const FALLBACK_CLIENT_ID = 'unconfigured-google-oauth-client-id.apps.googleusercontent.com';

export function useGoogleSignIn(onError?: (message: string) => void) {
  const { setTokens, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const clientIds = useMemo(() => ({
    web: trimEnv(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID),
    ios: trimEnv(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID),
    android: trimEnv(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID),
  }), []);

  const platformClientId = Platform.select({
    ios: clientIds.ios,
    android: clientIds.android,
    default: clientIds.web,
  });

  const isExpoGoNative = Platform.OS !== 'web' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  const config = useMemo(() => ({
    webClientId: clientIds.web || FALLBACK_CLIENT_ID,
    iosClientId: clientIds.ios || FALLBACK_CLIENT_ID,
    androidClientId: clientIds.android || FALLBACK_CLIENT_ID,
    selectAccount: true,
    scopes: ['openid', 'profile', 'email'],
  }), [clientIds.android, clientIds.ios, clientIds.web]);

  const isConfigured = Boolean(platformClientId);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(config);

  const finishGoogleLogin = useCallback(async (idToken: string) => {
    setLoading(true);
    try {
      const tokenResponse = await authAPI.socialLogin(idToken, 'google');
      setTokens(tokenResponse.access_token, tokenResponse.refresh_token);
      const user = await usersAPI.getMe();
      setUser(user);
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      onError?.(typeof detail === 'string' ? detail : 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [onError, setTokens, setUser]);

  useEffect(() => {
    if (response?.type === 'error') {
      setLoading(false);
      const description = response.params?.error_description || response.error?.message;
      onError?.(description || 'Google sign-in was rejected. Please check OAuth client configuration.');
      return;
    }

    if (response?.type !== 'success') return;
    const idToken = response.params?.id_token;
    if (!idToken) {
      onError?.('Google did not return an ID token. Please check OAuth client configuration.');
      return;
    }
    finishGoogleLogin(idToken).catch(() => {});
  }, [finishGoogleLogin, onError, response]);

  const signInWithGoogle = useCallback(async () => {
    if (!isConfigured) {
      onError?.('Google OAuth client IDs are not configured.');
      return;
    }
    if (isExpoGoNative) {
      onError?.('Google sign-in needs a development build for this app package. Expo Go uses a different app id, which Google rejects with a 400 error.');
      return;
    }
    if (!request) return;

    setLoading(true);
    try {
      const result = await promptAsync();
      if (result.type !== 'success') {
        setLoading(false);
      }
    } catch {
      setLoading(false);
      onError?.('Could not open Google sign-in.');
    }
  }, [isConfigured, isExpoGoNative, onError, promptAsync, request]);

  return {
    googleLoading: loading,
    googleReady: isConfigured && !!request,
    signInWithGoogle,
  };
}
