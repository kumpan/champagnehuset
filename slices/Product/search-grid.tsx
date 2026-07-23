"use client";

import { Search } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/components/forms/input";
import type { ProductDocument } from "@/prismicio-types";
import { FilterPanel } from "./filter-panel";
import { FilterTray } from "./filter-tray";
import { ProductCard } from "./product-card";
import type { FilterGroupId, FilterSelection } from "./search";
import {
  buildSearchIndex,
  buildSearchString,
  countActiveFilters,
  deriveFilterGroups,
  filterProducts,
  readStateFromSearch,
} from "./search";

type SearchGridProps = {
  products: ProductDocument[];
  searchPlaceholder?: string | null;
  noResultsText?: string | null;
};

export function SearchGrid({ products, searchPlaceholder, noResultsText }: SearchGridProps) {
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<FilterSelection>({});
  const hydratedFromUrl = useRef(false);
  const reducedMotion = useReducedMotion();

  // The first render gets the full arrival cascade; cards entering on later
  // filter changes use a much tighter stagger so rapid typing stays snappy.
  const isArrival = useRef(true);
  useEffect(() => {
    isArrival.current = false;
  }, []);

  const enterDelay = (index: number) =>
    isArrival.current ? Math.min(index * 0.06, 0.6) : Math.min(index * 0.025, 0.15);

  const groups = useMemo(() => deriveFilterGroups(products), [products]);
  const searchIndex = useMemo(() => buildSearchIndex(products), [products]);
  const filtered = useMemo(
    () => filterProducts(products, searchIndex, query, selection),
    [products, searchIndex, query, selection],
  );
  const activeCount = countActiveFilters(selection);

  // Restore state from the URL once on mount. The page is static, so we read
  // window.location instead of useSearchParams (which would force a CSR bailout).
  useEffect(() => {
    const state = readStateFromSearch(window.location.search, groups);
    if (state.query) setQuery(state.query);
    if (countActiveFilters(state.selection) > 0) setSelection(state.selection);
    hydratedFromUrl.current = true;
  }, [groups]);

  // Reflect state back into the URL so filtered views are shareable and
  // survive back-navigation from a product page.
  useEffect(() => {
    if (!hydratedFromUrl.current) return;
    const url = `${window.location.pathname}${buildSearchString(query, selection)}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", url);
  }, [query, selection]);

  const toggleFilter = (groupId: FilterGroupId, value: string) => {
    setSelection((prev) => {
      const current = prev[groupId] ?? [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      const { [groupId]: _removed, ...rest } = prev;
      return next.length > 0 ? { ...rest, [groupId]: next } : rest;
    });
  };

  const clearFilters = () => setSelection({});

  const searchInput = (
    <div className="relative">
      <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-dim" />
      <Input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={searchPlaceholder || "Sök"}
        aria-label={searchPlaceholder || "Sök"}
        className="h-12 rounded-1 bg-green-10 pl-11"
      />
    </div>
  );

  const clearButton = (
    <AnimatePresence initial={false}>
      {activeCount > 0 && (
        <m.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.5, 0, 0.1, 1] }}
          className="overflow-hidden"
        >
          <button
            type="button"
            onClick={clearFilters}
            className="cursor-pointer px-1 text-ink-dim text-sm underline underline-offset-4"
          >
            Rensa filter
          </button>
        </m.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Mobile: sticky filter tray */}
      <div className="sticky top-4 z-10 md:top-8 lg:hidden">
        <FilterTray activeCount={activeCount}>
          {searchInput}
          <FilterPanel groups={groups} selection={selection} onToggle={toggleFilter} />
          {clearButton}
        </FilterTray>
      </div>

      {/* Desktop: filter sidebar */}
      <aside className="hidden lg:block lg:w-80 lg:shrink-0">
        <div className="sticky top-24 flex flex-col gap-1">
          {searchInput}
          <FilterPanel groups={groups} selection={selection} onToggle={toggleFilter} />
          {clearButton}
        </div>
      </aside>

      {/* Results */}
      <div className="min-w-0 flex-1">
        <div className="relative grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-4">
          {/* popLayout pops exiting cards out of flow so the survivors' `layout`
              animations can slide them into their new grid positions immediately. */}
          <AnimatePresence mode="popLayout">
            {filtered.map((product, index) => (
              <m.div
                key={product.id}
                layout={!reducedMotion}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  scale: reducedMotion ? 1 : 0.96,
                  transition: { duration: 0.15, ease: "easeIn" },
                }}
                transition={{
                  layout: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.3, ease: "easeOut", delay: enterDelay(index) },
                  y: { type: "spring", stiffness: 300, damping: 25, delay: enterDelay(index) },
                }}
              >
                <ProductCard product={product} />
              </m.div>
            ))}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {filtered.length === 0 && (
            <m.p
              initial={{ opacity: 0 }}
              // Delayed past the card exit duration so it fades in after the
              // last ghosts are gone instead of on top of them.
              animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.2 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="py-8 text-center text-ink-dim"
            >
              {noResultsText || "Inga produkter matchar din sökning."}
            </m.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
