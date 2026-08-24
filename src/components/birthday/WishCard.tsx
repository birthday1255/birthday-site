"use client";

/**
 * WishCard — displays a single wish from a guest.
 * Used on the birthday person experience page after reveal.
 */
import type { Wish } from "@/types/wish";

interface WishCardProps {
  wish: Wish;
  index: number;
}

/**
 * Renders a single wish card with author, timestamp, content, and media indicator.
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

  // Pick a soft pastel accent per card based on index
  const accents = [
    "border-violet-800/60 bg-violet-950/20",
    "border-pink-800/60 bg-pink-950/20",
    "border-rose-800/60 bg-rose-950/20",
    "border-indigo-800/60 bg-indigo-950/20",
    "border-fuchsia-800/60 bg-fuchsia-950/20",
  ];
  const accent = accents[index % accents.length];

  return (
    <article
      className={`border rounded-2xl p-5 space-y-3 ${accent}
                  animate-in fade-in slide-in-from-bottom-3 duration-500`}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-violet-700/40 flex items-center
                          justify-center text-sm font-bold text-violet-200 shrink-0">
            {wish.authorName?.[0]?.toUpperCase() ?? "?"}
          </div>
          <p className="text-sm font-semibold text-neutral-200">
            {wish.authorName || "Someone special"}
          </p>
        </div>
        {submittedAt && (
          <p className="text-xs text-neutral-500 shrink-0">{submittedAt}</p>
        )}
      </div>

      {/* Content */}
      <p className="text-neutral-100 text-sm leading-relaxed whitespace-pre-wrap">
        {wish.content}
      </p>

      {/* Media badge */}
      {wish.mediaUrls?.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
          <span>📎</span>
          <span>{wish.mediaUrls.length} media file(s) attached</span>
        </div>
      )}
    </article>
  );
}
