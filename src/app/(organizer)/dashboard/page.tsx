"use client";

/**
 * Organizer Dashboard — visitor monitoring, share link, and reveal control.
 *
 * Role guard is applied by (organizer)/layout.tsx, not here.
 */
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { StatsCard } from "@/components/organizer/StatsCard";
import { VisitorsTodayList } from "@/components/organizer/VisitorsTodayList";
import { ShareLink } from "@/components/organizer/ShareLink";
import { RevealPanel } from "@/components/organizer/RevealPanel";
import { WishesList } from "@/components/organizer/WishesList";
import { SignOutButton } from "@/components/ui/SignOutButton";

interface DashboardStats {
  visitorsToday: number;
  totalGuests: number;
  totalWishes: number;
}

/**
 * Fetches dashboard stats for the organizer stats row.
 */
function useDashboardStats(
  user: ReturnType<typeof useAuth>["user"],
  refreshTrigger: number
) {
  const [stats, setStats] = useState<DashboardStats>({
    visitorsToday: 0,
    totalGuests: 0,
    totalWishes: 0,
  });

  const fetchStats = useCallback(async () => {
    if (!user) {
      return;
    }
    const token = await user.getIdToken();
    const headers = { Authorization: `Bearer ${token}` };
    const [todayRes, guestsRes, wishesRes] = await Promise.all([
      fetch("/api/users?visitedToday=true", { headers }),
      fetch("/api/users?role=guest", { headers }),
      fetch("/api/wishes", { headers }),
    ]);

    const todayData = todayRes.ok
      ? (await todayRes.json() as { users: unknown[] })
      : { users: [] };
    const guestsData = guestsRes.ok
      ? (await guestsRes.json() as { users: unknown[] })
      : { users: [] };
    const wishesData = wishesRes.ok
      ? (await wishesRes.json() as { wishes: unknown[] })
      : { wishes: [] };

    setStats({
      visitorsToday: todayData.users.length,
      totalGuests: guestsData.users.length,
      totalWishes: wishesData.wishes.length,
    });
  }, [user]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats, refreshTrigger]);

  return stats;
}

export default function OrganizerDashboardPage() {
  const { user } = useAuth();
  const [refreshTrigger] = useState(0);
  const stats = useDashboardStats(user, refreshTrigger);

  return (
    <main className="min-h-screen bg-neutral-950">
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
        <section aria-label="Dashboard statistics">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatsCard
              icon="📊"
              label="Visitors Today"
              value={stats.visitorsToday}
              description="Signed in today (IST)"
              accentClass="bg-violet-500/10"
            />
            <StatsCard
              icon="👥"
              label="Total Guests"
              value={stats.totalGuests}
              description="All-time sign-ins"
              accentClass="bg-blue-500/10"
            />
            <StatsCard
              icon="💌"
              label="Wishes Received"
              value={stats.totalWishes}
              accentClass="bg-pink-500/10"
            />
          </div>
        </section>

        <section
          aria-label="Share site link"
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
        >
          <h2 className="text-sm font-semibold text-white mb-1">Share the site</h2>
          <p className="text-xs text-neutral-500 mb-4">
            Anyone with this link can sign in and send a birthday wish.
          </p>
          <ShareLink />
        </section>

        <section
          aria-label="Today's visitors"
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
        >
          <h2 className="text-sm font-semibold text-white mb-1">
            Who visited today
          </h2>
          <p className="text-xs text-neutral-500 mb-4">
            Guests who opened the site and signed in today.
          </p>
          <VisitorsTodayList refreshTrigger={refreshTrigger} />
        </section>

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

        {/* ── Wishes Received ── */}
        <section
          aria-label="Wishes received"
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Wishes Received</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                All submitted birthday wishes — organizer preview.
              </p>
            </div>
            <span className="text-lg">💌</span>
          </div>
          <WishesList refreshTrigger={refreshTrigger} />
        </section>
      </div>
    </main>
  );
}
