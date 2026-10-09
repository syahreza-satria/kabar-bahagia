import Image from "next/image";
import type { ComponentType, ReactNode } from "react";
import { Suspense } from "react";
import { Countdown } from "@/components/invitation/Countdown";
import { Gallery, type GalleryVariant } from "@/components/invitation/Gallery";
import { GiftCards } from "@/components/invitation/GiftCards";
import { ParallaxBand } from "@/components/invitation/ParallaxBand";
import { Reveal, type RevealVariant } from "@/components/invitation/Reveal";
import { RsvpForm } from "@/components/invitation/RsvpForm";
import { Tilt } from "@/components/invitation/Tilt";
import { WishesBoard } from "@/components/invitation/WishesBoard";
import { googleCalendarUrl, icsDataUrl } from "@/lib/calendar";
import { formatDateLong, formatTime, youtubeId } from "@/lib/utils";
import type { InvitationContent, SectionCode } from "@/types/invitation";
import type { SectionProps } from "../types";

export type SectionWrapperProps = { title?: string; eyebrow?: string; children: ReactNode };

export type ThemeKit = {
  /** Pembungkus section (judul, ornamen, jarak) khas tema. */
  Section: ComponentType<SectionWrapperProps>;
  Cover: ComponentType<SectionProps>;
  /** Bentuk bingkai foto mempelai. */
  photoShape: "arch" | "circle" | "oval" | "square";
  /** Gaya animasi muncul untuk kartu & foto (default "slide"). */
  motion?: "slide" | "rise" | "zoom" | "flip" | "rotate" | "drop";
  /** Tata letak galeri (default "grid"). */
  gallery?: GalleryVariant;
};

const MOTION: Record<NonNullable<ThemeKit["motion"]>, [RevealVariant, RevealVariant]> = {
  slide: ["left", "right"],
  rise: ["up", "up"],
  zoom: ["zoom", "zoom"],
  flip: ["flip", "flip"],
  rotate: ["rotate", "rotate"],
  drop: ["drop", "drop"],
};

const SHAPE: Record<ThemeKit["photoShape"], string> = {
  arch: "h-60 w-44 rounded-t-full",
  circle: "h-52 w-52 rounded-full",
  oval: "h-64 w-48 rounded-[50%]",
  square: "h-60 w-48 rounded-md",
};

/**
 * Semua section selain Cover & pembungkusnya dibangun dari kit ini, jadi tema baru cukup
 * menyediakan konfigurasi, Section wrapper, dan Cover. Komponen interaktif (RSVP, ucapan,
 * amplop) dipakai bersama dan hanya diberi gaya lewat variabel --inv-*.
 */
export function createSections(
  kit: ThemeKit,
  overrides: Partial<Record<SectionCode, ComponentType<SectionProps>>> = {},
): Record<SectionCode, ComponentType<SectionProps>> {
  const { Section } = kit;
  const [motionA, motionB] = MOTION[kit.motion ?? "slide"];

  function Person({ p, label, side }: { p: InvitationContent["bride"]; label: string; side: RevealVariant }) {
    const handle = p.instagram.replace(/^@/, "");
    return (
      <Reveal variant={side} className="flex flex-col items-center">
        {p.photoUrl && (
          <Tilt>
            <div className={`relative overflow-hidden border-2 border-inv-primary p-1 ${SHAPE[kit.photoShape]}`}>
              <div className={`relative h-full w-full overflow-hidden ${kit.photoShape === "arch" ? "rounded-t-full" : kit.photoShape === "oval" ? "rounded-[50%]" : kit.photoShape === "circle" ? "rounded-full" : "rounded"}`}>
                <Image src={p.photoUrl} alt={p.fullName} fill sizes="200px" className="object-cover" loading="lazy" />
              </div>
            </div>
          </Tilt>
        )}
        <p className="mt-5 text-xs uppercase tracking-[0.3em] text-inv-muted">{label}</p>
        <h3 className="mt-1 font-display text-3xl text-inv-ink">{p.fullName}</h3>
        {p.parents && <p className="mt-2 max-w-[18rem] whitespace-pre-line text-sm text-inv-muted">{p.parents}</p>}
        {handle && (
          <a
            href={`https://instagram.com/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 items-center text-sm text-inv-primary underline underline-offset-4"
          >
            @{handle}
          </a>
        )}
      </Reveal>
    );
  }

  const Pembuka: ComponentType<SectionProps> = ({ data }) => {
    const { opening, coverImageUrl } = data.content;
    const body = (
      <Section eyebrow={opening.greeting}>
        {opening.text && <p className="whitespace-pre-line leading-relaxed text-inv-ink">{opening.text}</p>}
        {opening.quote && (
          <blockquote className="mt-8 font-display text-xl italic leading-relaxed text-inv-ink">
            &ldquo;{opening.quote}&rdquo;
            {opening.quoteSource && (
              <footer className="mt-2 text-sm not-italic text-inv-muted">&mdash; {opening.quoteSource}</footer>
            )}
          </blockquote>
        )}
      </Section>
    );
    return coverImageUrl ? <ParallaxBand src={coverImageUrl}>{body}</ParallaxBand> : body;
  };

  const Mempelai: ComponentType<SectionProps> = ({ data }) => {
    const { bride, groom } = data.content;
    return (
      <Section title="Mempelai" eyebrow="Dengan memohon rahmat Allah">
        <div className="space-y-10">
          <Person p={groom} label="Mempelai Pria" side={motionA} />
          <p className="font-display text-4xl italic text-inv-primary">&amp;</p>
          <Person p={bride} label="Mempelai Wanita" side={motionB} />
        </div>
      </Section>
    );
  };

  const CountdownSection: ComponentType<SectionProps> = ({ data }) => {
    const main = data.events[0];
    if (!main) return null;
    return (
      <Section title="Menuju Hari Bahagia">
        <Countdown targetIso={main.startsAt} />
      </Section>
    );
  };

  const Acara: ComponentType<SectionProps> = ({ data }) => {
    const title = `${data.content.groom.nickname} & ${data.content.bride.nickname}`;
    return (
      <Section title="Rangkaian Acara">
        <div className="space-y-6">
          {data.events.map((e, i) => (
            <Reveal key={e.id} variant={i % 2 ? motionB : motionA}>
              <article className="inv-card p-6">
                <h3 className="font-display text-3xl text-inv-primary">{e.name}</h3>
                <p className="mt-3 text-inv-ink">{formatDateLong(e.startsAt, e.timezone)}</p>
                <p className="text-sm text-inv-muted">
                  {formatTime(e.startsAt, e.timezone)}
                  {e.endsAt ? ` – ${formatTime(e.endsAt, e.timezone)}` : " – selesai"} {e.timezone}
                </p>
                {e.venue && <p className="mt-4 font-medium text-inv-ink">{e.venue}</p>}
                {e.address && <p className="mt-1 whitespace-pre-line text-sm text-inv-muted">{e.address}</p>}
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {e.mapsUrl && (
                    <a href={e.mapsUrl} target="_blank" rel="noopener noreferrer" className="inv-btn inv-btn-solid !text-xs">
                      Google Maps
                    </a>
                  )}
                  <a href={googleCalendarUrl(e, title)} target="_blank" rel="noopener noreferrer" className="inv-btn inv-btn-outline !text-xs">
                    + Kalender
                  </a>
                  <a href={icsDataUrl(e, title)} download={`${e.name}.ics`} className="inv-btn inv-btn-outline !text-xs">
                    File .ics
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>
    );
  };

  const Galeri: ComponentType<SectionProps> = ({ data }) => {
    const photos = data.media.filter((m) => m.type === "foto" && m.section === "galeri");
    const yt = data.content.youtubeUrl ? youtubeId(data.content.youtubeUrl) : null;
    return (
      <Section title="Galeri">
        {yt && (
          <div className="mb-4 aspect-video overflow-hidden rounded-md">
            <iframe src={`https://www.youtube-nocookie.com/embed/${yt}`} title="Video prewedding" loading="lazy" allowFullScreen className="h-full w-full" />
          </div>
        )}
        <Gallery photos={photos} variant={kit.gallery} />
      </Section>
    );
  };

  const LoveStory: ComponentType<SectionProps> = ({ data }) => (
    <Section title="Kisah Kami">
      <ol className="relative ml-3 space-y-8 border-l border-inv-line text-left">
        {data.content.loveStory.map((s, i) => (
          <li key={i} className="pl-6">
            <Reveal variant="right">
              <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-inv-primary" aria-hidden />
              {s.date && <p className="text-xs uppercase tracking-widest text-inv-muted">{s.date}</p>}
              <h3 className="font-display text-2xl text-inv-primary">{s.title}</h3>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-inv-ink">{s.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );

  const Rsvp: ComponentType<SectionProps> = ({ data }) => (
    <Section title="RSVP" eyebrow="Konfirmasi Kehadiran">
      <Suspense fallback={<p className="text-sm text-inv-muted">Memuat formulir…</p>}>
        <RsvpForm slug={data.slug} />
      </Suspense>
    </Section>
  );

  const Ucapan: ComponentType<SectionProps> = ({ data }) => (
    <Section title="Ucapan & Doa">
      <Suspense fallback={<p className="text-sm text-inv-muted">Memuat ucapan…</p>}>
        <WishesBoard slug={data.slug} />
      </Suspense>
    </Section>
  );

  const Amplop: ComponentType<SectionProps> = ({ data }) => (
    <Section title="Amplop Digital" eyebrow="Tanda kasih">
      <p className="mb-6 text-sm text-inv-muted">
        Doa restu Anda adalah hadiah terbaik bagi kami. Namun bila berkenan memberi tanda kasih, dapat melalui:
      </p>
      <GiftCards gifts={data.gifts} />
    </Section>
  );

  const Live: ComponentType<SectionProps> = ({ data }) => {
    const url = data.content.liveStreamUrl;
    const yt = youtubeId(url);
    return (
      <Section title="Live Streaming" eyebrow="Saksikan dari jauh">
        {yt && (
          <div className="mb-4 aspect-video overflow-hidden rounded-md">
            <iframe src={`https://www.youtube-nocookie.com/embed/${yt}`} title="Siaran langsung" loading="lazy" allowFullScreen className="h-full w-full" />
          </div>
        )}
        <a href={url} target="_blank" rel="noopener noreferrer" className="inv-btn inv-btn-outline">
          Buka siaran langsung
        </a>
      </Section>
    );
  };

  const Penutup: ComponentType<SectionProps> = ({ data }) => {
    const { closing, bride, groom } = data.content;
    return (
      <Section eyebrow="Terima kasih">
        {closing.message && <p className="whitespace-pre-line leading-relaxed text-inv-ink">{closing.message}</p>}
        <p className="mt-8 text-sm text-inv-muted">Kami yang berbahagia,</p>
        <p className="inv-shimmer mt-1 font-display text-5xl">
          {groom.nickname} &amp; {bride.nickname}
        </p>
        {closing.family && <p className="mt-4 whitespace-pre-line text-sm text-inv-muted">{closing.family}</p>}
        <p className="mt-12 text-[11px] uppercase tracking-widest text-inv-muted">Dibuat dengan KabarBahagia</p>
      </Section>
    );
  };

  const base = {
    cover: kit.Cover,
    pembuka: Pembuka,
    mempelai: Mempelai,
    countdown: CountdownSection,
    acara: Acara,
    galeri: Galeri,
    lovestory: LoveStory,
    rsvp: Rsvp,
    ucapan: Ucapan,
    amplop: Amplop,
    live: Live,
    penutup: Penutup,
  };
  return { ...base, ...overrides };
}
