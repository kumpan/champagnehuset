"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
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
  onChange: (page: number) => void;
};

export function Pagination({ currentPage, totalPages, sectionTheme, onChange }: Props) {
  const theme = pageThemeClasses[sectionTheme];
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;
  // Mobile shows a 3-wide window around current; desktop shows all.
  const mobileStart = Math.min(Math.max(1, currentPage - 1), Math.max(1, totalPages - 2));
  const mobileEnd = Math.min(totalPages, mobileStart + 2);
  const inMobileWindow = (p: number) => p >= mobileStart && p <= mobileEnd;

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        onClick={() => canPrev && onChange(currentPage - 1)}
        disabled={!canPrev}
        aria-label="Previous page"
        className={cn(
          "flex size-14 items-center justify-center rounded-3 transition-all duration-300 ease-out",
          canPrev ? theme.base : theme.disabled,
          canPrev && "cursor-pointer hover:scale-105",
        )}
      >
        <ChevronLeft aria-hidden="true" className="size-5" />
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onChange(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={cn(
            "h-10 min-w-10 items-center justify-center rounded-2 px-2 transition-all duration-300 ease-out md:flex",
            inMobileWindow(page) ? "flex" : "hidden",
            page === currentPage ? theme.active : theme.base,
            page !== currentPage && "cursor-pointer hover:scale-105",
          )}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        onClick={() => canNext && onChange(currentPage + 1)}
        disabled={!canNext}
        aria-label="Next page"
        className={cn(
          "flex size-14 items-center justify-center rounded-3 transition-all duration-300 ease-out",
          canNext ? theme.base : theme.disabled,
          canNext && "cursor-pointer hover:scale-105",
        )}
      >
        <ChevronRight aria-hidden="true" className="size-5" />
      </button>
    </nav>
  );
}
