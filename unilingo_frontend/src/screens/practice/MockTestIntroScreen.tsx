import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import AppBackground from '../../components/common/AppBackground';
import AnimatedMascot from '../../components/common/AnimatedMascot';
import { useThemeStore } from '../../store/themeStore';
import { BorderRadius, Gradients, Spacing, Typography } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';

const CHECKLIST = [
  'Find a quiet place',
  'Keep your face visible',
  'Keep your phone stable',
  'Answer naturally',
];

export default function MockTestIntroScreen({ navigation }: any) {
  const { colors } = useThemeStore();
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const requestPermissionsAndStart = async () => {
    setIsRequesting(true);
    setPermissionError(null);

    try {
      const [microphone, camera] = await Promise.all([
        Audio.requestPermissionsAsync(),
        Camera.requestCameraPermissionsAsync(),
      ]);

      if (!microphone.granted || !camera.granted) {
        setPermissionError(
          'Camera and microphone permissions are required for the mock speaking test. Please allow both permissions and try again.'
        );
        return;
      }

      navigation.navigate('MockSpeakingTest');
    } catch {
      setPermissionError('Could not request camera or microphone permission. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[Typography.bodyMedium, { color: colors.textPrimary }]}>Mock Test</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <AnimatedMascot state="idle" size={132} />
          <View style={styles.titleBlock}>
            <View style={[styles.badge, { backgroundColor: colors.errorBg }]}>
              <Text style={[styles.badgeText, { color: colors.error }]}>Hardcore</Text>
            </View>
            <Text style={[Typography.h2, styles.title, { color: colors.textPrimary }]}>
              IELTS Speaking Mock Test
            </Text>
            <Text style={[Typography.body, styles.description, { color: colors.textSecondary }]}>
              This mode simulates a real IELTS Speaking test. Your voice will be recorded and
              your camera will be used to monitor your speaking environment.
            </Text>
          </View>

          <View style={styles.checklist}>
            {CHECKLIST.map((item) => (
              <View key={item} style={styles.checkItem}>
                <View style={[styles.checkIcon, { backgroundColor: colors.successBg }]}>
                  <Ionicons name="checkmark" size={15} color={colors.success} />
                </View>
                <Text style={[Typography.bodySm, { color: colors.textPrimary }]}>{item}</Text>
              </View>
            ))}
          </View>

          {permissionError && (
            <View style={[styles.errorBox, { backgroundColor: colors.errorBg }]}>
              <Ionicons name="warning-outline" size={18} color={colors.error} />
              <Text style={[Typography.caption, { color: colors.error, flex: 1 }]}>
                {permissionError}
              </Text>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={requestPermissionsAndStart}
            disabled={isRequesting}
          >
            <LinearGradient colors={Gradients.primary} style={styles.startButton}>
              {isRequesting ? (
                <ActivityIndicator color="#1F2937" />
              ) : (
                <>
                  <Ionicons name="videocam" size={18} color="#1F2937" />
                  <Text style={styles.startButtonText}>Start Mock Test</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 38,
  },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  titleBlock: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    borderRadius: BorderRadius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
  },
  checklist: {
    gap: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: BorderRadius.md,
  },
  startButton: {
    height: 54,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  startButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: '#1F2937',
  },
});
