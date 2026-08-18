import type { Client, PrismicDocument } from "@prismicio/client";
import { getDocumentByUID } from "@/lib/cms";
import { createClient } from "@/prismicio";

/**
 * Maps every locale that has a translation of `doc` to that translation's
 * routed path.
 *
 * UIDs are per-locale in Prismic — `/om-oss` and `/en-gb/about` are the same
 * document — so a target path can never be derived by swapping the locale
 * prefix on the current one. It has to be resolved per document. `doc.url` is
 * already routed by `buildRoutes` in `prismicio.ts` (prefix-free for the master
 * locale, `/:lang/...` otherwise), so the result needs no string surgery.
 */
export async function resolveLocalePaths(doc: PrismicDocument, client: Client): Promise<Record<string, string>> {
  const paths: Record<string, string> = {};

  if (doc.url) paths[doc.lang] = doc.url;

  await Promise.all(
    doc.alternate_languages.map(async (alt) => {
      try {
        const altDoc = await client.getByID(alt.id, { lang: alt.lang });
        if (altDoc.url) paths[alt.lang] = altDoc.url;
      } catch {}
    }),
  );

  return paths;
}

/**
 * The same map, resolved from the request path alone — for the layout, which
 * renders the language switcher without knowing which document the page
 * fetched. The lookups dedupe with the page's own within a request, so this is
 * close to free.
 *
 * Returns `{}` when the path has no document (404s), leaving the switcher to
 * fall back to each locale's home.
 */
export async function getLocalePathsForPath(pathname: string, lang: string): Promise<Record<string, string>> {
  // The master locale serves prefix-free URLs and every other locale is
  // prefixed with its own id, so the only prefix `pathname` can carry is `lang` itself
  const segments = pathname.split("/").filter(Boolean);
  const withoutLocale = segments[0] === lang ? segments.slice(1) : segments;

  const client = await createClient();

  // Home is a real document ("page" / uid "home") and is translated like any other
  if (withoutLocale.length === 0) {
    const home = await client.getByUID("page", "home", { lang }).catch(() => null);
    return home ? resolveLocalePaths(home, client) : {};
  }

  const doc = await getDocumentByUID(withoutLocale[withoutLocale.length - 1], client, lang);
  return doc ? resolveLocalePaths(doc, client) : {};
}
