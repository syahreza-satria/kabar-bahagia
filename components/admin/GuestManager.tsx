"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addGuest, deleteGuest, importGuests, markGuestSent } from "@/app/admin/actions";
import { GuestLinks, type GuestRow } from "@/components/invitation/GuestLinks";

export function GuestManager({ invitationId, baseUrl, guests }: { invitationId: string; baseUrl: string; guests: GuestRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [bulk, setBulk] = useState("");

  function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    start(async () => {
      const res = await addGuest(invitationId, Object.fromEntries(fd));
      setMsg(res.ok ? { ok: true, text: "Tamu ditambahkan" } : { ok: false, text: res.error });
      if (res.ok) {
        form.reset();
        router.refresh();
      }
    });
  }

  function onImport() {
    start(async () => {
      const res = await importGuests(invitationId, bulk);
      if (res.ok) {
        setMsg({ ok: true, text: `${res.added} tamu diimpor${res.skipped ? `, ${res.skipped} baris dilewati` : ""}` });
        setBulk("");
        router.refresh();
      } else setMsg({ ok: false, text: res.error });
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={onAdd} className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="font-semibold">Tambah tamu</h2>
          <input name="nama" required placeholder="Nama tamu" className="adm-input" />
          <div className="grid grid-cols-3 gap-2">
            <input name="grup" placeholder="Grup" className="adm-input" />
            <input name="noWhatsapp" placeholder="No. WhatsApp" inputMode="tel" className="adm-input" />
            <input name="maxPax" type="number" min={1} max={20} defaultValue={2} className="adm-input" aria-label="Maks. tamu" />
          </div>
          <button disabled={pending} className="adm-btn">
            Tambah
          </button>
        </form>

        <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="font-semibold">Impor dari Excel / CSV</h2>
          <p className="text-xs text-zinc-500">
            Tempel baris dengan kolom: <code>nama, grup, no whatsapp, max pax</code> (pemisah tab, koma, atau titik koma).
          </p>
          <textarea rows={4} className="adm-input" value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={"Budi Santoso\tKeluarga\t08123456789\t2"} />
          <button type="button" disabled={pending || !bulk.trim()} onClick={onImport} className="adm-btn">
            Impor
          </button>
        </div>
      </div>
      {msg && (
        <p role="status" className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>
          {msg.text}
        </p>
      )}

      <GuestLinks
        guests={guests}
        baseUrl={baseUrl}
        onMarkSent={(gid, sent) => markGuestSent(invitationId, gid, sent)}
        extraActions={(g) => (
          <button
            type="button"
            className="adm-btn-ghost !text-red-600"
            onClick={() => {
              if (confirm(`Hapus tamu ${g.nama}?`)) start(async () => { await deleteGuest(invitationId, g.id); router.refresh(); });
            }}
          >
            Hapus
          </button>
        )}
      />
    </div>
  );
}
