"use client";

/**
 * WishCard — displays a single wish from a guest.
 * Sprint 9 polish: glassmorphism with gradient accent, staggered entrance,
 * hover lift with glow, gradient author avatar, sparkle decoration.
 */
import type { Wish } from "@/types/wish";
import { WishMediaDisplay } from "@/components/ui/WishMediaDisplay";

interface WishCardProps {
  wish: Wish;
  index: number;
}

const ACCENT_GRADIENTS = [
  "from-violet-600 to-purple-600",
  "from-fuchsia-600 to-pink-600",
  "from-rose-600 to-red-600",
  "from-indigo-600 to-blue-600",
  "from-pink-600 to-rose-600",
];

const BORDER_ACCENTS = [
  "border-violet-700/20 hover:border-violet-600/30",
  "border-fuchsia-700/20 hover:border-fuchsia-600/30",
  "border-rose-700/20 hover:border-rose-600/30",
  "border-indigo-700/20 hover:border-indigo-600/30",
  "border-pink-700/20 hover:border-pink-600/30",
];

/**
 * Renders a single wish card with author, timestamp, content, and attached media.
 * Animation delay is based on index for a staggered entrance effect.
 */
export function WishCard({ wish, index }: WishCardProps) {
  const submittedAt = wish.submittedAt
    ? new Date(
        (wish.submittedAt as unknown as { seconds: number }).seconds * 1000
      ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const gradient = ACCENT_GRADIENTS[index % ACCENT_GRADIENTS.length];
  const borderAccent = BORDER_ACCENTS[index % BORDER_ACCENTS.length];

  return (
    <article
      className={`glass-card rounded-3xl p-6 space-y-4 border ${borderAccent}
                  card-hover-lift animate-fade-slide-up relative overflow-hidden`}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
    >
      {/* Subtle gradient glow in corner */}
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-10
                    bg-gradient-to-br ${gradient}`}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient}
                        flex items-center justify-center text-sm font-bold text-white shrink-0
                        shadow-lg shadow-violet-900/20`}
          >
            {wish.authorName?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-100 font-heading">
              {wish.authorName || "Someone special"}
            </p>
            {submittedAt && (
              <p className="text-xs text-neutral-500 mt-0.5">{submittedAt}</p>
            )}
          </div>
        </div>
        {/* Sparkle decoration */}
        <span className="text-violet-400/30 text-xs">✦</span>
      </div>

      {/* Content */}
      <p className="text-neutral-100 text-[15px] leading-relaxed whitespace-pre-wrap relative z-10">
        {wish.content}
      </p>

      {/* Attached Media Display */}
      <WishMediaDisplay mediaUrls={wish.mediaUrls} />
    </article>
  );
}
