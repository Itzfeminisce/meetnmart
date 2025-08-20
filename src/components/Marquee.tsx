import React from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  text: string;
  speed?: number; // pixels per second
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
  gradient?: boolean;
  scroll?: boolean;
}

export const Marquee: React.FC<MarqueeProps> = ({
  text,
  speed = 50,
  direction = 'left',
  pauseOnHover = true,
  className = '',
  gradient = false,
  scroll = false,
}) => {
  const animationDuration = `${text.length * (100 / speed)}s`;

  return (
    <div
      className={cn(
        'relative overflow-hidden whitespace-nowrap w-full',
        className
      )}
    >
      {gradient && scroll && (
        <>
          <div className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-white/90 dark:from-black/80 z-10" />
          <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-white/90 dark:from-black/80 z-10" />
        </>
      )}

      <div
        className={cn(
          'inline-block min-w-full',
          pauseOnHover && scroll ? 'hover:[animation-play-state:paused]' : ''
        )}
        style={
          scroll
            ? {
                animation: `marquee-${direction} ${animationDuration} linear infinite`,
              }
            : undefined
        }
      >
        <span className="inline-block">
          {scroll ? (
            <>
              {text} &nbsp; • &nbsp; {text} &nbsp; • &nbsp; {text}
            </>
          ) : (
            text
          )}
        </span>
      </div>

      {scroll && (
        <style>{`
          @keyframes marquee-left {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-100%);
            }
          }
          @keyframes marquee-right {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(0);
            }
          }
        `}</style>
      )}
    </div>
  );
};
