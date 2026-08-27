"use client";

import { AnimatePresence, easeInOut, m, spring, useInView, useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import type { SectionTheme } from "@/components/layout/section";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ArticleDocument } from "@/prismicio-types";
import { ArticleCard } from "./article-card";
import { PAGE_SIZE, tagLabel } from "./constants";
import { Pagination } from "./pagination";

// Entering cards hold ENTER_LEAD before their staggered entrance.
// Makes smoother page transitions
const ENTER_LEAD = 0.3;

// Shared transition
const cardTransition = (delay: number) => ({
  opacity: { duration: 0.5, ease: easeInOut, delay },
  y: { type: spring, stiffness: 180, damping: 15, delay },
});

const chipThemeClasses: Record<SectionTheme, { active: string; inactive: string }> = {
  Bud: {
    active: "bg-brand text-brand-ink",
    inactive: "bg-fill-raised text-ink hover:bg-fill-raised/50",
  },
  Leaf: {
    active: "bg-brand text-brand-ink",
    inactive: "bg-fill text-ink hover:bg-fill/50",
  },
  Bottle: {
    active: "bg-brand text-brand-ink",
    inactive: "bg-ink/5 text-ink hover:bg-ink/15",
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
  tagOrder: readonly string[];
  sectionTheme: SectionTheme;
  showPagination: boolean;
  showChips: boolean;
  currentPage: number;
  lang?: string;
  className?: string;
};

export function ArticleGrid({
  articles,
  tagOrder,
  sectionTheme,
  showPagination,
  showChips,
  currentPage: pageFromUrl,
  lang,
  className,
}: ArticleGridProps) {
  const reducedMotion = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { once: true, amount: 0.15 });

  const pathname = usePathname();
  const router = useRouter();
  const buildHref = useCallback(
    (target: number) => (target <= 1 ? pathname : `${pathname}?page=${target}`),
    [pathname],
  );

  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Only tags actually present, in canonical order, so no empty chips.
  const availableTags = useMemo(() => {
    const present = new Set<string>(articles.map((article) => article.data.tag).filter(Boolean));
    return tagOrder.filter((tag) => present.has(tag));
  }, [articles, tagOrder]);

  const filtered = useMemo(
    () => (activeTag ? articles.filter((article) => article.data.tag === activeTag) : articles),
    [articles, activeTag],
  );

  const totalPages = showPagination ? Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)) : 1;
  // A filter narrows the feed, so a `?page=` deep-link can land past the end.
  const currentPage = Math.min(Math.max(1, pageFromUrl), totalPages);
  const visible = showPagination
    ? filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : filtered.slice(0, PAGE_SIZE);

  // Chips filter client-side, so a tag change invalidates the current page window
  const selectTag = (tag: string | null) => {
    setActiveTag(tag);
    if (pageFromUrl > 1) router.replace(pathname, { scroll: false });
  };

  const chips = showChips && availableTags.length > 0;

  if (articles.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      {chips && (
        <div className="flex flex-wrap gap-1.5">
          <ChipButton active={activeTag === null} theme={sectionTheme} onClick={() => selectTag(null)}>
            {t(lang).all}
          </ChipButton>
          {availableTags.map((tag) => (
            <ChipButton key={tag} active={activeTag === tag} theme={sectionTheme} onClick={() => selectTag(tag)}>
              {tagLabel(tag, lang)}
            </ChipButton>
          ))}
        </div>
      )}

      <div ref={gridRef} className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {visible.map((article, index) => {
            const stagger = Math.min(index * 0.08, 0.32);
            return (
              <m.div
                key={`${activeTag ?? "all"}:${article.id}`}
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : undefined}
                transition={cardTransition(reducedMotion ? 0 : ENTER_LEAD + stagger)}
                exit={reducedMotion ? undefined : { opacity: 0, y: -20, transition: cardTransition(stagger) }}
              >
                <ArticleCard article={article} sectionTheme={sectionTheme} className="w-full" />
              </m.div>
            );
          })}
        </AnimatePresence>
      </div>

      {showPagination && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          sectionTheme={sectionTheme}
          buildHref={buildHref}
        />
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
