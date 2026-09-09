import { PrismicNextLink } from "@prismicio/next";
import type { PrismicRichTextProps } from "@prismicio/react";
import type { ReactNode } from "react";

import { CalloutCheck } from "./callout-check";
import { CalloutFact } from "./callout-fact";
import { CalloutInfo } from "./callout-info";
import { Quote, QuoteLarge } from "./quote";

export type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const baseComponents: PrismicRichTextProps["components"] = {
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

// Renders the requested tag (e.g. <h1>) but keeps the visual size of cms heading
function renderHeadingAs(level: HeadingLevel, tag: HeadingTag) {
  return ({ children }: { children: ReactNode }) => {
    const Tag = tag;
    return <Tag className={`prose-size-h${level}`}>{children}</Tag>;
  };
}

export function createComponents(opts?: { headingAs?: HeadingTag }): PrismicRichTextProps["components"] {
  if (!opts?.headingAs) return baseComponents;
  const tag = opts.headingAs;
  return {
    ...baseComponents,
    heading1: renderHeadingAs(1, tag),
    heading2: renderHeadingAs(2, tag),
    heading3: renderHeadingAs(3, tag),
    heading4: renderHeadingAs(4, tag),
    heading5: renderHeadingAs(5, tag),
    heading6: renderHeadingAs(6, tag),
  };
}

export const components = baseComponents;
