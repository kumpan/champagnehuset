"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import type { SectionTheme } from "@/components/layout/section";
import { t } from "@/lib/i18n";
import { cn, toAnchorId } from "@/lib/utils";
import { tocTheme } from "./toc-desktop";

type HeadingNode = { text: string };

export function TocAccordion({
  headings,
  lang,
  sectionTheme,
}: {
  headings: HeadingNode[];
  lang?: string;
  sectionTheme: SectionTheme;
}) {
  const [open, setOpen] = useState(false);
  const theme = tocTheme[sectionTheme];

  return (
    <div className={cn("flex flex-col rounded-2 p-1", theme.panel)}>
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className={cn(
              "absolute top-0 left-0 flex max-h-[calc(100svh-7rem)] w-full flex-col overflow-hidden rounded-2 p-1 pt-13 md:max-h-[calc(100svh-8rem)]",
              theme.panel,
            )}
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
              className="flex min-h-0 flex-col gap-1 overflow-y-auto overscroll-contain rounded-1"
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
                  className={cn(
                    "flex h-12 shrink-0 items-center gap-1.5 rounded-1 pr-4 pl-3 leading-snug",
                    theme.item,
                    theme.hover,
                  )}
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
        className="relative flex h-12 w-full items-center justify-center rounded-4 px-5"
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
              {open ? t(lang).closeQuickNav : t(lang).openQuickNav}
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
