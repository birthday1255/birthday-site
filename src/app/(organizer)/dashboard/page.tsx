"use client";

/**
 * Organizer Dashboard — Sprint 9 UI Polish.
 *
 * Premium dark design with aurora background, glassmorphism stat cards,
 * animated number count-up, and clearly sectioned panels.
 */
import { useState, useEffect, useCallback, useRef } from "react";
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

// ─── Animated counter ────────────────────────────────────────────────────────

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;

    const duration = 600;
    const startTime = Date.now();

    function tick() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    prevRef.current = end;
  }, [value]);

  return <>{display}</>;
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  gradient: string;
  glowColor: string;
  description?: string;
  delay?: string;
}

function StatCard({ icon, label, value, gradient, glowColor, description, delay }: StatCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6 glass-card
                 group card-hover-lift animate-fade-slide-up"
      style={{ animationDelay: delay ?? "0ms" }}
    >
      {/* Gradient glow */}
      <div
        className={`absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl
                    opacity-15 group-hover:opacity-30 transition-opacity duration-500 ${gradient}`}
      />
      {/* Bottom glow */}
      <div
        className={`absolute -bottom-4 -left-4 w-20 h-20 rounded-full blur-2xl
                    opacity-0 group-hover:opacity-15 transition-opacity duration-500 ${glowColor}`}
      />
      <div className="relative z-10 flex flex-col gap-4">
        <div className="w-11 h-11 rounded-2xl bg-white/[0.05] flex items-center justify-center text-xl
                        group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div>
          <p className="text-3xl font-bold text-white tabular-nums font-heading">
            <AnimatedNumber value={value} />
          </p>
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
  delay?: string;
}

function Section({ title, subtitle, badge, children, delay }: SectionProps) {
  return (
    <section
      className="rounded-3xl glass-card overflow-hidden animate-fade-slide-up"
      style={{ animationDelay: delay ?? "0ms" }}
    >
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white font-heading">{title}</h2>
          {subtitle && (
            <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {badge && (
          <span className="text-xs font-medium px-3 py-1 rounded-full
                           bg-violet-500/10 text-violet-300 border border-violet-500/15">
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
    <div className="min-h-screen aurora-bg relative">
      {/* Ambient glow orbs */}
      <div className="fixed top-0 left-0 right-0 h-80 pointer-events-none z-0">
        <div className="absolute top-[-60px] left-1/4 w-[500px] h-[500px] rounded-full bg-violet-700/8 blur-[140px] animate-glow-pulse" />
        <div className="absolute top-[-40px] right-1/4 w-[350px] h-[350px] rounded-full bg-fuchsia-700/6 blur-[110px] animate-glow-pulse" style={{ animationDelay: "3s" }} />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 sticky top-0 border-b border-white/[0.06] bg-black/30 backdrop-blur-2xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600
                            flex items-center justify-center text-sm font-bold text-white
                            shadow-lg shadow-violet-900/30">
              🎂
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none font-heading">Birthday 2026</p>
              <p className="text-xs text-neutral-500 mt-0.5">Organizer Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full
                            bg-emerald-500/8 border border-emerald-500/15">
              <span className="relative w-2 h-2 rounded-full bg-emerald-400">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
              </span>
              <span className="text-xs text-emerald-400 font-medium">Live</span>
            </div>
            <span className="text-xs text-neutral-400 hidden md:block">{user?.displayName}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Welcome line */}
        <div className="animate-fade-slide-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading">
            Hey {firstName}{" "}
            <span className="inline-block animate-wave">👋</span>
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
            glowColor="bg-violet-500"
            description="Signed in (IST)"
            delay="0.05s"
          />
          <StatCard
            icon="👥"
            label="Total Guests"
            value={stats.totalGuests}
            gradient="bg-blue-500"
            glowColor="bg-blue-500"
            description="All-time sign-ins"
            delay="0.1s"
          />
          <StatCard
            icon="💌"
            label="Wishes Received"
            value={stats.totalWishes}
            gradient="bg-pink-500"
            glowColor="bg-pink-500"
            delay="0.15s"
          />
        </div>

        {/* ── Share link ── */}
        <Section
          title="Share the Birthday Site"
          subtitle="Anyone with this link can sign in and send a wish"
          delay="0.2s"
        >
          <ShareLink />
        </Section>

        {/* ── Reveal control ── */}
        <Section
          title="Reveal Control"
          subtitle="Toggle wishes visible to the birthday person — updates instantly"
          badge="🔑 Organizer only"
          delay="0.25s"
        >
          <RevealPanel />
        </Section>

        {/* ── Personal Gallery link ── */}
        <Link href="/gallery" className="block animate-fade-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="rounded-3xl glass-card p-6
                          hover:border-violet-700/30 transition-all duration-300
                          flex items-center justify-between group card-hover-lift">
            <div>
              <h2 className="text-sm font-semibold text-white font-heading">Personal Gallery</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Upload photos &amp; videos for the birthday person to see after reveal
              </p>
            </div>
            <span className="text-2xl group-hover:scale-125 group-hover:rotate-6 transition-transform duration-300">📸</span>
          </div>
        </Link>

        {/* ── Two-col: visitors + wishes ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section
            title="Who Visited Today"
            subtitle="Guests who signed in today (IST)"
            delay="0.35s"
          >
            <VisitorsTodayList refreshTrigger={refreshTrigger} />
          </Section>

          <Section
            title="Wishes Received 💌"
            subtitle="All submitted birthday messages"
            delay="0.4s"
          >
            <WishesList refreshTrigger={refreshTrigger} />
          </Section>
        </div>
      </main>
    </div>
  );
}
