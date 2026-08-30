"use client";

/**
 * Confetti — fires multiple waves of coloured confetti particles on mount.
 * Sprint 9 polish: multi-wave bursts, rotation, horizontal drift,
 * mixed shapes (circles, rectangles, stars), golden sparkle particles.
 *
 * Used on the birthday experience page the moment the reveal unlocks.
 * Particles are appended to document.body and self-clean after animation.
 */
import { useEffect } from "react";

const COLORS = [
  "#c084fc", "#a78bfa", "#e879f9", "#f0abfc",
  "#f9a8d4", "#fbbf24", "#34d399", "#60a5fa",
  "#f87171", "#fb923c", "#818cf8",
];

const GOLD_SPARKLES = ["#fbbf24", "#f59e0b", "#fcd34d", "#fde68a"];

interface ConfettiProps {
  /** Number of particles per wave. Default: 80 */
  count?: number;
}

function createParticle(color: string, isGold: boolean): HTMLElement {
  const el = document.createElement("div");
  const size = isGold ? 4 + Math.random() * 4 : 6 + Math.random() * 10;
  const left = Math.random() * 100;
  const duration = 3 + Math.random() * 3;
  const delay = Math.random() * 2;
  const rotation = Math.random() * 360;

  // Shape variety
  const shapeRand = Math.random();
  let borderRadius = "2px";
  const width = `${size}px`;
  let height = `${size * (0.3 + Math.random() * 0.7)}px`;

  if (shapeRand > 0.7) {
    // Circle
    borderRadius = "50%";
    height = width;
  } else if (isGold) {
    // Star shape via small square rotated
    borderRadius = "1px";
    height = width;
  }

  el.style.cssText = `
    position: fixed;
    top: -16px;
    left: ${left}vw;
    width: ${width};
    height: ${height};
    background: ${color};
    border-radius: ${borderRadius};
    pointer-events: none;
    z-index: 9999;
    opacity: ${isGold ? 1 : 0.9};
    transform: rotate(${rotation}deg);
    animation: confetti-fall ${duration}s ease-out ${delay}s forwards;
    ${isGold ? `box-shadow: 0 0 4px ${color};` : ""}
  `;

  return el;
}

export function Confetti({ count = 80 }: ConfettiProps) {
  useEffect(() => {
    const allParticles: HTMLElement[] = [];

    // Wave 1 — immediate
    for (let i = 0; i < count; i++) {
      const isGold = Math.random() > 0.8;
      const palette = isGold ? GOLD_SPARKLES : COLORS;
      const color = palette[Math.floor(Math.random() * palette.length)];
      const el = createParticle(color, isGold);
      document.body.appendChild(el);
      allParticles.push(el);
    }

    // Wave 2 — 0.8s delay
    const wave2Timer = setTimeout(() => {
      for (let i = 0; i < Math.floor(count * 0.6); i++) {
        const isGold = Math.random() > 0.75;
        const palette = isGold ? GOLD_SPARKLES : COLORS;
        const color = palette[Math.floor(Math.random() * palette.length)];
        const el = createParticle(color, isGold);
        document.body.appendChild(el);
        allParticles.push(el);
      }
    }, 800);

    // Wave 3 — 1.8s delay (smaller)
    const wave3Timer = setTimeout(() => {
      for (let i = 0; i < Math.floor(count * 0.3); i++) {
        const isGold = Math.random() > 0.7;
        const palette = isGold ? GOLD_SPARKLES : COLORS;
        const color = palette[Math.floor(Math.random() * palette.length)];
        const el = createParticle(color, isGold);
        document.body.appendChild(el);
        allParticles.push(el);
      }
    }, 1800);

    // Clean up after all animations finish
    const cleanupTimer = setTimeout(() => {
      allParticles.forEach((p) => p.parentNode?.removeChild(p));
    }, 8000);

    return () => {
      clearTimeout(wave2Timer);
      clearTimeout(wave3Timer);
      clearTimeout(cleanupTimer);
      allParticles.forEach((p) => p.parentNode?.removeChild(p));
    };
  }, [count]);

  return null;
}
