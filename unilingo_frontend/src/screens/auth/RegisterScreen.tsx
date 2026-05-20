/**
 * RegisterScreen — Logify Layout, Teal Emerald accent
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
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';

const NAVY = '#3350B2';

export default function RegisterScreen({ navigation }: any) {
  const { colors } = useThemeStore();
  const { logout } = useAuthStore();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [otp, setOtp] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalTitle, setErrorModalTitle] = useState('');
  const [errorModalMessage, setErrorModalMessage] = useState('');

  const showError = (title: string, message: string) => {
    setErrorModalTitle(title);
    setErrorModalMessage(message);
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

    return fallback;
  };

  const handleSendOtp = async () => {
    if (!email || !fullName || !password || !confirmPassword) {
      showError('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      showError('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 8) {
      showError('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await authAPI.registerSendOtp(email.trim().toLowerCase());
      setStep('otp');
    } catch (error: any) {
      showError('Error', getErrorMessage(error, 'Could not send OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (otp.length !== 6) {
      showError('Error', 'OTP must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      await authAPI.register({ email: email.trim().toLowerCase(), password, full_name: fullName, otp });
      logout();
      setShowSuccessModal(true);
    } catch (error: any) {
      showError('Registration Failed', getErrorMessage(error, 'Invalid or expired OTP'));
    } finally {
      setLoading(false);
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
          <Text style={[styles.heading, { color: colors.textPrimary }]}>Sign up</Text>

          {/* Subtitle */}
          <View style={styles.subtitleRow}>
            <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
              If you already have an account,
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 4 }}>
              <Text style={[styles.subtitleLink, { color: colors.accent }]}>Login here!</Text>
            </TouchableOpacity>
          </View>

          {step === 'details' ? (
            <>
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

              {/* Username / Full Name */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Full Name</Text>
                <View style={[styles.inputRow, { borderBottomColor: underlineColor('name') }]}>
                  <Ionicons name="person-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder="Enter your Full Name"
                    placeholderTextColor={colors.textMuted}
                    value={fullName}
                    onChangeText={setFullName}
                    onFocus={() => setFocusedField('name')}
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
                    <Ionicons name="eye-off-outline" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Confirm Password</Text>
                <View style={[styles.inputRow, { borderBottomColor: underlineColor('confirm') }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder="Confirm your Password"
                    placeholderTextColor={colors.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirm}
                    onFocus={() => setFocusedField('confirm')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                    <Ionicons name="eye-off-outline" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.mainBtn, { backgroundColor: colors.accent }]}
                onPress={handleSendOtp}
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.mainBtnText}>Register</Text>
                )}
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <Text style={[styles.dividerText, { color: colors.textMuted }]}>or continue with</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.googleButton,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.bgCard,
                    opacity: googleReady && !loading && !googleLoading ? 1 : 0.5,
                  },
                ]}
                activeOpacity={0.85}
                disabled={!googleReady || loading || googleLoading}
                onPress={signInWithGoogle}
              >
                {googleLoading ? (
                  <ActivityIndicator color={colors.accent} />
                ) : (
                  <>
                    <Text style={styles.googleG}>G</Text>
                    <Text style={[styles.googleButtonText, { color: colors.textPrimary }]}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* OTP Field */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Verification Code (OTP)</Text>
                <Text style={[styles.subtitleText, { color: colors.textSecondary, marginBottom: 12 }]}>
                  A 6-digit code has been sent to {email}
                </Text>
                <View style={[styles.inputRow, { borderBottomColor: underlineColor('otp') }]}>
                  <Ionicons name="keypad-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary, fontSize: 18, letterSpacing: 4 }]}
                    placeholder="000000"
                    placeholderTextColor={colors.textMuted}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    onFocus={() => setFocusedField('otp')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.mainBtn, { backgroundColor: colors.accent }]}
                onPress={handleRegister}
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.mainBtnText}>Complete Registration</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{ alignItems: 'center', marginTop: 12 }}
                onPress={() => setStep('details')}
              >
                <Text style={{ color: colors.textSecondary, fontFamily: 'PlusJakartaSans-Medium' }}>
                  Go back to edit details
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Terms */}
          <Text style={[styles.termsText, { color: colors.textMuted }]}>
            By registering, you agree to our{' '}
            <Text style={{ color: colors.accent }}>Terms</Text>
            {' '}and{' '}
            <Text style={{ color: colors.accent }}>Privacy Policy</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => { }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.bgPrimary }]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.successBg }]}>
              <Ionicons name="checkmark-circle" size={48} color={colors.success || '#10B981'} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Registration Successful!
            </Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              Your account has been successfully created. Please log in to start using Unilingo.
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.accent }]}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnText}>Log In Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={errorModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.bgPrimary }]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.errorBg }]}>
              <Ionicons name="close-circle" size={48} color={colors.error || '#EF4444'} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {errorModalTitle}
            </Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              {errorModalMessage}
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.error, shadowColor: colors.error }]}
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
    marginBottom: 36,
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
    marginBottom: 24,
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
  mainBtn: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
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
    marginBottom: 16,
  },
  dividerText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
  },
  googleButton: {
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  googleG: {
    fontSize: 22,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#4285F4',
  },
  googleButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
  },
  termsText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    includeFontPadding: false,
    paddingRight: 4,
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
    shadowColor: '#F6D85F',
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
