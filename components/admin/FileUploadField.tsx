"use client";

import { useRef, useState } from "react";

/** Unggah satu berkas (gambar/audio) lalu kembalikan URL publiknya lewat onChange. */
export function FileUploadField({
  label,
  invitationId,
  value,
  onChange,
  kind = "image",
}: {
  label: string;
  invitationId: string | null;
  value: string;
  onChange: (url: string) => void;
  kind?: "image" | "audio";
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    if (!invitationId) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("invitationId", invitationId);
      fd.set("section", "aset");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Upload gagal");
      onChange(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <span className="adm-label">{label}</span>
      <div className="flex items-center gap-2">
        {kind === "image" && value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-12 w-12 rounded border border-zinc-200 object-cover" />
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… atau unggah"
          className="adm-input"
          aria-label={label}
        />
        <button
          type="button"
          disabled={!invitationId || busy}
          title={invitationId ? undefined : "Simpan undangan dulu untuk mengunggah"}
          onClick={() => input.current?.click()}
          className="adm-btn-ghost shrink-0"
        >
          {busy ? "…" : "Unggah"}
        </button>
        <input
          ref={input}
          type="file"
          hidden
          accept={kind === "image" ? "image/*" : "audio/*"}
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />
      </div>
      {!invitationId && (
        <p className="mt-1 text-xs text-zinc-500">Simpan dulu sebagai draft untuk mengaktifkan unggah.</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
