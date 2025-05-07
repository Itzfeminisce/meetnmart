import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
  } from 'react';
  
  export type CallTimerHandle = {
    getTimer: () => string;
    pause: () => void;
    resume: () => void;
  };
  
  type CallTimerProps = {
    formatDuration: (seconds: number) => string;
  };
  
  const CallTimer = forwardRef<CallTimerHandle, CallTimerProps>(
    ({ formatDuration }, ref) => {
      const spanRef = useRef<HTMLSpanElement>(null);
      const startTime = useRef<number>(Date.now());
      const elapsedRef = useRef<number>(0);
      const pausedAt = useRef<number | null>(null);
      const [paused, setPaused] = useState(false);
      const animationFrame = useRef<number>();
  
      const updateElapsed = () => {
        if (!paused) {
          const now = Date.now();
          elapsedRef.current = Math.floor((now - startTime.current) / 1000);
        }
      };
  
      const updateDisplay = () => {
        if (spanRef.current) {
          spanRef.current.textContent = `Call Duration: ${formatDuration(
            elapsedRef.current || 0
          )}s`;
        }
      };
  
      const tick = () => {
        updateElapsed();
        updateDisplay();
        animationFrame.current = requestAnimationFrame(tick);
      };
  
      useEffect(() => {
        animationFrame.current = requestAnimationFrame(tick);
  
        return () => {
          if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
          }
        };
      }, [paused]);
  
      useImperativeHandle(ref, () => ({
        getTimer: () => {
          updateElapsed(); // Ensure the latest value is used
          return formatDuration(elapsedRef.current || 0);
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
            startTime.current += pauseDuration; // Adjust start time forward
            pausedAt.current = null;
            setPaused(false);
          }
        },
      }));
  
      return <span ref={spanRef}></span>;
    }
  );
  
  export {CallTimer};
  