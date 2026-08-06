"use client";

import type { LinkField } from "@prismicio/client";
import { ChevronDown, ChevronRight } from "lucide-react";
import { m } from "motion/react";
import { cn } from "@/lib/utils";
import { MobileNavLink } from "./mobile-nav-link";

export const mobileItemClass =
  "bg-fill-raised md:bg-fill transition-colors duration-300 ease-in-out hover:bg-fill-raised/60 md:hover:bg-fill/60";

export function MobileDropdown({ links, onClose }: { links: LinkField[]; onClose: () => void }) {
  return (
    <m.ul
      initial={{
        height: 0,
        opacity: 0,
        marginBottom: "0rem",
        marginTop: "0rem",
      }}
      animate={{
        height: "auto",
        opacity: 1,
        marginBottom: "1rem",
        marginTop: "0.25rem",
      }}
      exit={{ height: 0, opacity: 0, marginBottom: "0rem", marginTop: "0rem" }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex flex-col gap-2 overflow-hidden p-2"
    >
      {links.map((dropLink) => (
        <li
          key={dropLink.text}
          className="rounded-1 bg-fill-raised transition-colors duration-300 ease-in-out hover:bg-fill-raised/60 md:bg-fill md:hover:bg-fill/60"
        >
          <MobileNavLink field={dropLink} onClose={onClose}>
            <span className="text-base">{dropLink.text}</span>
            <ChevronRight className="size-6" aria-hidden="true" />
          </MobileNavLink>
        </li>
      ))}
    </m.ul>
  );
}

// Direct link, no sub-links
export function MobileNavItemDirect({ label, link, onClose }: { label: string; link: LinkField; onClose: () => void }) {
  return (
    <MobileNavLink className={cn(mobileItemClass, "rounded-1")} field={link} onClose={onClose}>
      {label}
      <ChevronRight className="size-6" aria-hidden="true" />
    </MobileNavLink>
  );
}

// Link + sub-links, a split button
export function MobileNavItemSplit({
  label,
  link,
  isOpen,
  onToggle,
  onClose,
}: {
  label: string;
  link: LinkField;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-1">
      <MobileNavLink field={link} onClose={onClose} className={cn(mobileItemClass, "mr-1 flex-1")}>
        {label}
      </MobileNavLink>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex size-16 shrink-0 cursor-pointer items-center justify-center rounded-1 bg-fill-raised text-primary transition-colors duration-300 hover:bg-fill-raised/60 md:bg-fill md:hover:bg-fill/60"
      >
        <ChevronDown
          aria-hidden="true"
          className={cn("size-6 transition-transform duration-300", isOpen && "rotate-180")}
        />
      </button>
    </div>
  );
}

// No link, only sub-links, full-width toggle
export function MobileNavItemToggle({
  label,
  isOpen,
  onToggle,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className={cn(
        mobileItemClass,
        "flex h-16 w-full cursor-pointer items-center justify-between rounded-1 px-5 text-lg text-primary",
      )}
    >
      {label}
      <ChevronDown
        aria-hidden="true"
        className={cn("size-6 transition-transform duration-300", isOpen && "rotate-180")}
      />
    </button>
  );
}
