"use client";

/**
 * CountdownTimer — displays a live countdown to a target date.
 * Used on the birthday experience page before reveal is triggered.
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

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-4 justify-center">
      {units.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col items-center bg-neutral-900 border border-neutral-800
                     rounded-2xl px-5 py-4 min-w-[72px]"
        >
          <span className="text-3xl font-bold text-white tabular-nums">
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-xs text-neutral-500 mt-1">{label}</span>
        </div>
      ))}
    </div>
  );
}
