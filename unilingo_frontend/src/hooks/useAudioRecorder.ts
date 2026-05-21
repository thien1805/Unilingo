import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

type StopRecordingResult = {
  uri: string;
  duration: number;
};

const RECORDING_OPTIONS = Audio.RecordingOptionsPresets.HIGH_QUALITY;
const AUDIO_SESSION_SETTLE_MS = 300;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const isStartingRef = useRef(false);
  const isStoppingRef = useRef(false);

  const requestPermission = useCallback(async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        setError('Microphone permission is required to record your answer.');
      }
      return granted;
    } catch {
      setError('Could not request microphone permission.');
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (isStartingRef.current || isStoppingRef.current) return false;
    isStartingRef.current = true;

    try {
      setError(null);
      setRecordingUri(null);

      const granted = await requestPermission();
      if (!granted) return false;

      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch {}
        recordingRef.current = null;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      await wait(AUDIO_SESSION_SETTLE_MS);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      const { recording } = await Audio.Recording.createAsync(RECORDING_OPTIONS);
      recordingRef.current = recording;
      startedAtRef.current = Date.now();
      setIsRecording(true);
      return true;
    } catch (recordingError) {
      console.log('Could not start recording:', recordingError);
      setError('Could not start recording. Please try again.');
      setIsRecording(false);
      return false;
    } finally {
      isStartingRef.current = false;
    }
  }, [requestPermission]);

  const stopRecording = useCallback(async (): Promise<StopRecordingResult | null> => {
    if (isStoppingRef.current) return null;
    const recording = recordingRef.current;
    if (!recording) {
      setIsRecording(false);
      return null;
    }

    isStoppingRef.current = true;
    try {
      setError(null);
      setIsRecording(false);
      recordingRef.current = null;
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recording.getURI();
      const duration = startedAtRef.current
        ? Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000))
        : 0;

      startedAtRef.current = null;

      if (!uri) {
        setError('Recording stopped, but no audio file was created.');
        return null;
      }

      setRecordingUri(uri);
      return { uri, duration };
    } catch (stopError) {
      console.log('Could not stop recording:', stopError);
      startedAtRef.current = null;
      setIsRecording(false);
      setError('Could not stop recording cleanly.');
      return null;
    } finally {
      isStoppingRef.current = false;
    }
  }, []);

  useEffect(() => {
    return () => {
      const recording = recordingRef.current;
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
      recordingRef.current = null;
      startedAtRef.current = null;
      isStartingRef.current = false;
      isStoppingRef.current = false;
      Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
    };
  }, []);

  return {
    requestPermission,
    startRecording,
    stopRecording,
    isRecording,
    recordingUri,
    error,
  };
}
