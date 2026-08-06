import { asImageSrc, type ImageField, type PrismicDocument } from "@prismicio/client";
import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "./schema-config";

type DocWithSeo = PrismicDocument<{
  meta_title?: string | null;
  meta_description?: string | null;
  meta_image?: ImageField;
}>;

/**
 * Builds Next.js Metadata from a Prismic document's SEO fields (shared across
 * pages, articles, products, producers).
 *
 * Next shallow-replaces `openGraph` and `twitter` per route segment (nested keys
 * are NOT merged), so any derived field the root layout set — og:type,
 * og:locale, twitter:card — is dropped the moment a page returns its own
 * `openGraph`/`twitter` object. Those fields are therefore re-declared here, and
 * the image/locale fall back to sane defaults so content pages never ship
 * without an og:image. The top-level `title`/`description` are deep-merged, so
 * the layout's title.template and default description still cascade when the CMS
 * leaves them empty.
 */
export function buildPageMetadata(doc: DocWithSeo | null): Metadata {
  if (!doc) return {};

  const title = doc.data.meta_title || undefined;
  const description = doc.data.meta_description || undefined;
  const imageUrl = doc.data.meta_image ? asImageSrc(doc.data.meta_image) : null;
  const images = [{ url: imageUrl ?? DEFAULT_OG_IMAGE }];

  // Prismic locale (sv-se) -> Open Graph locale (sv_SE)
  const ogLocale = doc.lang.replace(/-(\w+)$/, (_, region) => `_${region.toUpperCase()}`);

  const metadata: Metadata = {};
  if (title) metadata.title = title;
  if (description) metadata.description = description;

  metadata.openGraph = {
    type: doc.type === "article" ? "article" : "website",
    url: doc.url ?? undefined, // resolved against metadataBase
    locale: ogLocale,
    ...(title && { title }),
    ...(description && { description }),
    images,
  };
  metadata.twitter = {
    card: "summary_large_image",
    ...(title && { title }),
    ...(description && { description }),
    images,
  };

  return metadata;
}
