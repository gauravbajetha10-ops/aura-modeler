'use client';

import { useState, useEffect } from 'react';

export default function FlipClock() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return <div className="h-16 flex gap-2 animate-pulse bg-white/5 rounded-xl w-48"></div>;
  }

  const formatUnit = (unit: number) => unit.toString().padStart(2, '0');

  const hours = formatUnit(time.getHours());
  const minutes = formatUnit(time.getMinutes());
  const seconds = formatUnit(time.getSeconds());

  const FlipUnit = ({ value, label }: { value: string, label: string }) => (
    <div className="flex flex-col items-center flex-1 max-w-[140px]">
      <div className="relative bg-[#1a1a1a] border border-white/10 rounded-xl w-full aspect-[3/4] flex items-center justify-center overflow-hidden shadow-2xl drop-shadow-2xl">
        {/* Horizontal dividing line for the "flip" look */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-black/80 z-10 shadow-[0_1px_2px_rgba(255,255,255,0.1)]"></div>
        <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-mono text-white font-bold relative z-0 tracking-tighter drop-shadow-md">
          {value}
        </span>
        {/* Soft highlight on top half */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
      </div>
      <span className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-[0.2em] md:tracking-[0.3em] mt-3 md:mt-4 font-medium">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-2 sm:gap-4 md:gap-6 w-full justify-center max-w-[500px] mx-auto">
      <FlipUnit value={hours} label="HOURS" />
      <span className="text-3xl md:text-5xl font-light text-gray-600 mb-6 md:mb-8 animate-pulse drop-shadow-md">:</span>
      <FlipUnit value={minutes} label="MINUTES" />
      <span className="text-3xl md:text-5xl font-light text-gray-600 mb-6 md:mb-8 animate-pulse drop-shadow-md">:</span>
      <FlipUnit value={seconds} label="SECONDS" />
    </div>
  );
}
