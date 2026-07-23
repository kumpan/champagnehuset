"use client";

import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { ProductDocument } from "@/prismicio-types";
import { producerNameOf } from "./search";

type ProductCardProps = {
  product: ProductDocument;
  className?: string;
  /** Eager-load + preload the image — pass for above-the-fold cards (the LCP candidates). */
  priority?: boolean;
};

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const { product_image, product_name, product_year } = product.data;
  // Requires fetchLinks: ["producer.producer_name"] on the query; renders without it otherwise.
  const producerName = producerNameOf(product);
  // Fade the image in once its pixels have arrived instead of snapping.
  // next/image fires onLoad for cached images too, so this never sticks at 0.
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <PrismicNextLink document={product} className={cn("group flex flex-col gap-2", className)}>
      <div className="aspect-3/4 w-full overflow-hidden rounded-1 bg-green-10">
        <PrismicNextImage
          field={product_image}
          priority={priority}
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "size-full object-cover group-hover:scale-103",
            "[transition:opacity_300ms_ease-out,scale_400ms_ease-out]",
            imageLoaded ? "opacity-100" : "opacity-0",
          )}
          fallbackAlt=""
        />
      </div>
      <div className="flex w-full flex-col gap-0.5">
        {product_year && <span className="truncate text-ink-dim italic">{product_year}</span>}
        <span className="truncate font-medium text-ink text-xl leading-tight">{product_name}</span>
        {producerName && <span className="truncate text-ink-dim text-xl italic leading-tight">{producerName}</span>}
      </div>
    </PrismicNextLink>
  );
}
