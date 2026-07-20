"use client";

import { ChevronRight } from "lucide-react";
import { cn, toAnchorId } from "@/lib/utils";

type HeadingNode = { text: string };

export function TocDesktop({ headings, removeTopPadding }: { headings: HeadingNode[]; removeTopPadding?: boolean }) {
  return (
    <nav className={cn("sticky top-28 flex flex-col gap-1 rounded-2 bg-fill-raised p-6", removeTopPadding && "top-4")}>
      {headings.map((h) => (
        <a
          key={h.text}
          href={`#${toAnchorId(h.text)}`}
          onClick={(e) => {
            e.preventDefault();
            history.replaceState(null, "", `#${toAnchorId(h.text)}`);
            document.getElementById(toAnchorId(h.text))?.scrollIntoView({ block: "start" });
          }}
          className="flex items-center gap-1.5 border-green-500/40 not-last:border-b py-2 leading-snug hover:text-ink-raised"
        >
          <ChevronRight className="shrink-0" />
          <span className="line-clamp-2 text-pretty">{h.text}</span>
        </a>
      ))}
    </nav>
  );
}
