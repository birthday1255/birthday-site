import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome",
  description: "Sign in to join the birthday celebration.",
};

/**
 * Landing page — shown to all visitors before authentication.
 * The SignInButton component (TASK-008) will replace the placeholder below.
 */
export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="text-center space-y-6 px-4 max-w-sm w-full">
        <div className="text-6xl select-none">🎂</div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Birthday 2026
          </h1>
          <p className="text-neutral-400">
            A private celebration — invite only.
          </p>
        </div>

        {/* Wired to Firebase Auth in TASK-008 */}
        <button
          id="sign-in-google"
          className="w-full px-6 py-3 bg-white text-neutral-900 rounded-lg
                     font-medium hover:bg-neutral-100 active:bg-neutral-200
                     transition-colors duration-150 disabled:opacity-50
                     disabled:cursor-not-allowed"
          disabled
          aria-label="Sign in with Google"
        >
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
