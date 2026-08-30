"use client";

/**
 * Organizer Gallery Upload Page — Sprint 9 Polish.
 *
 * Allows the organizer to upload personal photos and videos
 * that the birthday person sees after the reveal.
 *
 * Features:
 *   - Drag-and-drop upload zone with animated border
 *   - Multi-file upload with progress bars
 *   - Optional caption per photo
 *   - Grid preview with hover effects
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
  index,
}: {
  item: GalleryItem;
  idToken: string;
  onDelete: (id: string, fileId: string) => void;
  index: number;
}) {
  const isVideo = item.mimeType.startsWith("video/");
  const src = `/api/gallery/media/${encodeURIComponent(item.fileId)}?token=${encodeURIComponent(idToken)}`;

  return (
    <div
      className="group relative rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06]
                 aspect-square card-hover-lift animate-fade-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {isVideo ? (
        <video
          src={src}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          muted
          preload="metadata"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={item.caption || "Gallery photo"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      )}

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      flex flex-col justify-between p-3">
        <button
          onClick={() => onDelete(item.id, item.fileId)}
          className="self-end w-8 h-8 rounded-full bg-red-600/80 backdrop-blur-sm
                     flex items-center justify-center text-white text-xs
                     hover:bg-red-500 transition-colors"
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
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm
                        rounded-full text-xs text-white flex items-center gap-1">
          <span>▶</span> Video
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
    <div className="min-h-screen aurora-bg relative">
      {/* Ambient glow */}
      <div className="fixed top-0 inset-x-0 h-80 pointer-events-none z-0">
        <div className="absolute top-[-50px] left-1/3 w-[400px] h-[400px] rounded-full bg-violet-700/8 blur-[120px] animate-glow-pulse" />
        <div className="absolute top-[-30px] right-1/3 w-[300px] h-[300px] rounded-full bg-fuchsia-700/6 blur-[100px] animate-glow-pulse" style={{ animationDelay: "3s" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 sticky top-0 border-b border-white/[0.06] bg-black/30 backdrop-blur-2xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-neutral-400 hover:text-white transition-colors text-sm flex items-center gap-1.5 font-heading"
            >
              ← Dashboard
            </Link>
            <span className="text-neutral-700">|</span>
            <div>
              <p className="text-sm font-semibold text-white leading-none font-heading">
                Personal Gallery
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {items.length} photo{items.length !== 1 ? "s" : ""} uploaded
              </p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/15 text-violet-300 font-medium font-heading">
            🔑 Organizer only
          </span>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Page title */}
        <div className="animate-fade-slide-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading">
            Upload Photos & Videos
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            These will appear in a private gallery for the birthday person after the reveal.
          </p>
        </div>

        {/* Caption input */}
        <div className="space-y-2 animate-fade-slide-up" style={{ animationDelay: "0.05s" }}>
          <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider font-heading">
            Caption (optional — applies to next upload)
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a memory or note…"
            maxLength={200}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-3.5
                       text-sm text-white placeholder-neutral-600
                       focus:outline-none focus:border-violet-500/40
                       focus:shadow-[0_0_15px_-5px_rgba(139,92,246,0.2)]
                       transition-all duration-300"
          />
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer border-2 border-dashed rounded-3xl p-14 text-center
                      transition-all duration-300 select-none animate-fade-slide-up
                      ${isDragging
                        ? "border-violet-500/60 bg-violet-500/8 scale-[1.01] shadow-[0_0_40px_-10px_rgba(139,92,246,0.2)]"
                        : "border-white/[0.08] bg-white/[0.02] hover:border-violet-500/25 hover:bg-violet-500/[0.03]"
                      }`}
          style={{ animationDelay: "0.1s" }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={handleFileInput}
          />
          <div className="text-5xl mb-5 select-none">
            {isDragging ? "📥" : "🖼️"}
          </div>
          <p className="text-white font-semibold text-lg font-heading">
            {isDragging ? "Drop to upload" : "Drop photos & videos here"}
          </p>
          <p className="text-neutral-500 text-sm mt-2">
            or click to browse · JPEG, PNG, WebP, GIF, MP4, MOV · Max 50 MB each
          </p>
        </div>

        {/* Upload progress */}
        {uploading.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider font-heading">
              Uploading
            </p>
            {uploading.map((u) => (
              <div
                key={u.id}
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl border text-sm
                            transition-colors duration-200 animate-fade-slide-up
                  ${u.progress === "error"
                    ? "bg-red-950/20 border-red-800/30"
                    : u.progress === "done"
                    ? "bg-emerald-950/20 border-emerald-800/30"
                    : "bg-white/[0.03] border-white/[0.06]"
                  }`}
              >
                {u.progress === "uploading" && (
                  <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin shrink-0" />
                )}
                {u.progress === "done" && (
                  <span className="text-emerald-400 shrink-0 animate-bounce-in">✓</span>
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
                <span className="text-xs text-neutral-500 shrink-0 tabular-nums">
                  {(u.file.size / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Gallery grid */}
        {items.length > 0 && idToken && (
          <div className="space-y-4">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider font-heading">
              Gallery — {items.length} item{items.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.map((item, i) => (
                <GalleryGridItem
                  key={item.id}
                  item={item}
                  idToken={idToken}
                  onDelete={handleDelete}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}

        {items.length === 0 && uploading.length === 0 && (
          <div className="text-center py-14 space-y-3">
            <span className="text-4xl block">📷</span>
            <p className="text-neutral-500 text-sm">
              No photos yet — upload some memories above!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
