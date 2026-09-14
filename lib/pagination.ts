import { parseTagParam } from "./article-tags";

/**
 * Reads the `?page=N` search param that drives listing pagination.
 *
 * The URL is the source of truth for the current page, so page 2+ is a real
 * server-rendered response with its own crawlable article links instead of
 * React state a crawler never triggers.
 *
 * Anything missing, non-integer or below 1 collapses to page 1. The value is
 * deliberately *not* clamped to a maximum here — the listing only knows how
 * many pages exist after it has filtered its articles.
 */
export function parsePageParam(value: string | string[] | null | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isInteger(page) && page > 1 ? page : 1;
}

type SliceLike = { slice_type: string; variation: string; primary: Record<string, unknown> };

const listSlices = (slices: readonly SliceLike[]) =>
  slices.filter((slice) => slice.slice_type === "article" && slice.variation === "list");

/**
 * True when the document actually renders a paginated listing. Only those pages
 * may act on `?page=N` in their metadata — otherwise any URL with the param
 * tacked on (`/om-oss?page=2`) would advertise a "Sida 2" title and its own
 * canonical while serving identical content.
 */
export function hasPaginatedListing(slices: readonly SliceLike[]): boolean {
  return listSlices(slices).some((slice) => slice.primary.show_pagination !== false);
}

/**
 * True when the document renders a listing whose chips filter by `?tag=`. A
 * fixed "Filter by Tag" hides the chips, so the URL param is ignored there too.
 */
export function hasFilterableListing(slices: readonly SliceLike[]): boolean {
  return listSlices(slices).some(
    (slice) =>
      slice.primary.show_filter_chips === true &&
      (!slice.primary.filter_by_tag || slice.primary.filter_by_tag === "All"),
  );
}

/** The raw `?page=` and `?tag=` a page template receives. */
export type ListingSearchParams = { page?: string | string[]; tag?: string | string[] };

/** The listing state after parsing. `tag` is the stored CMS value, never the URL slug. */
export type ListingParams = { page: number; tag: string | null };

/**
 * The listing state a document's metadata may act on. Params the document has
 * no listing to honour fall back to the defaults, for the same reason as
 * `hasPaginatedListing` above.
 */
export function listingParamsForMetadata(slices: readonly SliceLike[], search: ListingSearchParams): ListingParams {
  return {
    page: hasPaginatedListing(slices) ? parsePageParam(search.page) : 1,
    tag: hasFilterableListing(slices) ? parseTagParam(search.tag) : null,
  };
}
