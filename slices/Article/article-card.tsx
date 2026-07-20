import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";

import { Overline } from "@/components/overline";
import { cn } from "@/lib/utils";
import type { ArticleDocument } from "@/prismicio-types";

const cardThemeClasses = {
  Bud: "bg-fill-raised text-ink",
  Dust: "bg-accent-fill-raised text-accent-ink",
};

type ArticleCardProps = {
  article: ArticleDocument;
  sectionTheme: "Bud" | "Dust";
  className?: string;
};

export function ArticleCard({ article, sectionTheme, className }: ArticleCardProps) {
  const { meta_image, category, page_title } = article.data;

  return (
    <PrismicNextLink
      document={article}
      className={cn(
        "group flex flex-col overflow-hidden rounded-4 transition-colors duration-500",
        cardThemeClasses[sectionTheme],
        className,
      )}
    >
      <div className="aspect-3/2 w-full overflow-hidden">
        <PrismicNextImage
          field={meta_image}
          className="h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-103"
          fallbackAlt=""
        />
      </div>
      <div className="flex flex-1 flex-col items-start gap-2 p-4 md:gap-3 md:p-5">
        {category && <Overline>{category}</Overline>}
        <span className="line-clamp-3 text-balance font-semibold text-lg leading-tight md:text-xl">{page_title}</span>
      </div>
    </PrismicNextLink>
  );
}
