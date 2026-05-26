import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { TextExtended } from "./variations/text-extended";
import { TextForm } from "./variations/text-form";
import { TextHighlight } from "./variations/text-highlight";
import { TextLongform } from "./variations/text-longform";
import { TextMedia } from "./variations/text-media";
import { TextSplit } from "./variations/text-split";

export type TextProps = SliceComponentProps<Content.TextSlice>;

export default function Text(props: TextProps) {
  switch (props.slice.variation) {
    case "extended":
      return <TextExtended {...props} slice={props.slice} />;
    case "highlight":
      return <TextHighlight {...props} slice={props.slice} />;
    case "split":
      return <TextSplit {...props} slice={props.slice} />;
    case "longform":
      return <TextLongform {...props} slice={props.slice} />;
    case "media":
      return <TextMedia {...props} slice={props.slice} />;
    case "form":
      return <TextForm {...props} slice={props.slice} />;
  }
}
