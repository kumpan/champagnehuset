import type { Client, PrismicDocument } from "@prismicio/client";
import { isFilled } from "@prismicio/client";
export type BreadcrumbItem = {
  label: string;
  href: string;
};

/**
 * Recursively walks the parent chain of a Prismic page document and returns
 * a breadcrumb trail ordered root-first, e.g.:
 *
 *   [{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Team", href: "/about/team" }]
 *
 * Works for any depth. Each level is one cached API call.
 * The current page is always the last item (non-link in the UI).
 */
export async function buildBreadcrumbs(
  doc: PrismicDocument,
  client: Client,
  trail: BreadcrumbItem[] = [],
): Promise<BreadcrumbItem[]> {
  const label = (doc.data.page_title as string | undefined) || doc.uid || "";
  const href = doc.url ?? "/";

  trail.unshift({ label, href });

  if (isFilled.contentRelationship(doc.data.parent)) {
    try {
      const parent = await client.getByID(doc.data.parent.id, {
        lang: doc.lang,
        fetchLinks: ["page.page_title"],
      });
      return buildBreadcrumbs(parent, client, trail);
    } catch {
      // Parent document was deleted or unpublished, so stop the chain here
    }
  }

  // Prepend the home page (fetched, not hardcoded) unless we're already on it
  if (href !== "/") {
    const lang = doc.lang;
    const home = await client.getByUID("page", "home", {
      lang,
      fetchLinks: ["page.page_title"],
    });
    const homeLabel = (home.data.page_title as string | undefined) || home.uid || "";
    trail.unshift({ label: homeLabel, href: home.url ?? "/" });
  }

  return trail;
}
