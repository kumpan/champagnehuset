import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { ValueSplit } from "./variations/value-split";
import { ValueText } from "./variations/value-text";

export type ValueProps = SliceComponentProps<Content.ValueSlice>;

export default function Value(props: ValueProps) {
  switch (props.slice.variation) {
    case "text":
      return <ValueText {...props} slice={props.slice} />;
    case "split":
      return <ValueSplit {...props} slice={props.slice} />;
  }
}
