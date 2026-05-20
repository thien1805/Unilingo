import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView } from 'expo-camera';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { usePreventRemove } from '@react-navigation/native';
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
  const { height: windowHeight } = useWindowDimensions();
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
  const [isExaminerSpeaking, setIsExaminerSpeaking] = useState(false);
  const [allowRemove, setAllowRemove] = useState(false);

  const recordedAnswersRef = useRef<RecordedMockAnswer[]>([]);
  const activeQuestionRef = useRef<ActiveQuestion | null>(null);
  const isStoppingRef = useRef(false);
  const autoAdvancePendingRef = useRef(false);
  const examinerSoundRef = useRef<Audio.Sound | null>(null);
  const speechFinishRef = useRef<(() => void) | null>(null);
  const screenActiveRef = useRef(true);
  const spokenQuestionKeyRef = useRef<string | null>(null);

  const stopExaminerAudio = useCallback(async () => {
    Speech.stop();

    const finishSpeech = speechFinishRef.current;
    if (finishSpeech) {
      speechFinishRef.current = null;
      finishSpeech();
    }

    if (examinerSoundRef.current) {
      try {
        await examinerSoundRef.current.stopAsync();
        await examinerSoundRef.current.unloadAsync();
      } catch {}
      examinerSoundRef.current = null;
    }

    if (screenActiveRef.current) {
      setIsExaminerSpeaking(false);
    }
  }, []);

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

  const getExaminerPrompt = useCallback((
    targetPart: MockTestPart,
    targetIndex: number,
    includeIntro = false
  ) => {
    const question = getQuestion(targetPart, targetIndex);
    if (!question) return '';

    const intro = (() => {
      if (!includeIntro) return '';
      if (targetPart === 1 && targetIndex === 0) {
        return "Welcome to the IELTS Speaking test. This is Part 1. I'm going to ask you some questions about familiar topics.";
      }
      if (targetPart === 2) {
        return "Now let's move on to Part 2. I'm going to give you a topic and you will have one minute to prepare.";
      }
      if (targetPart === 3 && targetIndex === 0) {
        return "Now let's move on to Part 3. In this part, I'll ask you some more abstract questions related to the topic.";
      }
      return '';
    })();

    if (targetPart !== 2) {
      return [intro, question].filter(Boolean).join(' ');
    }

    const cuePoints = testData?.part2.points?.length
      ? `You should say: ${testData.part2.points.join('. ')}.`
      : '';
    return [intro, question, cuePoints, 'Your preparation time starts now.']
      .filter(Boolean)
      .join(' ');
  }, [getQuestion, testData]);

  const speakAndWait = useCallback((text: string): Promise<void> => {
    return new Promise(async (resolve) => {
      const speechText = text.trim();
      if (!speechText || !screenActiveRef.current) {
        resolve();
        return;
      }

      await stopExaminerAudio();
      if (!screenActiveRef.current) {
        resolve();
        return;
      }

      let resolved = false;
      let timeout: ReturnType<typeof setTimeout> | null = null;
      const finish = () => {
        if (resolved) return;
        resolved = true;
        if (timeout) clearTimeout(timeout);
        timeout = null;
        speechFinishRef.current = null;
        if (screenActiveRef.current) {
          setIsExaminerSpeaking(false);
        }
        resolve();
      };

      speechFinishRef.current = finish;
      setIsExaminerSpeaking(true);

      // Prevent infinite hangs if both fallback and native speech fail
      timeout = setTimeout(finish, Math.max(8000, speechText.length * 90));

      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });

        const url = practiceAPI.getTTSUrl(speechText);
        
        // Race network TTS with a 5s timeout to force fallback if network is bad or cleartext HTTP hangs
        const soundPromise = Audio.Sound.createAsync({ uri: url }, { shouldPlay: true, volume: 1.0 });
        soundPromise.catch(() => {}); // Prevent unhandled promise rejection if it fails after timeout
        const networkTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('TTS network timeout')), 5000));
        
        const { sound } = await Promise.race([soundPromise, networkTimeout]) as any;

        if (resolved) {
          sound.unloadAsync().catch(() => {});
          return;
        }

        examinerSoundRef.current = sound;

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync().catch(() => {});
            if (examinerSoundRef.current === sound) {
              examinerSoundRef.current = null;
            }
            finish();
          }
        });
      } catch (error) {
        console.log('[MockSpeakingTest] Backend examiner TTS failed, using native speech:', error);
        examinerSoundRef.current = null;

        if (timeout) clearTimeout(timeout);
        // Tight timeout for native speech because onDone is unreliable on Android
        timeout = setTimeout(finish, Math.max(3000, speechText.length * 75 + 1500));

        try {
          const voices = await Speech.getAvailableVoicesAsync();
          const bestVoice = voices.find(v =>
            v.language.startsWith('en') &&
            (v.quality === Speech.VoiceQuality.Enhanced || v.name.toLowerCase().includes('network'))
          ) || voices.find(v => v.language.startsWith('en'));

          Speech.speak(speechText, {
            language: 'en-US',
            voice: bestVoice?.identifier,
            rate: 0.92,
            pitch: 1.0,
            onDone: finish,
            onStopped: finish,
            onError: finish,
          });
        } catch {
          finish();
        }
      }
    });
  }, [stopExaminerAudio]);

  const speakExaminerPrompt = useCallback((
    targetPart: MockTestPart = part,
    targetIndex = questionIndex,
    includeIntro = false
  ) => {
    return speakAndWait(getExaminerPrompt(targetPart, targetIndex, includeIntro));
  }, [getExaminerPrompt, part, questionIndex, speakAndWait]);

  const currentQuestion = useMemo(() => getQuestion(part, questionIndex), [part, questionIndex, getQuestion]);
  const currentLimit = getLimit(part);
  const isPart2 = part === 2;
  const totalQuestions = testData
    ? (part === 1 ? testData.part1.length : part === 3 ? testData.part3.length : 1)
    : 1;

  const mascotState: AnimatedMascotState =
    phase === 'recording' ? 'speaking' : phase === 'completed' ? 'happy' : 'idle';
  const cameraFrameHeight = Math.max(220, Math.round(windowHeight * 0.38));

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
    await stopExaminerAudio();
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
  }, [part, questionIndex, getQuestion, getLimit, recorderError, showError, startRecording, startTimer, stopCurrentRecording, stopExaminerAudio]);

  useEffect(() => {
    if (phase !== 'ready' || !testData || isTranscribing || isRecording) return;

    const questionKey = `${part}-${questionIndex}`;
    if (spokenQuestionKeyRef.current === questionKey) return;
    spokenQuestionKeyRef.current = questionKey;

    let cancelled = false;
    const timeout = setTimeout(() => {
      const shouldIncludeIntro =
        (part === 1 && questionIndex === 0) ||
        (part === 3 && questionIndex === 0);

      speakExaminerPrompt(part, questionIndex, shouldIncludeIntro)
        .then(() => {
          if (!cancelled && screenActiveRef.current) {
            startQuestionRecording(part, questionIndex);
          }
        })
        .catch(() => {
          if (!cancelled && screenActiveRef.current) {
            startQuestionRecording(part, questionIndex);
          }
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [isRecording, isTranscribing, part, phase, questionIndex, speakExaminerPrompt, startQuestionRecording, testData]);

  const startPart2Preparation = useCallback(async () => {
    if (!testData) return;
    stopTimer();
    await stopExaminerAudio();
    spokenQuestionKeyRef.current = '2-0';
    setPart(2);
    setQuestionIndex(0);
    setPhase('preparing');
    resetTimer(testData.part2.preparationTime);
    await speakExaminerPrompt(2, 0, true);
    if (!screenActiveRef.current) return;
    startTimer(testData.part2.preparationTime, () => {
      startQuestionRecording(2, 0);
    });
  }, [resetTimer, speakExaminerPrompt, startQuestionRecording, startTimer, stopExaminerAudio, stopTimer, testData]);

  const finishTest = useCallback(() => {
    stopTimer();
    stopExaminerAudio();
    setAllowRemove(true);
    setTimeout(() => {
      navigation.replace('MockTestResult', {
        recordedAnswers: recordedAnswersRef.current,
        title: testTitle,
      });
    }, 0);
  }, [navigation, stopExaminerAudio, stopTimer, testTitle]);

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

  const handleManualStopRecording = useCallback(() => {
    autoAdvancePendingRef.current = true;
    stopCurrentRecording();
  }, [stopCurrentRecording]);

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
        await stopExaminerAudio();
        if (isRecording) {
          await stopCurrentRecording();
        }
        setAllowRemove(true);
        setTimeout(() => {
          navigation.replace('MockTestResult', {
            recordedAnswers: recordedAnswersRef.current,
            title: testTitle,
          });
        }, 0);
      },
      { confirmText: 'End Test', cancelText: 'Continue', destructive: true }
    );
  }, [isRecording, navigation, showConfirm, stopCurrentRecording, stopExaminerAudio, stopTimer, testTitle]);

  usePreventRemove(!allowRemove, ({ data }) => {
    showConfirm(
      'End Mock Test?',
      'Do you want to end this mock test and leave the screen?',
      async () => {
        stopTimer();
        await stopExaminerAudio();
        if (isRecording) {
          await stopCurrentRecording();
        }
        setAllowRemove(true);
        setTimeout(() => navigation.dispatch(data.action), 0);
      },
      { confirmText: 'End Test', cancelText: 'Continue', destructive: true }
    );
  });

  useEffect(() => {
    return () => {
      screenActiveRef.current = false;
      stopTimer();
      stopExaminerAudio();
    };
  }, [stopExaminerAudio, stopTimer]);

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
          <AppModal config={modal} onDismiss={hideModal} />
        </SafeAreaView>
      </AppBackground>
    );
  }

  const phaseLabel = (() => {
    if (isExaminerSpeaking) return 'Examiner speaking';
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
          <View style={[styles.questionCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={styles.questionHeader}>
              <Text style={[Typography.caption, { color: colors.accent }]}>
                {part === 2 ? 'Cue Card Task' : 'Current Question'}
              </Text>
              <TouchableOpacity
                style={[styles.listenButton, { backgroundColor: colors.accentBg }]}
                onPress={() => speakExaminerPrompt(part, questionIndex, false)}
                disabled={phase === 'recording'}
              >
                <Ionicons
                  name={isExaminerSpeaking ? 'volume-high' : 'volume-medium-outline'}
                  size={18}
                  color={phase === 'recording' ? colors.textMuted : colors.accent}
                />
              </TouchableOpacity>
            </View>
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

          {cameraEnabled && (
            <View style={[styles.cameraCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              {cameraGranted ? (
                <CameraView facing="front" mirror style={[styles.cameraPreview, { height: cameraFrameHeight }]}>
                  <View style={styles.cameraPill}>
                    <View style={styles.cameraDot} />
                    <Text style={styles.cameraPillText}>Camera active</Text>
                  </View>
                </CameraView>
              ) : (
                <View style={[styles.cameraFallback, { backgroundColor: colors.bgInput, height: cameraFrameHeight }]}>
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
                name={isExaminerSpeaking ? 'volume-high' : isTranscribing ? 'document-text-outline' : phase === 'recording' ? 'radio-button-on' : phase === 'completed' ? 'checkmark-circle' : 'time-outline'}
                size={18}
                color={isExaminerSpeaking ? colors.accent : isTranscribing ? colors.accent : phase === 'recording' ? colors.rose : phase === 'completed' ? colors.success : colors.textSecondary}
              />
              <Text
                style={[
                  Typography.bodySm,
                  { color: isExaminerSpeaking ? colors.accent : isTranscribing ? colors.accent : phase === 'recording' ? colors.rose : phase === 'completed' ? colors.success : colors.textSecondary },
                ]}
              >
                {isExaminerSpeaking
                  ? 'Listen to the examiner before you answer'
                  : isTranscribing
                  ? 'Converting your audio answer into script...'
                  : phase === 'recording'
                  ? 'Recording your answer'
                  : phase === 'completed'
                    ? 'Audio saved and transcript ready'
                    : phase === 'preparing'
                      ? 'Prepare your answer. Recording starts after the timer.'
                      : 'Recording will start automatically'}
              </Text>
            </View>
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
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { backgroundColor: colors.bgCard, borderColor: colors.border, opacity: phase === 'recording' && !isTranscribing ? 1 : 0.5 },
                ]}
                disabled={phase !== 'recording' || isTranscribing}
                onPress={handleManualStopRecording}
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
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  cameraFallback: {
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
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  listenButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
