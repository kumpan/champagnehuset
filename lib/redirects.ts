import type * as prismic from "@prismicio/client";
import { asLink, NotFoundError } from "@prismicio/client";
import { createClient } from "@/prismicio";

export type RedirectEntry = {
  destination: string;
  statusCode: 301 | 302 | 307 | 308;
};

type RedirectItem = {
  from_path: prismic.KeyTextField;
  to_url: prismic.LinkField;
  active: prismic.BooleanField;
  redirect_type: prismic.SelectField<"301 - Permanent" | "302 - Temporary">;
};

function parseStatusCode(raw: string | null | undefined): 301 | 302 {
  if (raw?.startsWith("302")) return 302;
  return 301;
}

export async function getRedirects(): Promise<Record<string, RedirectEntry>> {
  try {
    const client = await createClient(
      {
        fetchOptions:
          process.env.NODE_ENV === "production"
            ? { next: { tags: ["redirects"] }, cache: "force-cache" }
            : { next: { revalidate: 5 } },
      },
      { withAutoPreviews: false },
    );

    // Cast needed until Slice Machine regenerates prismicio-types after the
    // custom type changes from repeatable → singleton with a group field.
    const doc = (await client.getSingle("redirect")) as unknown as prismic.PrismicDocument<{
      redirects: prismic.GroupField<RedirectItem>;
    }>;

    const map: Record<string, RedirectEntry> = {};

    for (const item of doc.data.redirects) {
      const { active, from_path, to_url, redirect_type } = item;

      if (!(active ?? true)) continue;

      const fromPath = from_path?.trim();
      const destination = asLink(to_url);
      if (!fromPath || !destination) continue;

      const statusCode = parseStatusCode(redirect_type);
      const leading = fromPath.startsWith("/") ? fromPath : `/${fromPath}`;
      const normalized = leading !== "/" ? leading.replace(/\/$/, "") : "/";

      const entry: RedirectEntry = { destination, statusCode };

      if (normalized === "/") {
        map["/"] = entry;
      } else {
        map[normalized] = entry;
        map[`${normalized}/`] = entry;
      }
    }

    return map;
  } catch (error) {
    if (error instanceof NotFoundError) return {};
    console.error("[redirects] Failed to fetch redirect documents from Prismic:", error);
    return {};
  }
}
