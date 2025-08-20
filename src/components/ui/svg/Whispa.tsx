import React, { useMemo } from 'react';

export const WhispaIcon = ({
  size = 100,
  wColor = '#ffffff',
  accentColor = 'orange',
  className = '',
  style = {},
  id = 'whispa',
  ...props
}) => {
  // Generate stable unique IDs that won't change on re-render
  const uniqueIds = useMemo(() => {
    const baseId = id || 'whispa';
    return {
      glow: `${baseId}-glow`,
      slashGradient: `${baseId}-slash-gradient`,
      slashShadow: `${baseId}-slash-shadow`
    };
  }, [id]);

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        {/* Glow effect */}
        <filter id={uniqueIds.glow}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

      </defs>
      
      {/* Main W shape - stylized and modern */}
      <path 
        d="M25 30 L32 55 L40 35 L48 55 L55 35 L63 55 L70 30" 
        stroke={wColor} 
        strokeWidth="4" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter={`url(#${uniqueIds.glow})`}
      />
      
      {/* Clean minimal accent */}
      <circle 
        cx="48" 
        cy="25" 
        r="3.5" 
        fill={accentColor} 
        opacity="0.6"
      />
    </svg>
  );
};