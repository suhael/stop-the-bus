import { useEffect, useRef, useState } from 'react';

/**
 * A simple countdown timer hook.
 *
 * @param initialSeconds - Starting value (e.g. 3 for scramble phase).
 * @param active         - Whether the timer should be running.
 * @param onComplete     - Called once when the countdown reaches 0.
 * @returns current `seconds` remaining and a `reset` function.
 */
export const useCountdown = (
  initialSeconds: number,
  active: boolean,
  onComplete?: () => void,
) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Reset when initialSeconds changes (new round/scramble)
  useEffect(() => {
    setSeconds(initialSeconds);
    completedRef.current = false;
  }, [initialSeconds]);

  useEffect(() => {
    if (!active || seconds <= 0) return;

    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(id);
          if (!completedRef.current) {
            completedRef.current = true;
            onCompleteRef.current?.();
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [active, seconds]);

  const reset = (value?: number) => {
    completedRef.current = false;
    setSeconds(value ?? initialSeconds);
  };

  return { seconds, reset };
};
