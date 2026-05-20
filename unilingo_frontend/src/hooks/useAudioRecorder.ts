import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

type StopRecordingResult = {
  uri: string;
  duration: number;
};

const RECORDING_OPTIONS = Audio.RecordingOptionsPresets.HIGH_QUALITY;

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const startedAtRef = useRef<number | null>(null);

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

      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      await new Promise((resolve) => setTimeout(resolve, 150));
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(RECORDING_OPTIONS);
      recordingRef.current = recording;
      startedAtRef.current = Date.now();
      setIsRecording(true);
      return true;
    } catch {
      setError('Could not start recording. Please try again.');
      setIsRecording(false);
      return false;
    }
  }, [requestPermission]);

  const stopRecording = useCallback(async (): Promise<StopRecordingResult | null> => {
    const recording = recordingRef.current;
    if (!recording) {
      setIsRecording(false);
      return null;
    }

    try {
      setError(null);
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recording.getURI();
      const duration = startedAtRef.current
        ? Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000))
        : 0;

      recordingRef.current = null;
      startedAtRef.current = null;

      if (!uri) {
        setError('Recording stopped, but no audio file was created.');
        return null;
      }

      setRecordingUri(uri);
      return { uri, duration };
    } catch {
      recordingRef.current = null;
      startedAtRef.current = null;
      setIsRecording(false);
      setError('Could not stop recording cleanly.');
      return null;
    }
  }, []);

  useEffect(() => {
    return () => {
      const recording = recordingRef.current;
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
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
