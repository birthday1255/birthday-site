"use client";

/**
 * ShareLink — displays the public site URL for organizers to share.
 * Visitors sign in with Google and are auto-assigned the guest role.
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
      <div className="flex items-center gap-2 bg-neutral-800/60 border border-neutral-700 rounded-lg px-4 py-3">
        <p className="text-xs text-neutral-300 flex-1 truncate font-mono">
          {siteUrl}
        </p>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="text-xs px-3 py-1.5 bg-violet-600 hover:bg-violet-500
                     text-white rounded-md transition-colors shrink-0"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
      <p className="text-xs text-neutral-500">
        Share this link anywhere — friends sign in with Google, visit the site,
        and send their birthday wish. No invite codes needed.
      </p>
    </div>
  );
}
