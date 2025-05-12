import React, { useState, useEffect } from 'react';
import Logo from './Logo';

const SplashScreen = () => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const helperTexts = [
    "Analyzing market trends...",
    "Optimizing your experience...",
    "Connecting to real-time data...",
    "Preparing your dashboard...",
    "Almost ready..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) =>
        prevIndex === helperTexts.length - 1 ? 0 : prevIndex + 1
      );
    }, 900); // Change text every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dark bg-background text-foreground flex flex-col items-center justify-center h-screen w-full transition-colors duration-300">
      <div className="max-w-md w-full mx-auto p-8 flex flex-col items-center gap-8">
        {/* Logo/Product Name */}
        <div className="flex flex-col items-center gap-2">
          {/* <span className="font-bold text-5xl">
            Meet<span className="text-market-orange">n</span><span className="text-market-purple">Mart</span>
          </span> */}
          <Logo />
          <p className="text-muted-foreground text-sm">Local Marketplace for Instant Buying & Selling</p>
        </div>

        {/* Loader */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-primary border-t-transparent animate-spin animation-delay-200"></div>
        </div>

        {/* Animated Helper Text */}
        <div className="h-12 flex items-center justify-center w-full relative overflow-hidden">
          {helperTexts.map((text, index) => (
            <p
              key={index}
              className={`absolute text-center text-muted-foreground text-sm transition-all duration-500 ${index === currentTipIndex
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
                }`}
            >
              {text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export { SplashScreen };