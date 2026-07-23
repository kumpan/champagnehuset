import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";

import { cn } from "@/lib/utils";
import type { ArticleDocument } from "@/prismicio-types";

// TODO: placeholder — revisit once the article layout is finalized.

const cardThemeClasses = {
  Bud: "text-ink",
  Dust: "text-accent-ink",
};

export function formatArticleDate(date: string | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));
}

type ArticleCardProps = {
  article: ArticleDocument;
  sectionTheme: "Bud" | "Dust";
  className?: string;
};

export function ArticleCard({ article, sectionTheme, className }: ArticleCardProps) {
  const { meta_image, meta_description, tag, page_title } = article.data;
  const date = formatArticleDate(article.first_publication_date);

  return (
    <PrismicNextLink
      document={article}
      className={cn("group flex flex-col gap-2", cardThemeClasses[sectionTheme], className)}
    >
      <div className="aspect-3/2 w-full overflow-hidden rounded-1">
        <PrismicNextImage
          field={meta_image}
          className="h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-103"
          fallbackAlt=""
        />
      </div>
      <div className="flex items-center gap-2 font-medium text-base">
        {tag && <span>{tag}</span>}
        {tag && date && <span aria-hidden="true">•</span>}
        {date && <span>{date}</span>}
      </div>
      <div className="flex flex-col gap-1">
        <span className="line-clamp-2 text-balance font-medium text-xl leading-tight md:text-2xl">{page_title}</span>
        {meta_description && <p className="line-clamp-2 text-base">{meta_description}</p>}
      </div>
    </PrismicNextLink>
  );
}
