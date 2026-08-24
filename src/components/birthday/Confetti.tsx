"use client";

/**
 * Confetti — fires a burst of coloured confetti particles on mount.
 * Used on the birthday experience page the moment the reveal unlocks.
 * Particles are appended to document.body and self-clean after animation.
 */
import { useEffect } from "react";

const COLORS = [
  "#e879f9", "#a78bfa", "#f9a8d4",
  "#fbbf24", "#34d399", "#60a5fa",
  "#f87171", "#fb923c",
];

interface ConfettiProps {
  /** Number of particles to emit. Default: 80 */
  count?: number;
}

export function Confetti({ count = 80 }: ConfettiProps) {
  useEffect(() => {
    const particles: HTMLElement[] = [];

    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const size = 6 + Math.random() * 8;
      const left = Math.random() * 100;
      const duration = 2.5 + Math.random() * 2;
      const delay = Math.random() * 1.5;

      el.style.cssText = `
        position: fixed;
        top: -12px;
        left: ${left}vw;
        width: ${size}px;
        height: ${size * (0.4 + Math.random() * 0.6)}px;
        background: ${color};
        border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
        pointer-events: none;
        z-index: 9999;
        --duration: ${duration}s;
        --delay: ${delay}s;
        opacity: 0.9;
        transform: rotate(${Math.random() * 360}deg);
        animation: float-up ${duration}s ease-out ${delay}s forwards;
      `;

      document.body.appendChild(el);
      particles.push(el);
    }

    // Clean up after all animations finish
    const maxDuration = 4500;
    const timer = setTimeout(() => {
      particles.forEach((p) => p.parentNode?.removeChild(p));
    }, maxDuration);

    return () => {
      clearTimeout(timer);
      particles.forEach((p) => p.parentNode?.removeChild(p));
    };
  }, [count]);

  return null;
}
