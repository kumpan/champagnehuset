import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";

import { cn } from "@/lib/utils";
import type { ProductDocument } from "@/prismicio-types";

const cardThemeClasses = {
  Bud: "bg-fill-raised text-ink",
  Dust: "bg-accent-fill-raised text-accent-ink",
};

const metaThemeClasses = {
  Bud: "text-ink-dim",
  Dust: "text-accent-ink-dim",
};

type ProductCardProps = {
  product: ProductDocument;
  sectionTheme: "Bud" | "Dust";
  className?: string;
};

export function ProductCard({ product, sectionTheme, className }: ProductCardProps) {
  const { product_image, product_name, product_vintage, product_dosage } = product.data;
  const meta = [product_vintage, product_dosage].filter(Boolean).join(" · ");

  return (
    <PrismicNextLink
      document={product}
      className={cn(
        "group flex flex-col overflow-hidden rounded-4 transition-colors duration-500",
        cardThemeClasses[sectionTheme],
        className,
      )}
    >
      <div className="flex aspect-4/5 w-full items-center justify-center overflow-hidden p-6 md:p-8">
        <PrismicNextImage
          field={product_image}
          className="h-full w-auto object-contain transition-all duration-500 ease-out group-hover:scale-103"
          fallbackAlt=""
        />
      </div>
      <div className="flex flex-1 flex-col items-start gap-1 p-4 pt-0 md:p-5 md:pt-0">
        <span className="line-clamp-2 text-balance font-semibold text-lg leading-tight md:text-xl">{product_name}</span>
        {meta && <span className={cn("text-sm", metaThemeClasses[sectionTheme])}>{meta}</span>}
      </div>
    </PrismicNextLink>
  );
}
