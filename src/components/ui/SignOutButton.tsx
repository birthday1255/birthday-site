"use client";

/**
 * SignOutButton — calls Firebase signOut and redirects to the landing page.
 * Used in the organizer dashboard header.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/firebase/auth";

/**
 * Renders a sign-out button. Handles loading state and redirects to / on success.
 */
export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    router.replace("/");
  };

  return (
    <button
      id="sign-out"
      onClick={() => void handleSignOut()}
      disabled={loading}
      className="px-3 py-1.5 text-xs text-neutral-400 border border-neutral-700
                 rounded-lg hover:bg-neutral-800 hover:text-neutral-200
                 transition-colors disabled:opacity-50"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
