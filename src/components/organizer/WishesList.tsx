"use client";

/**
 * WishesList — organizer view of all submitted wishes.
 * Sprint 9 polish: glassmorphism cards, staggered entrances, gradient author avatars.
 */
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Wish } from "@/types/wish";
import { WishMediaDisplay } from "@/components/ui/WishMediaDisplay";

interface WishesListProps {
  refreshTrigger?: number;
}

const ACCENTS = [
  "from-violet-600 to-purple-600",
  "from-fuchsia-600 to-pink-600",
  "from-rose-600 to-red-600",
  "from-indigo-600 to-blue-600",
  "from-pink-600 to-rose-600",
];

/**
 * Renders all submitted wishes for the organizer dashboard.
 */
export function WishesList({ refreshTrigger = 0 }: WishesListProps) {
  const { user } = useAuth();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishes = useCallback(async () => {
    if (!user) return;
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
  }, [user]);

  useEffect(() => {
    void fetchWishes();
  }, [fetchWishes, refreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="skeleton h-28 rounded-2xl"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    );
  }

  if (wishes.length === 0) {
    return (
      <div className="text-center py-10 space-y-3">
        <span className="text-3xl block">💌</span>
        <p className="text-neutral-500 text-sm">
          No wishes submitted yet. Share the site link to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {wishes.map((wish, i) => (
        <div
          key={wish.id}
          className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 space-y-3
                     hover:bg-white/[0.04] hover:border-white/[0.08]
                     transition-all duration-200 animate-fade-slide-up"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          {/* Author row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${ACCENTS[i % ACCENTS.length]}
                            flex items-center justify-center text-xs font-bold text-white shrink-0`}
              >
                {wish.authorName?.[0]?.toUpperCase() ?? "?"}
              </div>
              <p className="text-sm font-semibold text-neutral-200 font-heading">
                {wish.authorName || "Anonymous"}
              </p>
            </div>
            <p className="text-xs text-neutral-500 tabular-nums">
              {wish.submittedAt
                ? new Date(
                    (wish.submittedAt as unknown as { seconds: number })
                      .seconds * 1000
                  ).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </p>
          </div>

          {/* Wish content */}
          <p className="text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed">
            {wish.content}
          </p>

          {/* Attached Media Display */}
          <WishMediaDisplay mediaUrls={wish.mediaUrls} />
        </div>
      ))}
    </div>
  );
}
