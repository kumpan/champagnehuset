import { PrismicNextLink } from "@prismicio/next";
import type { PrismicRichTextProps } from "@prismicio/react";

import { CalloutCheck } from "./callout-check";
import { CalloutFact } from "./callout-fact";
import { CalloutInfo } from "./callout-info";
import { Quote, QuoteLarge } from "./quote";

export const components: PrismicRichTextProps["components"] = {
  hyperlink: ({ node, children }) => (
    <PrismicNextLink field={node.data} className="underline underline-offset-2 hover:no-underline">
      {children}
    </PrismicNextLink>
  ),
  label: ({ node, children }) => {
    switch (node.data.label) {
      case "info":
        return <CalloutInfo>{children}</CalloutInfo>;
      case "fact":
        return <CalloutFact>{children}</CalloutFact>;
      case "check":
        return <CalloutCheck>{children}</CalloutCheck>;
      case "quote":
        return <Quote>{children}</Quote>;
      case "quote-large":
        return <QuoteLarge>{children}</QuoteLarge>;
      default:
        return <>{children}</>;
    }
  },
};
