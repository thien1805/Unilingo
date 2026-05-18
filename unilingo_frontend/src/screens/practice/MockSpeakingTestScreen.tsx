import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import AppBackground from '../../components/common/AppBackground';
import AnimatedMascot, { AnimatedMascotState } from '../../components/common/AnimatedMascot';
import { AppModal, useAppModal } from '../../components/common/AppModal';
import { useThemeStore } from '../../store/themeStore';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useMockTestTimer } from '../../hooks/useMockTestTimer';
import {
  MOCK_TEST,
  MOCK_TEST_LIMITS,
  MockTestPart,
  RecordedMockAnswer,
} from '../../data/mockSpeakingTest';
import { BorderRadius, Gradients, Spacing, Typography } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';

type TestPhase = 'ready' | 'preparing' | 'recording' | 'completed';

type ActiveQuestion = {
  part: MockTestPart;
  index: number;
  question: string;
  limit: number;
};

const getPartLabel = (part: MockTestPart) => `Part ${part}`;

const getQuestion = (part: MockTestPart, index: number) => {
  if (part === 1) return MOCK_TEST.part1[index] || MOCK_TEST.part1[0];
  if (part === 2) return MOCK_TEST.part2.topic;
  return MOCK_TEST.part3[index] || MOCK_TEST.part3[0];
};

const getLimit = (part: MockTestPart) => {
  if (part === 1) return MOCK_TEST_LIMITS.part1Question;
  if (part === 2) return MOCK_TEST.part2.speakingTime;
  return MOCK_TEST_LIMITS.part3Question;
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export default function MockSpeakingTestScreen({ navigation }: any) {
  const { colors } = useThemeStore();
  const { modal, hideModal, showConfirm, showError } = useAppModal();
  const { timeLeft, start: startTimer, stop: stopTimer, reset: resetTimer } = useMockTestTimer();
  const {
    startRecording,
    stopRecording,
    isRecording,
    error: recorderError,
  } = useAudioRecorder();

  const [part, setPart] = useState<MockTestPart>(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<TestPhase>('ready');
  const [recordedAnswers, setRecordedAnswers] = useState<RecordedMockAnswer[]>([]);
  const [cameraGranted, setCameraGranted] = useState<boolean | null>(null);

  const recordedAnswersRef = useRef<RecordedMockAnswer[]>([]);
  const activeQuestionRef = useRef<ActiveQuestion | null>(null);
  const isStoppingRef = useRef(false);

  const currentQuestion = useMemo(() => getQuestion(part, questionIndex), [part, questionIndex]);
  const currentLimit = getLimit(part);
  const isPart2 = part === 2;
  const totalQuestions = part === 1 ? MOCK_TEST.part1.length : part === 3 ? MOCK_TEST.part3.length : 1;

  const mascotState: AnimatedMascotState =
    phase === 'recording' ? 'speaking' : phase === 'completed' ? 'happy' : 'idle';

  useEffect(() => {
    Camera.getCameraPermissionsAsync()
      .then((permission) => setCameraGranted(permission.granted))
      .catch(() => setCameraGranted(false));
  }, []);

  useEffect(() => {
    if (phase === 'ready') {
      resetTimer(currentLimit);
    }
  }, [currentLimit, phase, resetTimer]);

  const appendRecordedAnswer = useCallback((answer: RecordedMockAnswer) => {
    const next = [...recordedAnswersRef.current, answer];
    recordedAnswersRef.current = next;
    setRecordedAnswers(next);
  }, []);

  const stopCurrentRecording = useCallback(async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;
    stopTimer();

    const activeQuestion = activeQuestionRef.current;
    const result = await stopRecording();

    if (result?.uri && activeQuestion) {
      appendRecordedAnswer({
        part: activeQuestion.part,
        question: activeQuestion.question,
        uri: result.uri,
        duration: Math.min(result.duration, activeQuestion.limit),
      });
    }

    activeQuestionRef.current = null;
    setPhase('completed');
  }, [appendRecordedAnswer, stopRecording, stopTimer]);

  const startQuestionRecording = useCallback(async (
    targetPart: MockTestPart = part,
    targetIndex = questionIndex
  ) => {
    const question = getQuestion(targetPart, targetIndex);
    const limit = getLimit(targetPart);

    isStoppingRef.current = false;
    const started = await startRecording();
    if (!started) {
      showError('Recording Error', recorderError || 'Could not start recording. Please try again.');
      setPhase('ready');
      return;
    }

    activeQuestionRef.current = {
      part: targetPart,
      index: targetIndex,
      question,
      limit,
    };
    setPhase('recording');
    startTimer(limit, stopCurrentRecording);
  }, [part, questionIndex, recorderError, showError, startRecording, startTimer, stopCurrentRecording]);

  const startPart2Preparation = useCallback(() => {
    stopTimer();
    setPart(2);
    setQuestionIndex(0);
    setPhase('preparing');
    startTimer(MOCK_TEST.part2.preparationTime, () => {
      startQuestionRecording(2, 0);
    });
  }, [startQuestionRecording, startTimer, stopTimer]);

  const finishTest = useCallback(() => {
    stopTimer();
    navigation.replace('MockTestResult', {
      recordedAnswers: recordedAnswersRef.current,
    });
  }, [navigation, stopTimer]);

  const handleNext = useCallback(() => {
    if (phase !== 'completed') return;

    if (part === 1) {
      const nextIndex = questionIndex + 1;
      if (nextIndex < MOCK_TEST.part1.length) {
        setQuestionIndex(nextIndex);
        setPhase('ready');
        resetTimer(MOCK_TEST_LIMITS.part1Question);
      } else {
        startPart2Preparation();
      }
      return;
    }

    if (part === 2) {
      setPart(3);
      setQuestionIndex(0);
      setPhase('ready');
      resetTimer(MOCK_TEST_LIMITS.part3Question);
      return;
    }

    const nextIndex = questionIndex + 1;
    if (nextIndex < MOCK_TEST.part3.length) {
      setQuestionIndex(nextIndex);
      setPhase('ready');
      resetTimer(MOCK_TEST_LIMITS.part3Question);
    } else {
      finishTest();
    }
  }, [finishTest, part, phase, questionIndex, resetTimer, startPart2Preparation]);

  const handleEndTest = useCallback(() => {
    showConfirm(
      'End Mock Test?',
      'Are you sure you want to end this mock test?',
      async () => {
        stopTimer();
        if (isRecording) {
          await stopCurrentRecording();
        }
        navigation.replace('MockTestResult', {
          recordedAnswers: recordedAnswersRef.current,
        });
      },
      { confirmText: 'End Test', cancelText: 'Continue' }
    );
  }, [isRecording, navigation, showConfirm, stopCurrentRecording, stopTimer]);

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  const phaseLabel = (() => {
    if (phase === 'preparing') return 'Preparation time';
    if (phase === 'recording') return 'Recording';
    if (phase === 'completed') return 'Answer saved';
    return 'Ready';
  })();

  const nextButtonLabel = (() => {
    if (part === 1 && questionIndex < MOCK_TEST.part1.length - 1) return 'Next Question';
    if (part === 1) return 'Next Part';
    if (part === 2) return 'Next Part';
    if (part === 3 && questionIndex < MOCK_TEST.part3.length - 1) return 'Next Question';
    return 'Finish Test';
  })();

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
            onPress={handleEndTest}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={[Typography.bodyMedium, { color: colors.textPrimary }]}>
              IELTS Speaking Mock Test
            </Text>
            <Text style={[Typography.captionSm, { color: colors.textMuted }]}>
              {getPartLabel(part)} • {phaseLabel}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.cameraCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            {cameraGranted ? (
              // TODO: Add real face detection here if the app later adopts a stable face detection pipeline.
              <CameraView facing="front" style={styles.cameraPreview}>
                <View style={styles.cameraPill}>
                  <View style={styles.cameraDot} />
                  <Text style={styles.cameraPillText}>Camera active</Text>
                </View>
              </CameraView>
            ) : (
              <View style={[styles.cameraFallback, { backgroundColor: colors.bgInput }]}>
                <Ionicons name="videocam-off-outline" size={28} color={colors.textMuted} />
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                  Camera permission is not active.
                </Text>
              </View>
            )}
            <Text style={[Typography.captionSm, { color: colors.textMuted }]}>
              Face should stay inside the frame
            </Text>
          </View>

          <View style={[styles.statusCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={styles.statusTop}>
              <View>
                <Text style={[Typography.caption, { color: colors.textMuted }]}>
                  {getPartLabel(part)} {part !== 2 ? `• Question ${questionIndex + 1}/${totalQuestions}` : '• Cue Card'}
                </Text>
                <Text style={[styles.timer, { color: phase === 'recording' ? colors.rose : colors.textPrimary }]}>
                  {formatTime(timeLeft)}
                </Text>
              </View>
              <AnimatedMascot state={mascotState} size={92} />
            </View>

            <View style={[styles.recordingStatus, { backgroundColor: phase === 'recording' ? colors.roseBg : colors.bgSecondary }]}>
              <Ionicons
                name={phase === 'recording' ? 'radio-button-on' : phase === 'completed' ? 'checkmark-circle' : 'time-outline'}
                size={18}
                color={phase === 'recording' ? colors.rose : phase === 'completed' ? colors.success : colors.textSecondary}
              />
              <Text
                style={[
                  Typography.bodySm,
                  { color: phase === 'recording' ? colors.rose : phase === 'completed' ? colors.success : colors.textSecondary },
                ]}
              >
                {phase === 'recording'
                  ? 'Recording your answer'
                  : phase === 'completed'
                    ? 'Recording saved'
                    : phase === 'preparing'
                      ? 'Prepare your answer. Recording starts after the timer.'
                      : 'Recording status: idle'}
              </Text>
            </View>
          </View>

          <View style={[styles.questionCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[Typography.caption, { color: colors.accent }]}>
              {part === 2 ? 'Cue Card Task' : 'Current Question'}
            </Text>
            <Text style={[Typography.h4, styles.questionText, { color: colors.textPrimary }]}>
              {currentQuestion}
            </Text>

            {isPart2 && (
              <View style={[styles.cueBox, { backgroundColor: colors.accentBg }]}>
                <Text style={[Typography.bodyMedium, { color: colors.textPrimary }]}>You should say:</Text>
                {MOCK_TEST.part2.points.map((point) => (
                  <View key={point} style={styles.cuePoint}>
                    <Text style={[Typography.bodySm, { color: colors.textPrimary }]}>• {point}</Text>
                  </View>
                ))}
                <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                  Preparation: {MOCK_TEST.part2.preparationTime}s • Speaking: {MOCK_TEST.part2.speakingTime}s
                </Text>
              </View>
            )}
          </View>

          {recorderError && (
            <View style={[styles.errorBox, { backgroundColor: colors.errorBg }]}>
              <Ionicons name="warning-outline" size={18} color={colors.error} />
              <Text style={[Typography.caption, { color: colors.error, flex: 1 }]}>
                {recorderError}
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={phase !== 'ready'}
              onPress={() => startQuestionRecording()}
              style={{ opacity: phase === 'ready' ? 1 : 0.5 }}
            >
              <LinearGradient colors={Gradients.primary} style={styles.primaryButton}>
                <Ionicons name="mic" size={18} color="#1F2937" />
                <Text style={styles.primaryButtonText}>Start Recording</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { backgroundColor: colors.bgCard, borderColor: colors.border, opacity: phase === 'recording' ? 1 : 0.5 },
                ]}
                disabled={phase !== 'recording'}
                onPress={stopCurrentRecording}
              >
                <Ionicons name="stop" size={18} color={colors.rose} />
                <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>Stop Recording</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { backgroundColor: colors.bgCard, borderColor: colors.border, opacity: phase === 'completed' ? 1 : 0.5 },
                ]}
                disabled={phase !== 'completed'}
                onPress={handleNext}
              >
                <Ionicons name="arrow-forward" size={18} color={colors.textPrimary} />
                <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>{nextButtonLabel}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.endButton, { borderColor: colors.error }]}
              onPress={handleEndTest}
            >
              <Text style={[styles.endButtonText, { color: colors.error }]}>End Test</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <AppModal config={modal} onDismiss={hideModal} />
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  iconButton: {
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 14,
  },
  cameraCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  cameraPreview: {
    height: 160,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  cameraFallback: {
    height: 160,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cameraPill: {
    alignSelf: 'flex-start',
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111827',
    borderRadius: BorderRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cameraDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  cameraPillText: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
  },
  statusCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: 12,
  },
  statusTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  timer: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 42,
    fontVariant: ['tabular-nums'],
  },
  recordingStatus: {
    borderRadius: BorderRadius.md,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questionCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: 10,
  },
  questionText: {
    lineHeight: 26,
  },
  cueBox: {
    borderRadius: BorderRadius.lg,
    padding: 14,
    gap: 6,
  },
  cuePoint: {
    paddingLeft: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: BorderRadius.md,
    padding: 12,
  },
  actions: {
    gap: 12,
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
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 4,
  },
  secondaryButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    textAlign: 'center',
  },
  endButton: {
    height: 48,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
  },
});
