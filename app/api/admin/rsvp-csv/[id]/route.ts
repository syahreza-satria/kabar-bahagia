import { getAdmin } from "@/lib/auth";
import { listRsvps } from "@/lib/rsvp";
import { rsvpCsv } from "@/lib/rsvp-format";
import { isUuid } from "@/lib/text";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return new Response("Tidak diizinkan", { status: 401 });
  const { id } = await ctx.params;
  if (!isUuid(id)) return new Response("Not found", { status: 404 });
  const csv = rsvpCsv(await listRsvps(id));
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="rsvp-${id.slice(0, 8)}.csv"`,
    },
  });
}
