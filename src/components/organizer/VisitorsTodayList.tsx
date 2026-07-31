"use client";

/**
 * VisitorsTodayList — guests who signed in today (IST), for organizer monitoring.
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
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-12 bg-neutral-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (visitors.length === 0) {
    return (
      <p className="text-neutral-500 text-sm text-center py-8">
        No visitors yet today. Share the site link to get started.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-800">
            <th className="text-left py-3 px-2 text-neutral-400 font-medium">
              Name
            </th>
            <th className="text-left py-3 px-2 text-neutral-400 font-medium">
              Email
            </th>
            <th className="text-left py-3 px-2 text-neutral-400 font-medium">
              Visited at
            </th>
          </tr>
        </thead>
        <tbody>
          {visitors.map((visitor) => (
            <tr
              key={visitor.uid}
              className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors"
            >
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  {visitor.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={visitor.photoURL}
                      alt=""
                      className="w-7 h-7 rounded-full"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center text-xs text-neutral-400">
                      {visitor.displayName?.[0] ?? "?"}
                    </div>
                  )}
                  <span className="text-neutral-200">{visitor.displayName}</span>
                </div>
              </td>
              <td className="py-3 px-2 text-neutral-400">{visitor.email}</td>
              <td className="py-3 px-2 text-neutral-500 text-xs">
                {formatVisitTime(visitor.lastVisitedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
