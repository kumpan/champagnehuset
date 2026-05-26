"use client";

import { ChevronRight } from "lucide-react";
import { cn, toAnchorId } from "@/lib/utils";

type HeadingNode = { text: string };

export function TocDesktop({ headings, removeTopPadding }: { headings: HeadingNode[]; removeTopPadding?: boolean }) {
  return (
    <nav className={cn("sticky top-28 flex flex-col gap-1 rounded-5 bg-fill-raised p-1", removeTopPadding && "top-4")}>
      {headings.map((h) => (
        <a
          key={h.text}
          href={`#${toAnchorId(h.text)}`}
          onClick={(e) => {
            e.preventDefault();
            history.replaceState(null, "", `#${toAnchorId(h.text)}`);
            document.getElementById(toAnchorId(h.text))?.scrollIntoView({ block: "start" });
          }}
          className="flex items-center gap-1.5 rounded-4 bg-fill py-3 pr-4 pl-3 text-ink text-sm leading-snug hover:text-ink-raised"
        >
          <ChevronRight className="size-5 shrink-0" />
          {h.text}
        </a>
      ))}
    </nav>
  );
}
