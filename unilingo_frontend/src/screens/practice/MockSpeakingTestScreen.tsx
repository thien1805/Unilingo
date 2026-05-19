import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import AppBackground from '../../components/common/AppBackground';
import AnimatedMascot, { AnimatedMascotState } from '../../components/common/AnimatedMascot';
import { AppModal, useAppModal } from '../../components/common/AppModal';
import { useThemeStore } from '../../store/themeStore';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useMockTestTimer } from '../../hooks/useMockTestTimer';
import { MockTestData, MockTestPart, RecordedMockAnswer, normalizeMockTestData } from '../../data/mockSpeakingTest';
import { topicsAPI } from '../../api/topics';
import { BorderRadius, Gradients, Spacing, Typography } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { practiceAPI } from '../../api/practice';

type TestPhase = 'loading' | 'ready' | 'preparing' | 'recording' | 'completed';

type ActiveQuestion = {
  part: MockTestPart;
  index: number;
  question: string;
  limit: number;
};

const getPartLabel = (part: MockTestPart) => `Part ${part}`;

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export default function MockSpeakingTestScreen({ navigation, route }: any) {
  const { colors } = useThemeStore();
  const cameraEnabled = route?.params?.cameraEnabled !== false;
  const testTitle = route?.params?.title || (cameraEnabled ? 'IELTS Speaking Mock Test' : 'Full IELTS Speaking Test');
  const { modal, hideModal, showConfirm, showError } = useAppModal();
  const { timeLeft, start: startTimer, stop: stopTimer, reset: resetTimer } = useMockTestTimer();
  const {
    startRecording,
    stopRecording,
    isRecording,
    error: recorderError,
  } = useAudioRecorder();

  const [testData, setTestData] = useState<MockTestData | null>(null);
  const [part, setPart] = useState<MockTestPart>(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<TestPhase>('loading');
  const [recordedAnswers, setRecordedAnswers] = useState<RecordedMockAnswer[]>([]);
  const [cameraGranted, setCameraGranted] = useState<boolean | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

  const recordedAnswersRef = useRef<RecordedMockAnswer[]>([]);
  const activeQuestionRef = useRef<ActiveQuestion | null>(null);
  const isStoppingRef = useRef(false);
  const autoAdvancePendingRef = useRef(false);

  // API-first: use backend questions when available, fallback only after request failure.
  useEffect(() => {
    let mounted = true;
    const fetchMockTest = async () => {
      setPhase('loading');
      setLoadError(null);
      try {
        const data = await topicsAPI.getMockTest();
        if (!mounted) return;

        setTestData(data);
        resetTimer(data.limits.part1Question);
        setPhase('ready');
      } catch (err: any) {
        console.error('Failed to load mock test:', err);
        if (mounted) {
          const fallback = normalizeMockTestData();
          setTestData(fallback);
          resetTimer(fallback.limits.part1Question);
          setLoadError('Using built-in mock questions because the backend is not responding.');
          setPhase('ready');
        }
      }
    };
    fetchMockTest();
    return () => { mounted = false; };
  }, [resetTimer]);

  // Helper functions that read from API data
  const getQuestion = useCallback((p: MockTestPart, idx: number) => {
    if (!testData) return '';
    if (p === 1) return testData.part1[idx] || testData.part1[0] || '';
    if (p === 2) return testData.part2.topic;
    return testData.part3[idx] || testData.part3[0] || '';
  }, [testData]);

  const getLimit = useCallback((p: MockTestPart) => {
    if (!testData) return 30;
    if (p === 1) return testData.limits.part1Question;
    if (p === 2) return testData.part2.speakingTime;
    return testData.limits.part3Question;
  }, [testData]);

  const currentQuestion = useMemo(() => getQuestion(part, questionIndex), [part, questionIndex, getQuestion]);
  const currentLimit = getLimit(part);
  const isPart2 = part === 2;
  const totalQuestions = testData
    ? (part === 1 ? testData.part1.length : part === 3 ? testData.part3.length : 1)
    : 1;

  const mascotState: AnimatedMascotState =
    phase === 'recording' ? 'speaking' : phase === 'completed' ? 'happy' : 'idle';

  useEffect(() => {
    if (!cameraEnabled) {
      setCameraGranted(null);
      return;
    }

    Camera.getCameraPermissionsAsync()
      .then((permission) => setCameraGranted(permission.granted))
      .catch(() => setCameraGranted(false));
  }, [cameraEnabled]);

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

  const transcribeRecording = useCallback(async (uri: string) => {
    try {
      setIsTranscribing(true);
      setTranscriptionError(null);

      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'audio/m4a',
        name: `mock_answer_${Date.now()}.m4a`,
      } as any);

      const response = await practiceAPI.transcribeAudio(formData);
      return response.transcript?.trim() || 'No speech could be recognized.';
    } catch {
      setTranscriptionError('Could not transcribe this answer. The audio was still saved.');
      return null;
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const stopCurrentRecording = useCallback(async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;
    stopTimer();

    const activeQuestion = activeQuestionRef.current;
    const result = await stopRecording();

    if (result?.uri && activeQuestion) {
      const transcript = await transcribeRecording(result.uri);
      appendRecordedAnswer({
        part: activeQuestion.part,
        question: activeQuestion.question,
        uri: result.uri,
        duration: Math.min(result.duration, activeQuestion.limit),
        transcript,
      });
    }

    activeQuestionRef.current = null;
    setPhase('completed');
  }, [appendRecordedAnswer, stopRecording, stopTimer, transcribeRecording]);

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
    startTimer(limit, () => {
      autoAdvancePendingRef.current = true;
      stopCurrentRecording();
    });
  }, [part, questionIndex, getQuestion, getLimit, recorderError, showError, startRecording, startTimer, stopCurrentRecording]);

  const startPart2Preparation = useCallback(() => {
    if (!testData) return;
    stopTimer();
    setPart(2);
    setQuestionIndex(0);
    setPhase('preparing');
    startTimer(testData.part2.preparationTime, () => {
      startQuestionRecording(2, 0);
    });
  }, [testData, startQuestionRecording, startTimer, stopTimer]);

  const finishTest = useCallback(() => {
    stopTimer();
    navigation.replace('MockTestResult', {
      recordedAnswers: recordedAnswersRef.current,
      title: testTitle,
    });
  }, [navigation, stopTimer, testTitle]);

  const handleNext = useCallback(() => {
    if (phase !== 'completed' || !testData) return;

    if (part === 1) {
      const nextIndex = questionIndex + 1;
      if (nextIndex < testData.part1.length) {
        setQuestionIndex(nextIndex);
        setPhase('ready');
        resetTimer(testData.limits.part1Question);
      } else {
        startPart2Preparation();
      }
      return;
    }

    if (part === 2) {
      setPart(3);
      setQuestionIndex(0);
      setPhase('ready');
      resetTimer(testData.limits.part3Question);
      return;
    }

    const nextIndex = questionIndex + 1;
    if (nextIndex < testData.part3.length) {
      setQuestionIndex(nextIndex);
      setPhase('ready');
      resetTimer(testData.limits.part3Question);
    } else {
      finishTest();
    }
  }, [finishTest, testData, part, phase, questionIndex, resetTimer, startPart2Preparation]);

  useEffect(() => {
    if (phase !== 'completed' || isTranscribing || !autoAdvancePendingRef.current) return;

    autoAdvancePendingRef.current = false;
    const timeout = setTimeout(() => {
      handleNext();
    }, 350);

    return () => clearTimeout(timeout);
  }, [handleNext, isTranscribing, phase]);

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
          title: testTitle,
        });
      },
      { confirmText: 'End Test', cancelText: 'Continue' }
    );
  }, [isRecording, navigation, showConfirm, stopCurrentRecording, stopTimer, testTitle]);

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  // Loading state
  if (phase === 'loading' || !testData) {
    return (
      <AppBackground>
        <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
          {loadError ? (
            <View style={{ alignItems: 'center', gap: 16, paddingHorizontal: 40 }}>
              <Ionicons name="cloud-offline-outline" size={48} color={colors.error} />
              <Text style={[Typography.bodyMedium, { color: colors.error, textAlign: 'center' }]}>
                {loadError}
              </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <LinearGradient colors={Gradients.primary} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Go Back</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ alignItems: 'center', gap: 16 }}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[Typography.bodySm, { color: colors.textSecondary }]}>
                Loading mock test questions...
              </Text>
            </View>
          )}
        </SafeAreaView>
      </AppBackground>
    );
  }

  const phaseLabel = (() => {
    if (phase === 'preparing') return 'Preparation time';
    if (phase === 'recording') return 'Recording';
    if (phase === 'completed') return 'Answer saved';
    return 'Ready';
  })();

  const nextButtonLabel = (() => {
    if (part === 1 && questionIndex < testData.part1.length - 1) return 'Next Question';
    if (part === 1) return 'Next Part';
    if (part === 2) return 'Next Part';
    if (part === 3 && questionIndex < testData.part3.length - 1) return 'Next Question';
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
              {testTitle}
            </Text>
            <Text style={[Typography.captionSm, { color: colors.textMuted }]}>
              {getPartLabel(part)} • {phaseLabel}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {cameraEnabled && (
            <View style={[styles.cameraCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              {cameraGranted ? (
                <CameraView facing="front" mirror style={styles.cameraPreview}>
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
          )}

          {loadError && phase === 'ready' && (
            <View style={[styles.syncBanner, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <Ionicons
                name="cloud-offline-outline"
                size={16}
                color={colors.warning}
              />
              <Text style={[Typography.captionSm, { color: colors.textSecondary, flex: 1 }]}>
                {loadError}
              </Text>
            </View>
          )}

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
                name={isTranscribing ? 'document-text-outline' : phase === 'recording' ? 'radio-button-on' : phase === 'completed' ? 'checkmark-circle' : 'time-outline'}
                size={18}
                color={isTranscribing ? colors.accent : phase === 'recording' ? colors.rose : phase === 'completed' ? colors.success : colors.textSecondary}
              />
              <Text
                style={[
                  Typography.bodySm,
                  { color: isTranscribing ? colors.accent : phase === 'recording' ? colors.rose : phase === 'completed' ? colors.success : colors.textSecondary },
                ]}
              >
                {isTranscribing
                  ? 'Converting your audio answer into script...'
                  : phase === 'recording'
                  ? 'Recording your answer'
                  : phase === 'completed'
                    ? 'Audio saved and transcript ready'
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
                {testData.part2.points.map((point) => (
                  <View key={point} style={styles.cuePoint}>
                    <Text style={[Typography.bodySm, { color: colors.textPrimary }]}>• {point}</Text>
                  </View>
                ))}
                <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                  Preparation: {testData.part2.preparationTime}s • Speaking: {testData.part2.speakingTime}s
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

          {transcriptionError && (
            <View style={[styles.errorBox, { backgroundColor: colors.warningBg }]}>
              <Ionicons name="document-text-outline" size={18} color={colors.warning} />
              <Text style={[Typography.caption, { color: colors.warning, flex: 1 }]}>
                {transcriptionError}
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={phase !== 'ready' || isTranscribing}
              onPress={() => startQuestionRecording()}
              style={{ opacity: phase === 'ready' && !isTranscribing ? 1 : 0.5 }}
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
                  { backgroundColor: colors.bgCard, borderColor: colors.border, opacity: phase === 'recording' && !isTranscribing ? 1 : 0.5 },
                ]}
                disabled={phase !== 'recording' || isTranscribing}
                onPress={stopCurrentRecording}
              >
                <Ionicons name="stop" size={18} color={colors.rose} />
                <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>Stop Recording</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { backgroundColor: colors.bgCard, borderColor: colors.border, opacity: phase === 'completed' && !isTranscribing ? 1 : 0.5 },
                ]}
                disabled={phase !== 'completed' || isTranscribing}
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
  syncBanner: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
