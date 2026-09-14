"use client";

import { AnimatePresence, easeInOut, m, spring, useInView, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useRef } from "react";
import type { SectionTheme } from "@/components/layout/section";
import { ARTICLE_TAGS, parseTagParam, tagLabel } from "@/lib/article-tags";
import { t } from "@/lib/i18n";
import { parsePageParam } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import type { ArticleDocument } from "@/prismicio-types";
import { ArticleCard } from "./article-card";
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

/**
 * Plain left clicks filter in place and push the new URL, so nothing waits on a
 * server round trip. Modified clicks and middle clicks fall through to the real
 * href so "open in new tab" keeps working. pushState is wired into the Next
 * router, so useSearchParams below picks the change up and Back steps through filters.
 */
export function navigateInPlace(event: React.MouseEvent<HTMLAnchorElement>) {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  window.history.pushState(null, "", event.currentTarget.getAttribute("href"));
}

type ArticleGridProps = {
  articles: ArticleDocument[];
  sectionTheme: SectionTheme;
  showPagination: boolean;
  showChips: boolean;
  pageSize: number;
  lang?: string;
  className?: string;
};

export function ArticleGrid({
  articles,
  sectionTheme,
  showPagination,
  showChips,
  pageSize,
  lang,
  className,
}: ArticleGridProps) {
  const reducedMotion = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { once: true, amount: 0.15 });

  // The filter and the page both live in the URL, so a copied address reopens the
  // same view and the server HTML for it already holds the right cards. Same param
  // order as the canonical in lib/metadata.ts so the two never disagree.
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const buildHref = (tag: string | null, page: number) => {
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag.toLowerCase());
    if (page > 1) params.set("page", String(page));
    const search = params.toString();
    return search ? `${pathname}?${search}` : pathname;
  };

  // Only tags actually present, in canonical order, so no empty chips.
  const availableTags = useMemo(() => {
    const present = new Set<string>(articles.map((article) => article.data.tag).filter(Boolean));
    return ARTICLE_TAGS.filter((tag) => present.has(tag));
  }, [articles]);

  // The URL tag is the chips' state, so it only applies where the chips render. A deep
  // link to a tag with no articles would show an empty grid and no matching chip.
  const tagFromUrl = showChips ? parseTagParam(searchParams.get("tag")) : null;
  const activeTag = tagFromUrl && availableTags.includes(tagFromUrl) ? tagFromUrl : null;

  const filtered = useMemo(
    () => (activeTag ? articles.filter((article) => article.data.tag === activeTag) : articles),
    [articles, activeTag],
  );

  const totalPages = showPagination ? Math.max(1, Math.ceil(filtered.length / pageSize)) : 1;
  // A filter narrows the feed, so a `?page=` deep-link can land past the end.
  const currentPage = Math.min(Math.max(1, parsePageParam(searchParams.get("page"))), totalPages);
  const visible = showPagination
    ? filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filtered.slice(0, pageSize);

  const chips = showChips && availableTags.length > 0;

  if (articles.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      {chips && (
        <nav aria-label={t(lang).filter} className="flex flex-wrap gap-1.5">
          <Chip href={buildHref(null, 1)} active={activeTag === null} theme={sectionTheme}>
            {t(lang).all}
          </Chip>
          {availableTags.map((tag) => (
            <Chip key={tag} href={buildHref(tag, 1)} active={activeTag === tag} theme={sectionTheme}>
              {tagLabel(tag, lang)}
            </Chip>
          ))}
        </nav>
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
          buildHref={(page) => buildHref(activeTag, page)}
          onNavigate={navigateInPlace}
        />
      )}
    </div>
  );
}

// The active chip is a plain span like the current page number, nothing clickable that changes nothing
function Chip({
  href,
  active,
  theme,
  children,
}: {
  href: string;
  active: boolean;
  theme: SectionTheme;
  children: React.ReactNode;
}) {
  const className = cn(
    "inline-flex h-12 items-center rounded-1 px-4 font-medium text-base transition-colors duration-300 ease-out",
    active ? chipThemeClasses[theme].active : chipThemeClasses[theme].inactive,
  );
  return active ? (
    <span aria-current="true" className={className}>
      {children}
    </span>
  ) : (
    <Link href={href} prefetch={false} onClick={navigateInPlace} className={className}>
      {children}
    </Link>
  );
}
