/**
 * SettingsScreen — Edit profile, change password, app settings
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { usersAPI } from '../../api/users';
import { authAPI } from '../../api/auth';
import apiClient from '../../api/client';
import { notificationsAPI, NotificationSettings } from '../../api/notifications';
import { syncNotificationPreferences } from '../../services/NotificationService';
import { Gradients } from '../../theme';

export default function SettingsScreen({ navigation }: any) {
  const { colors, isDark, toggleTheme } = useThemeStore();
  const { user, setUser, logout } = useAuthStore();

  // Profile fields
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [targetBand, setTargetBand] = useState(user?.target_band_score || 7.0);
  const [currentLevel, setCurrentLevel] = useState(user?.current_level || 'intermediate');
  const [streakGoal, setStreakGoal] = useState(user?.goal_target || 7);
  const [saving, setSaving] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);
  const [showPwdSection, setShowPwdSection] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [savingNotifications, setSavingNotifications] = useState(false);

  const initials = (user?.full_name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const levels = [
    { key: 'beginner', label: 'Beginner' },
    { key: 'elementary', label: 'Elementary' },
    { key: 'intermediate', label: 'Intermediate' },
    { key: 'upper_intermediate', label: 'Upper Inter.' },
    { key: 'advanced', label: 'Advanced' },
  ];

  const reminderTimes = [
    { label: '08:00', value: '08:00:00' },
    { label: '09:00', value: '09:00:00' },
    { label: '18:30', value: '18:30:00' },
    { label: '20:00', value: '20:00:00' },
  ];

  useEffect(() => {
    notificationsAPI.getSettings()
      .then(setNotificationSettings)
      .catch(() => {});
  }, []);

  const updateNotificationDraft = <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
    setNotificationSettings((current) => current ? { ...current, [key]: value } : current);
  };

  const handleSaveNotifications = async () => {
    if (!notificationSettings) return;
    setSavingNotifications(true);
    try {
      const updated = await notificationsAPI.updateSettings(notificationSettings);
      setNotificationSettings(updated);
      await syncNotificationPreferences(updated);
      Alert.alert('Success', 'Notification preferences updated!');
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Failed to update notification settings';
      Alert.alert('Error', typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await usersAPI.updateProfile({
        full_name: fullName,
        username: username || undefined,
        target_band_score: targetBand,
        current_level: currentLevel,
      });
      
      if (streakGoal !== user?.goal_target) {
        await apiClient.post('/users/me/streak-goal', { days: streakGoal });
        const finalUser = await usersAPI.getMe();
        setUser(finalUser);
      } else {
        setUser(updated);
      }
      
      Alert.alert('Success', 'Profile updated!');
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Failed to update profile';
      Alert.alert('Error', typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters');
      return;
    }
    setChangingPwd(true);
    try {
      await usersAPI.changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPwdSection(false);
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Failed to change password';
      Alert.alert('Error', typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setChangingPwd(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          try { await authAPI.logout(); } catch {}
          logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgBody }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { borderColor: colors.border }]}>
              <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.topTitle, { color: colors.textPrimary }]}>Settings</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <LinearGradient colors={Gradients.primary} style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
            <Text style={[styles.emailText, { color: colors.textMuted }]}>{user?.email}</Text>
          </View>

          {/* Profile Section */}
          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Profile</Text>
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <FieldRow label="Full Name" icon="person-outline" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Your name"
                placeholderTextColor={colors.textMuted}
              />
            </FieldRow>
            <FieldRow label="Username" icon="at-outline" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                value={username}
                onChangeText={setUsername}
                placeholder="username"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
            </FieldRow>
            <FieldRow label={`Target Band: ${targetBand.toFixed(1)}`} icon="flag-outline" colors={colors}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.bandRow}>
                  {[4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map(band => (
                    <TouchableOpacity
                      key={band}
                      style={[
                        styles.bandChip,
                        {
                          backgroundColor: targetBand === band ? colors.accent : colors.bgInput,
                          borderColor: targetBand === band ? colors.accent : colors.border,
                        },
                      ]}
                      onPress={() => setTargetBand(band)}
                    >
                      <Text style={[
                        styles.bandChipText,
                        { color: targetBand === band ? '#fff' : colors.textSecondary },
                      ]}>
                        {band.toFixed(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </FieldRow>
            <FieldRow label={`Commit Streak: ${streakGoal} Days`} icon="flame-outline" colors={colors}>
              <View style={styles.levelRow}>
                {[7, 14, 30].map(days => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.levelChip,
                      {
                        backgroundColor: streakGoal === days ? colors.accent : colors.bgInput,
                        borderColor: streakGoal === days ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => setStreakGoal(days)}
                  >
                    <Text style={[styles.levelText, { color: streakGoal === days ? '#fff' : colors.textSecondary }]}>
                      {days} Days
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </FieldRow>
            <FieldRow label="Level" icon="school-outline" colors={colors}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.levelRow}>
                  {levels.map(l => (
                    <TouchableOpacity
                      key={l.key}
                      style={[
                        styles.levelChip,
                        {
                          backgroundColor: currentLevel === l.key ? colors.accent : colors.bgInput,
                          borderColor: currentLevel === l.key ? colors.accent : colors.border,
                        },
                      ]}
                      onPress={() => setCurrentLevel(l.key)}
                    >
                      <Text style={[styles.levelText, { color: currentLevel === l.key ? '#fff' : colors.textSecondary }]}>
                        {l.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </FieldRow>
          </View>

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.accent }]} onPress={handleSaveProfile} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>

          {/* Password Section */}
          <TouchableOpacity
            style={[styles.card, styles.pwdToggle, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
            onPress={() => setShowPwdSection(!showPwdSection)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.accent} />
              <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginBottom: 0 }]}>Change Password</Text>
            </View>
            <Ionicons name={showPwdSection ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
          </TouchableOpacity>

          {showPwdSection && (
            <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <PwdField label="Current Password" value={currentPassword} onChange={setCurrentPassword} colors={colors} />
              <PwdField label="New Password" value={newPassword} onChange={setNewPassword} colors={colors} />
              <PwdField label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} colors={colors} />
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.accent, marginTop: 8 }]}
                onPress={handleChangePassword}
                disabled={changingPwd}
              >
                {changingPwd ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Change Password</Text>}
              </TouchableOpacity>
            </View>
          )}

          {/* App Settings */}
          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>App</Text>
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.settingRow} onPress={toggleTheme}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={colors.accent} />
                <Text style={[styles.settingText, { color: colors.textPrimary }]}>Dark Mode</Text>
              </View>
              <View style={[styles.toggle, isDark && styles.toggleOn, { borderColor: isDark ? colors.accent : colors.border }]}>
                <View style={[styles.toggleDot, isDark && styles.toggleDotOn, { backgroundColor: isDark ? colors.accent : colors.textMuted }]} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Notification Settings */}
          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Notifications</Text>
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            {!notificationSettings ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <>
                <SwitchRow
                  label="Daily practice reminder"
                  icon="time-outline"
                  value={notificationSettings.daily_reminder}
                  onValueChange={(value: boolean) => updateNotificationDraft('daily_reminder', value)}
                  colors={colors}
                />
                <View style={styles.notificationBlock}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginBottom: 8 }]}>Reminder time</Text>
                  <View style={styles.levelRow}>
                    {reminderTimes.map((item) => (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.levelChip,
                          {
                            backgroundColor: notificationSettings.reminder_time === item.value ? colors.accent : colors.bgInput,
                            borderColor: notificationSettings.reminder_time === item.value ? colors.accent : colors.border,
                          },
                        ]}
                        onPress={() => updateNotificationDraft('reminder_time', item.value)}
                      >
                        <Text style={[styles.levelText, { color: notificationSettings.reminder_time === item.value ? '#fff' : colors.textSecondary }]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <SwitchRow
                  label="Vocabulary review"
                  icon="library-outline"
                  value={notificationSettings.new_words_reminder}
                  onValueChange={(value: boolean) => updateNotificationDraft('new_words_reminder', value)}
                  colors={colors}
                />
                <SwitchRow
                  label="Streak reminders"
                  icon="flame-outline"
                  value={notificationSettings.streak_reminder}
                  onValueChange={(value: boolean) => updateNotificationDraft('streak_reminder', value)}
                  colors={colors}
                />
                <SwitchRow
                  label="Leaderboard updates"
                  icon="trophy-outline"
                  value={notificationSettings.leaderboard_update}
                  onValueChange={(value: boolean) => updateNotificationDraft('leaderboard_update', value)}
                  colors={colors}
                />
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <SwitchRow
                  label="Events from admin"
                  icon="megaphone-outline"
                  value={notificationSettings.event_notifications}
                  onValueChange={(value: boolean) => updateNotificationDraft('event_notifications', value)}
                  colors={colors}
                />
                <SwitchRow
                  label="Blog notifications"
                  icon="newspaper-outline"
                  value={notificationSettings.blog_notifications}
                  onValueChange={(value: boolean) => updateNotificationDraft('blog_notifications', value)}
                  colors={colors}
                />
                <View style={styles.blogPreferenceGrid}>
                  <MiniSwitch
                    label="Forecast"
                    value={notificationSettings.forecast_notifications}
                    onValueChange={(value: boolean) => updateNotificationDraft('forecast_notifications', value)}
                    colors={colors}
                  />
                  <MiniSwitch
                    label="Tips"
                    value={notificationSettings.tips_notifications}
                    onValueChange={(value: boolean) => updateNotificationDraft('tips_notifications', value)}
                    colors={colors}
                  />
                  <MiniSwitch
                    label="News"
                    value={notificationSettings.news_notifications}
                    onValueChange={(value: boolean) => updateNotificationDraft('news_notifications', value)}
                    colors={colors}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.accent, marginTop: 8, marginBottom: 0 }]}
                  onPress={handleSaveNotifications}
                  disabled={savingNotifications}
                >
                  {savingNotifications ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Notifications</Text>}
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Logout */}
          <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.error }]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Reusable field row
function FieldRow({ label, icon, colors, children }: any) {
  return (
    <View style={styles.fieldRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Ionicons name={icon} size={16} color={colors.textMuted} />
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

// Password input
function PwdField({ label, value, onChange, colors }: any) {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.fieldRow}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginBottom: 8 }]}>{label}</Text>
      <View style={[styles.pwdInputRow, { borderBottomColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          value={value}
          onChangeText={onChange}
          secureTextEntry={!show}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
        />
        <TouchableOpacity onPress={() => setShow(!show)}>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SwitchRow({ label, icon, value, onValueChange, colors }: any) {
  return (
    <View style={styles.notificationRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
        <Ionicons name={icon} size={20} color={colors.accent} />
        <Text style={[styles.settingText, { color: colors.textPrimary }]}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.bgInput, true: colors.accent2Bg }}
        thumbColor={value ? colors.accent : colors.textMuted}
      />
    </View>
  );
}

function MiniSwitch({ label, value, onValueChange, colors }: any) {
  return (
    <TouchableOpacity
      style={[
        styles.miniSwitch,
        {
          backgroundColor: value ? colors.accent2Bg : colors.bgInput,
          borderColor: value ? colors.accent : colors.border,
        },
      ]}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.8}
    >
      <Text style={[styles.miniSwitchText, { color: value ? colors.accent : colors.textSecondary }]}>{label}</Text>
      <Ionicons name={value ? 'checkmark-circle' : 'ellipse-outline'} size={17} color={value ? colors.accent : colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 18 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avatarText: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 24, color: '#fff' },
  emailText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13 },
  sectionLabel: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 16, marginBottom: 12, marginTop: 8 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  fieldRow: { marginBottom: 16 },
  fieldLabel: { fontFamily: 'PlusJakartaSans-Medium', fontSize: 13 },
  input: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 15, paddingVertical: 4 },
  levelRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  bandRow: { flexDirection: 'row', gap: 6, paddingVertical: 4 },
  bandChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, minWidth: 44, alignItems: 'center' },
  bandChipText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 12 },
  levelChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  levelText: { fontFamily: 'PlusJakartaSans-Medium', fontSize: 12 },
  saveBtn: { height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  saveBtnText: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 15, color: '#fff' },
  pwdToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pwdInputRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingBottom: 8 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  settingText: { fontFamily: 'PlusJakartaSans-Medium', fontSize: 15 },
  notificationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 7 },
  notificationBlock: { paddingVertical: 8 },
  blogPreferenceGrid: { flexDirection: 'row', gap: 8, paddingTop: 4, paddingBottom: 8 },
  miniSwitch: { flex: 1, minHeight: 38, borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center', gap: 5, flexDirection: 'row' },
  miniSwitchText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 12 },
  divider: { height: 1, marginVertical: 10 },
  toggle: { width: 44, height: 24, borderRadius: 12, borderWidth: 1.5, justifyContent: 'center', paddingHorizontal: 2 },
  toggleOn: {},
  toggleDot: { width: 18, height: 18, borderRadius: 9 },
  toggleDotOn: { alignSelf: 'flex-end' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 24, borderWidth: 1.5, marginTop: 8, marginBottom: 32 },
  logoutText: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 15 },
});
