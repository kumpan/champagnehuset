import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";

import { cn } from "@/lib/utils";
import type { ProductDocument } from "@/prismicio-types";
import { producerNameOf } from "./search";

type ProductCardProps = {
  product: ProductDocument;
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
  const { product_image, product_name, product_year } = product.data;
  // Requires fetchLinks: ["producer.producer_name"] on the query; renders without it otherwise.
  const producerName = producerNameOf(product);

  return (
    <PrismicNextLink document={product} className={cn("group flex flex-col gap-3", className)}>
      <div className="aspect-3/4 w-full overflow-hidden rounded-1 bg-white">
        <PrismicNextImage
          field={product_image}
          className="size-full object-contain transition-transform duration-500 ease-out group-hover:scale-103"
          fallbackAlt=""
        />
      </div>
      <div className="flex w-full flex-col gap-1">
        {product_year && <span className="truncate text-ink-dim italic">{product_year}</span>}
        <span className="truncate font-medium text-ink text-xl leading-tight">{product_name}</span>
        {producerName && <span className="truncate text-ink-dim text-xl italic leading-tight">{producerName}</span>}
      </div>
    </PrismicNextLink>
  );
}
