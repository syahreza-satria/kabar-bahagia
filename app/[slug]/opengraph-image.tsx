import { ImageResponse } from "next/og";
import { getInvitationBySlug } from "@/lib/data";
import { formatDateLong } from "@/lib/utils";

export const alt = "Undangan Pernikahan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getInvitationBySlug(slug);
  const names = data ? `${data.content.groom.nickname} & ${data.content.bride.nickname}` : "Undangan Pernikahan";
  const main = data?.events[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf7f2",
          color: "#2b2a28",
          border: "16px solid #faf7f2",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            border: "2px solid #8a6f4d",
          }}
        >
          <div style={{ fontSize: 28, letterSpacing: 10, color: "#78736b" }}>THE WEDDING OF</div>
          <div style={{ fontSize: 110, marginTop: 24, fontFamily: "serif", color: "#2b2a28" }}>{names}</div>
          {main && (
            <div style={{ fontSize: 34, marginTop: 28, color: "#8a6f4d" }}>
              {formatDateLong(main.startsAt, main.timezone)}
            </div>
          )}
        </div>
      </div>
    ),
    size,
  );
}
