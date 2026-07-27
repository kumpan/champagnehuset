import type { RichTextField } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";

import { components } from "@/components/rich-text/rich-text-components";
import { cn } from "@/lib/utils";

const proseThemeClass: Record<string, string> = {
  Bud: "text-ink-dim",
  Leaf: "text-ink-dim",
  Brand: "prose-flip text-ink-flip",
  Dust: "prose-spot text-spot-ink-dim",
  Slate: "prose-spot-flip text-spot-ink-flip",
};

interface CustomRichTextProps {
  field: RichTextField;
  className?: string;
  inheritSize?: boolean;
  sectionTheme?: string;
}

export function CustomRichText({ field, className, inheritSize, sectionTheme = "Bud" }: CustomRichTextProps) {
  return (
    <div className={cn("prose", proseThemeClass[sectionTheme], inheritSize && "prose-inherit-size", className)}>
      <PrismicRichText field={field} components={components} />
    </div>
  );
}
