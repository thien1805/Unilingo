import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { authAPI } from '../api/auth';
import { usersAPI } from '../api/users';
import { useAuthStore } from '../store/authStore';

WebBrowser.maybeCompleteAuthSession();

const trimEnv = (value?: string) => value?.trim() || undefined;
const FALLBACK_CLIENT_ID = 'unconfigured-google-oauth-client-id.apps.googleusercontent.com';

export function useGoogleSignIn(onError?: (message: string) => void) {
  const { setTokens, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const config = useMemo(() => ({
    webClientId: trimEnv(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) || FALLBACK_CLIENT_ID,
    iosClientId: trimEnv(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID) || FALLBACK_CLIENT_ID,
    androidClientId: trimEnv(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID) || FALLBACK_CLIENT_ID,
    selectAccount: true,
    scopes: ['openid', 'profile', 'email'],
  }), []);

  const isConfigured = Boolean(
    trimEnv(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) ||
    trimEnv(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID) ||
    trimEnv(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID)
  );

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
  }, [isConfigured, onError, promptAsync, request]);

  return {
    googleLoading: loading,
    googleReady: isConfigured && !!request,
    signInWithGoogle,
  };
}
