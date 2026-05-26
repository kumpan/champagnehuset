import type { RichTextField } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";

import { components } from "@/components/rich-text/rich-text-components";
import { cn } from "@/lib/utils";

const proseThemeClass: Record<string, string> = {
  Ocean: "text-ink-dim",
  Sunrise: "prose-accent text-accent-ink-dim",
  Night: "prose-night text-ink-flip",
  Dawn: "prose-dawn text-accent-ink-flip",
};

interface CustomRichTextProps {
  field: RichTextField;
  className?: string;
  inheritSize?: boolean;
  sectionTheme?: string;
}

export function CustomRichText({ field, className, inheritSize, sectionTheme = "Ocean" }: CustomRichTextProps) {
  return (
    <div className={cn("prose", proseThemeClass[sectionTheme], inheritSize && "prose-inherit-size", className)}>
      <PrismicRichText field={field} components={components} />
    </div>
  );
}
