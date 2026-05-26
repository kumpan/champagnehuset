import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import type { BreadcrumbItem } from "@/lib/breadcrumbs";
import { HeroBackdrop } from "./variations/hero-backdrop";
import { HeroSplit } from "./variations/hero-split";
import { HeroStack } from "./variations/hero-stack";

type HeroContext = { breadcrumbs?: BreadcrumbItem[] };
export type HeroProps = SliceComponentProps<Content.HeroSlice, HeroContext>;

export default function Hero(props: HeroProps) {
  switch (props.slice.variation) {
    case "backdrop":
      return <HeroBackdrop {...props} slice={props.slice} />;
    case "split":
      return <HeroSplit {...props} slice={props.slice} />;
    case "stack":
      return <HeroStack {...props} slice={props.slice} />;
  }
}
