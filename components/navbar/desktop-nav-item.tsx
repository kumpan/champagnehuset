"use client";

import type { LinkField } from "@prismicio/client";
import { isFilled } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { NavbarDocumentDataLinksItem } from "@/prismicio-types";

export function DesktopNavItem({ linkItem }: { linkItem: NavbarDocumentDataLinksItem }) {
  const [open, setOpen] = useState(false);
  const links = linkItem.link as LinkField[];
  const mainLink = links[0];
  const dropdownLinks = links.slice(1).filter((l) => isFilled.link(l));
  const hasDropdown = dropdownLinks.length > 0;
  const label = mainLink?.text;
  const isClickable = isFilled.link(mainLink);

  if (!label) return null;

  const triggerClass =
    "group relative flex h-12 cursor-pointer items-center justify-center gap-1.5 rounded-2 px-5 text-primary-foreground leading-snug focus-visible:outline-2 focus-visible:outline-primary-foreground focus-visible:outline-offset-2";

  const triggerContent = (
    <>
      <div
        className={cn(
          "absolute rounded-1 [transition:inset_400ms_var(--ease-spring-bounce),background-color_200ms_ease-in]",
          open
            ? "inset-1 bg-fill-raised group-hover:inset-0"
            : "inset-2 group-hover:inset-0 group-hover:bg-fill-raised",
        )}
      />
      <span className="relative flex items-center gap-1.5">
        {label}
        {hasDropdown && (
          <ChevronDown
            aria-hidden="true"
            className={cn("size-4 transition-transform duration-200", open && "rotate-180")}
          />
        )}
      </span>
    </>
  );

  return (
    <li className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {isClickable ? (
        <PrismicNextLink field={mainLink} className={triggerClass}>
          {triggerContent}
        </PrismicNextLink>
      ) : (
        <button type="button" className={cn(triggerClass, "cursor-default")}>
          {triggerContent}
        </button>
      )}

      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
        <AnimatePresence>
          {open && hasDropdown && (
            <m.ul
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
                    y: { type: "spring", stiffness: 300, damping: 20 },
                    scale: { type: "spring", stiffness: 300, damping: 20 },
                    staggerChildren: 0.05,
                  },
                },
              }}
              className="z-50 min-w-48 rounded-2 bg-fill-raised p-1"
            >
              {dropdownLinks.map((dropLink) => (
                <m.li
                  key={dropLink.text}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        opacity: { duration: 0.15, ease: "easeOut" },
                        y: { type: "spring", stiffness: 300, damping: 20 },
                      },
                    },
                  }}
                >
                  <PrismicNextLink
                    field={dropLink}
                    className="flex items-center rounded-1 px-4 py-3 text-primary-foreground/80 transition-colors duration-400 ease-in-out hover:bg-fill hover:text-primary-foreground"
                  >
                    {dropLink.text}
                  </PrismicNextLink>
                </m.li>
              ))}
            </m.ul>
          )}
        </AnimatePresence>
      </div>
    </li>
  );
}
