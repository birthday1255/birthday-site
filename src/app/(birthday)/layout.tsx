"use client";

/**
 * Role-guard layout for all (birthday) routes.
 * Sprint 9 polish: branded aurora loading screen.
 *
 * Allows only birthday_person role. Redirects organizer to /dashboard,
 * guests to /wish, and unauthenticated users to /.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useRole";

interface BirthdayLayoutProps {
  children: React.ReactNode;
}

export default function BirthdayLayout({ children }: BirthdayLayoutProps) {
  const router = useRouter();
  const { role, loading } = useRole();

  useEffect(() => {
    if (loading) return;
    if (role === "organizer") router.replace("/dashboard");
    else if (role === "guest") router.replace("/wish");
    else if (!role) router.replace("/");
  }, [role, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen aurora-bg-vivid flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-violet-600/12 blur-[120px] animate-glow-pulse" />
        <div className="flex flex-col items-center gap-5 relative z-10 animate-scale-in">
          <span className="text-5xl animate-float-cake drop-shadow-[0_0_20px_rgba(139,92,246,0.25)]">🎂</span>
          <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-500 text-sm font-heading">Preparing your experience…</p>
        </div>
      </div>
    );
  }

  if (role !== "birthday_person") return null;

  return <>{children}</>;
}
