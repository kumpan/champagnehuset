import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";

import { cn } from "@/lib/utils";
import type { ArticleDocument } from "@/prismicio-types";

// TODO: placeholder — revisit once the article layout is finalized.

export function formatArticleDate(date: string | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));
}

type ArticleCardProps = {
  article: ArticleDocument;
  className?: string;
};

// Text color is inherited from the enclosing Section theme — the card stays theme-agnostic
// so it renders correctly under every section_theme without a per-theme color map.
export function ArticleCard({ article, className }: ArticleCardProps) {
  const { article_image, article_description, tag, article_title, article_date } = article.data;
  const date = formatArticleDate(article_date ?? article.first_publication_date);

  return (
    <PrismicNextLink document={article} className={cn("group flex flex-col gap-2", className)}>
      <div className="aspect-3/2 w-full overflow-hidden rounded-1">
        <PrismicNextImage
          field={article_image}
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
        <span className="line-clamp-2 text-balance font-medium text-xl leading-tight md:text-2xl">{article_title}</span>
        {article_description && <p className="line-clamp-2 text-base">{article_description}</p>}
      </div>
    </PrismicNextLink>
  );
}
