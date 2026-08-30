"use client";

/**
 * Role-guard layout for all (guest) routes.
 * Sprint 9 polish: branded aurora loading screen.
 *
 * Redirects non-guests to their appropriate destination after role resolution.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useRole";

interface GuestLayoutProps {
  children: React.ReactNode;
}

/**
 * Wraps guest pages with a client-side role guard.
 */
export default function GuestLayout({ children }: GuestLayoutProps) {
  const router = useRouter();
  const { role, loading } = useRole();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (role === "organizer") {
      router.replace("/dashboard");
    } else if (role === "birthday_person") {
      router.replace("/experience");
    } else if (!role) {
      router.replace("/");
    }
  }, [role, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full bg-violet-600/10 blur-[110px] animate-glow-pulse" />
        <div className="flex flex-col items-center gap-5 relative z-10 animate-scale-in">
          <span className="text-5xl animate-float-cake drop-shadow-[0_0_20px_rgba(139,92,246,0.2)]">🎁</span>
          <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-500 text-sm font-heading">Loading…</p>
        </div>
      </div>
    );
  }

  if (role !== "guest") {
    return null;
  }

  return <>{children}</>;
}
