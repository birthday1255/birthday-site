"use client";

/**
 * Organizer Dashboard — Sprint 9 UI Polish.
 *
 * Premium dark design with gradient accents, glassmorphism stat cards,
 * and clearly sectioned panels.
 */
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { VisitorsTodayList } from "@/components/organizer/VisitorsTodayList";
import { ShareLink } from "@/components/organizer/ShareLink";
import { RevealPanel } from "@/components/organizer/RevealPanel";
import { WishesList } from "@/components/organizer/WishesList";
import { SignOutButton } from "@/components/ui/SignOutButton";
import Link from "next/link";

interface DashboardStats {
  visitorsToday: number;
  totalGuests: number;
  totalWishes: number;
}

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
    if (!user) return;
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

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  gradient: string;
  description?: string;
}

function StatCard({ icon, label, value, gradient, description }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-6 border border-white/5 bg-neutral-900 group hover:border-white/10 transition-colors">
      {/* Gradient glow */}
      <div className={`absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity ${gradient}`} />
      <div className="relative z-10 flex flex-col gap-4">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-3xl font-bold text-white tabular-nums">{value}</p>
          <p className="text-sm font-medium text-neutral-300 mt-0.5">{label}</p>
          {description && (
            <p className="text-xs text-neutral-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
}

function Section({ title, subtitle, badge, children }: SectionProps) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          {subtitle && (
            <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {badge && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20">
            {badge}
          </span>
        )}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function OrganizerDashboardPage() {
  const { user } = useAuth();
  const [refreshTrigger] = useState(0);
  const stats = useDashboardStats(user, refreshTrigger);

  const firstName = user?.displayName?.split(" ")[0] ?? "Organizer";

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Ambient gradient top */}
      <div className="fixed top-0 left-0 right-0 h-64 pointer-events-none z-0">
        <div className="absolute top-[-40px] left-1/4 w-96 h-96 rounded-full bg-violet-700/10 blur-[120px]" />
        <div className="absolute top-[-40px] right-1/4 w-64 h-64 rounded-full bg-pink-700/10 blur-[100px]" />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 sticky top-0 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600
                            flex items-center justify-center text-sm font-bold text-white shadow-lg">
              🎂
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none">Birthday 2026</p>
              <p className="text-xs text-neutral-500 mt-0.5">Organizer Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full
                            bg-green-500/10 border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-medium">Live</span>
            </div>
            <span className="text-xs text-neutral-400 hidden md:block">{user?.displayName}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Welcome line */}
        <div>
          <h1 className="text-2xl font-bold text-white">
            Hey {firstName} 👋
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Here&apos;s everything happening for the birthday.
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon="📊"
            label="Visitors Today"
            value={stats.visitorsToday}
            gradient="bg-violet-500"
            description="Signed in (IST)"
          />
          <StatCard
            icon="👥"
            label="Total Guests"
            value={stats.totalGuests}
            gradient="bg-blue-500"
            description="All-time sign-ins"
          />
          <StatCard
            icon="💌"
            label="Wishes Received"
            value={stats.totalWishes}
            gradient="bg-pink-500"
          />
        </div>

        {/* ── Share link ── */}
        <Section
          title="Share the Birthday Site"
          subtitle="Anyone with this link can sign in and send a wish"
        >
          <ShareLink />
        </Section>

        {/* ── Reveal control ── */}
        <Section
          title="Reveal Control"
          subtitle="Toggle wishes visible to the birthday person — updates instantly"
          badge="🔑 Organizer only"
        >
          <RevealPanel />
        </Section>

        {/* ── Personal Gallery link ── */}
        <Link href="/gallery" className="block">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6
                          hover:border-violet-700/50 hover:bg-neutral-800/60 transition-all duration-200
                          flex items-center justify-between group">
            <div>
              <h2 className="text-sm font-semibold text-white">Personal Gallery</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Upload photos &amp; videos for the birthday person to see after reveal
              </p>
            </div>
            <span className="text-2xl group-hover:scale-110 transition-transform">📸</span>
          </div>
        </Link>

        {/* ── Two-col: visitors + wishes ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section
            title="Who Visited Today"
            subtitle="Guests who signed in today (IST)"
          >
            <VisitorsTodayList refreshTrigger={refreshTrigger} />
          </Section>

          <Section
            title="Wishes Received 💌"
            subtitle="All submitted birthday messages"
          >
            <WishesList refreshTrigger={refreshTrigger} />
          </Section>
        </div>
      </main>
    </div>
  );
}
