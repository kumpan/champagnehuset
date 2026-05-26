import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { CalloutFloat } from "./variations/callout-float";
import { CalloutForm } from "./variations/callout-form";
import { CalloutSplit } from "./variations/callout-split";

export type CalloutProps = SliceComponentProps<Content.CalloutSlice>;

export default function Callout(props: CalloutProps) {
  switch (props.slice.variation) {
    case "split":
      return <CalloutSplit {...props} slice={props.slice} />;
    case "form":
      return <CalloutForm {...props} slice={props.slice} />;
    case "float":
      return <CalloutFloat {...props} slice={props.slice} />;
  }
}
