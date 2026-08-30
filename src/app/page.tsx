"use client";

/**
 * Landing page — public entry point for all visitors.
 *
 * Sprint 9 polish: aurora background, floating particles with drift,
 * glassmorphism card with glow border, gradient headline, premium sign-in.
 */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { roleRedirectPath } from "@/lib/utils/roleRedirect";
import type { UserRole } from "@/types/user";

// ─── Floating particles ───────────────────────────────────────────────────────

const PARTICLE_EMOJIS = ["✦", "✨", "⭐", "🌸", "💜", "🎈", "💫", "🌟", "♡", "✧"];
const PARTICLE_SHAPES = ["circle", "star", "heart"] as const;

interface Particle {
  id: number;
  emoji: string;
  shape: (typeof PARTICLE_SHAPES)[number];
  left: string;
  duration: string;
  delay: string;
  size: string;
  drift: string;
  useEmoji: boolean;
}

function useParticles(): Particle[] {
  const [particles, setParticles] = useState<Particle[]>([]);
  useEffect(() => {
    setParticles(
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        emoji: PARTICLE_EMOJIS[i % PARTICLE_EMOJIS.length],
        shape: PARTICLE_SHAPES[i % PARTICLE_SHAPES.length],
        left: `${Math.random() * 100}%`,
        duration: `${6 + Math.random() * 10}s`,
        delay: `${Math.random() * 8}s`,
        size: `${0.5 + Math.random() * 1}rem`,
        drift: `${-30 + Math.random() * 60}px`,
        useEmoji: Math.random() > 0.5,
      }))
    );
  }, []);
  return particles;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const particles = useParticles();

  async function handleSignIn(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      const idToken = await user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "GET",
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!res.ok) throw new Error("Session setup failed. Try again.");

      const data = (await res.json()) as { role: UserRole | null };
      router.push(roleRedirectPath(data.role));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Sign-in failed. Try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden aurora-bg">

      {/* ── Ambient glow orbs ── */}
      <div
        className="absolute top-[-25%] left-[-15%] w-[700px] h-[700px] rounded-full
                   bg-violet-600/15 blur-[150px] animate-glow-pulse pointer-events-none"
      />
      <div
        className="absolute bottom-[-25%] right-[-15%] w-[600px] h-[600px] rounded-full
                   bg-fuchsia-600/12 blur-[130px] animate-glow-pulse pointer-events-none"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="absolute top-[40%] left-[60%] w-[400px] h-[400px] rounded-full
                   bg-pink-500/8 blur-[100px] animate-glow-pulse pointer-events-none"
        style={{ animationDelay: "6s" }}
      />

      {/* ── Floating particles ── */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="confetti-particle select-none"
          style={{
            left: p.left,
            fontSize: p.size,
            "--duration": p.duration,
            "--delay": p.delay,
            opacity: 0.6,
            filter: p.useEmoji ? "none" : "blur(0.5px)",
            color: p.useEmoji
              ? undefined
              : ["#c084fc", "#e879f9", "#f9a8d4", "#818cf8", "#a78bfa"][
                  p.id % 5
                ],
          } as React.CSSProperties}
        >
          {p.useEmoji ? p.emoji : "●"}
        </span>
      ))}

      {/* ── Main card ── */}
      <div className="relative z-10 w-full max-w-[400px] mx-auto px-4">
        <div
          className="glass-card-vivid rounded-3xl p-8 sm:p-10 space-y-8 shadow-2xl
                     animate-scale-in"
        >

          {/* Cake with sparkle effect */}
          <div className="text-center relative">
            <span
              className="text-7xl sm:text-8xl select-none inline-block animate-float-cake
                         drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]"
              role="img"
              aria-label="Birthday cake"
            >
              🎂
            </span>
            {/* Sparkles around cake */}
            <span className="absolute top-0 right-1/4 text-xs text-violet-400 animate-sparkle">✦</span>
            <span
              className="absolute top-2 left-1/4 text-[10px] text-fuchsia-400 animate-sparkle"
              style={{ animationDelay: "0.7s" }}
            >
              ✧
            </span>
            <span
              className="absolute bottom-4 right-1/3 text-xs text-pink-400 animate-sparkle"
              style={{ animationDelay: "1.4s" }}
            >
              ✦
            </span>
          </div>

          {/* Headline */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-heading">
              <span className="gradient-text">Happy Birthday!</span>
            </h1>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-[280px] mx-auto">
              You&apos;re invited to leave a heartfelt wish.
              <br />
              Sign in to get started.
            </p>
          </div>

          {/* Sign-in button */}
          <div className="space-y-4">
            <button
              id="sign-in-google"
              onClick={() => void handleSignIn()}
              disabled={loading}
              aria-label="Sign in with Google"
              className="group relative w-full flex items-center justify-center gap-3
                         px-5 py-4 rounded-2xl font-semibold text-sm
                         bg-white text-neutral-900
                         hover:shadow-[0_8px_30px_-5px_rgba(255,255,255,0.15)]
                         active:scale-[0.97]
                         transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         overflow-hidden"
            >
              {/* Shine sweep on hover */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100
                           bg-gradient-to-r from-transparent via-white/20 to-transparent
                           -translate-x-full group-hover:translate-x-full
                           transition-transform duration-700 ease-out"
              />
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-neutral-400 border-t-neutral-900 rounded-full animate-spin" />
                  <span className="relative z-10">Signing in…</span>
                </>
              ) : (
                <>
                  {/* Google G logo */}
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="relative z-10">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                    <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" />
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" />
                  </svg>
                  <span className="relative z-10">Continue with Google</span>
                </>
              )}
            </button>

            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 px-4 py-3 rounded-xl
                           bg-red-950/40 border border-red-800/30 backdrop-blur-sm"
              >
                <span className="text-red-400 text-sm shrink-0">⚠</span>
                <p className="text-sm text-red-300 break-words">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-neutral-600 flex items-center justify-center gap-1.5">
            <span className="text-violet-500/60 text-[10px] animate-sparkle">✦</span>
            Private event — by invitation only
            <span className="text-pink-500/60 text-[10px] animate-sparkle" style={{ animationDelay: "1s" }}>✦</span>
          </p>
        </div>
      </div>
    </main>
  );
}
