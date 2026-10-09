import { googleCalendarUrl, icsDataUrl } from "@/lib/calendar";
import { formatDateLong, formatTime } from "@/lib/utils";
import type { SectionProps } from "../../types";
import { Section } from "../ui";

export function Acara({ data }: SectionProps) {
  const title = `${data.content.groom.nickname} & ${data.content.bride.nickname}`;
  return (
    <Section title="Rangkaian Acara">
      <div className="space-y-6">
        {data.events.map((e) => (
          <article key={e.id} className="rounded-lg border border-inv-line bg-inv-surface p-6">
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
              <a
                href={googleCalendarUrl(e, title)}
                target="_blank"
                rel="noopener noreferrer"
                className="inv-btn inv-btn-outline !text-xs"
              >
                + Kalender
              </a>
              <a href={icsDataUrl(e, title)} download={`${e.name}.ics`} className="inv-btn inv-btn-outline !text-xs">
                File .ics
              </a>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
