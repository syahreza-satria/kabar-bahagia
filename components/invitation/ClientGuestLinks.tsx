"use client";

import { markSentByToken } from "@/app/r/[token]/actions";
import { GuestLinks, type GuestRow } from "./GuestLinks";

export function ClientGuestLinks({ token, baseUrl, guests }: { token: string; baseUrl: string; guests: GuestRow[] }) {
  return <GuestLinks guests={guests} baseUrl={baseUrl} onMarkSent={(id, sent) => markSentByToken(token, id, sent)} />;
}
