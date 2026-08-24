"use client";

/**
 * Organizer Gallery Upload Page — Sprint 8.
 *
 * Allows the organizer to upload personal photos and videos
 * that the birthday person sees after the reveal.
 *
 * Features:
 *   - Drag-and-drop upload zone
 *   - Multi-file upload with progress bars
 *   - Optional caption per photo
 *   - Grid preview of uploaded items
 *   - Delete items
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import type { GalleryItem } from "@/lib/firestore/gallery";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadingFile {
  id: string;
  file: File;
  caption: string;
  progress: "uploading" | "done" | "error";
  error?: string;
}

// ─── Gallery grid item component ─────────────────────────────────────────────

function GalleryGridItem({
  item,
  idToken,
  onDelete,
}: {
  item: GalleryItem;
  idToken: string;
  onDelete: (id: string, fileId: string) => void;
}) {
  const isVideo = item.mimeType.startsWith("video/");
  const src = `/api/gallery/media/${encodeURIComponent(item.fileId)}?token=${encodeURIComponent(idToken)}`;

  return (
    <div className="group relative rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700 aspect-square">
      {isVideo ? (
        <video
          src={src}
          className="w-full h-full object-cover"
          muted
          preload="metadata"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={item.caption || "Gallery photo"}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity
                      flex flex-col justify-between p-3">
        <button
          onClick={() => onDelete(item.id, item.fileId)}
          className="self-end w-7 h-7 rounded-full bg-red-600/90 flex items-center justify-center
                     text-white text-xs hover:bg-red-500 transition-colors"
          aria-label="Delete photo"
        >
          ✕
        </button>
        {item.caption && (
          <p className="text-xs text-white/90 line-clamp-2 leading-relaxed">
            {item.caption}
          </p>
        )}
      </div>

      {/* Video badge */}
      {isVideo && (
        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white">
          ▶ Video
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrganizerGalleryPage() {
  const { user } = useAuth();
  const [idToken, setIdToken] = useState("");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch id token + gallery items on mount
  useEffect(() => {
    async function init() {
      if (!user) return;
      const token = await user.getIdToken();
      setIdToken(token);
      const res = await fetch("/api/gallery/items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as { items: GalleryItem[] };
        setItems(data.items);
      }
    }
    void init();
  }, [user]);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!user) return;
      const token = await user.getIdToken();
      const currentCaption = caption;

      const newUploads: UploadingFile[] = files.map((f) => ({
        id: crypto.randomUUID(),
        file: f,
        caption: currentCaption,
        progress: "uploading",
      }));

      setUploading((prev) => [...prev, ...newUploads]);
      setCaption("");

      await Promise.all(
        newUploads.map(async (u) => {
          try {
            const form = new FormData();
            form.append("file", u.file);
            form.append("caption", u.caption);

            const res = await fetch("/api/gallery/upload", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: form,
            });

            if (!res.ok) {
              const err = (await res.json()) as { error?: string };
              throw new Error(err.error ?? "Upload failed");
            }

            // Refresh gallery list
            const listRes = await fetch("/api/gallery/items", {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (listRes.ok) {
              const data = (await listRes.json()) as { items: GalleryItem[] };
              setItems(data.items);
            }

            setUploading((prev) =>
              prev.map((x) =>
                x.id === u.id ? { ...x, progress: "done" } : x
              )
            );
          } catch (err: unknown) {
            const msg =
              err instanceof Error ? err.message : "Upload failed";
            setUploading((prev) =>
              prev.map((x) =>
                x.id === u.id ? { ...x, progress: "error", error: msg } : x
              )
            );
          }
        })
      );

      // Clear done entries after 3 s
      setTimeout(() => {
        setUploading((prev) => prev.filter((x) => x.progress !== "done"));
      }, 3000);
    },
    [user, caption]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      void uploadFiles(files);
    },
    [uploadFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0) void uploadFiles(files);
      // Reset input so same file can be re-selected
      e.target.value = "";
    },
    [uploadFiles]
  );

  const handleDelete = useCallback(
    async (itemId: string, fileId: string) => {
      if (!user) return;
      if (!confirm("Remove this photo from the gallery?")) return;
      const token = await user.getIdToken();
      const res = await fetch(
        `/api/gallery/items?id=${encodeURIComponent(itemId)}&fileId=${encodeURIComponent(fileId)}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
      }
    },
    [user]
  );

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Ambient glow */}
      <div className="fixed top-0 inset-x-0 h-64 pointer-events-none z-0">
        <div className="absolute top-[-40px] left-1/3 w-72 h-72 rounded-full bg-violet-700/10 blur-[100px]" />
        <div className="absolute top-[-40px] right-1/3 w-56 h-56 rounded-full bg-pink-700/10 blur-[80px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 sticky top-0 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-neutral-400 hover:text-white transition-colors text-sm flex items-center gap-1.5"
            >
              ← Dashboard
            </Link>
            <span className="text-neutral-700">|</span>
            <div>
              <p className="text-sm font-semibold text-white leading-none">
                Personal Gallery
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {items.length} photo{items.length !== 1 ? "s" : ""} uploaded
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-medium">
            🔑 Organizer only
          </span>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-white">Upload Photos & Videos</h1>
          <p className="text-neutral-500 text-sm mt-1">
            These will appear in a private gallery for the birthday person after the reveal.
          </p>
        </div>

        {/* Caption input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
            Caption (optional — applies to next upload)
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a memory or note…"
            maxLength={200}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3
                       text-sm text-white placeholder-neutral-600
                       focus:outline-none focus:border-violet-500/60 transition-colors"
          />
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-12 text-center
                      transition-all duration-200 select-none
                      ${isDragging
                        ? "border-violet-500 bg-violet-500/10 scale-[1.01]"
                        : "border-neutral-700 bg-neutral-900/40 hover:border-neutral-500 hover:bg-neutral-800/30"
                      }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={handleFileInput}
          />
          <div className="text-5xl mb-4 select-none">
            {isDragging ? "📥" : "🖼️"}
          </div>
          <p className="text-white font-semibold text-lg">
            {isDragging ? "Drop to upload" : "Drop photos & videos here"}
          </p>
          <p className="text-neutral-500 text-sm mt-1">
            or click to browse · JPEG, PNG, WebP, GIF, MP4, MOV · Max 50 MB each
          </p>
        </div>

        {/* Upload progress */}
        {uploading.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Uploading
            </p>
            {uploading.map((u) => (
              <div
                key={u.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm
                  ${u.progress === "error"
                    ? "bg-red-950/30 border-red-800/50"
                    : u.progress === "done"
                    ? "bg-green-950/30 border-green-800/50"
                    : "bg-neutral-900 border-neutral-800"
                  }`}
              >
                {u.progress === "uploading" && (
                  <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin shrink-0" />
                )}
                {u.progress === "done" && (
                  <span className="text-green-400 shrink-0">✓</span>
                )}
                {u.progress === "error" && (
                  <span className="text-red-400 shrink-0">✕</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-neutral-200 truncate">{u.file.name}</p>
                  {u.error && (
                    <p className="text-xs text-red-400 mt-0.5">{u.error}</p>
                  )}
                </div>
                <span className="text-xs text-neutral-500 shrink-0">
                  {(u.file.size / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Gallery grid */}
        {items.length > 0 && idToken && (
          <div className="space-y-4">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Gallery — {items.length} item{items.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.map((item) => (
                <GalleryGridItem
                  key={item.id}
                  item={item}
                  idToken={idToken}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}

        {items.length === 0 && uploading.length === 0 && (
          <div className="text-center py-10 text-neutral-600 text-sm">
            No photos yet — upload some memories above!
          </div>
        )}
      </main>
    </div>
  );
}
