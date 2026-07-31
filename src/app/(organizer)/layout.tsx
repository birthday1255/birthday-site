"use client";

/**
 * Role-guard layout for all (organizer) routes.
 *
 * Reads the current user's role via useRole(). If the resolved role is not
 * "organizer", redirects immediately to the landing page. Shows a minimal
 * loading screen while auth and role resolution are in-flight.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useRole";

interface OrganizerLayoutProps {
  children: React.ReactNode;
}

/**
 * Wraps all organizer pages with a client-side role guard.
 * The Next.js edge middleware provides a first layer of auth presence
 * checking; this component provides the role-specific second layer.
 */
export default function OrganizerLayout({ children }: OrganizerLayoutProps) {
  const router = useRouter();
  const { role, loading } = useRole();

  useEffect(() => {
    if (!loading && role !== "organizer") {
      router.replace("/");
    }
  }, [role, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-500 text-sm">Verifying access…</p>
        </div>
      </div>
    );
  }

  if (role !== "organizer") {
    return null;
  }

  return <>{children}</>;
}
