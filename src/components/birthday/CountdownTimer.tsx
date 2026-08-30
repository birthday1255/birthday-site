"use client";

/**
 * CountdownTimer — displays a live countdown to a target date.
 * Sprint 9 polish: flip-clock aesthetic with glassmorphism digit cards,
 * gradient accent borders, animated separator pulse.
 */
import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function DigitCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative glass-card-vivid rounded-2xl px-4 sm:px-6 py-4 sm:py-5 min-w-[64px] sm:min-w-[80px]
                      overflow-hidden group">
        {/* Top accent line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
        {/* Digit */}
        <span className="text-3xl sm:text-4xl font-bold text-white tabular-nums font-heading
                         drop-shadow-[0_0_10px_rgba(139,92,246,0.2)]">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-[0.2em] font-heading">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <div className="flex flex-col gap-2 items-center justify-center pb-6">
      <span className="w-1.5 h-1.5 rounded-full bg-violet-500/60 animate-pulse" />
      <span className="w-1.5 h-1.5 rounded-full bg-violet-500/40 animate-pulse" style={{ animationDelay: "0.3s" }} />
    </div>
  );
}

/**
 * Renders a live countdown clock that updates every second.
 */
export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex gap-2 sm:gap-3 justify-center items-start">
      <DigitCard value={timeLeft.days} label="Days" />
      <Separator />
      <DigitCard value={timeLeft.hours} label="Hours" />
      <Separator />
      <DigitCard value={timeLeft.minutes} label="Mins" />
      <Separator />
      <DigitCard value={timeLeft.seconds} label="Secs" />
    </div>
  );
}
