import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppBackground from '../../components/common/AppBackground';
import AnimatedMascot from '../../components/common/AnimatedMascot';
import { useThemeStore } from '../../store/themeStore';
import { BorderRadius, Gradients, Spacing, Typography } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { RecordedMockAnswer } from '../../data/mockSpeakingTest';

export default function MockTestResultScreen({ navigation, route }: any) {
  const { colors } = useThemeStore();
  const [showRecordings, setShowRecordings] = useState(false);
  const recordedAnswers: RecordedMockAnswer[] = route.params?.recordedAnswers || [];

  const completedParts = [1, 2, 3].map((part) => ({
    part,
    completed: recordedAnswers.some((answer) => answer.part === part),
  }));

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.summaryCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <AnimatedMascot state="happy" size={132} />
            <Text style={[Typography.h2, styles.title, { color: colors.textPrimary }]}>
              Mock Test Completed
            </Text>
            <Text style={[Typography.body, styles.subtitle, { color: colors.textSecondary }]}>
              {recordedAnswers.length} recorded answers saved locally for this session.
            </Text>

            <View style={[styles.scoreBox, { backgroundColor: colors.accentBg }]}>
              <Ionicons name="analytics-outline" size={22} color={colors.accent} />
              <View style={{ flex: 1 }}>
                {/* TODO: Connect this placeholder to the speaking evaluation API once mock-test scoring is ready. */}
                <Text style={[Typography.bodyMedium, { color: colors.textPrimary }]}>
                  AI evaluation will be connected later
                </Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                  TODO: connect this summary to the existing speaking evaluation pipeline.
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[Typography.h4, { color: colors.textPrimary }]}>Parts Completed</Text>
            {completedParts.map((item) => (
              <View key={item.part} style={styles.partRow}>
                <Ionicons
                  name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={item.completed ? colors.success : colors.textMuted}
                />
                <Text style={[Typography.bodySm, { color: colors.textPrimary }]}>
                  Part {item.part} {item.completed ? 'completed' : 'not recorded'}
                </Text>
              </View>
            ))}
          </View>

          {showRecordings && (
            <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <Text style={[Typography.h4, { color: colors.textPrimary }]}>Recorded Answers</Text>
              {recordedAnswers.length === 0 ? (
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                  No recordings were saved.
                </Text>
              ) : (
                recordedAnswers.map((answer, index) => (
                  <View key={`${answer.part}-${index}-${answer.uri}`} style={styles.recordingRow}>
                    <View style={[styles.recordingIcon, { backgroundColor: colors.skyBg }]}>
                      <Ionicons name="mic" size={16} color={colors.sky} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[Typography.bodySm, { color: colors.textPrimary }]} numberOfLines={2}>
                        Part {answer.part}: {answer.question}
                      </Text>
                      <Text style={[Typography.captionSm, { color: colors.textMuted }]}>
                        {answer.duration}s • {answer.uri}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
              onPress={() => setShowRecordings((value) => !value)}
              activeOpacity={0.8}
            >
              <Ionicons name="list-outline" size={18} color={colors.textPrimary} />
              <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>
                Review Recordings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('PracticeMain')}
            >
              <LinearGradient colors={Gradients.primary} style={styles.primaryButton}>
                <Ionicons name="arrow-back" size={18} color="#1F2937" />
                <Text style={styles.primaryButtonText}>Back to Practice</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 110,
    gap: 14,
  },
  summaryCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  scoreBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: BorderRadius.lg,
  },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: 12,
  },
  partRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recordingIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    gap: 12,
  },
  secondaryButton: {
    height: 52,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
  },
  primaryButton: {
    height: 52,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
    color: '#1F2937',
  },
});
