"use client";

/**
 * VisitorsTodayList — guests who signed in today (IST), for organizer monitoring.
 * Sprint 9 polish: card-style rows, avatar gradient rings, staggered entrance.
 */
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { UserProfile } from "@/types/user";

interface VisitorsTodayListProps {
  refreshTrigger: number;
}

/** Formats a Firestore timestamp for display in IST. */
function formatVisitTime(
  lastVisitedAt: UserProfile["lastVisitedAt"]
): string {
  if (!lastVisitedAt) {
    return "—";
  }
  const seconds =
    typeof lastVisitedAt === "object" && "seconds" in lastVisitedAt
      ? (lastVisitedAt as { seconds: number }).seconds
      : null;
  if (seconds === null) {
    return "—";
  }
  return new Date(seconds * 1000).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Fetches and renders today's visitor list for the organizer dashboard.
 */
export function VisitorsTodayList({ refreshTrigger }: VisitorsTodayListProps) {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVisitors = useCallback(async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/users?visitedToday=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as { users: UserProfile[] };
        setVisitors(data.users);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchVisitors();
  }, [fetchVisitors, refreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="skeleton h-16 rounded-2xl"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    );
  }

  if (visitors.length === 0) {
    return (
      <div className="text-center py-10 space-y-3">
        <span className="text-3xl block">👀</span>
        <p className="text-neutral-500 text-sm">
          No visitors yet today. Share the site link to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visitors.map((visitor, i) => (
        <div
          key={visitor.uid}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl
                     bg-white/[0.02] border border-white/[0.04]
                     hover:bg-white/[0.04] hover:border-white/[0.08]
                     transition-all duration-200 animate-fade-slide-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {/* Avatar */}
          {visitor.photoURL ? (
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-br from-violet-500 to-fuchsia-500">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={visitor.photoURL}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600
                            flex items-center justify-center text-xs font-bold text-white shrink-0">
              {visitor.displayName?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-neutral-200 font-medium truncate">
              {visitor.displayName}
            </p>
            <p className="text-xs text-neutral-500 truncate">{visitor.email}</p>
          </div>

          {/* Time */}
          <span className="text-xs text-neutral-500 tabular-nums shrink-0 px-2 py-1
                           bg-white/[0.03] rounded-lg">
            {formatVisitTime(visitor.lastVisitedAt)}
          </span>
        </div>
      ))}
    </div>
  );
}
