import type { MetadataRoute } from "next";

/** Undangan bersifat pribadi: semua mesin pencari diminta tidak mengindeks apa pun. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
