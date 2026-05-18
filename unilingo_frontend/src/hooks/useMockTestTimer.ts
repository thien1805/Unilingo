import { useCallback, useEffect, useRef, useState } from 'react';

type TimerCompleteHandler = () => void;

export function useMockTestTimer() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialSecondsRef = useRef(0);
  const onCompleteRef = useRef<TimerCompleteHandler | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const reset = useCallback((seconds = 0) => {
    stop();
    initialSecondsRef.current = seconds;
    onCompleteRef.current = null;
    setTimeLeft(seconds);
    setElapsed(0);
  }, [stop]);

  const start = useCallback((seconds: number, onComplete?: TimerCompleteHandler) => {
    stop();
    initialSecondsRef.current = seconds;
    onCompleteRef.current = onComplete || null;
    setTimeLeft(seconds);
    setElapsed(0);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsRunning(false);
          setElapsed(initialSecondsRef.current);
          onCompleteRef.current?.();
          return 0;
        }

        const next = current - 1;
        setElapsed(initialSecondsRef.current - next);
        return next;
      });
    }, 1000);
  }, [stop]);

  useEffect(() => stop, [stop]);

  return {
    timeLeft,
    elapsed,
    isRunning,
    start,
    stop,
    reset,
  };
}
