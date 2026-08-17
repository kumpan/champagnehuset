"use client";

import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { iconMap, resolveIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface InfoItemData {
  icon?: string | null;
  label?: string | null;
  value?: string | null;
  href?: string | null;
  clickable?: boolean;
  theme?: string;
}

interface InfoItemsProps {
  items: InfoItemData[];
  theme?: string;
  className?: string;
  itemClassName?: string;
}

const textThemeClasses: Record<string, string> = {
  Bud: "text-ink-dim",
  Leaf: "text-ink-dim",
  Brand: "text-ink-dim",
  Dust: "text-spot-ink",
  Slate: "text-spot-ink-flip",
};

const cardThemeClasses: Record<string, string> = {
  Bud: "bg-fill text-ink",
  Leaf: "bg-fill-raised text-ink",
  Brand: "bg-fill text-ink",
  Dust: "bg-spot-fill/20 text-spot-ink-flip",
  Slate: "bg-spot-fill text-accent-ink",
};

const copyBtnThemeClasses: Record<string, string> = {
  Bud: "bg-brand text-brand-ink hover:bg-brand/90",
  Leaf: "bg-brand text-brand-ink hover:bg-brand/90",
  Brand: "bg-brand text-brand-ink hover:bg-brand/90",
  Dust: "bg-spot-fill-dark text-accent-ink-flip hover:bg-spot-fill-dark/80",
  Slate: "bg-spot-fill-dark text-accent-ink-flip hover:bg-accent/90",
};

function CopyButton({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const CopyIcon = iconMap.copy;
  const CheckIcon = iconMap.check;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className={cn(
        "group flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-1 transition-all duration-300 ease-in-out md:size-14",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <m.div
            key="check"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
          >
            <CheckIcon className="size-5.5" />
          </m.div>
        ) : (
          <m.div
            key="copy"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
          >
            <CopyIcon className="size-5.5 transition-all duration-300 ease-in-out group-hover:animate-wiggle-grow" />
          </m.div>
        )}
      </AnimatePresence>
    </button>
  );
}

function InfoItemContent({ icon, label, value, theme }: InfoItemData) {
  const Icon = resolveIcon(icon);

  return (
    <>
      {Icon && (
        <div className={cn("relative shrink-0", textThemeClasses[theme || "Bud"])}>
          <Icon className="size-8 md:size-11" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {label && (
          <p className={cn("font-medium leading-snug md:text-lg", textThemeClasses[theme || "Bud"])}>{label}</p>
        )}
        {value && (
          <p className={cn("truncate text-sm opacity-80 md:text-base", textThemeClasses[theme || "Bud"])}>{value}</p>
        )}
      </div>
    </>
  );
}

export function InfoItems({ items, theme = "Bud", className, itemClassName }: InfoItemsProps) {
  return (
    <div className={cn("flex flex-col gap-1 md:gap-2", className)}>
      {items.map((item, index) => {
        const { clickable = false, href, value, label } = item;

        return (
          <div
            key={`${index}-${label}`}
            className={cn(
              "flex items-center gap-3 rounded-2 py-2 pr-2 pl-4 transition-colors duration-500 md:py-3 md:pr-3",
              cardThemeClasses[theme],
              itemClassName,
            )}
          >
            {clickable && href ? (
              <a href={href} className="flex min-w-0 flex-1 items-center gap-4">
                <InfoItemContent {...item} theme={theme} />
              </a>
            ) : (
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <InfoItemContent {...item} theme={theme} />
              </div>
            )}
            {clickable && value && <CopyButton value={value} className={copyBtnThemeClasses[theme]} />}
          </div>
        );
      })}
    </div>
  );
}
