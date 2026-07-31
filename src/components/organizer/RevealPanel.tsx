"use client";

/**
 * RevealPanel — reads and controls the /config/reveal Firestore document
 * via GET and POST /api/reveal. Organizer dashboard, Sprint 4 (TASK-018).
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
    return <div className="h-24 bg-neutral-800 rounded-lg animate-pulse" />;
  }

  const isRevealed = state?.is_revealed ?? false;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-200">
            Reveal Status
          </p>
          <p className={`text-xs mt-0.5 ${isRevealed ? "text-green-400" : "text-neutral-500"}`}>
            {isRevealed ? "🟢 Revealed — wishes are visible to the birthday person" : "🔴 Hidden — birthday person cannot see wishes yet"}
          </p>
        </div>
        <button
          id="reveal-toggle"
          onClick={() => void handleSave({ is_revealed: !isRevealed })}
          disabled={saving}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50
            ${isRevealed
              ? "bg-red-900/40 border border-red-700 text-red-300 hover:bg-red-900/60"
              : "bg-green-900/40 border border-green-700 text-green-300 hover:bg-green-900/60"
            }`}
        >
          {saving ? "Saving…" : isRevealed ? "Hide Wishes" : "Reveal Now"}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 items-end">
        <div className="flex-1">
          <label
            htmlFor="reveal-timestamp"
            className="text-xs text-neutral-400 mb-1 block"
          >
            Scheduled Reveal Date & Time
          </label>
          <input
            id="reveal-timestamp"
            type="datetime-local"
            value={timestampInput}
            onChange={(e) => setTimestampInput(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2
                       text-sm text-white focus:outline-none focus:border-violet-500
                       transition-colors"
          />
        </div>
        <button
          onClick={() => void handleSave({ reveal_timestamp: new Date(timestampInput).toISOString() })}
          disabled={saving || !timestampInput}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50
                     disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg
                     transition-colors shrink-0"
        >
          Set Schedule
        </button>
      </div>
    </div>
  );
}
