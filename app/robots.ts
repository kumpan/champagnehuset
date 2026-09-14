import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE_URL } from "@/lib/schema-config";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host") ?? "";
  // Only the real domain gets indexed, so a staging host stays hidden even without env
  const isIndexable = host === new URL(SITE_URL).host;

  if (!isIndexable) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/slice-simulator/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
