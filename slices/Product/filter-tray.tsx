"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { Children, isValidElement, useState } from "react";

type FilterTrayProps = {
  /** Number of active filters, shown on the collapsed button. */
  activeCount: number;
  children: React.ReactNode;
};

/**
 * Mobile-only sticky tray: a "Filtrera" button that expands into an overlay
 * holding the search input + filter panel. Same pattern as the longform TOC.
 */
export function FilterTray({ activeCount, children }: FilterTrayProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col rounded-2 bg-fill-raised p-1">
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full overflow-hidden rounded-2 bg-fill-raised p-1 pt-13"
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
              className="flex max-h-[70dvh] flex-col gap-1 overflow-y-auto overscroll-contain"
            >
              {Children.map(children, (child) =>
                isValidElement(child) ? (
                  <m.div
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
                  >
                    {child}
                  </m.div>
                ) : (
                  child
                ),
              )}
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="relative flex h-12 w-full cursor-pointer items-center justify-center gap-1.5 rounded-4 px-5 text-ink"
      >
        <SlidersHorizontal className="size-5 shrink-0" />
        <span>{activeCount > 0 ? `Filtrera · ${activeCount}` : "Filtrera"}</span>
        <m.span
          initial={false}
          animate={{ rotate: open ? -180 : 0 }}
          transition={{ type: "spring", stiffness: 250, damping: 15 }}
        >
          <ChevronDown className="size-5 shrink-0" />
        </m.span>
      </button>
    </div>
  );
}
