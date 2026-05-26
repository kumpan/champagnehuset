import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { FAQList } from "./variations/faq-list";
import { FAQSplit } from "./variations/faq-split";

export type FAQProps = SliceComponentProps<Content.FaqSlice>;

export default function FAQ(props: FAQProps) {
  switch (props.slice.variation) {
    case "split":
      return <FAQSplit {...props} slice={props.slice} />;
    case "list":
      return <FAQList {...props} slice={props.slice} />;
  }
}
