import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

export type CallTimerHandle = {
  getTimer: () => string;
  getTimerWithLabel: () => string;
  pause: () => void;
  resume: () => void;
};

type CallTimerProps = {
  formatDuration?: (seconds: number) => string;
  shouldStart: boolean;
};

const defaultFormatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  return [
    hours > 0 ? String(hours).padStart(2, '0') : null,
    String(minutes).padStart(2, '0'),
    String(remainingSeconds).padStart(2, '0')
  ]
    .filter(Boolean)
    .join(':');
};

const CallTimer = forwardRef<CallTimerHandle, CallTimerProps>(
  ({ formatDuration = defaultFormatDuration, shouldStart }, ref) => {
    const spanRef = useRef<HTMLSpanElement>(null);
    const startTime = useRef<number | null>(null);
    const elapsedRef = useRef<number>(0);
    const pausedAt = useRef<number | null>(null);
    const [paused, setPaused] = useState(false);
    const animationFrame = useRef<number>();

    useEffect(() => {
      if (shouldStart && startTime.current === null) {
        // Initialize timer when shouldStart becomes true
        startTime.current = Date.now();
      }
    }, [shouldStart]);

    const updateElapsed = () => {
      if (!paused && shouldStart && startTime.current !== null) {
        const now = Date.now();
        elapsedRef.current = Math.floor((now - startTime.current) / 1000);
      }
    };

    const updateDisplay = () => {
      if (spanRef.current) {
        spanRef.current.textContent = getTimerWithLabel();
      }
    };

    const getTimerWithLabel = (): string => {
      updateElapsed(); // Ensure the latest value is used
      return `Call Duration: ${formatDuration(elapsedRef.current || 0)}`;
    };

    const tick = () => {
      updateElapsed();
      updateDisplay();
      animationFrame.current = requestAnimationFrame(tick);
    };

    useEffect(() => {
      if (shouldStart) {
        animationFrame.current = requestAnimationFrame(tick);
      }

      return () => {
        if (animationFrame.current) {
          cancelAnimationFrame(animationFrame.current);
        }
      };
    }, [paused, shouldStart]);

    useImperativeHandle(ref, () => ({
      getTimer: () => {
        updateElapsed(); // Ensure the latest value is used
        return formatDuration(elapsedRef.current || 0);
      },
      getTimerWithLabel: () => {
        return getTimerWithLabel();
      },
      pause: () => {
        if (!paused) {
          pausedAt.current = Date.now();
          setPaused(true);
        }
      },
      resume: () => {
        if (paused && pausedAt.current !== null) {
          const pauseDuration = Date.now() - pausedAt.current;
          if (startTime.current !== null) {
            startTime.current += pauseDuration; // Adjust start time forward
          }
          pausedAt.current = null;
          setPaused(false);
        }
      },
    }));

    // Only render the span if shouldStart is true
    return shouldStart ? <span ref={spanRef}></span> : <span>{getTimerWithLabel()}</span>;
  }
);

export { CallTimer };