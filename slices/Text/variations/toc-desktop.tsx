"use client";

import { ChevronRight } from "lucide-react";
import type { SectionTheme } from "@/components/layout/section";
import { cn, toAnchorId } from "@/lib/utils";

type HeadingNode = { text: string };

// Only the TOC card changes with the theme, the section background is handled by Section.
export const tocTheme: Record<SectionTheme, { panel: string; item: string; hover: string }> = {
  Bud: { panel: "bg-fill-raised text-ink", item: "bg-fill", hover: "hover:text-ink-dim" },
  Leaf: { panel: "bg-fill text-ink", item: "bg-fill-raised", hover: "hover:text-ink-dim" },
  Bottle: {
    panel: "bg-brand text-brand-ink selection-light",
    item: "bg-brand-fill/25",
    hover: "hover:text-brand-ink/70",
  },
  Dust: {
    panel: "bg-spot-fill text-spot-ink-flip selection-spot-raised",
    item: "bg-spot-fill-dark/25",
    hover: "hover:text-spot-ink-flip/70",
  },
  Slate: {
    panel: "bg-spot-fill-raised text-spot-ink selection-spot",
    item: "bg-spot-fill/15",
    hover: "hover:text-spot-ink-dim",
  },
};

export function TocDesktop({ headings, sectionTheme }: { headings: HeadingNode[]; sectionTheme: SectionTheme }) {
  const theme = tocTheme[sectionTheme];

  return (
    <nav className={cn("sticky top-24 flex flex-col gap-1 rounded-2 p-6", theme.panel)}>
      {headings.map((h) => (
        <a
          key={h.text}
          href={`#${toAnchorId(h.text)}`}
          onClick={(e) => {
            e.preventDefault();
            history.replaceState(null, "", `#${toAnchorId(h.text)}`);
            document.getElementById(toAnchorId(h.text))?.scrollIntoView({ block: "start" });
          }}
          className={cn("flex items-center gap-1.5 border-current/20 not-last:border-b py-2 leading-snug", theme.hover)}
        >
          <ChevronRight className="shrink-0" />
          <span className="line-clamp-2 text-pretty">{h.text}</span>
        </a>
      ))}
    </nav>
  );
}
