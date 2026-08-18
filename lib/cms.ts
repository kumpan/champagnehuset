import type * as prismic from "@prismicio/client";
import type { Content } from "@prismicio/client";
import { type createBaseClient, createClient } from "@/prismicio";

/** Narrows a generic Prismic document to a specific custom type. */
export const isPage = (doc: prismic.PrismicDocument): doc is Content.PageDocument => doc.type === "page";
export const isArticle = (doc: prismic.PrismicDocument): doc is Content.ArticleDocument => doc.type === "article";
export const isEmployee = (doc: prismic.PrismicDocument): doc is Content.EmployeeDocument => doc.type === "employee";
export const isProduct = (doc: prismic.PrismicDocument): doc is Content.ProductDocument => doc.type === "product";
export const isProducer = (doc: prismic.PrismicDocument): doc is Content.ProducerDocument => doc.type === "producer";

/** All routable page types. Employee is a non-page custom type (data only), so it is excluded. */
const PAGE_TYPES = ["page", "article", "product", "producer"] as const;

/** Fetches a document by UID, trying each page type in order. */
export async function getDocumentByUID(uid: string, client: prismic.Client, lang?: string) {
  // fetchLinks resolves the producer's name so the Text → Info (product detail)
  // overline can fall back to it. Harmless for page types with no producer link.
  const options = { fetchLinks: ["producer.producer_name"], ...(lang ? { lang } : {}) };

  for (const type of PAGE_TYPES) {
    try {
      return await client.getByUID(type, uid, options);
    } catch {}
  }

  return null;
}

/** Returns all routable documents */
export async function getAllRoutableDocuments(lang?: string) {
  const client = await createClient();
  const options = lang ? { lang } : undefined;

  const results = await Promise.all(PAGE_TYPES.map((type) => client.getAllByType(type, options).catch(() => [])));

  return results.flat();
}
/**
 * Fetches a singleton document by type, falling back to the master locale when
 * the requested one has no translation yet.
 *
 * The fallback is what makes it safe to pass `lang` from the layout before
 * editors have translated the chrome: `getSingle` throws on a missing locale
 * variant, and the layout guards on `{navbarData && …}`, so without it a fresh
 * locale would render with *no* navbar or footer at all. Falling back yields
 * today's behaviour (master-locale chrome) at worst, the translation at best.
 *
 * Returns null only when the singleton doesn't exist in any locale.
 */
export async function getSingleton<T extends prismic.PrismicDocument = prismic.PrismicDocument>(
  ...args: Parameters<ReturnType<typeof createBaseClient>["getSingle"]>
): Promise<T | null> {
  const client = await createClient();
  const [documentType, params] = args;

  try {
    return (await client.getSingle(documentType, params)) as unknown as T;
  } catch {
    if (!params?.lang) return null;
    try {
      return (await client.getSingle(documentType)) as unknown as T;
    } catch {
      return null;
    }
  }
}
