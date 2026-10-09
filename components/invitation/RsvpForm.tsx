"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DEMO_SLUG } from "@/lib/demo";
import { Confetti } from "./Confetti";
import { TurnstileWidget } from "./TurnstileWidget";

type Status = "hadir" | "tidak" | "ragu";
type Lookup = {
  guest: { nama: string; maxPax: number } | null;
  rsvp: { status: Status; jumlah: number } | null;
};

const OPTIONS: { value: Status; label: string }[] = [
  { value: "hadir", label: "Hadir" },
  { value: "ragu", label: "Masih ragu" },
  { value: "tidak", label: "Tidak hadir" },
];

/** Gaya mengikuti variabel tema (--inv-*); logika dipakai bersama semua tema. */
export function RsvpForm({ slug }: { slug: string }) {
  const code = useSearchParams().get("to") ?? "";
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [nama, setNama] = useState("");
  const [status, setStatus] = useState<Status>("hadir");
  const [jumlah, setJumlah] = useState(1);
  const [token, setToken] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [burst, setBurst] = useState(0);
  const demo = slug === DEMO_SLUG;
  const onToken = useCallback((t: string) => setToken(t), []);

  useEffect(() => {
    if (demo) return;
    let cancelled = false;
    fetch(`/api/rsvp?slug=${encodeURIComponent(slug)}&to=${encodeURIComponent(code)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Lookup | null) => {
        if (cancelled || !data) return;
        setLookup(data);
        if (data.rsvp) {
          setStatus(data.rsvp.status);
          setJumlah(data.rsvp.jumlah);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug, code, demo]);

  const maxPax = lookup?.guest?.maxPax ?? 5;
  const knownGuest = !!lookup?.guest;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      if (demo) {
        await new Promise((r) => setTimeout(r, 500));
        setLookup((l) => ({ guest: l?.guest ?? null, rsvp: { status, jumlah } }));
        if (status === "hadir") setBurst((b) => b + 1);
        setMessage({ ok: true, text: "Demo: konfirmasi Anda berhasil (tidak disimpan)." });
        return;
      }
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug,
          to: code || undefined,
          nama: knownGuest ? undefined : nama,
          status,
          jumlah: status === "tidak" ? 0 : jumlah,
          turnstile: token,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Gagal mengirim konfirmasi");
      if (status === "hadir") setBurst((b) => b + 1);
      setMessage({
        ok: true,
        text: knownGuest
          ? "Terima kasih, konfirmasi Anda tersimpan. Anda dapat mengubahnya kapan saja lewat link ini."
          : "Terima kasih, konfirmasi Anda tersimpan.",
      });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Terjadi kesalahan" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 text-left">
      <Confetti burstKey={burst} />
      {knownGuest ? (
        <p className="text-center text-inv-muted">
          Atas nama <strong className="text-inv-ink">{lookup!.guest!.nama}</strong>
        </p>
      ) : (
        <div>
          <label htmlFor="rsvp-nama" className="mb-1 block text-sm text-inv-muted">
            Nama
          </label>
          <input
            id="rsvp-nama"
            required
            maxLength={80}
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="inv-input"
            autoComplete="name"
          />
        </div>
      )}

      <fieldset>
        <legend className="mb-2 text-sm text-inv-muted">Konfirmasi kehadiran</legend>
        <div className="grid grid-cols-3 gap-2">
          {OPTIONS.map((o) => (
            <label
              key={o.value}
              className={`flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-2 text-center text-sm ${
                status === o.value
                  ? "border-inv-primary bg-inv-primary text-inv-on-primary"
                  : "border-inv-line bg-inv-surface text-inv-ink"
              }`}
            >
              <input
                type="radio"
                name="status"
                value={o.value}
                checked={status === o.value}
                onChange={() => setStatus(o.value)}
                className="sr-only"
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      {status !== "tidak" && (
        <div>
          <label htmlFor="rsvp-jumlah" className="mb-1 block text-sm text-inv-muted">
            Jumlah tamu (maks. {maxPax})
          </label>
          <select
            id="rsvp-jumlah"
            value={Math.min(jumlah, maxPax)}
            onChange={(e) => setJumlah(Number(e.target.value))}
            className="inv-input"
          >
            {Array.from({ length: maxPax }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} orang
              </option>
            ))}
          </select>
        </div>
      )}

      <TurnstileWidget onToken={onToken} />

      <button type="submit" disabled={busy} className="inv-btn inv-btn-solid w-full">
        {busy ? "Mengirim…" : lookup?.rsvp ? "Perbarui konfirmasi" : "Kirim konfirmasi"}
      </button>

      {message && (
        <p role="status" className={`text-center text-sm ${message.ok ? "text-inv-primary" : "text-red-700"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
