"use client";

import type { Language } from "@prismicio/client";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { isLocaleAvailable } from "@/lib/available-locales";
import { getLocaleLabel } from "@/lib/locale-labels";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ locales, masterLocale }: { locales: Language[]; masterLocale: string }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale =
    locales.find((l) => pathname.startsWith(`/${l.id}/`) || pathname === `/${l.id}`)?.id ?? masterLocale;

  const otherLocales = locales.filter((l) => l.id !== currentLocale);

  function handleOpen() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function handleClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  function navigateTo(targetId: string) {
    const withoutLocale = pathname.replace(new RegExp(`^/${currentLocale}(?=/|$)`), "") || "/";
    const targetPath = targetId === masterLocale ? withoutLocale : `/${targetId}${withoutLocale}`;
    const home = targetId === masterLocale ? "/" : `/${targetId}`;
    // alternate_languages (set on page mount) tells us if the page exists in
    // the target locale, no network round-trip.
    router.push(isLocaleAvailable(targetId) ? targetPath : home);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
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

      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
        <AnimatePresence>
          {open && (
            <m.ul
              role="menu"
              onMouseEnter={handleOpen}
              onMouseLeave={handleClose}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: { opacity: 0, y: 10, scale: 0.95 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
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
                  role="menuitem"
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
                  <button
                    type="button"
                    onClick={() => navigateTo(locale.id)}
                    className="flex w-full items-center rounded-2 px-4 py-3 text-primary-foreground/80 transition-colors duration-400 ease-in-out hover:bg-fill hover:text-primary-foreground"
                  >
                    {getLocaleLabel(locale.id, locale.name)}
                  </button>
                </m.li>
              ))}
            </m.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
