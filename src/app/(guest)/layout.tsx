"use client";

/**
 * Role-guard layout for all (guest) routes.
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
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-500 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (role !== "guest") {
    return null;
  }

  return <>{children}</>;
}
