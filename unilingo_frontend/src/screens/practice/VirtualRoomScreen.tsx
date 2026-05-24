/**
 * Virtual Room Screen — Full IELTS Speaking Exam Simulator
 * Manages multi-question flow with embedded recording.
 *
 * Part 1: 3 short questions (max 30s each)
 * Part 2: 1 cue card (60s prep + 120s recording)
 * Part 3: 3 discussion questions (max 45s each)
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, AppState,
} from 'react-native';
import type { AppStateStatus } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import type { AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, usePreventRemove } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../store/themeStore';
import { practiceAPI } from '../../api/practice';
import { Card, MascotIcon, OutlineButton } from '../../components/common';
import { AppModal, useAppModal } from '../../components/common/AppModal';
import { Gradients, Typography } from '../../theme';
import AppBackground from '../../components/common/AppBackground';

// Question counts per part
const QUESTION_COUNTS: Record<string, number> = { part1: 3, part2: 1, part3: 3 };
const MAX_RECORD_SECONDS: Record<string, number> = { part1: 30, part2: 120, part3: 45 };

// AI Examiner filler phrases
const FILLERS_NEXT = [
  "Good. Let's move on to the next question.",
  "Thank you. Now, I'd like to ask you another question.",
  "Alright, very well. Let me ask you something else.",
  "Thank you for that. Here's another question for you.",
  "OK, great. Let's continue.",
];

const FILLERS_DONE = [
  "That is the end of the speaking test. Thank you very much.",
  "Thank you. That concludes the speaking test.",
  "Alright, we've finished the speaking test. Thank you for your responses.",
];

const TTS_LOAD_TIMEOUT_MS = 12000;
const BACKGROUND_SUSPEND_GRACE_MS = 2500;
const getSpeechSafetyTimeout = (text: string) => Math.min(
  90000,
  Math.max(18000, text.length * 120 + 4000),
);

const shouldSkipNativeTTSFallback = (error: unknown) => {
  const message = String((error as any)?.message || error || '').toLowerCase();
  return (
    message.includes('audiofocusnotacquired') ||
    message.includes('background')
  );
};

type ExamPhase =
  | 'loading'
  | 'intro'
  | 'asking'
  | 'prep'        // Part 2 only
  | 'recording'
  | 'transition'
  | 'saving'
  | 'complete'
  | 'error';

export default function VirtualRoomScreen({ navigation, route }: any) {
  const { topicId, topicTitle, ieltsPart, isFullTest } = route.params || {};
  const incomingFullTestAttemptIds = Array.isArray(route.params?.fullTestAttemptIds)
    ? route.params.fullTestAttemptIds
    : [];
  const { colors } = useThemeStore();
  const { modal, showConfirm, hideModal, showError } = useAppModal();
  const safeIeltsPart = ieltsPart || 'part1';
  const questionCount = QUESTION_COUNTS[safeIeltsPart] || 3;
  const maxRecordSecs = MAX_RECORD_SECONDS[safeIeltsPart] || 30;

  // State
  const [phase, setPhase] = useState<ExamPhase>('loading');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [allowRemove, setAllowRemove] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [metering, setMetering] = useState(-60);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordSecondsRef = useRef(0);
  const isStoppingRecordingRef = useRef(false);

  // Prep timer (Part 2)
  const [prepTime, setPrepTime] = useState(60);
  const prepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prepTimeRef = useRef(60);

  // Notes
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  // Speaking state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const isQuestionActiveRef = useRef(false);
  const initStartedRef = useRef(false);
  const isExamActiveRef = useRef(true);
  const isExitingRef = useRef(false);
  const isForegroundRef = useRef(AppState.currentState !== 'background');
  const isFocusedRef = useRef(true);
  const allowRemoveRef = useRef(false);
  const mediaTransitionRef = useRef(false);
  const speechFinishRef = useRef<(() => void) | null>(null);
  const delayedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backgroundSuspendTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uploadedPartCountRef = useRef(0);
  const uploadFailedRef = useRef(false);

  const canUseMedia = useCallback(
    () => isExamActiveRef.current && isForegroundRef.current && isFocusedRef.current,
    [],
  );

  // ──── Stop All Audio (TTS + native speech) ────
  const stopAllAudio = useCallback(async () => {
    Speech.stop();
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
    const finishSpeech = speechFinishRef.current;
    if (finishSpeech) {
      speechFinishRef.current = null;
      finishSpeech();
    }
    setIsSpeaking(false);
  }, []);

  const clearAllTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    if (prepTimerRef.current) {
      clearInterval(prepTimerRef.current);
      prepTimerRef.current = null;
    }
    if (delayedTimeoutRef.current) {
      clearTimeout(delayedTimeoutRef.current);
      delayedTimeoutRef.current = null;
    }
    if (backgroundSuspendTimeoutRef.current) {
      clearTimeout(backgroundSuspendTimeoutRef.current);
      backgroundSuspendTimeoutRef.current = null;
    }
  }, []);

  const cleanupRecording = useCallback(async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {}
      recordingRef.current = null;
    }
    isStoppingRecordingRef.current = false;
    recordSecondsRef.current = 0;
    prepTimeRef.current = 60;
    setIsRecording(false);
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
  }, []);

  const wait = useCallback((ms: number) => new Promise<void>((resolve) => {
    if (!isExamActiveRef.current) {
      resolve();
      return;
    }

    delayedTimeoutRef.current = setTimeout(() => {
      delayedTimeoutRef.current = null;
      resolve();
    }, ms);
  }), []);

  const exitExam = useCallback(async () => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    isExamActiveRef.current = false;
    isQuestionActiveRef.current = false;
    clearAllTimers();
    await stopAllAudio();
    await cleanupRecording();
  }, [cleanupRecording, clearAllTimers, stopAllAudio]);

  const suspendExam = useCallback(async (message: string) => {
    if (!isExamActiveRef.current || isExitingRef.current || allowRemoveRef.current) return;

    isExamActiveRef.current = false;
    isQuestionActiveRef.current = false;
    clearAllTimers();
    await stopAllAudio();
    await cleanupRecording();
    setLoadError(message);
    setPhase('error');
  }, [cleanupRecording, clearAllTimers, stopAllAudio]);

  // ──── Lifecycle ────
  useEffect(() => {
    allowRemoveRef.current = allowRemove;
  }, [allowRemove]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'background') {
        if (backgroundSuspendTimeoutRef.current) {
          clearTimeout(backgroundSuspendTimeoutRef.current);
        }
        const checkBackground = () => {
          backgroundSuspendTimeoutRef.current = null;
          if (AppState.currentState !== 'background') {
            isForegroundRef.current = true;
            return;
          }
          if (mediaTransitionRef.current) {
            backgroundSuspendTimeoutRef.current = setTimeout(checkBackground, BACKGROUND_SUSPEND_GRACE_MS);
            return;
          }
          isForegroundRef.current = false;
          suspendExam('The exam was paused because the app moved to the background. Please keep the app open and retry.');
        };
        backgroundSuspendTimeoutRef.current = setTimeout(checkBackground, BACKGROUND_SUSPEND_GRACE_MS);
        return;
      }

      if (backgroundSuspendTimeoutRef.current) {
        clearTimeout(backgroundSuspendTimeoutRef.current);
        backgroundSuspendTimeoutRef.current = null;
      }
      isForegroundRef.current = true;
    });

    return () => {
      if (backgroundSuspendTimeoutRef.current) {
        clearTimeout(backgroundSuspendTimeoutRef.current);
        backgroundSuspendTimeoutRef.current = null;
      }
      subscription.remove();
    };
  }, [suspendExam]);

  useFocusEffect(useCallback(() => {
    isFocusedRef.current = true;
    return () => {
      isFocusedRef.current = false;
      suspendExam('The exam was paused because you left the exam screen. Please retry when you are ready.');
    };
  }, [suspendExam]));

  useEffect(() => {
    if (!initStartedRef.current) {
      initStartedRef.current = true;
      initExam();
    }
    return () => {
      isExamActiveRef.current = false;
      stopAllAudio();
      clearAllTimers();
      cleanupRecording();
    };
  }, []);

  usePreventRemove(!allowRemove && phase !== 'complete' && phase !== 'error', ({ data }) => {
    showConfirm(
      'Leave Exam?',
      'Your progress will be lost. Do you want to quit this test?',
      async () => {
        await exitExam();
        allowRemoveRef.current = true;
        setAllowRemove(true);
        setTimeout(() => navigation.dispatch(data.action), 0);
      },
      { confirmText: 'Quit', cancelText: 'Stay', destructive: true }
    );
  });

  // ──── Init Exam ────
  const initExam = async () => {
    isExamActiveRef.current = true;
    isExitingRef.current = false;
    isForegroundRef.current = AppState.currentState !== 'background';
    isFocusedRef.current = true;
    isQuestionActiveRef.current = false;
    uploadedPartCountRef.current = 0;
    uploadFailedRef.current = false;
    allowRemoveRef.current = false;
    setAllowRemove(false);
    setPhase('loading');
    setLoadError(null);
    try {
      // 1. Create attempt
      const attempt = await practiceAPI.start({
        topic_id: topicId,
        ielts_part: safeIeltsPart,
      });
      if (!isExamActiveRef.current) return;
      setAttemptId(attempt.attempt_id);

      // 2. Generate questions
      const resolvedTopicId = attempt.question?.topic_id || topicId;
      const { questions: qs } = await practiceAPI.generateQuestions(safeIeltsPart, questionCount, resolvedTopicId);
      if (!isExamActiveRef.current) return;

      // Use the first question from start if generateQuestions returned fewer
      const allQuestions = qs.length >= questionCount ? qs : [
        {
          id: attempt.question?.id,
          question_text: attempt.question?.question_text,
          cue_card_content: attempt.question?.cue_card_content,
          ielts_part: safeIeltsPart,
        },
        ...qs.slice(0, questionCount - 1),
      ];

      setQuestions(allQuestions.slice(0, questionCount));
      setPhase('intro');

      // 3. AI intro
      const introText = getIntroText();
      await speakAndWait(introText);
      if (!isExamActiveRef.current) return;

      // 4. Ask first question
      askQuestion(0, allQuestions.slice(0, questionCount));
    } catch (err) {
      if (!isExamActiveRef.current) return;
      console.log('[VirtualRoom] Init failed:', err);
      setQuestions([]);
      setAttemptId(null);
      setLoadError('Could not prepare the exam. Please check that the backend has active topics and questions for this part.');
      setPhase('error');
    }
  };

  // ──── Speak & Wait ────
  const speakAndWait = (text: string): Promise<void> => {
    return new Promise(async (resolve) => {
      const speechText = text.trim();
      await stopAllAudio();
      if (!speechText || !canUseMedia()) {
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
        if (isExamActiveRef.current) {
          setIsSpeaking(false);
        }
        resolve();
      };

      speechFinishRef.current = finish;
      setIsSpeaking(true);

      try {
        if (!canUseMedia()) {
          finish();
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        if (!canUseMedia()) {
          finish();
          return;
        }

        const url = practiceAPI.getTTSUrl(speechText);
        let didTimeout = false;
        let loadTimeout: ReturnType<typeof setTimeout> | null = null;
        const soundPromise = Audio.Sound.createAsync({ uri: url }, { shouldPlay: false, volume: 1.0 });
        soundPromise
          .then(({ sound }) => {
            if (didTimeout) {
              sound.unloadAsync().catch(() => {});
            }
          })
          .catch(() => {});
        const { sound } = await Promise.race([
          soundPromise,
          new Promise<never>((_, reject) => {
            loadTimeout = setTimeout(() => {
              didTimeout = true;
              reject(new Error('TTS load timeout'));
            }, TTS_LOAD_TIMEOUT_MS);
          }),
        ]).finally(() => {
          if (loadTimeout) clearTimeout(loadTimeout);
        });

        if (resolved || !canUseMedia()) {
          sound.unloadAsync().catch(() => {});
          finish();
          return;
        }

        soundRef.current = sound;
        timeout = setTimeout(async () => {
          if (soundRef.current === sound) {
            try {
              await sound.stopAsync();
              await sound.unloadAsync();
            } catch {}
            soundRef.current = null;
          }
          finish();
        }, getSpeechSafetyTimeout(speechText));

        sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.setOnPlaybackStatusUpdate(null);
            (async () => {
              try {
                await sound.unloadAsync();
              } catch {}
              if (soundRef.current === sound) {
                soundRef.current = null;
              }
              finish();
            })();
          }
        });
        if (!canUseMedia()) {
          sound.unloadAsync().catch(() => {});
          soundRef.current = null;
          finish();
          return;
        }
        await sound.playAsync();
      } catch (err) {
        if (!canUseMedia()) {
          finish();
          return;
        }
        if (shouldSkipNativeTTSFallback(err)) {
          console.log('[TTS] Backend TTS unavailable; native fallback skipped:', err);
          finish();
          return;
        }
        console.log('[TTS] Backend TTS failed, falling back to native:', err);
        if (soundRef.current) {
          try {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
          } catch {}
        }
        soundRef.current = null;
        if (resolved || !canUseMedia()) {
          finish();
          return;
        }
        
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          Speech.stop();
          finish();
        }, getSpeechSafetyTimeout(speechText));

        // Fallback to native speech if network TTS fails
        try {
          const voices = await Speech.getAvailableVoicesAsync();
          if (!canUseMedia()) {
            finish();
            return;
          }
          const bestVoice = voices.find(v =>
            v.language.startsWith('en') &&
            (v.quality === Speech.VoiceQuality.Enhanced || v.name.includes('network'))
          ) || voices.find(v => v.language.startsWith('en'));

          Speech.speak(speechText, {
            language: 'en-US',
            voice: bestVoice?.identifier,
            rate: 0.95,
            pitch: 1.0,
            onDone: finish,
            onError: finish,
            onStopped: finish,
          });
        } catch {
          finish();
        }
      }
    });
  };

  // ──── Ask Question ────
  const askQuestion = async (idx: number, qs: any[]) => {
    if (!canUseMedia()) return;
    // Guard against duplicate calls for the same question
    if (isQuestionActiveRef.current) return;
    isQuestionActiveRef.current = true;

    setCurrentIdx(idx);
    setPhase('asking');
    const q = qs[idx];
    if (!q) { isQuestionActiveRef.current = false; return; }

    await speakAndWait(q.question_text);
    if (!canUseMedia()) {
      isQuestionActiveRef.current = false;
      return;
    }

    // Part 2: start prep timer
    if (safeIeltsPart === 'part2') {
      setPhase('prep');
      prepTimeRef.current = 60;
      setPrepTime(60);
      startPrepTimer();
    } else {
      // Part 1 & 3: brief pause then auto-start recording
      await wait(1200);
      if (!canUseMedia()) {
        isQuestionActiveRef.current = false;
        return;
      }
      await startRecording();
    }
    isQuestionActiveRef.current = false;
  };

  // ──── Prep Timer (Part 2) ────
  const startPrepTimer = () => {
    if (!canUseMedia()) return;
    prepTimeRef.current = 60;
    prepTimerRef.current = setInterval(() => {
      if (!canUseMedia()) {
        if (prepTimerRef.current) clearInterval(prepTimerRef.current);
        prepTimerRef.current = null;
        return;
      }

      const next = Math.max(0, prepTimeRef.current - 1);
      prepTimeRef.current = next;
      setPrepTime(next);

      if (next === 0) {
        if (prepTimerRef.current) clearInterval(prepTimerRef.current);
        prepTimerRef.current = null;
        setTimeout(() => {
          startRecording();
        }, 0);
      }
    }, 1000);
  };

  // ──── Recording ────
  const startRecording = async () => {
    if (!canUseMedia()) return false;
    mediaTransitionRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    recordSecondsRef.current = 0;
    setPhase('recording');
    setRecordSeconds(0);

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      await wait(200);
      if (!canUseMedia()) return false;

      const { granted } = await Audio.requestPermissionsAsync();
      if (!canUseMedia()) return false;
      if (!granted) {
        showError('Permission Required', 'Microphone access is needed.');
        setLoadError('Microphone permission was not granted, so this answer cannot be recorded or scored.');
        setPhase('error');
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
      if (!canUseMedia()) return false;

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (canUseMedia() && status.isRecording && status.metering !== undefined) setMetering(status.metering);
        },
        100,
      );

      if (!canUseMedia()) {
        try { await recording.stopAndUnloadAsync(); } catch {}
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
        return false;
      }

      recordingRef.current = recording;
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        if (!canUseMedia()) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return;
        }

        const next = Math.min(maxRecordSecs, recordSecondsRef.current + 1);
        recordSecondsRef.current = next;
        setRecordSeconds(next);

        if (next >= maxRecordSecs) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          if (!autoStopTimeoutRef.current) {
            autoStopTimeoutRef.current = setTimeout(() => {
              autoStopTimeoutRef.current = null;
              stopRecording();
            }, 0);
          }
        }
      }, 1000);
      return true;

    } catch (error) {
      if (!canUseMedia()) return false;
      console.error('Recording start failed:', error);
      setLoadError('Could not start the microphone. Please retry the exam.');
      setPhase('error');
      return false;
    } finally {
      mediaTransitionRef.current = false;
    }
  };

  const uploadRecordedAnswer = async (uri: string, questionIndex: number) => {
    if (!canUseMedia()) {
      throw new Error('Screen is no longer active for audio upload');
    }

    if (!attemptId) {
      throw new Error('Attempt is not ready');
    }

    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'audio/m4a',
      name: `recording_${attemptId}_q${questionIndex + 1}.m4a`,
    } as any);

    const questionId = questions[questionIndex]?.id;
    await practiceAPI.uploadAudio(attemptId, formData, questionIndex + 1, questionId);
    uploadedPartCountRef.current += 1;
  };

  const handleUploadFailure = (error: any) => {
    console.log('Upload error message:', error?.message || error);
    console.log('Upload API base URL:', error?.apiBaseUrl || practiceAPI.getDiagnostics().baseURL);
    if (error?.response) {
      console.log('Upload error response data:', JSON.stringify(error.response.data));
      console.log('Upload error response status:', error.response.status);
    }
    uploadFailedRef.current = true;
    if (isExamActiveRef.current) {
      showError('Upload Failed', 'Your recording could not be uploaded, so this answer cannot be scored.');
      setLoadError(`Upload failed (${error?.response?.status || 'network'}). Please retry the exam.`);
      setPhase('error');
    }
  };

  const stopRecording = async () => {
    if (!isExamActiveRef.current) return;
    if (isStoppingRecordingRef.current) return;
    isStoppingRecordingRef.current = true;
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }

    const recording = recordingRef.current;
    if (!recording) {
      setIsRecording(false);
      isStoppingRecordingRef.current = false;
      setLoadError('No recording was captured, so this answer cannot be scored. Please retry the exam.');
      setPhase('error');
      return;
    }

    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      setPhase('saving');
      recordingRef.current = null;
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recording.getURI();
      if (!isExamActiveRef.current) return;

      // Upload audio — MUST await so file is on server before scoring
      if (!uri || !attemptId) {
        setLoadError('No recording file was produced, so this answer cannot be scored. Please retry the exam.');
        setPhase('error');
        isStoppingRecordingRef.current = false;
        return;
      }

      const uploadPromise = uploadRecordedAnswer(uri, currentIdx);
      isStoppingRecordingRef.current = false;
      if (isExamActiveRef.current) await handleNextOrFinish(uploadPromise);
      return;
    } catch (e) {
      console.error('Stop recording error:', e);
      recordingRef.current = null;
      setLoadError('Could not finish saving your recording. Please retry the exam.');
      setPhase('error');
      isStoppingRecordingRef.current = false;
      return;
    }

    isStoppingRecordingRef.current = false;
  };

  // ──── Next Question or Finish ────
  const getPartCompletionText = () => {
    if (isFullTest && safeIeltsPart === 'part1') {
      return "That is the end of Part 1. Now let's move on to Part 2.";
    }
    if (isFullTest && safeIeltsPart === 'part2') {
      return "That is the end of Part 2. Now let's move on to Part 3.";
    }
    return FILLERS_DONE[Math.floor(Math.random() * FILLERS_DONE.length)];
  };

  const handleNextOrFinish = async (uploadPromise?: Promise<void>) => {
    if (!canUseMedia()) return;
    const uploadResult = uploadPromise
      ?.then(() => null)
      .catch((error) => error);
    const nextIdx = currentIdx + 1;

    if (nextIdx >= questions.length) {
      // All questions done
      setPhase('transition');
      const doneText = getPartCompletionText();
      await speakAndWait(doneText);
      if (!canUseMedia()) return;
      const uploadError = await uploadResult;
      if (uploadError) {
        handleUploadFailure(uploadError);
        return;
      }
      finishExam();
    } else {
      // Transition filler
      setPhase('transition');
      const filler = FILLERS_NEXT[Math.floor(Math.random() * FILLERS_NEXT.length)];
      await speakAndWait(filler);
      if (!canUseMedia()) return;
      const uploadError = await uploadResult;
      if (uploadError) {
        handleUploadFailure(uploadError);
        return;
      }
      if (!canUseMedia()) return;
      askQuestion(nextIdx, questions);
    }
  };

  // ──── Finish Exam ────
  const finishExam = async () => {
    if (!canUseMedia()) return;
    setPhase('complete');
    allowRemoveRef.current = true;
    setAllowRemove(true);

    if (!attemptId || uploadedPartCountRef.current === 0 || uploadFailedRef.current) {
      setLoadError('No recorded answer was uploaded, so there is nothing to score. Please retry the exam.');
      setPhase('error');
      return;
    }

    try {
      await practiceAPI.submit(attemptId, {
        waitForResult: false,
        timeoutSeconds: 5,
      });
    } catch (e) {
      console.log('Submit delayed or failed, opening result screen for recovery:', e);
    }

    if (!canUseMedia()) return;
    isExamActiveRef.current = false;

    if (isFullTest && safeIeltsPart !== 'part3') {
      const nextPart = safeIeltsPart === 'part1' ? 'part2' : 'part3';
      const resolvedTopicId = attemptId && questions[0] ? questions[0].topic_id || topicId : topicId;
      navigation.replace('VirtualRoom', {
        topicId: resolvedTopicId,
        topicTitle,
        ieltsPart: nextPart,
        isFullTest: true,
        fullTestAttemptIds: [...incomingFullTestAttemptIds, attemptId],
      });
    } else {
      const fullTestAttemptIds = isFullTest
        ? [...incomingFullTestAttemptIds, attemptId]
        : undefined;
      navigation.replace('Results', {
        attemptId,
        fullTestAttemptIds,
        ieltsPart: safeIeltsPart,
        topicTitle,
        duration: recordSecondsRef.current || recordSeconds,
        submitPending: true,
      });
    }
  };

  const getIntroText = () => {
    if (safeIeltsPart === 'part1') return "Welcome to the IELTS Speaking test. This is Part 1. I'm going to ask you some questions about familiar topics. Let's begin.";
    if (safeIeltsPart === 'part2') return "Now let's move on to Part 2. I'm going to give you a topic and you'll have one minute to prepare, then you'll need to speak for one to two minutes.";
    return "Now let's move on to Part 3. In this part, I'll ask you some more abstract questions related to the topic.";
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // ──── Derived ────
  const currentQuestion = questions[currentIdx];
  let cueCard = null;
  if (currentQuestion?.cue_card_content) {
    const raw = currentQuestion.cue_card_content;
    if (typeof raw === 'object') cueCard = raw;
    else if (typeof raw === 'string') {
      try { cueCard = JSON.parse(raw); } catch { cueCard = { prompt: raw, points: [] }; }
    }
  }

  const normalizedLevel = Math.max(0, (metering + 60) / 60);
  const displayTitle = isFullTest ? 'Full Mock Test' : `${safeIeltsPart.replace('part', 'Part ')}`;

  // ──── Render ────
  if (phase === 'loading') {
    return (
      <AppBackground>
        <SafeAreaView style={styles.safe}>
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[Typography.bodyMedium, { color: colors.textSecondary, marginTop: 16 }]}>
              Preparing your exam...
            </Text>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  if (phase === 'error') {
    return (
      <AppBackground>
        <SafeAreaView style={styles.safe}>
          <View style={[styles.container, { justifyContent: 'center', padding: 24 }]}>
            <View style={[styles.errorCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <Ionicons name="alert-circle-outline" size={34} color={colors.error} />
              <Text style={[Typography.h3, { color: colors.textPrimary, textAlign: 'center' }]}>
                Exam unavailable
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary, textAlign: 'center', lineHeight: 20 }]}>
                {loadError}
              </Text>
              <View style={styles.errorActions}>
                <OutlineButton
                  title="Go Back"
                  onPress={async () => {
                    await exitExam();
                    allowRemoveRef.current = true;
                    setAllowRemove(true);
                    setTimeout(() => navigation.goBack(), 0);
                  }}
                />
                <TouchableOpacity
                  style={[styles.retryExamBtn, { backgroundColor: colors.accent }]}
                  onPress={async () => {
                    await exitExam();
                    initExam();
                  }}
                >
                  <Text style={styles.retryExamText}>Retry</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
        {/* Header */}
        <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
          onPress={() => {
            showConfirm('Leave Exam?', 'Your progress will be lost. Do you want to quit this test?', async () => {
                    await exitExam();
                    allowRemoveRef.current = true;
                    setAllowRemove(true);
              setTimeout(() => navigation.goBack(), 0);
            }, { confirmText: 'Quit', cancelText: 'Stay', destructive: true });
          }}
        >
          <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[Typography.bodyMedium, { color: colors.textPrimary, flex: 1, textAlign: 'center' }]} numberOfLines={1}>
          {displayTitle}
        </Text>
        <View style={{ width: 36 }} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressRow}>
        {questions.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              {
                backgroundColor: i < currentIdx ? colors.accent : i === currentIdx ? colors.accentLight : colors.bgInput,
                flex: 1,
              },
            ]}
          />
        ))}
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* AI Examiner Avatar */}
        <LinearGradient colors={Gradients.primary} style={styles.examinerAvatar}>
          <MascotIcon mood={isSpeaking ? 'closedEyes' : 'idle'} size={58} />
        </LinearGradient>

        {/* Phase indicator */}
        <Text style={[Typography.caption, {
          color: phase === 'recording' ? colors.rose : colors.accent,
          textAlign: 'center', marginBottom: 8, textTransform: 'uppercase',
          letterSpacing: 1, fontWeight: '700',
        }]}>
          {phase === 'intro' || phase === 'asking' ? 'Examiner Speaking...'
            : phase === 'prep' ? `Preparation Time - ${formatTime(prepTime)}`
            : phase === 'recording' ? `Recording - Q${currentIdx + 1}/${questions.length}`
            : phase === 'saving' ? 'Saving Answer...'
            : phase === 'transition' ? 'Transitioning...'
            : phase === 'complete' ? 'Exam Complete' : ''}
        </Text>

        {/* Question Card */}
        {currentQuestion && (
          <Card style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={[Typography.captionSm, { color: colors.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }]}>
                Question {currentIdx + 1} of {questions.length}
              </Text>
              <TouchableOpacity
                disabled={phase === 'recording' || isSpeaking}
                onPress={() => {
                  if (phase !== 'recording' && !isSpeaking) speakAndWait(currentQuestion.question_text);
                }}
              >
                <Ionicons
                  name={isSpeaking ? "volume-high" : "volume-medium"}
                  size={20}
                  color={phase === 'recording' ? colors.textMuted : isSpeaking ? colors.accent : colors.textMuted}
                />
              </TouchableOpacity>
            </View>
            <Text style={[Typography.body, { color: colors.textPrimary, lineHeight: 22 }]}>
              {currentQuestion.question_text}
            </Text>
          </Card>
        )}

        {/* Cue Card (Part 2) */}
        {cueCard && (
          <View style={[styles.cueCard, { backgroundColor: colors.accentBg, borderColor: colors.borderAccent }]}>
            <Text style={[Typography.label, { color: colors.accent, marginBottom: 6 }]}>Cue Card</Text>
            <Text style={[Typography.bodySm, { color: colors.textSecondary, marginBottom: 6 }]}>
              {cueCard.prompt || 'You should say:'}
            </Text>
            {(cueCard.points || []).map((point: string, i: number) => (
              <View key={i} style={styles.cuePoint}>
                <Text style={[Typography.bodySm, { color: colors.accent, fontWeight: '700' }]}>•</Text>
                <Text style={[Typography.bodySm, { color: colors.textSecondary }]}>{point}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {showNotes && (
          <View style={[styles.noteContainer, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
            <View style={styles.noteHeader}>
              <Text style={[Typography.label, { color: colors.textSecondary }]}>Your Notes</Text>
              <TouchableOpacity onPress={() => setShowNotes(false)}>
                <Ionicons name="close" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.noteInput, { color: colors.textPrimary }]}
              placeholder="Jot down your ideas..."
              placeholderTextColor={colors.textMuted}
              multiline textAlignVertical="top"
              value={notes} onChangeText={setNotes}
            />
          </View>
        )}

        {/* Recording Waveform */}
        {phase === 'recording' && (
          <View style={styles.recordingSection}>
            <View style={styles.waveform}>
              {Array.from({ length: 25 }, (_, i) => {
                const center = 12;
                const dist = Math.abs(i - center) / center;
                const h = 8 + normalizedLevel * 30 * (1 - dist * 0.7) + Math.sin(Date.now() / 200 + i * 0.5) * 3;
                return (
                  <View key={i} style={[styles.waveBar, {
                    height: Math.max(4, h),
                    backgroundColor: colors.rose,
                    opacity: 0.4 + normalizedLevel * 0.4,
                  }]} />
                );
              })}
            </View>
            <Text style={[styles.timerText, { color: colors.rose }]}>
              {formatTime(recordSeconds)} / {formatTime(maxRecordSecs)}
            </Text>
          </View>
        )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actions}>
        {(phase === 'prep' || phase === 'asking') && (
          <OutlineButton
            title={showNotes ? 'Hide Notes' : 'Notes'}
            icon="create"
            onPress={() => setShowNotes(!showNotes)}
            style={{ flex: 1 }}
          />
        )}

        {phase === 'prep' && (
          <TouchableOpacity style={{ flex: 1 }} onPress={() => {
            if (prepTimerRef.current) {
              clearInterval(prepTimerRef.current);
              prepTimerRef.current = null;
            }
            prepTimeRef.current = 0;
            startRecording();
          }}>
            <LinearGradient colors={['#F43F5E', '#E11D48']} style={styles.recordBtn}>
              <Ionicons name="mic" size={18} color="#fff" />
              <Text style={[Typography.button, { color: '#fff' }]}>Skip Prep & Record</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {phase === 'recording' && (
          <TouchableOpacity style={{ flex: 1 }} onPress={stopRecording}>
            <LinearGradient colors={['#F43F5E', '#E11D48']} style={styles.recordBtn}>
              <Ionicons name="stop" size={18} color="#fff" />
              <Text style={[Typography.button, { color: '#fff' }]}>
                Stop Recording
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        </View>

        <AppModal config={modal} onDismiss={hideModal} />
        </View>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  progressRow: {
    flexDirection: 'row', gap: 4, paddingHorizontal: 20, marginBottom: 6,
  },
  progressDot: { height: 4, borderRadius: 2 },
  errorCard: { borderRadius: 18, borderWidth: 1, padding: 22, alignItems: 'center', gap: 12 },
  errorActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  retryExamBtn: { minWidth: 104, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  retryExamText: { fontFamily: 'PlusJakartaSans-Bold', color: '#fff', fontSize: 14 },
  content: { padding: 20, paddingTop: 0, paddingBottom: 20 },
  examinerAvatar: {
    width: 80, height: 80, borderRadius: 40,
    alignSelf: 'center', alignItems: 'center', justifyContent: 'center',
    marginVertical: 10,
    shadowColor: '#F6D85F', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
  },
  cueCard: { borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1 },
  cuePoint: { flexDirection: 'row', gap: 8, paddingLeft: 4, marginTop: 5 },
  noteContainer: {
    borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, minHeight: 100,
  },
  noteHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  noteInput: { flex: 1, fontSize: 15, lineHeight: 22, minHeight: 60 },
  recordingSection: { alignItems: 'center', paddingVertical: 10 },
  waveform: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 3, height: 50, marginBottom: 8,
  },
  waveBar: { width: 4, borderRadius: 2 },
  timerText: { fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
  actions: {
    flexDirection: 'row', gap: 12, padding: 20, paddingBottom: 100,
  },
  recordBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14,
  },
});
