"use client";

/**
 * WishesList — organizer view of all submitted wishes.
 *
 * Fetches GET /api/wishes (organizer-allowed) and renders
 * each wish as a card with author, timestamp, and message.
 * Sprint 4 extension / TASK-017 preview.
 */
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Wish } from "@/types/wish";
import { WishMediaDisplay } from "@/components/ui/WishMediaDisplay";

interface WishesListProps {
  refreshTrigger?: number;
}

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
          <div key={i} className="h-24 bg-neutral-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (wishes.length === 0) {
    return (
      <p className="text-neutral-500 text-sm text-center py-8">
        No wishes submitted yet. Share the site link to get started!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {wishes.map((wish) => (
        <div
          key={wish.id}
          className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4 space-y-2"
        >
          {/* Author row */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-violet-300">
              {wish.authorName || "Anonymous"}
            </p>
            <p className="text-xs text-neutral-500">
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
