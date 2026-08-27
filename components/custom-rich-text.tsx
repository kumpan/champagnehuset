import type { RichTextField } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";

import { components } from "@/components/rich-text/rich-text-components";
import { cn } from "@/lib/utils";

const proseThemeClass: Record<string, string> = {
  Bud: "text-ink-dim",
  Leaf: "text-ink-dim",
  Bottle: "text-ink-dim",
  Dust: "prose-spot text-spot-ink-dim",
  Slate: "prose-spot-flip text-spot-ink-flip",
};

interface CustomRichTextProps {
  field: RichTextField;
  className?: string;
  inheritSize?: boolean;
  sectionTheme?: string;
  surface?: "brand";
}

export function CustomRichText({ field, className, inheritSize, sectionTheme = "Bud", surface }: CustomRichTextProps) {
  return (
    <div
      className={cn(
        "prose",
        surface === "brand" ? "prose-flip text-ink-flip" : proseThemeClass[sectionTheme],
        inheritSize && "prose-inherit-size",
        className,
      )}
    >
      <PrismicRichText field={field} components={components} />
    </div>
  );
}
