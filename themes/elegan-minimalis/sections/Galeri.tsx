import { Gallery } from "@/components/invitation/Gallery";
import { youtubeId } from "@/lib/utils";
import type { SectionProps } from "../../types";
import { Section } from "../ui";

export function Galeri({ data }: SectionProps) {
  const photos = data.media.filter((m) => m.type === "foto" && m.section === "galeri");
  const yt = data.content.youtubeUrl ? youtubeId(data.content.youtubeUrl) : null;
  return (
    <Section title="Galeri">
      {yt && (
        <div className="mb-4 aspect-video overflow-hidden rounded-md">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${yt}`}
            title="Video prewedding"
            loading="lazy"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      )}
      <Gallery photos={photos} />
    </Section>
  );
}
