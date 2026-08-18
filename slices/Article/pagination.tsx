import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// active = the theme's primary surface, base = its secondary. Same tokens as button.tsx.
const pageThemeClasses = {
  Bud: {
    base: "bg-fill-raised text-ink hover:bg-brand/15",
    active: "bg-brand text-brand-ink",
    disabled: "bg-fill-raised/50 text-ink/30",
  },
  Leaf: {
    base: "bg-fill text-ink hover:bg-brand/15",
    active: "bg-brand text-brand-ink",
    disabled: "bg-fill/50 text-ink/30",
  },
  Brand: {
    base: "bg-brand-fill text-ink-flip hover:bg-brand-fill/80",
    active: "bg-fill text-ink",
    disabled: "bg-brand-fill/50 text-ink-flip/30",
  },
  Dust: {
    base: "bg-spot-fill-dark/10 text-spot-ink hover:bg-spot-fill-dark/20",
    active: "bg-spot-fill-dark text-spot-ink-flip",
    disabled: "bg-spot-fill-dark/5 text-spot-ink/40",
  },
  Slate: {
    base: "bg-spot-fill-dark text-spot-ink-flip hover:bg-spot-fill-dark/80",
    active: "bg-spot-fill-raised text-spot-ink",
    disabled: "bg-spot-fill-dark/50 text-spot-ink-flip/40",
  },
};

type Props = {
  currentPage: number;
  totalPages: number;
  sectionTheme: keyof typeof pageThemeClasses;
  /** Builds the crawlable href for a page number — the URL is the source of truth. */
  buildHref: (page: number) => string;
};

/**
 * Every page is a real `<a href="?page=N">`, so a crawler starting at the
 * listing can reach every article instead of stopping at page one. The current
 * page and the dead-end arrows render as `<span>` — nothing to click, nothing
 * to crawl. `scroll={false}` keeps it feeling like an in-place swap.
 */
export function Pagination({ currentPage, totalPages, sectionTheme, buildHref }: Props) {
  const theme = pageThemeClasses[sectionTheme];
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;
  // Mobile shows a 3-wide window around current; desktop shows all.
  const mobileStart = Math.min(Math.max(1, currentPage - 1), Math.max(1, totalPages - 2));
  const mobileEnd = Math.min(totalPages, mobileStart + 2);
  const inMobileWindow = (p: number) => p >= mobileStart && p <= mobileEnd;

  const arrowBase = "flex size-12 items-center justify-center rounded-1 transition-all duration-300 ease-out";

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
      {canPrev ? (
        <Link
          href={buildHref(currentPage - 1)}
          scroll={false}
          rel="prev"
          aria-label="Previous page"
          className={cn(arrowBase, theme.base, "cursor-pointer")}
        >
          <ChevronLeft aria-hidden="true" className="size-5" />
        </Link>
      ) : (
        <span aria-hidden="true" className={cn(arrowBase, theme.disabled)}>
          <ChevronLeft className="size-5" />
        </span>
      )}
      {pages.map((page) => {
        const isCurrent = page === currentPage;
        const className = cn(
          "h-12 min-w-12 items-center justify-center rounded-1 px-2 transition-all duration-300 ease-out md:flex",
          inMobileWindow(page) ? "flex" : "hidden",
          isCurrent ? theme.active : theme.base,
          isCurrent ? "-translate-y-1" : "cursor-pointer",
        );
        return isCurrent ? (
          <span key={page} aria-current="page" className={className}>
            {page}
          </span>
        ) : (
          <Link key={page} href={buildHref(page)} scroll={false} className={className}>
            {page}
          </Link>
        );
      })}
      {canNext ? (
        <Link
          href={buildHref(currentPage + 1)}
          scroll={false}
          rel="next"
          aria-label="Next page"
          className={cn(arrowBase, theme.base, "cursor-pointer")}
        >
          <ChevronRight aria-hidden="true" className="size-5" />
        </Link>
      ) : (
        <span aria-hidden="true" className={cn(arrowBase, theme.disabled)}>
          <ChevronRight className="size-5" />
        </span>
      )}
    </nav>
  );
}
