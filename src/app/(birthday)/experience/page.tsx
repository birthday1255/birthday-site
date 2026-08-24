"use client";

/**
 * Birthday Person Experience Page — Sprint 7 (TASK-026, 027, 028).
 *
 * States:
 *  1. Loading — spinner while reveal status resolves
 *  2. Locked  — countdown to reveal_timestamp (or a "waiting" state if no
 *               timestamp set); organizer can still flip the reveal toggle
 *               at any time which instantly unlocks this view via onSnapshot
 *  3. Revealed — full-screen wish cascade with celebratory header
 *
 * Role guard is applied by (birthday)/layout.tsx, not here.
 */
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRevealStatus } from "@/hooks/useRevealStatus";
import { CountdownTimer } from "@/components/birthday/CountdownTimer";
import { WishCard } from "@/components/birthday/WishCard";
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
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
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
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-6 text-center gap-10">
      {/* Cake */}
      <div className="text-8xl animate-bounce select-none">🎂</div>

      <div className="space-y-3 max-w-md">
        <h1 className="text-3xl font-bold text-white">
          {userName ? `Hey ${userName.split(" ")[0]}!` : "Hey!"}
        </h1>
        <p className="text-neutral-400 leading-relaxed">
          Your birthday surprise is locked away. Once the organizer hits reveal,
          all the messages and memories will appear here instantly — no refresh
          needed.
        </p>
      </div>

      {revealTimestamp && revealTimestamp > new Date() ? (
        <div className="space-y-4">
          <p className="text-sm text-neutral-500 uppercase tracking-wider">
            Reveal in
          </p>
          <CountdownTimer targetDate={revealTimestamp} />
        </div>
      ) : (
        <div className="px-6 py-3 bg-neutral-900 border border-neutral-800 rounded-xl">
          <p className="text-sm text-neutral-400">
            🔒 Waiting for the organizer to reveal…
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
}

function RevealedView({ wishes, wishesLoading, userName }: RevealedViewProps) {
  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Celebratory header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-950 via-neutral-950 to-pink-950">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #7c3aed 0%, transparent 50%), radial-gradient(circle at 80% 20%, #db2777 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-6 py-16 text-center space-y-4">
          <div className="text-6xl select-none animate-pulse">🎉</div>
          <h1 className="text-4xl font-bold text-white">
            Happy Birthday{userName ? `, ${userName.split(" ")[0]}` : ""}!
          </h1>
          <p className="text-neutral-300 text-lg">
            Everyone who loves you left a message. Here they are — just for you.
          </p>
        </div>
      </div>

      {/* Wishes grid */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        {wishesLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-neutral-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : wishes.length === 0 ? (
          <p className="text-neutral-500 text-center py-16">
            No wishes yet — but the best ones are worth the wait. 💜
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-neutral-600 text-center mb-6 uppercase tracking-wider">
              {wishes.length} {wishes.length === 1 ? "wish" : "wishes"} from people who care
            </p>
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

  if (loading) return <LoadingView />;

  return (
    <>
      {/* Sticky minimal header — always visible */}
      <header className="fixed top-0 right-0 z-20 p-4">
        <SignOutButton />
      </header>

      {isRevealed ? (
        <RevealedView
          wishes={wishes}
          wishesLoading={wishesLoading}
          userName={user?.displayName ?? ""}
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
