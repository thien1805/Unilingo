/**
 * LoginScreen — Logify Layout, Teal Emerald accent
 */
import React, { useState } from 'react';
import {
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../api/auth';
import { getApiBaseUrl } from '../../api/client';
import { usersAPI } from '../../api/users';
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';
import { Typography, FontFamily } from '../../theme/typography';

const NAVY = '#3350B2';

export default function LoginScreen({ navigation }: any) {
  const { colors } = useThemeStore();
  const { setTokens, setUser, logout, hydrate } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalTitle, setErrorModalTitle] = useState('');
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [errorModalType, setErrorModalType] = useState<'error' | 'success'>('error');

  // Forgot Password state
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'newpass'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const showError = (title: string, message: string) => {
    setErrorModalTitle(title);
    setErrorModalMessage(message);
    setErrorModalType('error');
    setErrorModalVisible(true);
  };

  const showSuccess = (title: string, message: string) => {
    setErrorModalTitle(title);
    setErrorModalMessage(message);
    setErrorModalType('success');
    setErrorModalVisible(true);
  };

  const { googleLoading, googleReady, signInWithGoogle } = useGoogleSignIn((message) => {
    showError('Google Sign In', message);
  });

  const getErrorMessage = (error: any, fallback: string) => {
    const detail = error?.response?.data?.detail;
    const message = error?.response?.data?.message;

    if (typeof detail === 'string') return detail;
    if (typeof message === 'string') return message;
    if (Array.isArray(detail)) {
      return detail
        .map((item) => item?.msg || item?.message || JSON.stringify(item))
        .join(', ');
    }

    if (error?.code === 'ECONNABORTED') {
      return `Request timed out while connecting to ${getApiBaseUrl()}. The backend may still be starting up; please try again in a moment.`;
    }

    if (!error?.response && (error?.request || error?.message === 'Network Error')) {
      return `Cannot connect to API server at ${getApiBaseUrl()}. Make sure the backend is running and reachable.`;
    }

    return fallback;
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showError('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login({ email: email.trim().toLowerCase(), password });
      setTokens(response.access_token, response.refresh_token);
      
      const user = await usersAPI.getMe();
      setUser(user);
    } catch (error: any) {
      showError('Login Failed', getErrorMessage(error, 'Incorrect email or password'));
    } finally {
      setLoading(false);
    }
  };

  const closeForgotModal = () => {
    setForgotModalVisible(false);
    setForgotStep('email');
    setForgotEmail('');
    setResetOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleSendResetOtp = async () => {
    if (!forgotEmail) {
      showError('Error', 'Please enter your email');
      return;
    }
    setForgotLoading(true);
    try {
      await authAPI.forgotPassword(forgotEmail.trim().toLowerCase());
      setForgotStep('otp');
    } catch (error: any) {
      showError('Error', getErrorMessage(error, 'Could not send OTP.'));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyResetOtp = async () => {
    if (resetOtp.length !== 6) {
      showError('Error', 'OTP must be 6 digits');
      return;
    }
    setForgotLoading(true);
    try {
      await authAPI.verifyResetOtp(forgotEmail.trim().toLowerCase(), resetOtp);
      setForgotStep('newpass');
    } catch (error: any) {
      showError('Error', getErrorMessage(error, 'Invalid or expired OTP'));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      showError('Error', 'New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showError('Error', 'Passwords do not match');
      return;
    }
    setForgotLoading(true);
    try {
      await authAPI.resetPassword({ email: forgotEmail.trim().toLowerCase(), otp: resetOtp, new_password: newPassword });
      closeForgotModal();
      showSuccess('Success', 'Password has been reset. Please log in.');
    } catch (error: any) {
      showError('Error', getErrorMessage(error, 'Could not reset password'));
    } finally {
      setForgotLoading(false);
    }
  };

  const underlineColor = (field: string) =>
    focusedField === field ? colors.accent : colors.border;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
      <View style={styles.backgroundLayer} pointerEvents="none">
        <Image
          source={require('../../../background.png')}
          style={styles.background}
          resizeMode="cover"
        />
      </View>
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
            <Image
              source={require('../../../uni_icon.png')}
              style={styles.logoIcon}
              resizeMode="contain"
            />
            <Text style={[styles.logoText, { color: NAVY }]}>Unilingo</Text>
          </View>

          {/* Heading */}
          <Text style={[styles.heading, { color: colors.textPrimary }]}>Sign in</Text>

          {/* Subtitle */}
          <View style={styles.subtitleRow}>
            <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
              If you don't have an account. Please register new account!
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 4 }}>
              <Text style={[styles.subtitleLink, { color: colors.accent }]}>Register here </Text>
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
            <TouchableOpacity onPress={() => { setForgotStep('email'); setForgotModalVisible(true); }}>
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
              style={[
                styles.socialIcon,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.bgCard,
                  opacity: googleReady && !loading && !googleLoading ? 1 : 0.5,
                },
              ]}
              activeOpacity={0.8}
              disabled={!googleReady || loading || googleLoading}
              onPress={signInWithGoogle}
            >
              {googleLoading ? <ActivityIndicator color={colors.accent} /> : <Text style={styles.googleG}>G</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={forgotModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => closeForgotModal()}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.bgPrimary }]}>
            <View style={{ width: '100%', alignItems: 'flex-end', marginBottom: -20, zIndex: 10 }}>
              <TouchableOpacity onPress={() => closeForgotModal()}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            
            <View style={[styles.iconCircle, { backgroundColor: colors.accentBg }]}>
              <Ionicons name="lock-closed" size={40} color={colors.accent} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Forgot Password
            </Text>

            {forgotStep === 'email' ? (
              <>
                <Text style={[styles.modalText, { color: colors.textSecondary }]}>
                  Enter your email to receive a password reset code.
                </Text>
                <View style={[styles.inputRow, { borderBottomColor: colors.border, width: '100%', marginBottom: 24 }]}>
                  <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder="Your email"
                    placeholderTextColor={colors.textMuted}
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: colors.accent }]}
                  onPress={handleSendResetOtp}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Send Code</Text>}
                </TouchableOpacity>
              </>
            ) : forgotStep === 'otp' ? (
              <>
                <Text style={[styles.modalText, { color: colors.textSecondary }]}>
                  Enter the 6-digit code sent to {forgotEmail}
                </Text>
                <View style={[styles.inputRow, { borderBottomColor: colors.border, width: '100%', marginBottom: 24 }]}>
                  <Ionicons name="keypad-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary, fontSize: 18, letterSpacing: 4 }]}
                    placeholder="000000"
                    placeholderTextColor={colors.textMuted}
                    value={resetOtp}
                    onChangeText={setResetOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: colors.accent }]}
                  onPress={handleVerifyResetOtp}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Verify Code</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setForgotStep('email')} style={{ marginTop: 12 }}>
                  <Text style={{ color: colors.textSecondary, fontFamily: 'PlusJakartaSans-Medium' }}>Go Back</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={[styles.modalText, { color: colors.textSecondary }]}>
                  Create a new password for your account.
                </Text>
                <View style={[styles.inputRow, { borderBottomColor: colors.border, width: '100%', marginBottom: 16 }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder="New password (min 8 characters)"
                    placeholderTextColor={colors.textMuted}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={true}
                    autoCorrect={false}
                    autoComplete="off"
                    textContentType="newPassword"
                  />
                </View>
                <View style={[styles.inputRow, { borderBottomColor: colors.border, width: '100%', marginBottom: 24 }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder="Confirm new password"
                    placeholderTextColor={colors.textMuted}
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    secureTextEntry={true}
                    autoCorrect={false}
                    autoComplete="off"
                    textContentType="newPassword"
                  />
                </View>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: colors.accent }]}
                  onPress={handleResetPassword}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Reset Password</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setForgotStep('otp')} style={{ marginTop: 12 }}>
                  <Text style={{ color: colors.textSecondary, fontFamily: 'PlusJakartaSans-Medium' }}>Go Back</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Feedback Modal (Error / Success) */}
      <Modal
        visible={errorModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.bgPrimary }]}>
            <View style={[styles.iconCircle, { backgroundColor: errorModalType === 'success' ? colors.successBg : colors.errorBg }]}>
              <Ionicons 
                name={errorModalType === 'success' ? 'checkmark-circle' : 'close-circle'} 
                size={48} 
                color={errorModalType === 'success' ? (colors.success || '#10B981') : (colors.error || '#EF4444')} 
              />
            </View>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {errorModalTitle}
            </Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              {errorModalMessage}
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: errorModalType === 'success' ? (colors.success || '#10B981') : (colors.error || '#EF4444') }]}
              onPress={() => setErrorModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.68,
  },
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
  logoIcon: {
    width: 28,
    height: 28,
  },
  logoText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    lineHeight: 24,
    includeFontPadding: false,
    paddingRight: 4,
  },
  heading: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 34,
    lineHeight: 42,
    marginBottom: 12,
  },
  subtitleRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  subtitleText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 22,
    includeFontPadding: false,
    paddingRight: 4,
  },
  subtitleLink: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    lineHeight: 22,
    includeFontPadding: false,
    paddingRight: 4,
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
    lineHeight: 18,
    includeFontPadding: false,
    paddingRight: 4,
  },
  forgotText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    lineHeight: 18,
    includeFontPadding: false,
    paddingRight: 4,
  },
  mainBtn: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#F6D85F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  mainBtnText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
    includeFontPadding: false,
    paddingRight: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 22,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  modalBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  modalBtnText: {
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#fff',
    fontSize: 16,
  },
});
