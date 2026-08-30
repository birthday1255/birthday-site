"use client";

/**
 * Birthday Person Experience Page — Sprint 9 Premium Polish.
 *
 * States:
 *  1. Loading  — branded spinner with aurora bg
 *  2. Locked   — countdown to reveal, sparkle particles, floating gifts
 *  3. Revealed — confetti burst, hero gradient, wish cascade + gallery
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
import { GallerySection } from "@/components/birthday/GallerySection";
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
    <div className="min-h-screen aurora-bg-vivid flex items-center justify-center relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-violet-600/15 blur-[120px] animate-glow-pulse" />
      <div className="flex flex-col items-center gap-5 relative z-10">
        <span className="text-5xl animate-float-cake">🎂</span>
        <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-400 text-sm">
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
    <div className="min-h-screen aurora-bg-vivid flex flex-col items-center justify-center px-6 text-center gap-10 relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[600px] h-[600px]
                      rounded-full bg-violet-700/12 blur-[140px] pointer-events-none animate-glow-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px]
                      rounded-full bg-fuchsia-700/8 blur-[100px] pointer-events-none animate-glow-pulse"
        style={{ animationDelay: "4s" }} />

      {/* Floating sparkle particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <span
          key={i}
          className="absolute text-violet-400/40 animate-sparkle pointer-events-none"
          style={{
            top: `${15 + Math.random() * 70}%`,
            left: `${10 + Math.random() * 80}%`,
            fontSize: `${8 + Math.random() * 8}px`,
            animationDelay: `${i * 0.5}s`,
          }}
        >
          ✦
        </span>
      ))}

      {/* Cake with sparkle halo */}
      <div className="relative z-10 animate-scale-in">
        <span className="text-8xl sm:text-9xl select-none inline-block animate-float-cake
                         drop-shadow-[0_0_40px_rgba(139,92,246,0.35)]">
          🎂
        </span>
        {/* Sparkles */}
        <span className="absolute -top-2 -right-2 text-sm text-violet-400 animate-sparkle">✦</span>
        <span className="absolute top-0 -left-3 text-xs text-fuchsia-400 animate-sparkle" style={{ animationDelay: "0.8s" }}>✧</span>
        <span className="absolute -bottom-1 right-0 text-xs text-pink-400 animate-sparkle" style={{ animationDelay: "1.5s" }}>✦</span>
      </div>

      <div className="space-y-3 max-w-sm relative z-10 animate-fade-slide-up" style={{ animationDelay: "0.2s" }}>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
          {firstName ? (
            <>Hey {firstName}! <span className="inline-block animate-wave">👋</span></>
          ) : (
            "Your surprise is coming!"
          )}
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          Everyone who loves you has left a message here.
          They&apos;ll appear the moment the organizer hits reveal.
          <br />
          <span className="text-neutral-600 text-xs">No refresh needed — it&apos;s live. ✨</span>
        </p>
      </div>

      {revealTimestamp && revealTimestamp > new Date() ? (
        <div className="space-y-5 relative z-10 animate-fade-slide-up" style={{ animationDelay: "0.4s" }}>
          <p className="text-xs text-neutral-500 uppercase tracking-[0.2em] font-heading">
            Reveal in
          </p>
          <CountdownTimer targetDate={revealTimestamp} />
        </div>
      ) : (
        <div className="glass-card-vivid rounded-2xl px-8 py-5 relative z-10 animate-fade-slide-up" style={{ animationDelay: "0.4s" }}>
          <p className="text-sm text-neutral-400 flex items-center gap-2">
            <span className="text-base">🔒</span> Waiting for the organizer to reveal…
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
    <div className="min-h-screen aurora-bg">
      {/* Confetti burst fires once on reveal */}
      {showConfetti && <Confetti count={120} />}

      {/* Hero header */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 aurora-bg-vivid" />
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-fuchsia-600/12 rounded-full blur-[100px] animate-glow-pulse"
            style={{ animationDelay: "3s" }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 sm:py-28 text-center space-y-6">
          <div className="text-6xl sm:text-7xl select-none animate-spin-in inline-block
                          drop-shadow-[0_0_30px_rgba(232,121,249,0.3)]">
            🎉
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight font-heading">
            <span className="gradient-text">
              Happy Birthday{firstName ? `, ${firstName}` : ""}!
            </span>
          </h1>
          <p className="text-neutral-300 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Everyone who loves you gathered here to say something.
            These are all for you. 💜
          </p>
          {wishes.length > 0 && !wishesLoading && (
            <p className="text-sm text-neutral-500 animate-fade-slide-up" style={{ animationDelay: "0.5s" }}>
              {wishes.length} {wishes.length === 1 ? "wish" : "wishes"} waiting for you ↓
            </p>
          )}
        </div>
      </div>

      {/* Wishes */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-10 pt-4">
        {wishesLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-3xl" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : wishes.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <span className="text-5xl block animate-float-cake">💌</span>
            <p className="text-neutral-500 text-sm">No wishes yet — but you are loved.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-neutral-600 text-center mb-8 uppercase tracking-[0.2em] font-heading">
              {wishes.length} {wishes.length === 1 ? "wish" : "wishes"} from people who care
            </p>
            {wishes.map((wish, i) => (
              <WishCard key={wish.id} wish={wish} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Personal gallery — shown after wishes */}
      <GallerySection isRevealed={true} />
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
