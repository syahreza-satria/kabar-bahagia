import { statusLabel, summarize } from "@/lib/rsvp";

type Row = { nama: string; status: "hadir" | "tidak" | "ragu"; jumlah: number; grup: string | null };

export function RsvpTable({ rows, csvHref }: { rows: Row[]; csvHref?: string }) {
  const s = summarize(rows);
  const cards: [string, number][] = [
    ["Hadir (konfirmasi)", s.hadir],
    ["Hadir (orang)", s.hadirOrang],
    ["Ragu", s.ragu],
    ["Tidak hadir", s.tidak],
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map(([label, n]) => (
          <div key={label} className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{n}</p>
          </div>
        ))}
      </div>
      {csvHref && (
        <a href={csvHref} className="adm-btn-ghost">
          Ekspor CSV
        </a>
      )}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Grup</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-zinc-500">
                  Belum ada konfirmasi.
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-zinc-100 last:border-0">
                <td className="px-3 py-2 font-medium">{r.nama}</td>
                <td className="px-3 py-2 text-zinc-600">{r.grup || "-"}</td>
                <td className="px-3 py-2">{statusLabel(r.status)}</td>
                <td className="px-3 py-2">{r.jumlah}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
