import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { LinkCards } from "./variations/link-cards";
import { LinkGrid } from "./variations/link-grid";
import { LinkQuick } from "./variations/link-quick";

export type LinkProps = SliceComponentProps<Content.LinkSlice>;

export default function Link(props: LinkProps) {
  switch (props.slice.variation) {
    case "quick":
      return <LinkQuick {...props} slice={props.slice} />;
    case "grid":
      return <LinkGrid {...props} slice={props.slice} />;
    case "cards":
      return <LinkCards {...props} slice={props.slice} />;
  }
}
