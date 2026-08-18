"use client";

import type { Language } from "@prismicio/client";
import { ChevronDown } from "lucide-react";
import { m } from "motion/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { getLocaleLabel } from "@/lib/locale-labels";
import { cn } from "@/lib/utils";

/**
 * UIDs are per-locale, so a translation's path can't be derived by swapping the
 * locale prefix — `/om-oss` and `/en-gb/about` are the same document. The paths
 * are resolved on the server (`lib/locale-paths.ts`) and passed in, which is
 * also what lets these be real `<Link>`s: translated pages get a crawlable
 * link from the navigation and prefetch on hover.
 *
 * A locale with no translation of this page falls back to its own home rather
 * than 404ing. `localePaths` carries what you'd need to dim or badge that
 * option if the bounce should be signalled visually.
 */
export function LanguageSwitcher({
  locales,
  masterLocale,
  currentLocale,
  localePaths,
}: {
  locales: Language[];
  masterLocale: string;
  currentLocale: string;
  localePaths: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const otherLocales = locales.filter((l) => l.id !== currentLocale);
  const homeFor = (id: string) => (id === masterLocale ? "/" : `/${id}`);

  function handleOpen() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function handleClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onFocus={handleOpen}
        className="group relative flex h-14 cursor-pointer items-center justify-center gap-1.5 rounded-2 pr-4 pl-5 text-primary-foreground leading-snug focus-visible:outline-2 focus-visible:outline-primary-foreground focus-visible:outline-offset-2"
      >
        <div
          className={cn(
            "absolute rounded-2 [transition:inset_500ms_var(--ease-spring-bounce),background-color_200ms_ease-in]",
            open
              ? "inset-1 bg-fill-raised group-hover:inset-0"
              : "inset-2 group-hover:inset-0 group-hover:bg-fill-raised",
          )}
        />
        <span className="relative flex items-center gap-1.5">
          {getLocaleLabel(currentLocale, locales.find((l) => l.id === currentLocale)?.name ?? currentLocale)}
          <ChevronDown
            aria-hidden="true"
            className={cn("size-4 transition-transform duration-200", open && "rotate-180")}
          />
        </span>
      </button>

      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2" inert={!open}>
        <m.ul
          role="menu"
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
          initial={false}
          animate={open ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0, y: 10, scale: 0.95, pointerEvents: "none" },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              pointerEvents: "auto",
              transition: {
                opacity: { duration: 0.15, ease: "easeOut" },
                y: { type: "spring", stiffness: 300, damping: 12 },
                scale: { type: "spring", stiffness: 300, damping: 12 },
                staggerChildren: 0.05,
              },
            },
          }}
          className="z-50 min-w-32 rounded-3 bg-fill-raised p-1"
        >
          {otherLocales.map((locale) => (
            <m.li
              key={locale.id}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    opacity: { duration: 0.15, ease: "easeOut" },
                    y: { type: "spring", stiffness: 300, damping: 15 },
                  },
                },
              }}
            >
              <Link
                href={localePaths[locale.id] ?? homeFor(locale.id)}
                hrefLang={locale.id}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex w-full items-center rounded-2 px-4 py-3 text-primary-foreground/80 transition-colors duration-400 ease-in-out hover:bg-fill hover:text-primary-foreground"
              >
                {getLocaleLabel(locale.id, locale.name)}
              </Link>
            </m.li>
          ))}
        </m.ul>
      </div>
    </div>
  );
}
