import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { CalloutBackdrop } from "./variations/callout-backdrop";
import { CalloutCard } from "./variations/callout-card";
import { CalloutContact } from "./variations/callout-contact";
import { CalloutDetails } from "./variations/callout-details";
import { CalloutSplit } from "./variations/callout-split";

export type CalloutProps = SliceComponentProps<Content.CalloutSlice>;

export default function Callout(props: CalloutProps) {
  switch (props.slice.variation) {
    case "split":
      return <CalloutSplit {...props} slice={props.slice} />;
    case "backdrop":
      return <CalloutBackdrop {...props} slice={props.slice} />;
    case "card":
      return <CalloutCard {...props} slice={props.slice} />;
    case "contact":
      return <CalloutContact {...props} slice={props.slice} />;
    case "details":
      return <CalloutDetails {...props} slice={props.slice} />;
  }
}
