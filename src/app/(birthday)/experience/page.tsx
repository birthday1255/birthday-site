"use client";

/**
 * Birthday Person Experience Page — Sprint 7 + Sprint 9 Polish.
 *
 * States:
 *  1. Loading  — spinner while reveal status resolves from Firestore
 *  2. Locked   — countdown to reveal_timestamp, or "waiting" message
 *  3. Revealed — confetti burst, animated wish cascade
 *
 * Real-time: Firestore onSnapshot auto-transitions Locked → Revealed
 * without any page refresh the instant the organizer hits "Reveal Now".
 *
 * Role guard is applied by (birthday)/layout.tsx — not duplicated here.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRevealStatus } from "@/hooks/useRevealStatus";
import { CountdownTimer } from "@/components/birthday/CountdownTimer";
import { WishCard } from "@/components/birthday/WishCard";
import { Confetti } from "@/components/birthday/Confetti";
import { SignOutButton } from "@/components/ui/SignOutButton";
import type { Wish } from "@/types/wish";

// ─── Wish fetcher hook ────────────────────────────────────────────────────────

function useWishes(isRevealed: boolean) {
  const { user } = useAuth();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishes = useCallback(async () => {
    if (!user || !isRevealed) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/wishes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as { wishes: Wish[] };
        setWishes(data.wishes);
      }
    } finally {
      setLoading(false);
    }
  }, [user, isRevealed]);

  useEffect(() => {
    void fetchWishes();
  }, [fetchWishes]);

  return { wishes, loading };
}

// ─── Sub-views ────────────────────────────────────────────────────────────────

function LoadingView() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-400 text-sm animate-pulse">
          Preparing something special…
        </p>
      </div>
    </div>
  );
}

interface LockedViewProps {
  revealTimestamp: Date | null;
  userName: string;
}

function LockedView({ revealTimestamp, userName }: LockedViewProps) {
  const firstName = userName.split(" ")[0] || "";
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-6 text-center gap-10">
      {/* Ambient glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px]
                      rounded-full bg-violet-700/15 blur-[120px] pointer-events-none animate-glow-pulse" />

      {/* Cake */}
      <div className="text-8xl sm:text-9xl select-none animate-float-cake relative z-10">
        🎂
      </div>

      <div className="space-y-3 max-w-sm relative z-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          {firstName ? `Hey ${firstName}! 👋` : "Your surprise is coming!"}
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          Everyone who loves you has left a message here.
          They&apos;ll appear the moment the organizer hits reveal.
          <br />
          <span className="text-neutral-600">No refresh needed — it&apos;s live. ✨</span>
        </p>
      </div>

      {revealTimestamp && revealTimestamp > new Date() ? (
        <div className="space-y-4 relative z-10">
          <p className="text-xs text-neutral-500 uppercase tracking-widest">
            Reveal in
          </p>
          <CountdownTimer targetDate={revealTimestamp} />
        </div>
      ) : (
        <div className="glass-card rounded-2xl px-8 py-4 relative z-10">
          <p className="text-sm text-neutral-400 flex items-center gap-2">
            <span>🔒</span> Waiting for the organizer to reveal…
          </p>
        </div>
      )}
    </div>
  );
}

interface RevealedViewProps {
  wishes: Wish[];
  wishesLoading: boolean;
  userName: string;
  showConfetti: boolean;
}

function RevealedView({ wishes, wishesLoading, userName, showConfetti }: RevealedViewProps) {
  const firstName = userName.split(" ")[0] || "";
  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Confetti burst fires once on reveal */}
      {showConfetti && <Confetti count={100} />}

      {/* Hero header */}
      <div className="relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950/80 via-neutral-950 to-pink-950/60" />
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-[100px] animate-glow-pulse" />
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-pink-600/20 rounded-full blur-[80px] animate-glow-pulse"
            style={{ animationDelay: "3s" }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 sm:py-24 text-center space-y-5">
          <div className="text-6xl sm:text-7xl select-none animate-spin-in inline-block">
            🎉
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            <span className="gradient-text">
              Happy Birthday{firstName ? `, ${firstName}` : ""}!
            </span>
          </h1>
          <p className="text-neutral-300 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Everyone who loves you gathered here to say something.
            These are all for you. 💜
          </p>
          {wishes.length > 0 && !wishesLoading && (
            <p className="text-sm text-neutral-500">
              {wishes.length} {wishes.length === 1 ? "wish" : "wishes"} waiting for you ↓
            </p>
          )}
        </div>
      </div>

      {/* Wishes grid */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-20 pt-4">
        {wishesLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-28 rounded-2xl" />
            ))}
          </div>
        ) : wishes.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">
            <p className="text-4xl mb-4">💌</p>
            <p className="text-sm">No wishes yet — but you are loved.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {wishes.map((wish, i) => (
              <WishCard key={wish.id} wish={wish} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BirthdayExperiencePage() {
  const { user } = useAuth();
  const { isRevealed, revealTimestamp, loading } = useRevealStatus();
  const { wishes, loading: wishesLoading } = useWishes(isRevealed);

  // Fire confetti only on the first transition from locked → revealed
  const prevRevealed = useRef<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (prevRevealed.current === false && isRevealed === true) {
      setShowConfetti(true);
      // Reset after 5s so confetti only fires once
      const t = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(t);
    }
    if (!loading) {
      prevRevealed.current = isRevealed;
    }
  }, [isRevealed, loading]);

  if (loading) return <LoadingView />;

  return (
    <>
      <header className="fixed top-0 right-0 z-20 p-4">
        <SignOutButton />
      </header>

      {isRevealed ? (
        <RevealedView
          wishes={wishes}
          wishesLoading={wishesLoading}
          userName={user?.displayName ?? ""}
          showConfetti={showConfetti}
        />
      ) : (
        <LockedView
          revealTimestamp={revealTimestamp}
          userName={user?.displayName ?? ""}
        />
      )}
    </>
  );
}
