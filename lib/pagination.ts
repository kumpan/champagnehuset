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
export function parsePageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isInteger(page) && page > 1 ? page : 1;
}

type SliceLike = { slice_type: string; variation: string; primary: Record<string, unknown> };

/**
 * True when the document actually renders a paginated listing. Only those pages
 * may act on `?page=N` in their metadata — otherwise any URL with the param
 * tacked on (`/om-oss?page=2`) would advertise a "Sida 2" title and its own
 * canonical while serving identical content.
 */
export function hasPaginatedListing(slices: readonly SliceLike[]): boolean {
  return slices.some(
    (slice) => slice.slice_type === "article" && slice.variation === "list" && slice.primary.show_pagination !== false,
  );
}
