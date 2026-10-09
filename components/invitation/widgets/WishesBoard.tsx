"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DEMO_SLUG } from "@/lib/demo";
import { TurnstileWidget } from "@/components/invitation/widgets/TurnstileWidget";

type Wish = { id: string; nama: string; pesan: string; createdAt: string };

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "baru saja";
  if (s < 3600) return `${Math.floor(s / 60)} menit lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  return `${Math.floor(s / 86400)} hari lalu`;
}

export function WishesBoard({ slug }: { slug: string }) {
  const code = useSearchParams().get("to") ?? "";
  const demo = slug === DEMO_SLUG;
  const [wishes, setWishes] = useState<Wish[]>(() =>
    demo
      ? [
          {
            id: "d1",
            nama: "Keluarga Besar",
            pesan: "Selamat menempuh hidup baru! Semoga sakinah, mawaddah, warahmah.",
            createdAt: new Date(Date.now() - 3_600_000).toISOString(),
          },
          {
            id: "d2",
            nama: "Sahabat Kuliah",
            pesan: "Akhirnya sah juga! Bahagia selalu ya kalian berdua.",
            createdAt: new Date(Date.now() - 86_400_000).toISOString(),
          },
        ]
      : [],
  );
  const [guestName, setGuestName] = useState<string | null>(null);
  const [nama, setNama] = useState("");
  const [pesan, setPesan] = useState("");
  const [token, setToken] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onToken = useCallback((t: string) => setToken(t), []);

  const load = useCallback(async () => {
    const r = await fetch(`/api/wishes?slug=${encodeURIComponent(slug)}`);
    if (r.ok) setWishes((await r.json()).wishes);
  }, [slug]);

  useEffect(() => {
    if (demo) return;
    fetch(`/api/wishes?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setWishes(d.wishes))
      .catch(() => {});
    if (code) {
      fetch(`/api/rsvp?slug=${encodeURIComponent(slug)}&to=${encodeURIComponent(code)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setGuestName(d?.guest?.nama ?? null))
        .catch(() => {});
    }
  }, [slug, code, demo]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (demo) {
        setWishes((w) => [
          { id: `d${Date.now()}`, nama: nama || "Anda", pesan, createdAt: new Date().toISOString() },
          ...w,
        ]);
        setPesan("");
        return;
      }
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug,
          to: code || undefined,
          nama: guestName ? undefined : nama,
          pesan,
          turnstile: token,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Gagal mengirim ucapan");
      setPesan("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 text-left">
      <form onSubmit={submit} className="space-y-3">
        {!guestName && (
          <input
            required
            maxLength={80}
            placeholder="Nama"
            aria-label="Nama"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="inv-input"
          />
        )}
        <textarea
          required
          maxLength={500}
          rows={4}
          placeholder="Tulis ucapan & doa"
          aria-label="Ucapan"
          value={pesan}
          onChange={(e) => setPesan(e.target.value)}
          className="inv-input"
        />
        <TurnstileWidget onToken={onToken} />
        <button type="submit" disabled={busy} className="inv-btn inv-btn-solid w-full">
          {busy ? "Mengirim…" : "Kirim ucapan"}
        </button>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
      </form>

      <ul className="max-h-96 space-y-3 overflow-y-auto pr-1">
        {wishes.length === 0 && (
          <li className="text-center text-sm text-inv-muted">Jadilah yang pertama memberi ucapan.</li>
        )}
        {wishes.map((w) => (
          <li key={w.id} className="rounded-lg border border-inv-line bg-inv-surface p-4">
            <div className="flex items-baseline justify-between gap-2">
              <strong className="text-sm text-inv-ink">{w.nama}</strong>
              <span className="text-xs text-inv-muted">{timeAgo(w.createdAt)}</span>
            </div>
            <p className="mt-1 whitespace-pre-line break-words text-sm text-inv-ink">{w.pesan}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
