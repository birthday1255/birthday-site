"use client";

/**
 * RevealPanel — reads and controls the /config/reveal Firestore document
 * via GET and POST /api/reveal. Sprint 9 polish: gradient toggle, animated status.
 */
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

interface RevealState {
  is_revealed: boolean;
  reveal_timestamp?: string;
}

/**
 * Displays current reveal status and allows the organizer to toggle it
 * or set a reveal timestamp via the /api/reveal endpoint.
 */
export function RevealPanel() {
  const { user } = useAuth();
  const [state, setState] = useState<RevealState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timestampInput, setTimestampInput] = useState("");

  const fetchReveal = useCallback(async () => {
    if (!user) return;
    const token = await user.getIdToken();
    const res = await fetch("/api/reveal", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = (await res.json()) as RevealState;
      setState(data);
      if (data.reveal_timestamp) {
        // Format for datetime-local input (YYYY-MM-DDTHH:mm)
        setTimestampInput(data.reveal_timestamp.slice(0, 16));
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void fetchReveal();
  }, [fetchReveal]);

  const handleSave = async (overrides: Partial<RevealState>) => {
    if (!user) return;
    setSaving(true);
    const token = await user.getIdToken();
    await fetch("/api/reveal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(overrides),
    });
    await fetchReveal();
    setSaving(false);
  };

  if (loading) {
    return <div className="skeleton h-28 rounded-2xl" />;
  }

  const isRevealed = state?.is_revealed ?? false;

  return (
    <div className="space-y-5">
      {/* Status + toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Animated status dot */}
          <div className="relative">
            <span
              className={`block w-3 h-3 rounded-full ${
                isRevealed ? "bg-emerald-400" : "bg-red-400"
              }`}
            />
            <span
              className={`absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-30 ${
                isRevealed ? "bg-emerald-400" : "bg-red-400"
              }`}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-200 font-heading">
              Reveal Status
            </p>
            <p className={`text-xs mt-0.5 ${isRevealed ? "text-emerald-400" : "text-neutral-500"}`}>
              {isRevealed
                ? "Wishes are visible to the birthday person"
                : "Birthday person cannot see wishes yet"}
            </p>
          </div>
        </div>
        <button
          id="reveal-toggle"
          onClick={() => void handleSave({ is_revealed: !isRevealed })}
          disabled={saving}
          className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200
                     disabled:opacity-50 font-heading ${
            isRevealed
              ? "bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 hover:border-red-500/30"
              : "btn-gradient"
          }`}
        >
          {saving ? "Saving…" : isRevealed ? "Hide Wishes" : "✨ Reveal Now"}
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-white/[0.06]" />

      {/* Timestamp */}
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1">
          <label
            htmlFor="reveal-timestamp"
            className="text-xs text-neutral-400 mb-1.5 block font-heading"
          >
            Scheduled Reveal Date & Time
          </label>
          <input
            id="reveal-timestamp"
            type="datetime-local"
            value={timestampInput}
            onChange={(e) => setTimestampInput(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3
                       text-sm text-white focus:outline-none focus:border-violet-500/40
                       focus:shadow-[0_0_15px_-5px_rgba(139,92,246,0.2)]
                       transition-all duration-300"
          />
        </div>
        <button
          onClick={() => void handleSave({ reveal_timestamp: new Date(timestampInput).toISOString() })}
          disabled={saving || !timestampInput}
          className="px-5 py-3 bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08]
                     hover:border-violet-500/20 disabled:opacity-50
                     disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl
                     transition-all duration-200 shrink-0 font-heading"
        >
          Set Schedule
        </button>
      </div>
    </div>
  );
}
