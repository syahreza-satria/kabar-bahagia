"use client";

import { useState, useTransition } from "react";
import { deleteWish, setWishHidden } from "@/app/admin/actions";

type Wish = { id: string; nama: string; pesan: string; hidden: boolean; createdAt: string };

export function WishModeration({ invitationId, initial }: { invitationId: string; initial: Wish[] }) {
  const [wishes, setWishes] = useState(initial);
  const [, start] = useTransition();

  return (
    <ul className="space-y-3">
      {wishes.length === 0 && <li className="text-sm text-zinc-500">Belum ada ucapan.</li>}
      {wishes.map((w) => (
        <li key={w.id} className={`rounded-lg border bg-white p-4 ${w.hidden ? "border-amber-300 opacity-70" : "border-zinc-200"}`}>
          <div className="flex items-baseline justify-between gap-2">
            <strong>{w.nama}</strong>
            <span className="text-xs text-zinc-500">{new Date(w.createdAt).toLocaleString("id-ID")}</span>
          </div>
          <p className="mt-1 whitespace-pre-line break-words text-sm">{w.pesan}</p>
          <div className="mt-3 flex gap-2">
            <button
              className="adm-btn-ghost"
              onClick={() => {
                setWishes((p) => p.map((x) => (x.id === w.id ? { ...x, hidden: !x.hidden } : x)));
                start(() => setWishHidden(invitationId, w.id, !w.hidden));
              }}
            >
              {w.hidden ? "Tampilkan" : "Sembunyikan"}
            </button>
            <button
              className="adm-btn-ghost !text-red-600"
              onClick={() => {
                if (!confirm("Hapus ucapan ini permanen?")) return;
                setWishes((p) => p.filter((x) => x.id !== w.id));
                start(() => deleteWish(invitationId, w.id));
              }}
            >
              Hapus
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
