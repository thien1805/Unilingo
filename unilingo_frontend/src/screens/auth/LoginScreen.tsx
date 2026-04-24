/**
 * LoginScreen — Logify Layout, Teal Emerald accent
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../api/auth';
import { usersAPI } from '../../api/users';
import { Typography, FontFamily } from '../../theme/typography';

export default function LoginScreen({ navigation }: any) {
  const { colors } = useThemeStore();
  const { setTokens, setUser } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const tokens = await authAPI.login({ email, password });
      setTokens(tokens.access_token, tokens.refresh_token);
      const user = await usersAPI.getMe();
      setUser(user);
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Invalid email or password';
      Alert.alert('Login Failed', typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const underlineColor = (field: string) =>
    focusedField === field ? colors.accent : colors.border;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={[styles.logoDot, { backgroundColor: colors.accent }]} />
            <Text style={[styles.logoText, { color: colors.textPrimary }]}>Unilingo</Text>
          </View>

          {/* Heading */}
          <Text style={[styles.heading, { color: colors.textPrimary }]}>Sign in</Text>

          {/* Subtitle */}
          <View style={styles.subtitleRow}>
            <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
              If you don't have an account register{'\n'}You can{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.subtitleLink, { color: colors.accent }]}>Register here !</Text>
            </TouchableOpacity>
          </View>

          {/* Email Field */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Email</Text>
            <View style={[styles.inputRow, { borderBottomColor: underlineColor('email') }]}>
              <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Enter your email address"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Password</Text>
            <View style={[styles.inputRow, { borderBottomColor: underlineColor('password') }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Enter your Password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me + Forgot */}
          <View style={styles.rememberRow}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.checkbox,
                {
                  borderColor: rememberMe ? colors.accent : colors.border,
                  backgroundColor: rememberMe ? colors.accent : 'transparent',
                }
              ]}>
                {rememberMe && <Ionicons name="checkmark" size={11} color="#fff" />}
              </View>
              <Text style={[styles.rememberText, { color: colors.textSecondary }]}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={[styles.forgotText, { color: colors.textSecondary }]}>Forgot Password ?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.mainBtn, { backgroundColor: colors.accent }]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.mainBtnText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>or continue with</Text>
          </View>

          {/* Google Only */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={[styles.socialIcon, { borderColor: colors.border, backgroundColor: colors.bgCard }]}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Google Sign In', 'Coming soon')}
            >
              {/* Google G logo using colored text */}
              <Text style={styles.googleG}>G</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 36,
  },
  logoDot: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  logoText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
  },
  heading: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 34,
    lineHeight: 42,
    marginBottom: 12,
  },
  subtitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  subtitleText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  subtitleLink: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    lineHeight: 22,
  },
  fieldGroup: {
    marginBottom: 28,
  },
  fieldLabel: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    paddingBottom: 10,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    paddingVertical: 0,
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 36,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
  },
  forgotText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
  },
  mainBtn: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  mainBtnText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: '#fff',
    letterSpacing: 0.5,
  },
  dividerRow: {
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 22,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#4285F4',
  },
});
