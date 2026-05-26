"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { cn, toAnchorId } from "@/lib/utils";

type HeadingNode = { text: string };

export function TocAccordion({ headings }: { headings: HeadingNode[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col rounded-4 bg-fill-raised p-1">
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full overflow-hidden rounded-5 bg-fill-raised p-1 pt-13"
          >
            <m.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    opacity: { duration: 0.15, ease: "easeInOut" },
                    staggerChildren: 0.05,
                  },
                },
              }}
              className="flex flex-col gap-1"
            >
              {headings.map((h) => (
                <m.a
                  key={h.text}
                  variants={{
                    hidden: { opacity: 0, y: -10 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        opacity: { duration: 0.15, ease: "easeInOut" },
                        y: { type: "spring", stiffness: 300, damping: 20 },
                      },
                    },
                  }}
                  href={`#${toAnchorId(h.text)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    requestAnimationFrame(() => {
                      document.getElementById(toAnchorId(h.text))?.scrollIntoView({ block: "start" });
                    });
                  }}
                  className="flex h-12 items-center gap-1.5 rounded-4 bg-fill pr-4 pl-3 text-ink leading-snug hover:text-ink-raised"
                >
                  <ChevronRight className="size-5 shrink-0" />
                  <span className="truncate">{h.text}</span>
                </m.a>
              ))}
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-12 w-full items-center justify-center rounded-4 px-5 text-ink"
      >
        <m.span layout transition={{ duration: 0.2, ease: "easeInOut" }} className="flex items-center gap-1.5">
          <AnimatePresence mode="wait" initial={false}>
            <m.span
              key={open ? "close" : "open"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {open ? "Close quick navigation" : "Open quick navigation"}
            </m.span>
          </AnimatePresence>
          <m.div
            layout
            initial={{ rotate: 0 }}
            animate={{ rotate: open ? -180 : 0 }}
            exit={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 15 }}
          >
            <ChevronDown className={cn("size-5 shrink-0")} />
          </m.div>
        </m.span>
      </button>
    </div>
  );
}
