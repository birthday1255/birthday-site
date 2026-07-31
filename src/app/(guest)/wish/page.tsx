"use client";

/**
 * Guest wish submission page — write and submit a birthday wish.
 */
import { WishForm } from "@/components/guest/WishForm";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { useAuth } from "@/hooks/useAuth";

export default function GuestWishPage() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-neutral-950">
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎁</span>
            <div>
              <h1 className="text-sm font-semibold text-white">Send a Wish</h1>
              <p className="text-xs text-neutral-500">Birthday 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user?.displayName && (
              <span className="text-xs text-neutral-400 hidden sm:block">
                {user.displayName}
              </span>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">
            Wish them a happy birthday
          </h2>
          <p className="text-neutral-400 text-sm mt-1">
            Share a message, photo, video, or voice note. You can edit your
            wish anytime before the reveal.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <WishForm />
        </div>
      </div>
    </main>
  );
}
