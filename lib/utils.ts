import { type GroupField, isFilled, type LinkField, type RichTextField } from "@prismicio/client";
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge our custom numeric radius scale (see --radius-* in globals.css),
// otherwise it can't detect rounded-* conflicts and leaves duplicate classes in place.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ["0", "1", "1_5", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Slugify text into an anchor id: lowercase, spaces to dashes, strip non-word chars. */
export function toAnchorId(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

/**
 * True if any section-intro field (overline, title, description, buttons) has
 * content. Each renders independently, so none depends on another being filled.
 */
export function hasSectionIntroContent(slice: {
  primary: {
    overline?: GroupField;
    title?: RichTextField;
    description?: RichTextField;
    buttons?: unknown;
  };
}) {
  const { overline, title, description, buttons } = slice.primary;

  const hasButtons = Array.isArray(buttons)
    ? buttons.some((button) => {
        if (typeof button === "object" && button !== null && "link" in (button as Record<string, unknown>)) {
          const { link } = button as { link: LinkField };
          return isFilled.link(link);
        }
        return isFilled.link(button as LinkField);
      })
    : false;

  return isFilled.group(overline) || isFilled.richText(title) || isFilled.richText(description) || hasButtons;
}
