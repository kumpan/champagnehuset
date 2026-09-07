"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

type SearchParamsSyncProps = {
  /** Called with the current query string (no leading "?") on mount and whenever it changes. */
  onChange: (search: string) => void;
};

/**
 * Reports the URL's query string to the grid. Rendered inside its own Suspense
 * boundary so useSearchParams only opts this empty leaf out of prerendering,
 * leaving the product grid in the static HTML. Unlike reading window.location
 * once on mount, this also fires when a link navigates to the same page with
 * new params, like the footer category links.
 */
export function SearchParamsSync({ onChange }: SearchParamsSyncProps) {
  const search = useSearchParams().toString();
  useEffect(() => {
    onChange(search);
  }, [search, onChange]);
  return null;
}
