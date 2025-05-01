// components/splash-screen.tsx
"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export const SplashScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-full items-center justify-center bg-gradient-to-br from-market-orange via-market-purple to-market-pink">
      {/* 3D floating elements */}
      <div className="absolute inset-0 overflow-hidden perspective-1000">
        {[...Array(12)].map((_, i) => {
          const colors = ['market-orange', 'market-blue', 'market-green', 'market-purple', 'market-pink'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          return (
            <div
              key={i}
              className={`absolute h-12 w-12 animate-market-float-3d opacity-50 bg-${randomColor} rounded-lg shadow-3d`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                transformStyle: 'preserve-3d',
              }}
            />
          );
        })}
      </div>

      {/* Main content with 3D effect */}
      <div className="relative z-10 flex flex-col items-center space-y-8 transform-style-preserve-3d">
        {/* 3D Animated logo */}
        <div className="animate-logo-3d">
          <h1 className="text-6xl font-black text-transparent bg-gradient-to-r from-market-orange via-market-pink to-market-purple bg-clip-text [text-shadow:_0_4px_8px_rgba(249,115,22,0.3)]">
            LiveMarket
            <span className="block mt-2 text-2xl text-market-blue animate-pulse">
              Escrow Protected
            </span>
          </h1>
        </div>

        {/* Pulsing Live Indicator */}
        <div className="flex items-center gap-2 p-4 bg-market-blue/20 rounded-2xl backdrop-blur-sm">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-live-pulse-3d rounded-full bg-market-pink opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-market-purple" />
          </span>
          <span className="font-semibold text-market-purple">LIVE TRANSACTIONS</span>
        </div>

        {/* 3D Progress Bar */}
        <div className="space-y-4 transform-style-preserve-3d">
          <Progress 
            value={progress} 
            className="h-4 w-96 bg-market-blue/30 rounded-full shadow-3d-progress"
          />
          <div className="flex justify-between px-2">
            <span className="text-sm font-medium text-market-blue">$0.00</span>
            <span className="text-sm font-medium text-market-green">{progress}% Loaded</span>
            <span className="text-sm font-medium text-market-blue">$0.00 in escrow</span>
          </div>
        </div>
      </div>
    </div>
  );
};