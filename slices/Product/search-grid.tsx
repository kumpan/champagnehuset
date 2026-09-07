"use client";

import { Search } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/components/forms/input";
import type { SectionTheme } from "@/components/layout/section";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
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
import { SearchParamsSync } from "./search-params-sync";

// Muted text and the search field's border accent, per section theme
const themeClasses: Record<SectionTheme, { dim: string; input: string }> = {
  Bud: { dim: "text-ink-dim", input: "hover:border-brand/50 focus-visible:border-brand" },
  Leaf: { dim: "text-ink-dim", input: "hover:border-brand/50 focus-visible:border-brand" },
  Bottle: { dim: "text-ink-dim", input: "hover:border-brand/50 focus-visible:border-brand" },
  Dust: { dim: "text-spot-ink-dim", input: "hover:border-spot-fill/50 focus-visible:border-spot-fill" },
  Slate: { dim: "text-spot-ink-flip", input: "hover:border-spot-fill-dark/50 focus-visible:border-spot-fill-dark" },
};

type SearchGridProps = {
  products: ProductDocument[];
  searchPlaceholder?: string | null;
  noResultsText?: string | null;
  lang?: string;
  sectionTheme?: SectionTheme;
};

export function SearchGrid({
  products,
  searchPlaceholder,
  noResultsText,
  lang,
  sectionTheme = "Bud",
}: SearchGridProps) {
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<FilterSelection>({});
  const theme = themeClasses[sectionTheme];
  const reducedMotion = useReducedMotion();

  // The first render gets the full arrival cascade; cards entering on later
  // filter changes use a much tighter stagger so rapid typing stays snappy.
  const isArrival = useRef(true);
  useEffect(() => {
    isArrival.current = false;
  }, []);

  const enterDelay = (index: number) =>
    isArrival.current ? Math.min(index * 0.06, 0.6) : Math.min(index * 0.025, 0.15);

  const groups = useMemo(() => deriveFilterGroups(products, lang), [products, lang]);
  const searchIndex = useMemo(() => buildSearchIndex(products), [products]);
  const filtered = useMemo(
    () => filterProducts(products, searchIndex, query, selection),
    [products, searchIndex, query, selection],
  );
  const activeCount = countActiveFilters(selection);

  // The query string we last read from or wrote to the address bar, with its
  // leading "?". Lets the URL sync below ignore its own writes.
  const urlSearch = useRef<string | null>(null);
  const urlWriteTimer = useRef<number | undefined>(undefined);

  // Adopt state from the URL: on arrival, and when a link navigates here with
  // new params while the grid is already mounted.
  const syncFromUrl = useCallback(
    (search: string) => {
      const next = search ? `?${search}` : "";
      if (next === urlSearch.current) return;
      urlSearch.current = next;
      const state = readStateFromSearch(next, groups);
      setQuery(state.query);
      setSelection(state.selection);
    },
    [groups],
  );

  // Reflect state back into the URL so filtered views are shareable and
  // survive back-navigation from a product page. Typing is debounced because
  // browsers rate limit history writes, Safari hard-errors past 100 per 30s.
  const writeUrl = (search: string, delay = 0) => {
    window.clearTimeout(urlWriteTimer.current);
    const write = () => {
      urlSearch.current = search;
      const { pathname, hash } = window.location;
      window.history.replaceState(window.history.state, "", `${pathname}${search}${hash}`);
    };
    if (delay > 0) urlWriteTimer.current = window.setTimeout(write, delay);
    else write();
  };
  useEffect(() => () => window.clearTimeout(urlWriteTimer.current), []);

  const changeQuery = (next: string) => {
    setQuery(next);
    writeUrl(buildSearchString(next, selection), 300);
  };

  const changeSelection = (next: FilterSelection) => {
    setSelection(next);
    writeUrl(buildSearchString(query, next));
  };

  const toggleFilter = (groupId: FilterGroupId, value: string) => {
    const current = selection[groupId] ?? [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    const { [groupId]: _removed, ...rest } = selection;
    changeSelection(next.length > 0 ? { ...rest, [groupId]: next } : rest);
  };

  const clearFilters = () => changeSelection({});

  const searchInput = (
    <div className="relative">
      <Search className={cn("absolute top-1/2 left-4 size-5 -translate-y-1/2", theme.dim)} />
      <Input
        type="search"
        value={query}
        onChange={(event) => changeQuery(event.target.value)}
        placeholder={searchPlaceholder || t(lang).search}
        aria-label={searchPlaceholder || t(lang).search}
        className={cn(
          "h-12 rounded-1 border-brand/0 bg-green-10 pl-11 outline-0 hover:bg-green-10/60 hover:outline-0 focus-visible:bg-green-10 focus-visible:outline-0 active:outline-0",
          theme.input,
        )}
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
            className={cn("cursor-pointer px-1 text-sm underline underline-offset-4", theme.dim)}
          >
            {t(lang).clearFilters}
          </button>
        </m.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <Suspense fallback={null}>
        <SearchParamsSync onChange={syncFromUrl} />
      </Suspense>

      {/* Mobile: sticky filter tray */}
      <div className="sticky top-20 z-10 md:top-23 lg:hidden">
        <FilterTray activeCount={activeCount} lang={lang} sectionTheme={sectionTheme}>
          {searchInput}
          <FilterPanel groups={groups} selection={selection} onToggle={toggleFilter} sectionTheme={sectionTheme} />
          {clearButton}
        </FilterTray>
      </div>

      {/* Desktop: filter sidebar, scrolls with the page */}
      <aside className="hidden lg:flex lg:w-80 lg:shrink-0 lg:flex-col lg:gap-1">
        {searchInput}
        <FilterPanel groups={groups} selection={selection} onToggle={toggleFilter} sectionTheme={sectionTheme} />
        {clearButton}
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
                  layout: { type: "spring", stiffness: 300, damping: 35 },
                  opacity: { duration: 0.3, ease: "easeOut", delay: enterDelay(index) },
                  y: { type: "spring", stiffness: 300, damping: 25, delay: enterDelay(index) },
                }}
              >
                <ProductCard product={product} preload={index < 6} sectionTheme={sectionTheme} />
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
              className={cn("py-8 text-center", theme.dim)}
            >
              {query.trim().toLowerCase() === "ida"
                ? "Inget hittades, men ring Ida så löser hon det 💪"
                : noResultsText || t(lang).noProductsMatch}
            </m.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
