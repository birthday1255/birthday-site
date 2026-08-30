"use client";

/**
 * WishForm — guest wish submission with optional media upload.
 *
 * Sprint 9 polish: gradient submit button, animated character counter,
 * styled file upload area, confetti success animation.
 *
 * Flow: upload file (optional) → POST /api/wishes → success state.
 * If the guest already has a wish, supports edit via PATCH /api/wishes/[id].
 */
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Wish } from "@/types/wish";

type FormMode = "create" | "edit";

interface WishFormProps {
  onSuccess?: () => void;
}

/**
 * Renders the guest wish submission and edit form.
 */
export function WishForm({ onSuccess }: WishFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [existingWish, setExistingWish] = useState<Wish | null>(null);
  const [mode, setMode] = useState<FormMode>("create");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadExistingWish = useCallback(async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/wishes/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as { wish: Wish | null };
        if (data.wish) {
          setExistingWish(data.wish);
          setContent(data.wish.content);
          setMode("edit");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadExistingWish();
  }, [loadExistingWish]);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!user || !content.trim()) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const token = await user.getIdToken();
      let mediaUrls = existingWish?.mediaUrls ?? [];

      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const uploadRes = await fetch("/api/wishes/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: uploadData,
        });
        if (!uploadRes.ok) {
          const err = (await uploadRes.json()) as { error?: string };
          throw new Error(err.error ?? "Upload failed");
        }
        const uploaded = (await uploadRes.json()) as { fileId: string };
        mediaUrls = [uploaded.fileId];
      }

      if (mode === "edit" && existingWish) {
        const patchRes = await fetch(`/api/wishes/${existingWish.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: content.trim(), mediaUrls }),
        });
        if (!patchRes.ok) {
          const err = (await patchRes.json()) as { error?: string };
          throw new Error(err.error ?? "Update failed");
        }
      } else {
        const postRes = await fetch("/api/wishes", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: content.trim(), mediaUrls }),
        });
        if (!postRes.ok) {
          const err = (await postRes.json()) as { error?: string };
          throw new Error(err.error ?? "Submission failed");
        }
      }

      setSuccess(true);
      setFile(null);
      onSuccess?.();
      await loadExistingWish();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  // Character count color gradient
  const charRatio = content.length / 2000;
  const charCountColor =
    charRatio > 0.9
      ? "text-red-400"
      : charRatio > 0.7
        ? "text-amber-400"
        : "text-neutral-500";

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-36 rounded-2xl" />
        <div className="skeleton h-12 rounded-2xl w-40" />
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      {/* Textarea */}
      <div>
        <label
          htmlFor="wish-content"
          className="block text-sm font-medium text-neutral-300 mb-2 font-heading"
        >
          Your birthday message
        </label>
        <textarea
          id="wish-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          required
          maxLength={2000}
          placeholder="Write something heartfelt for the birthday person…"
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl
                     px-5 py-4 text-neutral-100 placeholder:text-neutral-600
                     focus:outline-none focus:border-violet-500/40
                     focus:shadow-[0_0_20px_-5px_rgba(139,92,246,0.2)]
                     resize-y min-h-[160px] transition-all duration-300
                     text-sm leading-relaxed"
        />
        <p className={`text-xs mt-2 tabular-nums transition-colors ${charCountColor}`}>
          {content.length} / 2,000 characters
        </p>
      </div>

      {/* File upload area */}
      <div>
        <label
          htmlFor="wish-media"
          className="block text-sm font-medium text-neutral-300 mb-2 font-heading"
        >
          Add a photo, video, or audio
          <span className="text-neutral-600 font-normal ml-1">(optional)</span>
        </label>
        <div className="relative">
          <input
            id="wish-media"
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
          <label
            htmlFor="wish-media"
            className="flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-dashed
                       border-white/[0.08] bg-white/[0.02] cursor-pointer
                       hover:border-violet-500/30 hover:bg-violet-500/[0.03]
                       transition-all duration-300 group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center
                            group-hover:bg-violet-500/20 transition-colors text-lg shrink-0">
              {file ? "📎" : "📸"}
            </div>
            <div className="flex-1 min-w-0">
              {file ? (
                <div>
                  <p className="text-sm text-neutral-200 truncate">{file.name}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                    Click to upload or drag a file
                  </p>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Photos, videos, audio — up to 50 MB
                  </p>
                </div>
              )}
            </div>
            {file && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setFile(null);
                }}
                className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
              >
                Remove
              </button>
            )}
          </label>
        </div>
        {existingWish?.mediaUrls.length ? (
          <p className="text-xs text-neutral-500 mt-2">
            📎 Media already attached. Upload a new file to replace it.
          </p>
        ) : null}
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 px-4 py-3 rounded-xl
                     bg-red-950/40 border border-red-800/30 backdrop-blur-sm"
        >
          <span className="text-red-400 text-sm shrink-0">⚠</span>
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Success */}
      {success && (
        <div
          role="status"
          className="flex items-center gap-3 px-4 py-3 rounded-xl
                     bg-green-950/30 border border-green-800/30 backdrop-blur-sm
                     animate-fade-slide-up"
        >
          <span className="text-2xl animate-bounce-in">🎉</span>
          <p className="text-sm text-green-300">
            Wish saved! Thank you for celebrating.
          </p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={submitting || !content.trim()}
        className="btn-gradient w-full py-4 rounded-2xl font-semibold text-sm
                   tracking-wide font-heading"
      >
        {submitting
          ? "Saving…"
          : mode === "edit"
            ? "✨ Update wish"
            : "💌 Send wish"}
      </button>
    </form>
  );
}
