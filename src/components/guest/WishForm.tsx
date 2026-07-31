"use client";

/**
 * WishForm — guest wish submission with optional media upload.
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

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-32 bg-neutral-800 rounded-lg animate-pulse" />
        <div className="h-10 bg-neutral-800 rounded-lg animate-pulse w-32" />
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      <div>
        <label
          htmlFor="wish-content"
          className="block text-sm font-medium text-neutral-300 mb-2"
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
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg
                     px-4 py-3 text-neutral-100 placeholder:text-neutral-500
                     focus:outline-none focus:ring-2 focus:ring-violet-500/50
                     resize-y min-h-[140px]"
        />
        <p className="text-xs text-neutral-500 mt-1">
          {content.length} / 2000 characters
        </p>
      </div>

      <div>
        <label
          htmlFor="wish-media"
          className="block text-sm font-medium text-neutral-300 mb-2"
        >
          Add a photo, video, or audio (optional)
        </label>
        <input
          id="wish-media"
          type="file"
          accept="image/*,video/*,audio/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-neutral-400
                     file:mr-4 file:py-2 file:px-4 file:rounded-lg
                     file:border-0 file:bg-neutral-700 file:text-neutral-200
                     hover:file:bg-neutral-600 cursor-pointer"
        />
        {existingWish?.mediaUrls.length ? (
          <p className="text-xs text-neutral-500 mt-1">
            Current media attached. Upload a new file to replace it.
          </p>
        ) : null}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="text-sm text-green-400">
          Wish saved! Thank you for celebrating. 🎉
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !content.trim()}
        className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50
                   disabled:cursor-not-allowed text-white text-sm font-medium
                   rounded-lg transition-colors"
      >
        {submitting
          ? "Saving…"
          : mode === "edit"
            ? "Update wish"
            : "Send wish"}
      </button>
    </form>
  );
}
