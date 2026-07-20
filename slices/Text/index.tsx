import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { TextDetails } from "./variations/text-details";
import { TextExtended } from "./variations/text-extended";
import { TextInfo } from "./variations/text-info";
import { TextLongform } from "./variations/text-longform";
import { TextMedia } from "./variations/text-media";
import { TextSplit } from "./variations/text-split";

export type TextProps = SliceComponentProps<Content.TextSlice>;

export default function Text(props: TextProps) {
  switch (props.slice.variation) {
    case "extended":
      return <TextExtended {...props} slice={props.slice} />;
    case "split":
      return <TextSplit {...props} slice={props.slice} />;
    case "longform":
      return <TextLongform {...props} slice={props.slice} />;
    case "media":
      return <TextMedia {...props} slice={props.slice} />;
    case "details":
      return <TextDetails {...props} slice={props.slice} />;
    case "info":
      return <TextInfo {...props} slice={props.slice} />;
  }
}
