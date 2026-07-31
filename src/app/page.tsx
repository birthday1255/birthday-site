"use client";

/**
 * Landing page — public entry point for all visitors.
 *
 * Sign in with Google → auto-assigned guest role → redirected by role.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { roleRedirectPath } from "@/lib/utils/roleRedirect";
import type { UserRole } from "@/types/user";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      const idToken = await user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "GET",
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!res.ok) {
        throw new Error("Session setup failed. Try again.");
      }

      const data = (await res.json()) as { role: UserRole | null };
      router.push(roleRedirectPath(data.role));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Sign-in failed. Try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="text-center space-y-6 px-4 max-w-sm w-full">
        <div className="text-6xl select-none">🎂</div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Birthday 2026
          </h1>
          <p className="text-neutral-400">
            Sign in to visit and send a birthday wish.
          </p>
        </div>

        <button
          id="sign-in-google"
          onClick={() => void handleSignIn()}
          disabled={loading}
          aria-label="Sign in with Google"
          className="w-full px-6 py-3 bg-white text-neutral-900 rounded-lg
                     font-medium hover:bg-neutral-100 active:bg-neutral-200
                     transition-colors duration-150 disabled:opacity-50
                     disabled:cursor-not-allowed"
        >
          {loading ? "Signing in…" : "Sign in with Google"}
        </button>

        {error && (
          <p role="alert" className="text-sm text-red-400 break-words">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
