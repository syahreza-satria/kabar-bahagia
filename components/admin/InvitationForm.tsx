"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveInvitation } from "@/app/admin/_actions/invitation";
import { SECTION_LABELS, type InvitationContent, type SectionConfig, type TimezoneLabel } from "@/types/invitation";
import { slugify } from "@/lib/text";
import { FileUploadField } from "./FileUploadField";

export type FormEvent = {
  name: string;
  startsLocal: string;
  endsLocal: string;
  timezone: TimezoneLabel;
  venue: string;
  address: string;
  mapsUrl: string;
};
export type FormGift = {
  type: "bank" | "ewallet" | "qris" | "alamat";
  bankName: string;
  number: string;
  accountName: string;
  qrUrl: string;
};
export type FormState = {
  slug: string;
  themeId: string;
  primaryColor: string;
  musicUrl: string;
  ogImageUrl: string;
  content: InvitationContent;
  sectionConfig: SectionConfig;
  events: FormEvent[];
  gifts: FormGift[];
};

type Theme = { id: string; name: string; description: string; previewImage: string };

const EMPTY_EVENT: FormEvent = {
  name: "",
  startsLocal: "",
  endsLocal: "",
  timezone: "WIB",
  venue: "",
  address: "",
  mapsUrl: "",
};
const EMPTY_GIFT: FormGift = { type: "bank", bankName: "", number: "", accountName: "", qrUrl: "" };

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="adm-label">{label}</span>
      {children}
    </label>
  );
}

export function InvitationForm({
  invitationId,
  initial,
  themes,
}: {
  invitationId: string | null;
  initial: FormState;
  themes: Theme[];
}) {
  const router = useRouter();
  const [s, setS] = useState<FormState>(initial);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const patch = (p: Partial<FormState>) => setS((prev) => ({ ...prev, ...p }));
  const patchContent = (p: Partial<InvitationContent>) =>
    setS((prev) => ({ ...prev, content: { ...prev.content, ...p } }));
  const setPerson = (who: "bride" | "groom", p: Partial<InvitationContent["bride"]>) =>
    patchContent({ [who]: { ...s.content[who], ...p } } as Partial<InvitationContent>);

  function moveSection(i: number, dir: -1 | 1) {
    const j = i + dir;
    // cover selalu paling atas
    if (j < 1 || j >= s.sectionConfig.length || i < 1) return;
    const next = [...s.sectionConfig];
    [next[i], next[j]] = [next[j], next[i]];
    patch({ sectionConfig: next });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const res = await saveInvitation(invitationId, s);
      if (!res.ok) return setMsg({ ok: false, text: res.error });
      setMsg({ ok: true, text: "Tersimpan." });
      if (!invitationId && res.id) router.push(`/admin/${res.id}/edit`);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Card title="Dasar">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug (alamat undangan)">
            <div className="flex items-center gap-1">
              <span className="text-sm text-zinc-500">/</span>
              <input
                required
                value={s.slug}
                onChange={(e) => patch({ slug: slugify(e.target.value) })}
                className="adm-input"
                placeholder="rina-dimas"
              />
            </div>
          </Field>
          <Field label="Warna utama (opsional)">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={s.primaryColor || "#8a6f4d"}
                onChange={(e) => patch({ primaryColor: e.target.value })}
                className="h-9 w-12 rounded border border-zinc-300"
                aria-label="Pilih warna utama"
              />
              <button type="button" className="adm-btn-ghost" onClick={() => patch({ primaryColor: "" })}>
                Pakai bawaan tema
              </button>
            </div>
          </Field>
        </div>
        <div>
          <span className="adm-label">Tema</span>
          <div className="flex flex-wrap gap-3">
            {themes.map((t) => (
              <label
                key={t.id}
                className={`w-36 cursor-pointer rounded-lg border p-2 text-center text-xs ${
                  s.themeId === t.id ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200"
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  className="sr-only"
                  checked={s.themeId === t.id}
                  onChange={() => patch({ themeId: t.id })}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.previewImage}
                  alt={`Pratinjau tema ${t.name}`}
                  className="mb-2 aspect-[3/4] w-full rounded object-cover"
                />
                <strong className="block">{t.name}</strong>
                <a href={`/preview/${t.id}`} target="_blank" rel="noopener noreferrer" className="mt-1 block underline">
                  Lihat demo ↗
                </a>
              </label>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FileUploadField
            label="Musik latar (mp3)"
            kind="audio"
            invitationId={invitationId}
            value={s.musicUrl}
            onChange={(v) => patch({ musicUrl: v })}
          />
          <FileUploadField
            label="Gambar preview WhatsApp (1200×630)"
            invitationId={invitationId}
            value={s.ogImageUrl}
            onChange={(v) => patch({ ogImageUrl: v })}
          />
        </div>
      </Card>

      <Card title="Mempelai">
        <div className="grid gap-6 md:grid-cols-2">
          {(["groom", "bride"] as const).map((who) => (
            <div key={who} className="space-y-3">
              <h3 className="text-sm font-medium">{who === "groom" ? "Mempelai Pria" : "Mempelai Wanita"}</h3>
              <Field label="Nama panggilan">
                <input
                  required
                  className="adm-input"
                  value={s.content[who].nickname}
                  onChange={(e) => setPerson(who, { nickname: e.target.value })}
                />
              </Field>
              <Field label="Nama lengkap + gelar">
                <input
                  required
                  className="adm-input"
                  value={s.content[who].fullName}
                  onChange={(e) => setPerson(who, { fullName: e.target.value })}
                />
              </Field>
              <Field label="Nama orang tua">
                <textarea
                  rows={2}
                  className="adm-input"
                  value={s.content[who].parents}
                  onChange={(e) => setPerson(who, { parents: e.target.value })}
                  placeholder="Putra/Putri dari Bapak … & Ibu …"
                />
              </Field>
              <Field label="Instagram">
                <input
                  className="adm-input"
                  value={s.content[who].instagram}
                  onChange={(e) => setPerson(who, { instagram: e.target.value })}
                  placeholder="@username"
                />
              </Field>
              <FileUploadField
                label="Foto"
                invitationId={invitationId}
                value={s.content[who].photoUrl}
                onChange={(v) => setPerson(who, { photoUrl: v })}
              />
            </div>
          ))}
        </div>
        <FileUploadField
          label="Foto cover"
          invitationId={invitationId}
          value={s.content.coverImageUrl}
          onChange={(v) => patchContent({ coverImageUrl: v })}
        />
      </Card>

      <Card title="Pembuka & Penutup">
        <Field label="Salam pembuka">
          <input
            className="adm-input"
            value={s.content.opening.greeting}
            onChange={(e) => patchContent({ opening: { ...s.content.opening, greeting: e.target.value } })}
          />
        </Field>
        <Field label="Teks pembuka">
          <textarea
            rows={3}
            className="adm-input"
            value={s.content.opening.text}
            onChange={(e) => patchContent({ opening: { ...s.content.opening, text: e.target.value } })}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ayat / kutipan">
            <textarea
              rows={3}
              className="adm-input"
              value={s.content.opening.quote}
              onChange={(e) => patchContent({ opening: { ...s.content.opening, quote: e.target.value } })}
            />
          </Field>
          <Field label="Sumber kutipan">
            <input
              className="adm-input"
              value={s.content.opening.quoteSource}
              onChange={(e) => patchContent({ opening: { ...s.content.opening, quoteSource: e.target.value } })}
              placeholder="QS. Ar-Rum: 21"
            />
          </Field>
        </div>
        <Field label="Pesan penutup">
          <textarea
            rows={3}
            className="adm-input"
            value={s.content.closing.message}
            onChange={(e) => patchContent({ closing: { ...s.content.closing, message: e.target.value } })}
          />
        </Field>
        <Field label="Nama keluarga (penutup)">
          <textarea
            rows={2}
            className="adm-input"
            value={s.content.closing.family}
            onChange={(e) => patchContent({ closing: { ...s.content.closing, family: e.target.value } })}
          />
        </Field>
      </Card>

      <Card title="Acara">
        {s.events.map((ev, i) => {
          const set = (p: Partial<FormEvent>) =>
            patch({ events: s.events.map((x, k) => (k === i ? { ...x, ...p } : x)) });
          return (
            <div key={i} className="space-y-3 rounded-md border border-zinc-200 p-4">
              <div className="grid gap-3 sm:grid-cols-4">
                <Field label="Nama acara">
                  <input
                    required
                    className="adm-input"
                    value={ev.name}
                    onChange={(e) => set({ name: e.target.value })}
                    placeholder="Akad Nikah"
                  />
                </Field>
                <Field label="Mulai">
                  <input
                    required
                    type="datetime-local"
                    className="adm-input"
                    value={ev.startsLocal}
                    onChange={(e) => set({ startsLocal: e.target.value })}
                  />
                </Field>
                <Field label="Selesai (opsional)">
                  <input
                    type="datetime-local"
                    className="adm-input"
                    value={ev.endsLocal}
                    onChange={(e) => set({ endsLocal: e.target.value })}
                  />
                </Field>
                <Field label="Zona waktu">
                  <select
                    className="adm-input"
                    value={ev.timezone}
                    onChange={(e) => set({ timezone: e.target.value as TimezoneLabel })}
                  >
                    <option>WIB</option>
                    <option>WITA</option>
                    <option>WIT</option>
                  </select>
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Tempat / venue">
                  <input className="adm-input" value={ev.venue} onChange={(e) => set({ venue: e.target.value })} />
                </Field>
                <Field label="Link Google Maps">
                  <input className="adm-input" value={ev.mapsUrl} onChange={(e) => set({ mapsUrl: e.target.value })} />
                </Field>
              </div>
              <Field label="Alamat">
                <textarea
                  rows={2}
                  className="adm-input"
                  value={ev.address}
                  onChange={(e) => set({ address: e.target.value })}
                />
              </Field>
              <button
                type="button"
                className="text-sm text-red-600"
                onClick={() => patch({ events: s.events.filter((_, k) => k !== i) })}
              >
                Hapus acara
              </button>
            </div>
          );
        })}
        <button
          type="button"
          className="adm-btn-ghost"
          onClick={() => patch({ events: [...s.events, { ...EMPTY_EVENT }] })}
        >
          + Tambah acara
        </button>
      </Card>

      <Card title="Amplop digital">
        {s.gifts.map((g, i) => {
          const set = (p: Partial<FormGift>) => patch({ gifts: s.gifts.map((x, k) => (k === i ? { ...x, ...p } : x)) });
          return (
            <div key={i} className="space-y-3 rounded-md border border-zinc-200 p-4">
              <div className="grid gap-3 sm:grid-cols-4">
                <Field label="Jenis">
                  <select
                    className="adm-input"
                    value={g.type}
                    onChange={(e) => set({ type: e.target.value as FormGift["type"] })}
                  >
                    <option value="bank">Rekening bank</option>
                    <option value="ewallet">E-wallet</option>
                    <option value="qris">QRIS</option>
                    <option value="alamat">Alamat kirim kado</option>
                  </select>
                </Field>
                {g.type !== "alamat" && g.type !== "qris" && (
                  <Field label={g.type === "bank" ? "Nama bank" : "Nama e-wallet"}>
                    <input
                      className="adm-input"
                      value={g.bankName}
                      onChange={(e) => set({ bankName: e.target.value })}
                    />
                  </Field>
                )}
                <Field label={g.type === "alamat" ? "Alamat lengkap" : "Nomor"}>
                  <input className="adm-input" value={g.number} onChange={(e) => set({ number: e.target.value })} />
                </Field>
                <Field label="Atas nama">
                  <input
                    className="adm-input"
                    value={g.accountName}
                    onChange={(e) => set({ accountName: e.target.value })}
                  />
                </Field>
              </div>
              {g.type === "qris" && (
                <FileUploadField
                  label="Gambar QRIS"
                  invitationId={invitationId}
                  value={g.qrUrl}
                  onChange={(v) => set({ qrUrl: v })}
                />
              )}
              <button
                type="button"
                className="text-sm text-red-600"
                onClick={() => patch({ gifts: s.gifts.filter((_, k) => k !== i) })}
              >
                Hapus
              </button>
            </div>
          );
        })}
        <button
          type="button"
          className="adm-btn-ghost"
          onClick={() => patch({ gifts: [...s.gifts, { ...EMPTY_GIFT }] })}
        >
          + Tambah rekening / alamat
        </button>
      </Card>

      <Card title="Opsional: Love story, galeri video, live streaming">
        {s.content.loveStory.map((st, i) => {
          const set = (p: Partial<InvitationContent["loveStory"][number]>) =>
            patchContent({ loveStory: s.content.loveStory.map((x, k) => (k === i ? { ...x, ...p } : x)) });
          return (
            <div key={i} className="grid gap-3 rounded-md border border-zinc-200 p-4 sm:grid-cols-3">
              <Field label="Waktu">
                <input
                  className="adm-input"
                  value={st.date}
                  onChange={(e) => set({ date: e.target.value })}
                  placeholder="Maret 2019"
                />
              </Field>
              <Field label="Judul">
                <input className="adm-input" value={st.title} onChange={(e) => set({ title: e.target.value })} />
              </Field>
              <div className="sm:row-span-2 sm:col-span-3">
                <Field label="Cerita">
                  <textarea
                    rows={2}
                    className="adm-input"
                    value={st.text}
                    onChange={(e) => set({ text: e.target.value })}
                  />
                </Field>
              </div>
              <button
                type="button"
                className="text-left text-sm text-red-600"
                onClick={() => patchContent({ loveStory: s.content.loveStory.filter((_, k) => k !== i) })}
              >
                Hapus bagian ini
              </button>
            </div>
          );
        })}
        <button
          type="button"
          className="adm-btn-ghost"
          onClick={() => patchContent({ loveStory: [...s.content.loveStory, { date: "", title: "", text: "" }] })}
        >
          + Tambah cerita
        </button>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Video YouTube galeri (opsional)">
            <input
              className="adm-input"
              value={s.content.youtubeUrl}
              onChange={(e) => patchContent({ youtubeUrl: e.target.value })}
            />
          </Field>
          <Field label="Link live streaming YouTube/Instagram (opsional)">
            <input
              className="adm-input"
              value={s.content.liveStreamUrl}
              onChange={(e) => patchContent({ liveStreamUrl: e.target.value })}
            />
          </Field>
        </div>
      </Card>

      <Card title="Section undangan (aktifkan & urutkan)">
        <ul className="divide-y divide-zinc-100">
          {s.sectionConfig.map((sec, i) => (
            <li key={sec.code} className="flex items-center justify-between gap-3 py-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sec.enabled}
                  disabled={sec.code === "cover"}
                  onChange={(e) =>
                    patch({
                      sectionConfig: s.sectionConfig.map((x, k) => (k === i ? { ...x, enabled: e.target.checked } : x)),
                    })
                  }
                />
                {SECTION_LABELS[sec.code]}
                {sec.code === "cover" && <span className="text-xs text-zinc-500">(wajib, selalu pertama)</span>}
              </label>
              {sec.code !== "cover" && (
                <span className="flex gap-1">
                  <button
                    type="button"
                    className="adm-btn-ghost !px-2 !py-1"
                    aria-label="Naikkan"
                    onClick={() => moveSection(i, -1)}
                    disabled={i <= 1}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="adm-btn-ghost !px-2 !py-1"
                    aria-label="Turunkan"
                    onClick={() => moveSection(i, 1)}
                    disabled={i === s.sectionConfig.length - 1}
                  >
                    ↓
                  </button>
                </span>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex items-center gap-3 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur">
        <button type="submit" disabled={pending} className="adm-btn">
          {pending ? "Menyimpan…" : invitationId ? "Simpan perubahan" : "Simpan sebagai draft"}
        </button>
        {invitationId && s.slug && (
          <a href={`/${s.slug}`} target="_blank" rel="noopener noreferrer" className="adm-btn-ghost">
            Pratinjau ↗
          </a>
        )}
        {msg && (
          <span role="status" className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>
            {msg.text}
          </span>
        )}
      </div>
    </form>
  );
}
