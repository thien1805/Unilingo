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
  TextInput, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat,
  withSequence, withTiming, Easing,
} from 'react-native-reanimated';
import { useThemeStore } from '../../store/themeStore';
import { practiceAPI } from '../../api/practice';
import { Card, OutlineButton } from '../../components/common';
import { AppModal, useAppModal } from '../../components/common/AppModal';
import { Gradients, Typography } from '../../theme';

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

type ExamPhase =
  | 'loading'
  | 'intro'
  | 'asking'
  | 'prep'        // Part 2 only
  | 'recording'
  | 'transition'
  | 'complete'
  | 'error';

export default function VirtualRoomScreen({ navigation, route }: any) {
  const { topicId, topicTitle, ieltsPart, isFullTest } = route.params || {};
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

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [metering, setMetering] = useState(-60);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Prep timer (Part 2)
  const [prepTime, setPrepTime] = useState(60);
  const prepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Notes
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  // Speaking state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const isQuestionActiveRef = useRef(false);

  // Animation
  const pulseScale = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

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
    setIsSpeaking(false);
  }, []);

  // ──── Lifecycle ────
  useEffect(() => {
    initExam();
    return () => {
      stopAllAudio();
      clearAllTimers();
      cleanupRecording();
    };
  }, []);

  // ──── Intercept back gesture / hardware back ────
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      // Allow programmatic navigation (replace, goBack after confirm)
      if (e.data.action.type === 'REPLACE') return;

      e.preventDefault();
      showConfirm(
        'Leave Exam?',
        'Your progress will be lost. Do you want to quit this test?',
        async () => {
          await stopAllAudio();
          clearAllTimers();
          await cleanupRecording();
          navigation.dispatch(e.data.action);
        },
        { confirmText: 'Quit', cancelText: 'Stay', destructive: true }
      );
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (isRecording) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 700, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        ), -1,
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [isRecording]);

  // ──── Init Exam ────
  const initExam = async () => {
    setPhase('loading');
    setLoadError(null);
    try {
      // 1. Create attempt
      const attempt = await practiceAPI.start({
        topic_id: topicId,
        ielts_part: safeIeltsPart,
      });
      setAttemptId(attempt.attempt_id);

      // 2. Generate questions
      const resolvedTopicId = attempt.question?.topic_id || topicId;
      const { questions: qs } = await practiceAPI.generateQuestions(safeIeltsPart, questionCount, resolvedTopicId);

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

      // 4. Ask first question
      askQuestion(0, allQuestions.slice(0, questionCount));
    } catch (err) {
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
      await stopAllAudio();
      setIsSpeaking(true);
      
      try {
        // Prepare Audio mode for playback
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });

        const url = practiceAPI.getTTSUrl(text);
        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true }
        );
        soundRef.current = sound;

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
            soundRef.current = null;
            setIsSpeaking(false);
            resolve();
          }
        });
      } catch (err) {
        console.log('[TTS] Backend TTS failed, falling back to native:', err);
        soundRef.current = null;
        // Fallback to native speech if network TTS fails
        try {
          const voices = await Speech.getAvailableVoicesAsync();
          const bestVoice = voices.find(v =>
            v.language.startsWith('en') &&
            (v.quality === Speech.VoiceQuality.Enhanced || v.name.includes('network'))
          ) || voices.find(v => v.language.startsWith('en'));

          Speech.speak(text, {
            language: 'en-US',
            voice: bestVoice?.identifier,
            rate: 0.95,
            pitch: 1.0,
            onDone: () => { setIsSpeaking(false); resolve(); },
            onError: () => { setIsSpeaking(false); resolve(); },
          });
        } catch {
          setIsSpeaking(false);
          resolve();
        }
      }
    });
  };

  // ──── Ask Question ────
  const askQuestion = async (idx: number, qs: any[]) => {
    // Guard against duplicate calls for the same question
    if (isQuestionActiveRef.current) return;
    isQuestionActiveRef.current = true;

    setCurrentIdx(idx);
    setPhase('asking');
    const q = qs[idx];
    if (!q) { isQuestionActiveRef.current = false; return; }

    await speakAndWait(q.question_text);

    // Part 2: start prep timer
    if (safeIeltsPart === 'part2') {
      setPhase('prep');
      setPrepTime(60);
      startPrepTimer();
    } else {
      // Part 1 & 3: brief pause then auto-start recording
      await new Promise(r => setTimeout(r, 1200));
      startRecording();
    }
    isQuestionActiveRef.current = false;
  };

  // ──── Prep Timer (Part 2) ────
  const startPrepTimer = () => {
    prepTimerRef.current = setInterval(() => {
      setPrepTime(t => {
        if (t <= 1) {
          if (prepTimerRef.current) clearInterval(prepTimerRef.current);
          startRecording();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  // ──── Recording ────
  const startRecording = async () => {
    setPhase('recording');
    setRecordSeconds(0);

    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      await new Promise(r => setTimeout(r, 200));

      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        showError('Permission Required', 'Microphone access is needed.');
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording } = await Audio.Recording.createAsync(
        {
          android: { extension: '.m4a', outputFormat: Audio.AndroidOutputFormat.MPEG_4, audioEncoder: Audio.AndroidAudioEncoder.AAC, sampleRate: 44100, numberOfChannels: 1, bitRate: 128000 },
          ios: { extension: '.m4a', outputFormat: Audio.IOSOutputFormat.MPEG4AAC, audioQuality: Audio.IOSAudioQuality.HIGH, sampleRate: 44100, numberOfChannels: 1, bitRate: 128000 },
          web: { mimeType: 'audio/webm', bitsPerSecond: 128000 },
        },
        (status) => {
          if (status.isRecording && status.metering !== undefined) setMetering(status.metering);
        },
        100,
      );

      recordingRef.current = recording;
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordSeconds(s => {
          if (s >= maxRecordSecs - 1) {
            stopRecording();
            return s;
          }
          return s + 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Recording start failed:', error);
      setPhase('transition');
      handleNextOrFinish();
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      // Upload audio — MUST await so file is on server before scoring
      if (uri && attemptId) {
        const formData = new FormData();
        formData.append('file', {
          uri,
          type: 'audio/m4a',
          name: `recording_${attemptId}_q${currentIdx + 1}.m4a`,
        } as any);
        try {
          const questionId = questions[currentIdx]?.id;
          await practiceAPI.uploadAudio(attemptId, formData, currentIdx + 1, questionId);
        } catch (e: any) {
          console.log('Upload error:', e?.message);
        }
      }
    } catch (e) {
      console.error('Stop recording error:', e);
      recordingRef.current = null;
    }

    handleNextOrFinish();
  };

  // ──── Next Question or Finish ────
  const handleNextOrFinish = async () => {
    const nextIdx = currentIdx + 1;

    if (nextIdx >= questions.length) {
      // All questions done
      setPhase('transition');
      const doneText = FILLERS_DONE[Math.floor(Math.random() * FILLERS_DONE.length)];
      await speakAndWait(doneText);
      finishExam();
    } else {
      // Transition filler
      setPhase('transition');
      const filler = FILLERS_NEXT[Math.floor(Math.random() * FILLERS_NEXT.length)];
      await speakAndWait(filler);
      askQuestion(nextIdx, questions);
    }
  };

  // ──── Finish Exam ────
  const finishExam = async () => {
    setPhase('complete');

    // Submit for scoring
    if (attemptId) {
      try {
        await practiceAPI.submit(attemptId);
      } catch (e) {
        console.log('Submit error:', e);
      }
    }

    // Navigate to results
    if (!attemptId) {
      setLoadError('The practice attempt could not be submitted. Please retry the exam.');
      setPhase('error');
      return;
    }

    if (isFullTest && safeIeltsPart !== 'part3') {
      const nextPart = safeIeltsPart === 'part1' ? 'part2' : 'part3';
      const resolvedTopicId = attemptId && questions[0] ? questions[0].topic_id || topicId : topicId;
      navigation.replace('VirtualRoom', {
        topicId: resolvedTopicId,
        topicTitle,
        ieltsPart: nextPart,
        isFullTest: true,
      });
    } else {
      navigation.replace('Results', {
        attemptId,
        ieltsPart: safeIeltsPart,
        topicTitle,
        duration: recordSeconds,
      });
    }
  };

  // ──── Helpers ────
  const clearAllTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
  };

  const cleanupRecording = async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {}
      recordingRef.current = null;
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
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
      <View style={[styles.container, { backgroundColor: colors.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[Typography.bodyMedium, { color: colors.textSecondary, marginTop: 16 }]}>
          Preparing your exam...
        </Text>
      </View>
    );
  }

  if (phase === 'error') {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPrimary, justifyContent: 'center', padding: 24 }]}>
        <View style={[styles.errorCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Ionicons name="alert-circle-outline" size={34} color={colors.error} />
          <Text style={[Typography.h3, { color: colors.textPrimary, textAlign: 'center' }]}>
            Exam unavailable
          </Text>
          <Text style={[Typography.caption, { color: colors.textSecondary, textAlign: 'center', lineHeight: 20 }]}>
            {loadError}
          </Text>
          <View style={styles.errorActions}>
            <OutlineButton title="Go Back" onPress={() => navigation.goBack()} />
            <TouchableOpacity style={[styles.retryExamBtn, { backgroundColor: colors.accent }]} onPress={initExam}>
              <Text style={styles.retryExamText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
          onPress={() => {
            showConfirm('Leave Exam?', 'Your progress will be lost. Do you want to quit this test?', async () => {
              await stopAllAudio();
              clearAllTimers();
              await cleanupRecording();
              navigation.goBack();
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
          <Text style={{ fontSize: 42 }}>{isSpeaking ? '🗣️' : '🤖'}</Text>
        </LinearGradient>

        {/* Phase indicator */}
        <Text style={[Typography.caption, {
          color: phase === 'recording' ? colors.rose : colors.accent,
          textAlign: 'center', marginBottom: 8, textTransform: 'uppercase',
          letterSpacing: 1, fontWeight: '700',
        }]}>
          {phase === 'intro' || phase === 'asking' ? '🎧 Examiner Speaking...'
            : phase === 'prep' ? `📝 Preparation Time — ${formatTime(prepTime)}`
            : phase === 'recording' ? `🔴 Recording — Q${currentIdx + 1}/${questions.length}`
            : phase === 'transition' ? '💬 Transitioning...'
            : phase === 'complete' ? '✅ Exam Complete' : ''}
        </Text>

        {/* Question Card */}
        {currentQuestion && (
          <Card style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={[Typography.captionSm, { color: colors.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }]}>
                Question {currentIdx + 1} of {questions.length}
              </Text>
              <TouchableOpacity onPress={() => speakAndWait(currentQuestion.question_text)}>
                <Ionicons name={isSpeaking ? "volume-high" : "volume-medium"} size={20} color={isSpeaking ? colors.accent : colors.textMuted} />
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
            <Text style={[Typography.label, { color: colors.accent, marginBottom: 6 }]}>📋 Cue Card</Text>
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
              <Text style={[Typography.label, { color: colors.textSecondary }]}>📝 Your Notes</Text>
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
            if (prepTimerRef.current) clearInterval(prepTimerRef.current);
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
              <Animated.View style={pulseStyle}>
                <Ionicons name="stop" size={18} color="#fff" />
              </Animated.View>
              <Text style={[Typography.button, { color: '#fff' }]}>
                Stop Recording
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      <AppModal config={modal} onDismiss={hideModal} />
    </View>
  );
}

const styles = StyleSheet.create({
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
    shadowColor: '#3350B2', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
  },
  cueCard: { borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1 },
  cuePoint: { flexDirection: 'row', gap: 8, paddingLeft: 4, marginTop: 5 },
  noteContainer: {
    borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, minHeight: 100,
  },
  noteHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)',
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
