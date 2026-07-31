"use client";

/**
 * InviteForm — creates a new invite via POST /api/invites.
 * On success, shows a copyable invite link and fires onSuccess().
 * Organizer dashboard, Sprint 4 (TASK-016).
 */
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/user";

interface InviteFormProps {
  /** Called after a successful invite creation to trigger a guest list refresh. */
  onSuccess: () => void;
}

type InviteRole = Extract<UserRole, "guest" | "birthday_person">;

/**
 * Renders an invite creation form. Posts to /api/invites with role+email.
 */
export function InviteForm({ onSuccess }: InviteFormProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("guest");
  const [submitting, setSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !email.trim()) return;

    setSubmitting(true);
    setError(null);
    setInviteLink(null);

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: email.trim(), role }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error: string };
        throw new Error(data.error ?? "Failed to create invite");
      }

      const data = (await res.json()) as { inviteId: string };
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
      setInviteLink(`${appUrl}/join?invite=${data.inviteId}`);
      setEmail("");
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            id="invite-email"
            required
            placeholder="guest@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2
                       text-sm text-white placeholder-neutral-500 focus:outline-none
                       focus:border-violet-500 transition-colors"
          />
          <select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value as InviteRole)}
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2
                       text-sm text-white focus:outline-none focus:border-violet-500
                       transition-colors"
          >
            <option value="guest">Guest</option>
            <option value="birthday_person">Birthday Person</option>
          </select>
          <button
            type="submit"
            disabled={submitting || !email.trim()}
            id="invite-submit"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50
                       disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg
                       transition-colors"
          >
            {submitting ? "Sending…" : "Create Invite"}
          </button>
        </div>
        {error && (
          <p role="alert" className="text-red-400 text-xs">{error}</p>
        )}
      </form>

      {inviteLink && (
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 flex items-center gap-2">
          <p className="text-xs text-neutral-400 flex-1 truncate font-mono">{inviteLink}</p>
          <button
            onClick={() => void navigator.clipboard.writeText(inviteLink)}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors shrink-0"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}
