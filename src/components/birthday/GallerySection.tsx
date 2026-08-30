"use client";

/**
 * GallerySection — shows the organizer's personal photo/video gallery
 * to the birthday person after the reveal.
 * Sprint 9 polish: gradient heading, glassmorphism cards with hover effects,
 * staggered entrances, premium lightbox.
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
  index,
}: {
  item: GalleryItem;
  idToken: string;
  onClick: () => void;
  index: number;
}) {
  const isVideo = item.mimeType.startsWith("video/");
  const src = `/api/gallery/media/${encodeURIComponent(item.fileId)}?token=${encodeURIComponent(idToken)}`;

  return (
    <div
      onClick={onClick}
      className="relative rounded-3xl overflow-hidden glass-card
                 cursor-pointer group card-hover-lift animate-fade-slide-up"
      style={{ animationDelay: `${index * 70}ms` }}
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
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent
                        p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-xs text-white/90 line-clamp-2 leading-relaxed">{item.caption}</p>
        </div>
      )}

      {isVideo && (
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm
                        rounded-full text-xs text-white flex items-center gap-1">
          <span>▶</span>
        </div>
      )}

      {/* Hover border glow */}
      <div className="absolute inset-0 rounded-3xl border border-violet-500/0
                      group-hover:border-violet-500/20 transition-colors duration-300" />
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
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4
                 animate-scale-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-neutral-400 hover:text-white text-sm
                     transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg
                     bg-white/[0.05] hover:bg-white/[0.1]"
        >
          ✕ Close
          <span className="text-neutral-600 text-xs">(Esc)</span>
        </button>
        {isVideo ? (
          <video
            src={src}
            controls
            autoPlay
            className="w-full max-h-[80vh] rounded-3xl object-contain"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={item.caption || "Memory"}
            className="w-full max-h-[80vh] rounded-3xl object-contain"
          />
        )}
        {item.caption && (
          <p className="text-center text-sm text-neutral-300 mt-5 px-4">
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
    <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-20 pt-10 border-t border-white/[0.06]">
      <div className="mb-8 space-y-2 text-center">
        <h2 className="text-2xl font-bold text-white font-heading flex items-center justify-center gap-2">
          <span>📸</span>
          <span className="gradient-text-warm">A Gallery, Just for You</span>
        </h2>
        <p className="text-neutral-500 text-sm">Memories curated with love.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="skeleton aspect-square rounded-3xl"
              style={{ animationDelay: `${i * 0.08}s` }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item, i) => (
            <GalleryCard
              key={item.id}
              item={item}
              idToken={idToken}
              onClick={() => setLightboxItem(item)}
              index={i}
            />
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
