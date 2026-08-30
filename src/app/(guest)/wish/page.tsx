"use client";

/**
 * Guest wish submission page — write and submit a birthday wish.
 * Sprint 9 polish: glassmorphism header, aurora-tinted background, premium layout.
 */
import { WishForm } from "@/components/guest/WishForm";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { useAuth } from "@/hooks/useAuth";

export default function GuestWishPage() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen aurora-bg relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed top-[-10%] left-1/3 w-[500px] h-[500px] rounded-full bg-violet-700/10 blur-[130px] pointer-events-none animate-glow-pulse" />
      <div className="fixed bottom-[-10%] right-1/4 w-[400px] h-[400px] rounded-full bg-fuchsia-700/8 blur-[100px] pointer-events-none animate-glow-pulse" style={{ animationDelay: "4s" }} />

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06] bg-black/20 backdrop-blur-xl sticky top-0">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-base shadow-lg shadow-violet-900/30">
              🎁
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white font-heading">Send a Wish</h1>
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

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">
        {/* Section heading */}
        <div className="mb-8 animate-fade-slide-up">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
            Wish them a <span className="gradient-text">happy birthday</span>
          </h2>
          <p className="text-neutral-400 text-sm mt-2 leading-relaxed">
            Share a heartfelt message, photo, video, or voice note. You can
            edit your wish anytime before the reveal.
          </p>
        </div>

        {/* Form card */}
        <div
          className="glass-card-vivid rounded-3xl p-6 sm:p-8 animate-fade-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <WishForm />
        </div>
      </div>
    </main>
  );
}
