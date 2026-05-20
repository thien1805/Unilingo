import { useCallback, useEffect, useRef, useState } from 'react';

type TimerCompleteHandler = () => void;

export function useMockTestTimer() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialSecondsRef = useRef(0);
  const remainingSecondsRef = useRef(0);
  const onCompleteRef = useRef<TimerCompleteHandler | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (completeTimeoutRef.current) {
      clearTimeout(completeTimeoutRef.current);
      completeTimeoutRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const reset = useCallback((seconds = 0) => {
    stop();
    initialSecondsRef.current = seconds;
    remainingSecondsRef.current = seconds;
    onCompleteRef.current = null;
    setTimeLeft(seconds);
    setElapsed(0);
  }, [stop]);

  const start = useCallback((seconds: number, onComplete?: TimerCompleteHandler) => {
    stop();
    initialSecondsRef.current = seconds;
    remainingSecondsRef.current = seconds;
    onCompleteRef.current = onComplete || null;
    setTimeLeft(seconds);
    setElapsed(0);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      const next = Math.max(0, remainingSecondsRef.current - 1);
      remainingSecondsRef.current = next;
      setTimeLeft(next);
      setElapsed(initialSecondsRef.current - next);

      if (next === 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsRunning(false);

        const complete = onCompleteRef.current;
        onCompleteRef.current = null;
        if (complete) {
          completeTimeoutRef.current = setTimeout(() => {
            completeTimeoutRef.current = null;
            complete();
          }, 0);
        }
      }
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
