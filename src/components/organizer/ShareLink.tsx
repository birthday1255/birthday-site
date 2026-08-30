"use client";

/**
 * ShareLink — displays the public site URL for organizers to share.
 * Sprint 9 polish: glassmorphism display, gradient copy button, animated check.
 */
import { useState } from "react";

/**
 * Renders a copyable public link to the birthday site.
 */
export function ShareLink() {
  const [copied, setCopied] = useState(false);
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://www.tekutriveni.me";

  async function handleCopy(): Promise<void> {
    await navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08]
                      rounded-2xl px-5 py-4 group">
        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center
                        text-sm shrink-0">
          🔗
        </div>
        <p className="text-xs text-neutral-300 flex-1 truncate font-mono tracking-wide">
          {siteUrl}
        </p>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className={`text-xs px-4 py-2 rounded-xl font-medium transition-all duration-200 shrink-0 font-heading
            ${copied
              ? "bg-emerald-500/15 border border-emerald-500/20 text-emerald-400"
              : "btn-gradient"
            }`}
        >
          {copied ? "✓ Copied!" : "Copy link"}
        </button>
      </div>
      <p className="text-xs text-neutral-500 leading-relaxed">
        Share this link anywhere — friends sign in with Google, visit the site,
        and send their birthday wish. No invite codes needed.
      </p>
    </div>
  );
}
