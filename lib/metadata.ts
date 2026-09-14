import { asImageSrc, type ImageField, type PrismicDocument } from "@prismicio/client";
import type { Metadata } from "next";
import { t } from "./i18n";
import type { ListingParams } from "./pagination";
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
 *
 * `listing` is the listing's `?tag=` and `?page=N` (see `lib/pagination.ts`).
 * A filtered or paged view is a distinct URL with distinct articles, so it gets
 * a self-referencing canonical rather than reading as a duplicate of the open
 * feed, and page 2+ gets its own title.
 */
export function buildPageMetadata(doc: DocWithSeo | null, listing: ListingParams = { page: 1, tag: null }): Metadata {
  if (!doc) return {};

  const paged = listing.page > 1;
  const pageSuffix = paged ? ` – ${t(doc.lang).page} ${listing.page}` : "";
  const title = doc.data.meta_title ? `${doc.data.meta_title}${pageSuffix}` : undefined;
  const description = doc.data.meta_description || undefined;
  const imageUrl = doc.data.meta_image ? asImageSrc(doc.data.meta_image) : null;
  const images = [{ url: imageUrl ?? DEFAULT_OG_IMAGE }];

  // Prismic locale (sv-se) -> Open Graph locale (sv_SE)
  const ogLocale = doc.lang.replace(/-(\w+)$/, (_, region) => `_${region.toUpperCase()}`);

  // Same param order as the listing's own links, so the canonical matches the address bar
  const query = new URLSearchParams();
  if (listing.tag) query.set("tag", listing.tag.toLowerCase());
  if (paged) query.set("page", String(listing.page));
  const search = query.toString();
  const url = doc.url ? `${doc.url}${search ? `?${search}` : ""}` : undefined;

  const metadata: Metadata = {};
  if (title) metadata.title = title;
  if (description) metadata.description = description;

  // Only filtered and paginated URLs get a canonical for now — the site emits none
  // otherwise (see improvements.md), and a narrowed view must not be mistaken for the open feed.
  if (search && url) metadata.alternates = { canonical: url };

  metadata.openGraph = {
    type: doc.type === "article" ? "article" : "website",
    url, // resolved against metadataBase
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
