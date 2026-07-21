import type { PrismicDocument } from "@prismicio/client";
import type { MetadataRoute } from "next";
import { getMasterLocale } from "@/lib/locales";
import { createClient } from "@/prismicio";

type Resolved<T> = T & { url: string; uid: string };

const isResolvable = <T extends PrismicDocument>(doc: T): doc is Resolved<T> => Boolean(doc.url) && Boolean(doc.uid);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const client = await createClient();
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const masterLocale = await getMasterLocale();

  const [pages, articles, products, producers] = await Promise.all([
    client.getAllByType("page", { lang: "*" }),
    client.getAllByType("article", { lang: "*" }),
    client.getAllByType("product", { lang: "*" }),
    client.getAllByType("producer", { lang: "*" }),
  ]);

  const urlById = new Map<string, string>();
  for (const doc of [...pages, ...articles, ...products, ...producers]) {
    if (isResolvable(doc)) urlById.set(doc.id, doc.url);
  }

  const buildAlternates = (doc: Resolved<PrismicDocument>) =>
    Object.fromEntries([
      [doc.lang, `${SITE_URL}${doc.url}`],
      ...doc.alternate_languages
        .map((alt) => {
          const altPath = urlById.get(alt.id);
          return altPath ? [alt.lang, `${SITE_URL}${altPath}`] : null;
        })
        .filter((entry): entry is [string, string] => entry !== null),
    ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const doc of pages.filter(isResolvable)) {
    entries.push({
      url: `${SITE_URL}${doc.url}`,
      lastModified: new Date(doc.last_publication_date),
      priority: doc.lang === masterLocale ? (doc.uid === "home" ? 1 : 0.8) : 0.6,
      alternates: { languages: buildAlternates(doc) },
    });
  }

  for (const doc of articles.filter(isResolvable)) {
    entries.push({
      url: `${SITE_URL}${doc.url}`,
      lastModified: new Date(doc.last_publication_date),
      priority: 0.6,
      alternates: { languages: buildAlternates(doc) },
    });
  }

  for (const doc of products.filter(isResolvable)) {
    entries.push({
      url: `${SITE_URL}${doc.url}`,
      lastModified: new Date(doc.last_publication_date),
      priority: 0.7,
      alternates: { languages: buildAlternates(doc) },
    });
  }

  for (const doc of producers.filter(isResolvable)) {
    entries.push({
      url: `${SITE_URL}${doc.url}`,
      lastModified: new Date(doc.last_publication_date),
      priority: 0.5,
      alternates: { languages: buildAlternates(doc) },
    });
  }

  return entries;
}
