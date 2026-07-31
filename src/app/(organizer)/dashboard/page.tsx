"use client";

/**
 * Organizer Dashboard — TASK-014 through TASK-018.
 *
 * Sections:
 *  - Header with organizer name + sign-out
 *  - Stats row (total guests, pending invites, reveal status)
 *  - Invite creation (TASK-016)
 *  - Guest list table (TASK-015)
 *  - Reveal control panel (TASK-018)
 *
 * Role guard is applied by (organizer)/layout.tsx, not here.
 */
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { StatsCard } from "@/components/organizer/StatsCard";
import { GuestList } from "@/components/organizer/GuestList";
import { InviteForm } from "@/components/organizer/InviteForm";
import { RevealPanel } from "@/components/organizer/RevealPanel";
import { SignOutButton } from "@/components/ui/SignOutButton";
import type { Invite } from "@/types/invite";

interface DashboardStats {
  totalGuests: number;
  pendingInvites: number;
  acceptedInvites: number;
}

/**
 * Fetches invite stats server-side for the stats row.
 */
function useInviteStats(
  user: ReturnType<typeof useAuth>["user"],
  refreshTrigger: number
) {
  const [stats, setStats] = useState<DashboardStats>({
    totalGuests: 0,
    pendingInvites: 0,
    acceptedInvites: 0,
  });

  const fetchStats = useCallback(async () => {
    if (!user) return;
    const token = await user.getIdToken();
    const [usersRes, invitesRes] = await Promise.all([
      fetch("/api/users?role=guest", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/invites", { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    const usersData = usersRes.ok
      ? (await usersRes.json() as { users: unknown[] })
      : { users: [] };
    const invitesData = invitesRes.ok
      ? (await invitesRes.json() as { invites: Invite[] })
      : { invites: [] };

    setStats({
      totalGuests: usersData.users.length,
      pendingInvites: invitesData.invites.filter((i) => i.status === "pending").length,
      acceptedInvites: invitesData.invites.filter((i) => i.status === "accepted").length,
    });
  }, [user]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats, refreshTrigger]);

  return stats;
}

export default function OrganizerDashboardPage() {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const stats = useInviteStats(user, refreshTrigger);

  const handleInviteSuccess = () => setRefreshTrigger((n) => n + 1);

  return (
    <main className="min-h-screen bg-neutral-950">
      {/* ── Header ── */}
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎂</span>
            <div>
              <h1 className="text-sm font-semibold text-white">Birthday 2026</h1>
              <p className="text-xs text-neutral-500">Organizer Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user?.displayName && (
              <span className="text-xs text-neutral-400 hidden sm:block">
                {user.displayName}
              </span>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* ── Stats Row ── */}
        <section aria-label="Dashboard statistics">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatsCard
              icon="👥"
              label="Total Guests"
              value={stats.totalGuests}
              accentClass="bg-blue-500/10"
            />
            <StatsCard
              icon="📨"
              label="Pending Invites"
              value={stats.pendingInvites}
              description="Sent but not yet joined"
              accentClass="bg-amber-500/10"
            />
            <StatsCard
              icon="✅"
              label="Accepted Invites"
              value={stats.acceptedInvites}
              accentClass="bg-green-500/10"
            />
          </div>
        </section>

        {/* ── Invite Creation ── */}
        <section
          aria-label="Create invite"
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
        >
          <h2 className="text-sm font-semibold text-white mb-1">Send Invite</h2>
          <p className="text-xs text-neutral-500 mb-4">
            Generate an invite link for a guest or the birthday person.
          </p>
          <InviteForm onSuccess={handleInviteSuccess} />
        </section>

        {/* ── Guest List ── */}
        <section
          aria-label="Guest list"
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
        >
          <h2 className="text-sm font-semibold text-white mb-4">
            Guests who have joined
          </h2>
          <GuestList refreshTrigger={refreshTrigger} />
        </section>

        {/* ── Reveal Control ── */}
        <section
          aria-label="Reveal control"
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
        >
          <h2 className="text-sm font-semibold text-white mb-1">
            Reveal Control
          </h2>
          <p className="text-xs text-neutral-500 mb-4">
            Toggle the birthday reveal or schedule it for a specific date and time.
          </p>
          <RevealPanel />
        </section>
      </div>
    </main>
  );
}
