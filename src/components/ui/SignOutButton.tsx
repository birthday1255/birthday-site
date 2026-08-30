"use client";

/**
 * SignOutButton — calls Firebase signOut and redirects to the landing page.
 * Sprint 9 polish: glassmorphism background, hover glow.
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
      className="px-3.5 py-1.5 text-xs text-neutral-400 bg-white/[0.04] border border-white/[0.08]
                 rounded-xl hover:bg-white/[0.08] hover:text-neutral-200 hover:border-white/[0.12]
                 transition-all duration-200 disabled:opacity-50 font-heading"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
