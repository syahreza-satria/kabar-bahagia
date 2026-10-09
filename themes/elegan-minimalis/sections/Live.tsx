import { youtubeId } from "@/lib/utils";
import type { SectionProps } from "../../types";
import { Section } from "../ui";

export function Live({ data }: SectionProps) {
  const url = data.content.liveStreamUrl;
  const yt = youtubeId(url);
  return (
    <Section title="Live Streaming" eyebrow="Saksikan dari jauh">
      {yt && (
        <div className="mb-4 aspect-video overflow-hidden rounded-md">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${yt}`}
            title="Siaran langsung"
            loading="lazy"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      )}
      <a href={url} target="_blank" rel="noopener noreferrer" className="inv-btn inv-btn-outline">
        Buka siaran langsung
      </a>
    </Section>
  );
}
