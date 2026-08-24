"use client";

/**
 * Role-guard layout for all (birthday) routes.
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
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-500 text-sm">Preparing your experience…</p>
        </div>
      </div>
    );
  }

  if (role !== "birthday_person") return null;

  return <>{children}</>;
}
