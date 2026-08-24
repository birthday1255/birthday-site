"use client";

/**
 * Landing page — public entry point for all visitors.
 *
 * Sprint 9 polish: animated floating particles, glassmorphism card,
 * gradient headline, premium Google sign-in button.
 */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { roleRedirectPath } from "@/lib/utils/roleRedirect";
import type { UserRole } from "@/types/user";

// Floating emoji particles rendered in the background
const PARTICLES = ["🎉", "✨", "🎁", "🌸", "💜", "🎈", "⭐", "🎊", "💫", "🌟"];

interface Particle {
  id: number;
  emoji: string;
  left: string;
  duration: string;
  delay: string;
  size: string;
}

function useParticles(): Particle[] {
  const [particles, setParticles] = useState<Particle[]>([]);
  useEffect(() => {
    setParticles(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        emoji: PARTICLES[i % PARTICLES.length],
        left: `${Math.random() * 100}%`,
        duration: `${5 + Math.random() * 8}s`,
        delay: `${Math.random() * 6}s`,
        size: `${1 + Math.random() * 1.2}rem`,
      }))
    );
  }, []);
  return particles;
}

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
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-neutral-950">

      {/* ── Ambient glow orbs ── */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full
                   bg-violet-600/20 blur-[120px] animate-glow-pulse pointer-events-none"
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full
                   bg-pink-600/20 blur-[100px] animate-glow-pulse pointer-events-none"
        style={{ animationDelay: "3s" }}
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
          } as React.CSSProperties}
        >
          {p.emoji}
        </span>
      ))}

      {/* ── Main card ── */}
      <div className="relative z-10 w-full max-w-sm mx-auto px-4">
        <div className="glass-card rounded-3xl p-8 sm:p-10 space-y-8 shadow-2xl">

          {/* Cake */}
          <div className="text-center">
            <span
              className="text-7xl select-none inline-block animate-float-cake"
              role="img"
              aria-label="Birthday cake"
            >
              🎂
            </span>
          </div>

          {/* Headline */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="gradient-text">Happy Birthday!</span>
            </h1>
            <p className="text-neutral-400 text-sm leading-relaxed">
              You&apos;re invited to leave a wish.
              <br />
              Sign in to get started.
            </p>
          </div>

          {/* Sign-in button */}
          <div className="space-y-3">
            <button
              id="sign-in-google"
              onClick={() => void handleSignIn()}
              disabled={loading}
              aria-label="Sign in with Google"
              className="group w-full flex items-center justify-center gap-3
                         px-5 py-3.5 rounded-xl font-semibold text-sm
                         bg-white text-neutral-900
                         hover:bg-neutral-100 active:scale-[0.98]
                         transition-all duration-150
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-lg shadow-white/5"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-neutral-400 border-t-neutral-900 rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  {/* Google G logo */}
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                    <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" />
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {error && (
              <p role="alert" className="text-sm text-red-400 text-center break-words">
                {error}
              </p>
            )}
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-neutral-600">
            Private event — by invitation only
          </p>
        </div>
      </div>
    </main>
  );
}
