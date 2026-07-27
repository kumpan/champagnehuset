import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { ProductGrid } from "./variations/product-grid";
import { ProductSearch } from "./variations/product-search";

export type ProductProps = SliceComponentProps<Content.ProductSlice>;

export default function Product(props: ProductProps) {
  switch (props.slice.variation) {
    case "grid":
      return <ProductGrid {...props} slice={props.slice} />;
    case "search":
      return <ProductSearch {...props} slice={props.slice} />;
  }
}
