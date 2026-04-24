/**
 * Recording Screen — Real audio recording with expo-av + waveform & timer
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useThemeStore } from '../../store/themeStore';
import { practiceAPI } from '../../api/practice';
import { Card } from '../../components/common';
import { Typography, Gradients } from '../../theme';

export default function RecordingScreen({ navigation, route }: any) {
  const { attemptId, question, ieltsPart, topicTitle } = route.params;
  const { colors } = useThemeStore();

  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [metering, setMetering] = useState(-60);
  const maxSeconds = ieltsPart === 'part2' ? 120 : 180;

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Animated recording pulse
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    startRecording();
    return () => {
      stopAndCleanup();
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s >= maxSeconds) {
            handleStop();
            return s;
          }
          return s + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  // Pulse animation when recording
  useEffect(() => {
    if (isRecording && !isPaused) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [isRecording, isPaused]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const startRecording = async () => {
    try {
      // Request permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Microphone access is needed to record your speaking practice.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        {
          android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
          },
          ios: {
            extension: '.m4a',
            outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
          },
          web: {
            mimeType: 'audio/webm',
            bitsPerSecond: 128000,
          },
        },
        (status) => {
          // Metering callback for waveform visualization
          if (status.isRecording && status.metering !== undefined) {
            setMetering(status.metering);
          }
        },
        100 // Update every 100ms
      );

      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  const stopAndCleanup = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      if (recordingRef.current) {
        const status = await recordingRef.current.getStatusAsync();
        if (status.isRecording) {
          await recordingRef.current.stopAndUnloadAsync();
        }
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch {}
  };

  const handlePauseResume = async () => {
    if (!recordingRef.current) return;
    try {
      if (isPaused) {
        await recordingRef.current.startAsync();
        setIsPaused(false);
      } else {
        await recordingRef.current.pauseAsync();
        setIsPaused(true);
      }
    } catch {
      // Pause/resume may not be supported on all platforms
      setIsPaused(!isPaused);
    }
  };

  const handleStop = useCallback(async () => {
    if (!recordingRef.current) {
      // No recording — navigate with mock
      navigation.replace('Results', { attemptId, ieltsPart, topicTitle, duration: seconds });
      return;
    }

    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recordingRef.current.getURI();

      if (uri && attemptId) {
        // Upload audio to backend
        try {
          const formData = new FormData();
          formData.append('file', {
            uri,
            type: 'audio/m4a',
            name: `recording_${attemptId}.m4a`,
          } as any);

          await practiceAPI.uploadAudio(attemptId, formData);
          await practiceAPI.submit(attemptId);
        } catch (uploadError) {
          console.log('Upload failed, showing mock results:', uploadError);
        }
      }

      navigation.replace('Results', {
        attemptId,
        ieltsPart,
        topicTitle,
        duration: seconds,
        audioUri: uri,
      });
    } catch (error) {
      console.error('Stop recording error:', error);
      navigation.replace('Results', { attemptId, ieltsPart, topicTitle, duration: seconds });
    }
  }, [seconds, attemptId, ieltsPart, topicTitle]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = seconds / maxSeconds;

  // Generate waveform bars based on real metering data
  const normalizedLevel = Math.max(0, (metering + 60) / 60); // -60dB to 0dB → 0 to 1
  const waveformBars = Array.from({ length: 30 }, (_, i) => {
    const center = 15;
    const dist = Math.abs(i - center) / center;
    const baseHeight = isPaused ? 6 : 8 + normalizedLevel * 38 * (1 - dist * 0.7);
    const jitter = isPaused ? 0 : Math.sin(Date.now() / 200 + i * 0.5) * 4;
    return Math.max(4, baseHeight + jitter);
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
          onPress={() => {
            Alert.alert('Stop Recording?', 'Your recording will be discarded.', [
              { text: 'Cancel' },
              {
                text: 'Stop',
                style: 'destructive',
                onPress: async () => {
                  await stopAndCleanup();
                  navigation.goBack();
                },
              },
            ]);
          }}
        >
          <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[Typography.bodyMedium, { color: colors.textPrimary }]}>
          Recording — {ieltsPart?.replace('part', 'Part ')}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Question */}
      <Card style={{ marginHorizontal: 20, marginTop: 6 }}>
        <Text style={[Typography.bodyMedium, { color: colors.textSecondary }]}>
          {question?.question_text || 'Describe a place you have visited...'}
        </Text>
      </Card>

      {/* Recording Section */}
      <View style={styles.recordingSection}>
        {/* Recording indicator */}
        <View style={styles.recLabel}>
          <Animated.View style={pulseStyle}>
            <View style={[styles.recDot, { backgroundColor: isPaused ? colors.textMuted : colors.rose }]} />
          </Animated.View>
          <Text style={[Typography.bodyMedium, { color: isPaused ? colors.textMuted : colors.rose }]}>
            {isPaused ? 'Paused' : 'Recording'}
          </Text>
        </View>

        {/* Timer */}
        <Text style={[styles.recTimer, { color: isPaused ? colors.textMuted : colors.rose }]}>
          {formatTime(seconds)}
        </Text>

        {/* Real Waveform */}
        <View style={styles.waveform}>
          {waveformBars.map((height, i) => (
            <View
              key={i}
              style={[
                styles.waveBar,
                {
                  height,
                  backgroundColor: isPaused ? colors.textMuted : colors.accent,
                  opacity: isPaused ? 0.3 : 0.4 + normalizedLevel * 0.4,
                },
              ]}
            />
          ))}
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBg, { backgroundColor: colors.bgInput }]}>
            <LinearGradient
              colors={Gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={[Typography.caption, { color: colors.textMuted }]}>
            {formatTime(seconds)} / {formatTime(maxSeconds)}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.pauseBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
            onPress={handlePauseResume}
          >
            <Ionicons name={isPaused ? 'play' : 'pause'} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.stopBtn} onPress={handleStop}>
            <Ionicons name="stop" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={[styles.tip, { backgroundColor: colors.skyBg }]}>
          <Text style={[Typography.bodySm, { color: colors.sky }]}>
            💡 <Text style={{ fontWeight: '600' }}>Tip:</Text> Speak clearly and at a natural pace.
            {ieltsPart === 'part2' ? ' You have 2 minutes for your long turn.' : ''}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  recordingSection: { alignItems: 'center', padding: 20, flex: 1 },
  recLabel: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, marginTop: 20,
  },
  recDot: { width: 10, height: 10, borderRadius: 5 },
  recTimer: {
    fontSize: 42, fontFamily: 'PlusJakartaSans-ExtraBold',
    fontVariant: ['tabular-nums'], marginBottom: 8,
  },
  waveform: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 3, height: 60, marginVertical: 14,
  },
  waveBar: { width: 4, borderRadius: 2 },
  progressContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    width: '100%', maxWidth: 280, marginVertical: 14,
  },
  progressBg: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  controls: {
    flexDirection: 'row', gap: 20, justifyContent: 'center', marginTop: 18,
  },
  pauseBtn: {
    width: 56, height: 56, borderRadius: 28, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  stopBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#F43F5E',
    alignItems: 'center', justifyContent: 'center',
  },
  tip: {
    marginTop: 24, padding: 12, borderRadius: 12, width: '100%',
  },
});
