"use client";

/**
 * useRevealStatus — polls GET /api/reveal every 5 seconds.
 *
 * Replaces the previous Firestore client onSnapshot approach which would
 * silently hang forever if Firestore security rules blocked direct client reads.
 *
 * Polling via the API route is reliable because the API uses Firebase Admin SDK
 * which bypasses security rules entirely. The 5-second interval gives near
 * real-time behaviour without a persistent WebSocket connection.
 *
 * Used by the birthday person experience page to auto-transition from
 * the countdown/locked state to the revealed wish cascade.
 */
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

interface RevealStatus {
  isRevealed: boolean;
  revealTimestamp: Date | null;
  /** True on the very first fetch before any data arrives. */
  loading: boolean;
}

const POLL_INTERVAL_MS = 5000;

export function useRevealStatus(): RevealStatus {
  const { user } = useAuth();
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [revealTimestamp, setRevealTimestamp] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReveal = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/reveal", {
        headers: { Authorization: `Bearer ${token}` },
        // Bust the Next.js data cache so we always get fresh data
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = (await res.json()) as {
        is_revealed?: boolean;
        reveal_timestamp?: { seconds: number } | string | null;
      };

      setIsRevealed(Boolean(data.is_revealed));

      if (data.reveal_timestamp) {
        // Firestore Timestamp serialised as { seconds, nanoseconds } or ISO string
        if (
          typeof data.reveal_timestamp === "object" &&
          "seconds" in data.reveal_timestamp
        ) {
          setRevealTimestamp(
            new Date(data.reveal_timestamp.seconds * 1000)
          );
        } else if (typeof data.reveal_timestamp === "string") {
          setRevealTimestamp(new Date(data.reveal_timestamp));
        }
      } else {
        setRevealTimestamp(null);
      }
    } catch {
      // Network error — keep previous state, don't crash
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch + polling every 5 seconds
  useEffect(() => {
    void fetchReveal();
    const interval = setInterval(() => void fetchReveal(), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchReveal]);

  return { isRevealed, revealTimestamp, loading };
}
