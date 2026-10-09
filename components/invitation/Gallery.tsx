"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { MediaData } from "@/types/invitation";

/** Galeri foto dengan lightbox. Gambar di-lazy-load oleh next/image. */
export type GalleryVariant = "grid" | "polaroid" | "filmstrip" | "masonry";

export function Gallery({ photos, variant = "grid" }: { photos: MediaData[]; variant?: GalleryVariant }) {
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") setIndex((i) => (i === null ? i : (i + 1) % photos.length));
      if (e.key === "ArrowLeft") setIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, photos.length]);

  return (
    <>
      {variant === "polaroid" && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 px-1 pt-2">
          {photos.map((p, i) => (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Perbesar foto ${i + 1}`}
              style={{ rotate: ((i * 37) % 11) - 5 }}
              whileHover={{ rotate: 0, scale: 1.06, zIndex: 5 }}
              whileTap={{ scale: 0.97 }}
              className="relative bg-white p-2 pb-8 text-left shadow-lg"
            >
              <span aria-hidden className="absolute -top-2 left-1/2 h-4 w-12 -translate-x-1/2 rotate-2 bg-inv-primary/30" />
              <span className="relative block aspect-square overflow-hidden bg-inv-line">
                <Image src={p.url} alt={`Foto galeri ${i + 1}`} fill sizes="200px" className="object-cover" loading="lazy" />
              </span>
              <span className="absolute inset-x-0 bottom-1.5 text-center font-display text-sm text-neutral-600">#{i + 1}</span>
            </motion.button>
          ))}
        </div>
      )}

      {variant === "filmstrip" && (
        <div className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-3 [scrollbar-width:none]">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Perbesar foto ${i + 1}`}
              className="relative aspect-[3/4] w-[70%] shrink-0 snap-center overflow-hidden rounded-[var(--inv-radius,0.5rem)] bg-inv-line"
            >
              <Image src={p.url} alt={`Foto galeri ${i + 1}`} fill sizes="340px" className="object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {variant === "masonry" && (
        <div className="columns-2 gap-2">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Perbesar foto ${i + 1}`}
              className={`relative mb-2 block w-full overflow-hidden rounded-[var(--inv-radius,0.5rem)] bg-inv-line ${i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/5]"}`}
            >
              <Image src={p.url} alt={`Foto galeri ${i + 1}`} fill sizes="240px" className="object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {variant === "grid" && (
      <div className="grid grid-cols-2 gap-2">
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Perbesar foto ${i + 1}`}
            className={`relative overflow-hidden rounded-md bg-inv-line ${i % 5 === 0 ? "col-span-2 aspect-[16/10]" : "aspect-square"}`}
          >
            <Image
              src={p.url}
              alt={`Foto galeri ${i + 1}`}
              fill
              sizes="(max-width: 480px) 50vw, 240px"
              className="object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          </button>
        ))}
      </div>
      )}

      {index !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau foto"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
          onClick={() => setIndex(null)}
        >
          <button
            type="button"
            aria-label="Tutup"
            className="absolute right-3 top-3 h-11 w-11 rounded-full text-2xl text-white"
            onClick={() => setIndex(null)}
          >
            ✕
          </button>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Foto sebelumnya"
                className="absolute left-2 h-11 w-11 rounded-full text-3xl text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((index - 1 + photos.length) % photos.length);
                }}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Foto berikutnya"
                className="absolute right-2 h-11 w-11 rounded-full text-3xl text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((index + 1) % photos.length);
                }}
              >
                ›
              </button>
            </>
          )}
          <motion.div
            key={index}
            className="relative h-[80dvh] w-[92vw] max-w-[900px] cursor-grab touch-pan-y"
            onClick={(e) => e.stopPropagation()}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) setIndex((index + 1) % photos.length);
              else if (info.offset.x > 80) setIndex((index - 1 + photos.length) % photos.length);
            }}
          >
            <Image src={photos[index].url} alt={`Foto galeri ${index + 1}`} fill sizes="92vw" className="pointer-events-none object-contain" />
          </motion.div>
          <p className="absolute bottom-4 text-xs text-white/70">Geser untuk berpindah foto · {index + 1}/{photos.length}</p>
        </div>
      )}
    </>
  );
}
