import type { EventData } from "@/types/invitation";

const fmt = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function range(e: EventData) {
  const start = e.startsAt;
  const end = e.endsAt ?? new Date(new Date(e.startsAt).getTime() + 2 * 3_600_000).toISOString();
  return { start, end };
}

export function googleCalendarUrl(e: EventData, title: string) {
  const { start, end } = range(e);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${e.name} - ${title}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    location: [e.venue, e.address].filter(Boolean).join(", "),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function icsDataUrl(e: EventData, title: string) {
  const { start, end } = range(e);
  const esc = (s: string) => s.replace(/[\\;,]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KabarBahagia//ID",
    "BEGIN:VEVENT",
    `UID:${e.id}@kabarbahagia`,
    `DTSTAMP:${fmt(start)}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(`${e.name} - ${title}`)}`,
    `LOCATION:${esc([e.venue, e.address].filter(Boolean).join(", "))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
