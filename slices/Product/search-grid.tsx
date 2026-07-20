"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/forms/input";
import { cn } from "@/lib/utils";
import type { ProductDocument } from "@/prismicio-types";
import { ProductCard } from "./product-card";

const emptyThemeClasses = {
  Bud: "text-ink-dim",
  Dust: "text-accent-ink-dim",
};

type SearchGridProps = {
  products: ProductDocument[];
  sectionTheme: "Bud" | "Dust";
  searchPlaceholder?: string | null;
  noResultsText?: string | null;
};

export function SearchGrid({ products, sectionTheme, searchPlaceholder, noResultsText }: SearchGridProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) => {
      const { product_name, product_vintage, product_dosage } = product.data;
      return [product_name, product_vintage, product_dosage].some((value) => value?.toLowerCase().includes(q));
    });
  }, [products, query]);

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <Input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={searchPlaceholder || "Search products"}
        aria-label={searchPlaceholder || "Search products"}
        className="mx-auto w-full max-w-xl"
      />
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} sectionTheme={sectionTheme} className="w-full" />
          ))}
        </div>
      ) : (
        <p className={cn("py-8 text-center", emptyThemeClasses[sectionTheme])}>
          {noResultsText || "No products match your search."}
        </p>
      )}
    </div>
  );
}
