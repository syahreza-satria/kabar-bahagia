"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteInvitation, duplicateInvitation, setInvitationStatus } from "@/app/admin/_actions/invitation";

export function InvitationActions({ id, status }: { id: string; status: "draft" | "aktif" | "arsip" }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const changeStatus = (next: "draft" | "aktif") =>
    start(async () => {
      setError(null);
      const res = await setInvitationStatus(id, next);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {status === "draft" && (
          <button disabled={pending} className="adm-btn" onClick={() => changeStatus("aktif")}>
            Publikasikan
          </button>
        )}
        {status === "aktif" && (
          <button disabled={pending} className="adm-btn-ghost" onClick={() => changeStatus("draft")}>
            Kembalikan ke draft
          </button>
        )}
        <button disabled={pending} className="adm-btn-ghost" onClick={() => start(() => duplicateInvitation(id))}>
          Duplikat
        </button>
        <button
          disabled={pending}
          className="adm-btn-ghost !text-red-600"
          onClick={() => {
            if (
              confirm("Hapus undangan beserta semua tamu, RSVP, ucapan, dan media? Tindakan ini tidak bisa dibatalkan.")
            ) {
              start(() => deleteInvitation(id));
            }
          }}
        >
          Hapus
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
