import { asImageSrc, type ImageField, type PrismicDocument } from "@prismicio/client";
import type { Metadata } from "next";

type DocWithSeo = PrismicDocument<{
  meta_title?: string | null;
  meta_description?: string | null;
  meta_image?: ImageField;
}>;

/**
 * Builds Next.js Metadata from a Prismic document's SEO tab fields.
 * Reuses the same shape across pages, articles, and employees.
 *
 * Only sets fields that have actual content so the layout's defaults
 * (title.template, fallback description, etc.) cascade through cleanly
 * when the CMS leaves a field empty.
 */
export function buildPageMetadata(doc: DocWithSeo | null): Metadata {
  if (!doc) return {};

  const title = doc.data.meta_title || undefined;
  const description = doc.data.meta_description || undefined;
  const imageUrl = doc.data.meta_image ? asImageSrc(doc.data.meta_image) : null;
  const images = imageUrl ? [{ url: imageUrl }] : undefined;

  const metadata: Metadata = {};
  if (title) metadata.title = title;
  if (description) metadata.description = description;

  if (title || description || images) {
    metadata.openGraph = {
      ...(title && { title }),
      ...(description && { description }),
      ...(images && { images }),
    };
    metadata.twitter = {
      ...(title && { title }),
      ...(description && { description }),
      ...(images && { images }),
    };
  }

  return metadata;
}
