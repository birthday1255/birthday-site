"use client";

/**
 * WishMediaDisplay — renders attached photos, videos, or audio for a wish.
 * Sprint 9 polish: gradient hover borders, styled containers, smooth transitions.
 *
 * Takes an array of Appwrite file IDs (`mediaUrls`) and fetches their metadata
 * to render the appropriate HTML5 player (<img>, <video>, <audio>).
 */
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface WishMediaDisplayProps {
  mediaUrls?: string[];
}

interface MediaItemInfo {
  fileId: string;
  mimeType: string;
  name: string;
}

function SingleMediaItem({ fileId }: { fileId: string }) {
  const { user } = useAuth();
  const [info, setInfo] = useState<MediaItemInfo | null>(null);
  const [idToken, setIdToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMedia() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        if (!isMounted) return;
        setIdToken(token);

        const res = await fetch(`/api/wishes/media/${encodeURIComponent(fileId)}?info=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load media info");

        const data = (await res.json()) as { mimeType: string; name: string };
        if (isMounted) {
          setInfo({ fileId, mimeType: data.mimeType, name: data.name });
        }
      } catch {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadMedia();
    return () => {
      isMounted = false;
    };
  }, [user, fileId]);

  if (loading) {
    return (
      <div className="w-full h-52 skeleton rounded-2xl flex items-center justify-center text-neutral-500 text-xs">
        Loading media…
      </div>
    );
  }

  if (error || !info || !idToken) {
    return null;
  }

  const src = `/api/wishes/media/${encodeURIComponent(fileId)}?token=${encodeURIComponent(idToken)}`;

  if (info.mimeType.startsWith("image/")) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06]
                      bg-white/[0.02] group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={info.name || "Wish photo attachment"}
          loading="lazy"
          className="w-full max-h-96 object-contain rounded-2xl
                     group-hover:scale-[1.02] transition-transform duration-500"
        />
        {/* Hover border glow */}
        <div className="absolute inset-0 rounded-2xl border border-violet-500/0
                        group-hover:border-violet-500/15 transition-colors duration-300 pointer-events-none" />
      </div>
    );
  }

  if (info.mimeType.startsWith("video/")) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-black/20">
        <video
          controls
          preload="metadata"
          src={src}
          className="w-full max-h-96 rounded-2xl"
        />
      </div>
    );
  }

  if (info.mimeType.startsWith("audio/")) {
    return (
      <div className="p-4 glass-card rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium font-heading">
          <span className="text-base">🎵</span>
          <span className="truncate">{info.name || "Voice note"}</span>
        </div>
        <audio controls src={src} className="w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 glass-card rounded-2xl flex items-center gap-2 text-xs text-neutral-400">
      <span className="text-base">📎</span>
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-white transition-colors truncate"
      >
        {info.name || "Attachment"}
      </a>
    </div>
  );
}

export function WishMediaDisplay({ mediaUrls }: WishMediaDisplayProps) {
  if (!mediaUrls || mediaUrls.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      {mediaUrls.map((fileId) => (
        <SingleMediaItem key={fileId} fileId={fileId} />
      ))}
    </div>
  );
}
