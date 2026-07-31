"use client";

/**
 * GuestList — displays all users with role 'guest' fetched from /api/users.
 * Organizer dashboard, Sprint 4 (TASK-015).
 */
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { UserProfile } from "@/types/user";

interface GuestListProps {
  /** Triggers a refresh when invite creation is confirmed. */
  refreshTrigger: number;
}

/**
 * Fetches and renders the guest list. Re-fetches when refreshTrigger changes.
 */
export function GuestList({ refreshTrigger }: GuestListProps) {
  const { user } = useAuth();
  const [guests, setGuests] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGuests = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/users?role=guest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as { users: UserProfile[] };
        setGuests(data.users);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchGuests();
  }, [fetchGuests, refreshTrigger]);

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

  if (guests.length === 0) {
    return (
      <p className="text-neutral-500 text-sm text-center py-8">
        No guests have joined yet. Send invite links to get started.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-800">
            <th className="text-left py-3 px-2 text-neutral-400 font-medium">Name</th>
            <th className="text-left py-3 px-2 text-neutral-400 font-medium">Email</th>
            <th className="text-left py-3 px-2 text-neutral-400 font-medium">Joined</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((guest) => (
            <tr
              key={guest.uid}
              className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors"
            >
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  {guest.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={guest.photoURL}
                      alt=""
                      className="w-7 h-7 rounded-full"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center text-xs text-neutral-400">
                      {guest.displayName?.[0] ?? "?"}
                    </div>
                  )}
                  <span className="text-neutral-200">{guest.displayName}</span>
                </div>
              </td>
              <td className="py-3 px-2 text-neutral-400">{guest.email}</td>
              <td className="py-3 px-2 text-neutral-500 text-xs">
                {guest.createdAt
                  ? new Date(
                      (guest.createdAt as unknown as { seconds: number }).seconds * 1000
                    ).toLocaleDateString("en-IN")
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
