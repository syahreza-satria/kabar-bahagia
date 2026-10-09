"use client";

import { useMemo, useState, useTransition } from "react";
import { DEFAULT_WA_TEMPLATE, renderTemplate, waLink } from "@/lib/wa";

export type GuestRow = {
  id: string;
  kode: string;
  nama: string;
  grup: string;
  noWhatsapp: string;
  maxPax: number;
  sentAt: string | null;
  openedAt: string | null;
};

/**
 * Daftar link tamu + tombol kirim WhatsApp (wa.me). Dipakai admin dan halaman rekap klien;
 * `onMarkSent` diberikan masing-masing konteks (otorisasi berbeda).
 */
export function GuestLinks({
  guests,
  baseUrl,
  onMarkSent,
  extraActions,
}: {
  guests: GuestRow[];
  baseUrl: string;
  onMarkSent: (guestId: string, sent: boolean) => Promise<void>;
  extraActions?: (g: GuestRow) => React.ReactNode;
}) {
  const [template, setTemplate] = useState(DEFAULT_WA_TEMPLATE);
  const [rows, setRows] = useState(guests);
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("");
  const [, start] = useTransition();

  const groups = useMemo(() => [...new Set(guests.map((g) => g.grup).filter(Boolean))], [guests]);
  const filtered = rows.filter(
    (g) => (!group || g.grup === group) && (!q || g.nama.toLowerCase().includes(q.toLowerCase())),
  );

  function mark(g: GuestRow, sent: boolean) {
    setRows((prev) => prev.map((x) => (x.id === g.id ? { ...x, sentAt: sent ? new Date().toISOString() : null } : x)));
    start(() => onMarkSent(g.id, sent));
  }

  return (
    <div className="space-y-4">
      <details className="rounded-lg border border-zinc-200 bg-white p-4" open={false}>
        <summary className="cursor-pointer text-sm font-medium">Template pesan WhatsApp</summary>
        <p className="mt-2 text-xs text-zinc-500">
          Gunakan <code>{"{nama}"}</code> dan <code>{"{link}"}</code> sebagai pengganti otomatis.
        </p>
        <textarea rows={7} className="adm-input mt-2" value={template} onChange={(e) => setTemplate(e.target.value)} />
        <button type="button" className="mt-2 text-xs underline" onClick={() => setTemplate(DEFAULT_WA_TEMPLATE)}>
          Kembalikan ke bawaan
        </button>
      </details>

      <div className="flex flex-wrap gap-2">
        <input
          placeholder="Cari nama tamu"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="adm-input !w-56"
        />
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="adm-input !w-44"
          aria-label="Filter grup"
        >
          <option value="">Semua grup</option>
          {groups.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <p className="self-center text-sm text-zinc-500">
          Terkirim {rows.filter((r) => r.sentAt).length}/{rows.length}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Grup</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-zinc-500">
                  Tidak ada tamu.
                </td>
              </tr>
            )}
            {filtered.map((g) => {
              const link = `${baseUrl}?to=${g.kode}`;
              const message = renderTemplate(template, { nama: g.nama, link });
              return (
                <tr key={g.id} className="border-b border-zinc-100 last:border-0 align-top">
                  <td className="px-3 py-3">
                    <p className="font-medium">{g.nama}</p>
                    <p className="text-xs text-zinc-500">{g.noWhatsapp ? `+${g.noWhatsapp}` : "Tanpa nomor WA"}</p>
                  </td>
                  <td className="px-3 py-3 text-zinc-600">{g.grup || "-"}</td>
                  <td className="px-3 py-3 text-xs">
                    {g.sentAt ? (
                      <span className="text-emerald-700">Terkirim</span>
                    ) : (
                      <span className="text-zinc-500">Belum</span>
                    )}
                    {g.openedAt && <span className="ml-2 text-sky-700">Dibuka</span>}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={waLink(g.noWhatsapp, message)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => !g.sentAt && mark(g, true)}
                        className="adm-btn !bg-emerald-600 hover:!bg-emerald-700"
                      >
                        Kirim WhatsApp
                      </a>
                      <button
                        type="button"
                        className="adm-btn-ghost"
                        onClick={() =>
                          navigator.clipboard?.writeText(link).catch(() => window.prompt("Salin link:", link))
                        }
                      >
                        Salin link
                      </button>
                      <button type="button" className="adm-btn-ghost" onClick={() => mark(g, !g.sentAt)}>
                        {g.sentAt ? "Batalkan tanda" : "Tandai terkirim"}
                      </button>
                      {extraActions?.(g)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
