import type * as React from "react";
import type { SectionTheme } from "@/components/layout/section";
import { Slot } from "@/lib/slot";
import { cn } from "@/lib/utils";

const variantClasses = {
  default:
    "bg-brand text-brand-ink hover:bg-brand/90 outline-brand/70 selection:bg-fill-raised selection:text-ink",
  destructive: "bg-error text-ink-flip hover:bg-error/90 outline-error",
  outline: "border border-brand text-brand hover:bg-brand/5 outline-brand",
  secondary:
    "bg-fill-raised hover:bg-fill-raised/70 text-raised-ink outline-brand/70 selection:bg-brand selection:text-ink-flip",
  ghost: "text-ink hover:bg-fill-raised outline-brand",
  link: "text-brand underline underline-offset-4 hover:no-underline outline-brand",
} as const;

const themeClasses: Record<SectionTheme, Partial<Record<ButtonVariant, string>>> = {
  Bud: {},

  Leaf: {
    secondary: "bg-fill hover:bg-fill/70",
  },

  Bottle: {},

  Brand: {
    default: "bg-fill text-ink hover:bg-fill/90 outline-fill-raised/70 selection:bg-brand! selection:text-ink-flip",
    secondary:
      "bg-brand-fill text-ink-flip hover:bg-brand-fill/90 outline-fill-raised/70 selection:bg-brand! selection:text-ink-flip",
    outline:
      "border-ink-flip/40 text-ink-flip hover:bg-ink-flip/10 outline-ink-flip/70 selection:bg-brand! selection:text-ink-flip",
  },

  Dust: {
    default:
      "bg-spot-fill-dark text-spot-ink-flip hover:bg-spot-fill-dark/90 outline-spot-fill-dark/70 selection:bg-spot-fill! selection:text-spot-ink-flip",
    secondary:
      "bg-spot-fill-dark/15 text-spot-ink hover:bg-spot-fill-dark/20 outline-spot-fill-dark/70 selection:bg-spot-fill! selection:text-spot-ink-flip",
    outline:
      "border-spot-ink/40 text-spot-ink hover:bg-spot-ink/5 outline-spot-ink/70 selection:bg-spot-fill! selection:text-spot-ink-flip",
  },

  Slate: {
    default:
      "bg-spot-fill-raised text-spot-ink hover:bg-spot-fill-raised/90 outline-spot-fill-raised/70 selection:bg-spot-fill! selection:text-spot-ink-flip",
    secondary:
      "bg-spot-fill-dark text-spot-ink-flip hover:bg-spot-fill-dark/90 outline-spot-fill-raised/70 selection:bg-spot-fill! selection:text-spot-ink-flip",
    outline:
      "border-spot-ink-flip/40 text-spot-ink-flip hover:bg-spot-ink-flip/10 outline-spot-ink-flip/70 selection:bg-spot-fill! selection:text-spot-ink-flip",
  },
};

const sizeClasses = {
  default:
    "h-12 gap-1 px-5 [&>svg:first-child]:-ml-0.5 [&>svg:last-child]:-mr-0.5 [&_svg:not([class*='size-'])]:size-5",
  sm: "h-12 px-5 [&_svg:not([class*='size-'])]:size-4",
  lg: "h-14 gap-1.5 px-7 [&>svg:first-child]:-ml-1 [&>svg:last-child]:-mr-1 [&_svg:not([class*='size-'])]:size-5",
  icon: "size-12 px-0 [&_svg:not([class*='size-'])]:size-5",
  link: "h-auto px-0 py-4 [&_svg:not([class*='size-'])]:size-5",
} as const;

const baseClasses =
  "inline-flex max-w-full shrink-0 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-1 font-medium " +
  "transition-all duration-200 ease-in-out " +
  "active:opacity-50 " +
  "outline-0 outline-offset-0 focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "aria-invalid:border-error " +
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 " +
  "hover:[&_svg]:[animation:var(--animate-wiggle-grow)]";

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

// Focus ring for whole-card links: same 2px width + offset as the buttons' focus outline,
// with a themed outline color per section. Mirrors the per-theme outline colors above.
const focusRingThemeClasses: Record<SectionTheme, string> = {
  Bud: "focus-visible:outline-brand/70",
  Leaf: "focus-visible:outline-brand/70",
  Bottle: "focus-visible:outline-brand/70",
  Brand: "focus-visible:outline-fill-raised/70",
  Dust: "focus-visible:outline-spot-fill-dark/70",
  Slate: "focus-visible:outline-spot-fill-raised/70",
};

export function cardFocusRing(sectionTheme: SectionTheme = "Bud") {
  return cn(
    "rounded-1 outline-0 outline-offset-0 focus-visible:outline-2 focus-visible:outline-offset-2",
    focusRingThemeClasses[sectionTheme],
  );
}

export function buttonVariants({
  variant = "default",
  size = "default",
  sectionTheme = "Bud",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  sectionTheme?: SectionTheme;
  className?: string;
} = {}) {
  return cn(baseClasses, variantClasses[variant], themeClasses[sectionTheme]?.[variant], sizeClasses[size], className);
}

export function Button({
  className,
  variant = "default",
  size = "default",
  sectionTheme = "Bud",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  sectionTheme?: SectionTheme;
  asChild?: boolean;
}) {
  const classes = buttonVariants({ variant, size, sectionTheme, className });
  const Comp = asChild ? Slot : "button";

  return <Comp data-slot="button" className={classes} {...(props as object)} />;
}
