import { Suspense, type CSSProperties } from "react";
import { findGuestByCode } from "@/lib/invitations";
import { SECTION_LABELS } from "@/types/invitation";
import { getTheme } from "@/themes/registry";
import type { InvitationData, SectionCode } from "@/types/invitation";
import { InvitationShell } from "./InvitationShell";
import { ViewBeacon } from "@/components/invitation/widgets/ViewBeacon";

/** Section tanpa data tidak ditampilkan walau diaktifkan. */
function hasContent(code: SectionCode, d: InvitationData) {
  switch (code) {
    case "countdown":
    case "acara":
      return d.events.length > 0;
    case "galeri":
      return d.media.some((m) => m.type === "foto") || !!d.content.youtubeUrl;
    case "lovestory":
      return d.content.loveStory.length > 0;
    case "amplop":
      return d.gifts.length > 0;
    case "live":
      return !!d.content.liveStreamUrl;
    default:
      return true;
  }
}

/** Nama tamu diambil dari database lewat kode (bukan dari teks URL); di-stream terpisah. */
async function GuestName({
  invitationId,
  searchParams,
}: {
  invitationId: string;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (invitationId === "demo") return <>Nama Tamu (demo)</>;
  const { to } = await searchParams;
  const code = typeof to === "string" ? to : "";
  const guest = code ? await findGuestByCode(invitationId, code) : null;
  return <>{guest?.nama ?? "Tamu Undangan"}</>;
}

export function InvitationView({
  data,
  searchParams,
}: {
  data: InvitationData;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const theme = getTheme(data.themeId);
  const { colors } = theme.config;

  const themeVars = {
    "--inv-bg": colors.bg,
    "--inv-surface": colors.surface,
    "--inv-ink": colors.ink,
    "--inv-muted": colors.muted,
    "--inv-primary": data.primaryColor ?? colors.primary,
    "--inv-line": colors.line,
    "--inv-on-primary": colors.onPrimary ?? "#ffffff",
    "--inv-radius": theme.config.radius,
    "--inv-scene": colors.scene ?? data.primaryColor ?? colors.primary,
  } as CSSProperties;

  const Cover = theme.sections.cover;
  const body = data.sectionConfig.filter((s) => s.enabled && s.code !== "cover" && hasContent(s.code, data));

  return (
    <InvitationShell
      className={theme.config.fontClassName}
      themeVars={themeVars}
      musicUrl={data.musicUrl}
      ambient={theme.config.ambient}
      exit={theme.config.coverExit}
      nav={body
        .filter((s) => !["pembuka", "countdown", "penutup"].includes(s.code))
        .map((s) => ({ code: s.code, label: SECTION_LABELS[s.code] }))}
      cover={
        <Cover
          data={data}
          guestSlot={
            <Suspense fallback="Tamu Undangan">
              <GuestName invitationId={data.id} searchParams={searchParams} />
            </Suspense>
          }
        />
      }
    >
      {body.map(({ code }) => {
        const Section = theme.sections[code];
        return (
          <div key={code} id={`sec-${code}`}>
            <Section data={data} />
          </div>
        );
      })}
      {data.status === "aktif" && (
        <Suspense>
          <ViewBeacon slug={data.slug} />
        </Suspense>
      )}
    </InvitationShell>
  );
}
