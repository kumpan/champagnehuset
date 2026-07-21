import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { ProductDetailDefault } from "./variations/default";

export type ProductDetailProps = SliceComponentProps<Content.ProductDetailSlice>;

export default function ProductDetail(props: ProductDetailProps) {
  switch (props.slice.variation) {
    case "default":
      return <ProductDetailDefault {...props} slice={props.slice} />;
  }
}
