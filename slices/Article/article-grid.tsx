"use client";

import { AnimatePresence, m, useInView, useReducedMotion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import type { SectionTheme } from "@/components/layout/section";
import { cn } from "@/lib/utils";
import type { ArticleDocument } from "@/prismicio-types";
import { ArticleCard } from "./article-card";
import { Pagination } from "./pagination";

const PAGE_SIZE = 4;

// Chip order follows the article `tag` field's option order.
const TAG_ORDER = ["Event", "News", "Guide", "Tasting"] as const;

// Chips read as buttons: active = the theme's primary surface, inactive = its secondary.
// Same per-theme tokens as button.tsx.
const chipThemeClasses: Record<SectionTheme, { active: string; inactive: string }> = {
  Bud: {
    active: "bg-brand text-brand-ink",
    inactive: "bg-fill-raised text-ink hover:bg-fill-raised/50",
  },
  Leaf: {
    active: "bg-brand text-brand-ink",
    inactive: "bg-fill text-ink hover:bg-fill/50",
  },
  Brand: {
    active: "bg-fill text-ink",
    inactive: "bg-brand-fill text-ink-flip hover:bg-brand-fill/55",
  },
  Dust: {
    active: "bg-spot-fill-dark text-spot-ink-flip",
    inactive: "bg-spot-fill-dark/10 text-spot-ink hover:bg-spot-fill-dark/25",
  },
  Slate: {
    active: "bg-spot-fill-raised text-spot-ink",
    inactive: "bg-spot-fill-dark text-spot-ink-flip hover:bg-spot-fill-dark/60",
  },
};

type ArticleGridProps = {
  articles: ArticleDocument[];
  sectionTheme: SectionTheme;
  showPagination: boolean;
  showChips: boolean;
  className?: string;
};

export function ArticleGrid({ articles, sectionTheme, showPagination, showChips, className }: ArticleGridProps) {
  const reducedMotion = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  // once: true latches on first scroll-in, so later page/filter changes animate on mount
  // instead of waiting for another scroll.
  const inView = useInView(gridRef, { once: true, amount: 0.15 });

  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Only tags actually present, in canonical order, so no empty chips.
  const availableTags = useMemo(() => {
    const present = new Set(articles.map((article) => article.data.tag).filter(Boolean));
    return TAG_ORDER.filter((tag) => present.has(tag));
  }, [articles]);

  const filtered = useMemo(
    () => (activeTag ? articles.filter((article) => article.data.tag === activeTag) : articles),
    [articles, activeTag],
  );

  const totalPages = showPagination ? Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)) : 1;
  const currentPage = Math.min(page, totalPages);
  const visible = showPagination
    ? filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : filtered.slice(0, PAGE_SIZE);

  const selectTag = (tag: string | null) => {
    setActiveTag(tag);
    setPage(1);
  };

  const chips = showChips && availableTags.length > 0;

  if (articles.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      {chips && (
        <div className="flex flex-wrap gap-2">
          <ChipButton active={activeTag === null} theme={sectionTheme} onClick={() => selectTag(null)}>
            Alla
          </ChipButton>
          {availableTags.map((tag) => (
            <ChipButton key={tag} active={activeTag === tag} theme={sectionTheme} onClick={() => selectTag(tag)}>
              {tag}
            </ChipButton>
          ))}
        </div>
      )}

      <div ref={gridRef} className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="wait">
          {visible.map((article, index) => (
            <m.div
              key={article.id}
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              exit={
                reducedMotion
                  ? undefined
                  : { opacity: 0, y: -12, transition: { duration: 0.25, ease: [0.5, 0, 0.1, 1] } }
              }
              transition={{
                duration: 0.4,
                ease: [0.5, 0, 0.1, 1],
                delay: reducedMotion ? 0 : Math.min(index * 0.08, 0.32),
              }}
            >
              <ArticleCard article={article} className="w-full" />
            </m.div>
          ))}
        </AnimatePresence>
      </div>

      {showPagination && totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} sectionTheme={sectionTheme} onChange={setPage} />
      )}
    </div>
  );
}

function ChipButton({
  active,
  theme,
  onClick,
  children,
}: {
  active: boolean;
  theme: SectionTheme;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-12 rounded-1 px-4 font-medium text-base transition-colors duration-300 ease-out",
        active ? chipThemeClasses[theme].active : chipThemeClasses[theme].inactive,
        !active && "cursor-pointer",
      )}
    >
      {children}
    </button>
  );
}
