import type * as prismic from "@prismicio/client";
import type { Content } from "@prismicio/client";
import { type createBaseClient, createClient } from "@/prismicio";

/** Narrows a generic Prismic document to a specific custom type. */
export const isPage = (doc: prismic.PrismicDocument): doc is Content.PageDocument => doc.type === "page";
export const isArticle = (doc: prismic.PrismicDocument): doc is Content.ArticleDocument => doc.type === "article";
export const isEmployee = (doc: prismic.PrismicDocument): doc is Content.EmployeeDocument => doc.type === "employee";
export const isProduct = (doc: prismic.PrismicDocument): doc is Content.ProductDocument => doc.type === "product";
export const isProducer = (doc: prismic.PrismicDocument): doc is Content.ProducerDocument => doc.type === "producer";

/** All routable page types */
const PAGE_TYPES = ["page", "article", "employee", "product", "producer"] as const;

/** Fetches a document by UID, trying each page type in order. */
export async function getDocumentByUID(uid: string, client: prismic.Client, lang?: string) {
  // fetchLinks resolves the producer's name so the ProductDetail overline can
  // fall back to it. Harmless for page types that don't link a producer.
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

/** Fetches a singleton document by type. Returns null if it doesn't exist yet. */
export async function getSingleton<T extends prismic.PrismicDocument = prismic.PrismicDocument>(
  ...args: Parameters<ReturnType<typeof createBaseClient>["getSingle"]>
): Promise<T | null> {
  const client = await createClient();

  try {
    return (await client.getSingle(...args)) as unknown as T;
  } catch {
    return null;
  }
}
