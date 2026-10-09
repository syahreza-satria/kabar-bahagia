"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { OpenButton } from "@/components/invitation/InvitationShell";

type Card = { src: string; caption: string; rotate: number; x: number; y: number };

/** Cover album: polaroid bisa diseret ke mana saja, lalu tekan "Buka Album". */
export function PolaroidCover({
  groom,
  bride,
  dateText,
  photos,
  children,
}: {
  groom: string;
  bride: string;
  dateText: string;
  photos: { src: string; caption: string }[];
  children: ReactNode;
}) {
  const area = useRef<HTMLDivElement>(null);
  const layout = [
    { rotate: -9, x: -70, y: 10 },
    { rotate: 7, x: 60, y: 30 },
    { rotate: -2, x: 0, y: 70 },
  ];
  const cards: Card[] = photos.slice(0, 3).map((p, i) => ({ ...p, ...layout[i] }));

  return (
    <div className="inv-paper relative flex min-h-dvh flex-col items-center overflow-hidden bg-inv-bg px-6 pb-10 pt-12 text-center">
      <p className="font-display text-3xl text-inv-primary">Our Wedding Album</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-inv-muted">seret fotonya ✋</p>

      <div ref={area} className="relative mt-4 h-[300px] w-full">
        {cards.map((c, i) => (
          <motion.div
            key={c.caption}
            drag
            dragConstraints={area}
            dragElastic={0.25}
            dragMomentum={false}
            whileDrag={{ scale: 1.08, rotate: 0, zIndex: 20, cursor: "grabbing" }}
            initial={{ opacity: 0, y: -80, rotate: c.rotate * 2 }}
            animate={{ opacity: 1, y: c.y, x: c.x, rotate: c.rotate }}
            transition={{ delay: 0.2 + i * 0.25, type: "spring", stiffness: 120, damping: 14 }}
            className="absolute left-1/2 top-0 -ml-[75px] w-[150px] cursor-grab bg-white p-2 pb-7 shadow-xl"
            style={{ zIndex: i + 1 }}
          >
            <span aria-hidden className="absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2 rotate-3 bg-inv-primary/35" />
            <span className="relative block aspect-square overflow-hidden bg-inv-line">
              <Image src={c.src} alt="" fill sizes="150px" loading={i === 0 ? "eager" : "lazy"} className="pointer-events-none object-cover" draggable={false} />
            </span>
            <span className="absolute inset-x-0 bottom-1 font-display text-lg leading-none text-neutral-600">{c.caption}</span>
          </motion.div>
        ))}
      </div>

      <h1 className="mt-6 font-display text-6xl leading-none text-inv-ink">
        {groom} <span className="text-inv-primary">&amp;</span> {bride}
      </h1>
      <p className="mt-2 text-sm text-inv-muted">{dateText}</p>

      <div className="mt-6">
        <p className="text-xs text-inv-muted">Kepada Yth. Bapak/Ibu/Saudara/i</p>
        <p className="mt-1 font-display text-3xl">{children}</p>
        <div className="mt-5">
          <OpenButton>Buka Album</OpenButton>
        </div>
      </div>
    </div>
  );
}
