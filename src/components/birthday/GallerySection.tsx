"use client";

/**
 * GallerySection — shows the organizer's personal photo/video gallery
 * to the birthday person after the reveal.
 *
 * Displays a responsive masonry-style grid of all uploaded gallery items.
 * Each item is securely streamed via /api/gallery/media/[fileId].
 */
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { GalleryItem } from "@/lib/firestore/gallery";

interface GallerySectionProps {
  isRevealed: boolean;
}

function GalleryCard({
  item,
  idToken,
  onClick,
}: {
  item: GalleryItem;
  idToken: string;
  onClick: () => void;
}) {
  const isVideo = item.mimeType.startsWith("video/");
  const src = `/api/gallery/media/${encodeURIComponent(item.fileId)}?token=${encodeURIComponent(idToken)}`;

  return (
    <div
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800
                 cursor-pointer group hover:border-violet-700/60 transition-all duration-300
                 hover:shadow-lg hover:shadow-violet-900/20 animate-fade-slide-up"
    >
      {isVideo ? (
        <video
          src={src}
          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
          muted
          preload="metadata"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={item.caption || "Birthday memory"}
          loading="lazy"
          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
        />
      )}

      {/* Caption overlay */}
      {item.caption && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent
                        p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-xs text-white/90 line-clamp-2">{item.caption}</p>
        </div>
      )}

      {isVideo && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 rounded-full text-xs text-white">
          ▶
        </div>
      )}
    </div>
  );
}

// Lightbox for fullscreen viewing
function Lightbox({
  item,
  idToken,
  onClose,
}: {
  item: GalleryItem;
  idToken: string;
  onClose: () => void;
}) {
  const isVideo = item.mimeType.startsWith("video/");
  const src = `/api/gallery/media/${encodeURIComponent(item.fileId)}?token=${encodeURIComponent(idToken)}`;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-neutral-400 hover:text-white text-sm transition-colors"
        >
          ✕ Close (Esc)
        </button>
        {isVideo ? (
          <video
            src={src}
            controls
            autoPlay
            className="w-full max-h-[80vh] rounded-2xl object-contain"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={item.caption || "Memory"}
            className="w-full max-h-[80vh] rounded-2xl object-contain"
          />
        )}
        {item.caption && (
          <p className="text-center text-sm text-neutral-300 mt-4 px-4">
            {item.caption}
          </p>
        )}
      </div>
    </div>
  );
}

export function GallerySection({ isRevealed }: GallerySectionProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [idToken, setIdToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    if (!isRevealed || !user) return;

    async function load() {
      if (!user) return;
      const token = await user.getIdToken();
      setIdToken(token);
      try {
        const res = await fetch("/api/gallery/items", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = (await res.json()) as { items: GalleryItem[] };
          setItems(data.items);
        }
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [isRevealed, user]);

  if (!isRevealed || (items.length === 0 && !loading)) return null;

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-20 pt-8 border-t border-neutral-800/60">
      <div className="mb-6 space-y-1">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>📸</span> A Gallery, Just for You
        </h2>
        <p className="text-neutral-500 text-sm">Memories curated with love.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton aspect-square rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item, i) => (
            <div
              key={item.id}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <GalleryCard
                item={item}
                idToken={idToken}
                onClick={() => setLightboxItem(item)}
              />
            </div>
          ))}
        </div>
      )}

      {lightboxItem && idToken && (
        <Lightbox
          item={lightboxItem}
          idToken={idToken}
          onClose={() => setLightboxItem(null)}
        />
      )}
    </section>
  );
}
