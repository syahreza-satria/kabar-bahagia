"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deleteMedia, reorderMedia } from "@/app/admin/_actions/media";

type Item = { id: string; url: string };

export function MediaManager({ invitationId, initial }: { invitationId: string; initial: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();
  const dragFrom = useRef<number | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function upload(files: FileList) {
    setBusy(true);
    setError(null);
    const added: Item[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("invitationId", invitationId);
      fd.set("section", "galeri");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(`${file.name}: ${json.error ?? "gagal"}`);
        continue;
      }
      added.push({ id: json.id, url: json.url });
    }
    setItems((prev) => [...prev, ...added]);
    setBusy(false);
    if (input.current) input.current.value = "";
    router.refresh();
  }

  function persist(next: Item[]) {
    setItems(next);
    start(() =>
      reorderMedia(
        invitationId,
        next.map((i) => i.id),
      ),
    );
  }

  function drop(to: number) {
    const from = dragFrom.current;
    dragFrom.current = null;
    if (from === null || from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    persist(next);
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    persist(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button className="adm-btn" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? "Mengunggah…" : "+ Unggah foto"}
        </button>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => e.target.files && upload(e.target.files)}
        />
        <p className="text-xs text-zinc-500">
          Foto otomatis diperkecil (maks 1600px) dan dikonversi ke WebP. Seret untuk mengurutkan.
        </p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {items.map((m, i) => (
          <li
            key={m.id}
            draggable
            onDragStart={() => (dragFrom.current = i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => drop(i)}
            className="group relative cursor-grab overflow-hidden rounded-md border border-zinc-200 bg-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt={`Foto ${i + 1}`} className="aspect-square w-full object-cover" />
            <div className="flex items-center justify-between gap-1 p-1 text-xs">
              <span>#{i + 1}</span>
              <span className="flex gap-1">
                <button type="button" aria-label="Geser maju" onClick={() => move(i, -1)} className="px-1">
                  ←
                </button>
                <button type="button" aria-label="Geser mundur" onClick={() => move(i, 1)} className="px-1">
                  →
                </button>
                <button
                  type="button"
                  aria-label="Hapus foto"
                  className="px-1 text-red-600"
                  onClick={() => {
                    if (!confirm("Hapus foto ini?")) return;
                    setItems((prev) => prev.filter((x) => x.id !== m.id));
                    start(() => deleteMedia(invitationId, m.id));
                  }}
                >
                  ✕
                </button>
              </span>
            </div>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p className="text-sm text-zinc-500">Belum ada foto galeri.</p>}
    </div>
  );
}
