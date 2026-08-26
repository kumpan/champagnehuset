import { isFilled, type KeyTextField, type LinkField, type RichTextField } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import type { ReactNode } from "react";
import type { ButtonVariant } from "@/components/button";
import { Button } from "@/components/button";
import { CustomRichText } from "@/components/custom-rich-text";
import { resolveIcon } from "@/components/icons";
import type { SectionTheme } from "@/components/layout/section";
import { Overline } from "@/components/overline";
import { cn } from "@/lib/utils";

type CmsButtonItem = {
  link: LinkField;
  variant?: string | null;
  icon_left?: string | null;
  icon_right?: string | null;
};

type CmsOverlineItem = {
  overline_text?: KeyTextField;
  overline_icon?: string | null;
};

// "center" | "left" | "side-by-side" are text-block presets; "split" places the
// text block on the left and the buttons pinned to the side on desktop.
type Align = "left" | "center" | "side-by-side" | "split";

const overlineThemeClasses = {
  Bud: "text-ink",
  Leaf: "text-ink",
  Bottle: "text-ink",
  Brand: "text-ink-flip",
  Dust: "text-spot-ink",
  Slate: "text-spot-ink-flip",
};

// Shared title width cap, applied in two spots (root and the title itself).
const TITLE_MAX_W = "max-w-4xl xl:max-w-5xl";

// Per-align class deltas. Base classes shared by every layout live inline at the
// call site; only what differs between layouts lives here.
const alignClasses: Record<Align, { root: string; titleDesc: string; title: string; description: string }> = {
  center: { root: "mx-auto items-center text-center", titleDesc: "flex-col items-center", title: "", description: "" },
  left: { root: "text-left", titleDesc: "flex-col items-start", title: "", description: "" },
  "side-by-side": {
    root: "w-full items-start text-left",
    titleDesc: "flex-col items-start md:gap-2 lg:flex-row lg:gap-12",
    title: "w-full",
    description: "prose-p:mt-2! prose-p:mb-0! lg:mt-4 lg:max-w-md",
  },
  // split reuses the left-aligned text block; its row layout is handled separately.
  split: { root: "", titleDesc: "flex-col items-start", title: "", description: "" },
};

export type { SectionTheme };

interface SectionIntroProps {
  overline?: KeyTextField | ReadonlyArray<CmsOverlineItem>;
  title?: RichTextField;
  description?: RichTextField;
  descriptionClassName?: string;
  children?: ReactNode | ReactNode[];
  buttons?: ReadonlyArray<CmsButtonItem>;
  align?: Align;
  className?: string;
  overlineClassName?: string;
  sectionTheme?: SectionTheme;
  titleMaxWidth?: boolean;
  textBalance?: boolean;
  buttonVariant?: ButtonVariant;
  buttonClassName?: string;
  buttonWrapperClassName?: string;
}

// Helpers
function isVariant(value: unknown): value is ButtonVariant {
  return value === "default" || value === "secondary" || value === "outline" || value === "ghost";
}

// Component
export function SectionIntro({
  overline,
  overlineClassName,
  title,
  description,
  descriptionClassName,
  children,
  buttons,
  align = "center",
  className,
  sectionTheme = "Bud",
  titleMaxWidth = true,
  textBalance = false,
  buttonVariant,
  buttonClassName,
  buttonWrapperClassName,
}: SectionIntroProps) {
  const isSplit = align === "split";
  const styles = alignClasses[align];

  const items: ReadonlyArray<CmsButtonItem> = Array.isArray(buttons) ? buttons : [];
  const hasDescription = isFilled.richText(description);

  const overlineItem = Array.isArray(overline) ? overline[0] : undefined;
  const overlineText = typeof overline === "string" ? overline : overlineItem?.overline_text;
  const OverlineIcon = resolveIcon(overlineItem?.overline_icon);

  function renderButton(btn: CmsButtonItem, index: number) {
    const { link } = btn;
    if (!isFilled.link(link)) return null;

    const variant: ButtonVariant = buttonVariant ?? (isVariant(btn.variant) ? btn.variant : "default");
    const LeftIcon = resolveIcon(btn.icon_left);
    const RightIcon = resolveIcon(btn.icon_right);

    const linkKey = "url" in link && link.url ? link.url : `btn-${index}`;
    return (
      <Button key={linkKey} className={buttonClassName} sectionTheme={sectionTheme} variant={variant} size="lg" asChild>
        <PrismicNextLink field={link}>
          {LeftIcon ? <LeftIcon /> : null}
          <span>{link.text}</span>
          {RightIcon ? <RightIcon /> : null}
        </PrismicNextLink>
      </Button>
    );
  }

  // Overline + title + description + children — the text block itself, reused as-is
  // whether it stands alone (center/left/side-by-side) or sits in the split row.
  const introContent = (
    <>
      {isFilled.keyText(overlineText) && (
        <Overline className={cn(overlineThemeClasses[sectionTheme], overlineClassName)}>
          {OverlineIcon && <OverlineIcon className="size-5" />}
          {overlineText}
        </Overline>
      )}

      <div className={cn("flex w-full gap-0.5 md:gap-1 lg:gap-1", styles.titleDesc)}>
        {isFilled.richText(title) && (
          <CustomRichText
            sectionTheme={sectionTheme}
            className={cn(
              "prose-headings:mb-0! transition-colors",
              titleMaxWidth ? TITLE_MAX_W : "max-w-none",
              textBalance ? "text-balance" : "text-pretty",
              styles.title,
            )}
            field={title}
          />
        )}

        {hasDescription && (
          <CustomRichText
            sectionTheme={sectionTheme}
            className={cn("max-w-xl text-pretty", styles.description, descriptionClassName)}
            field={description}
          />
        )}
      </div>

      {children}
    </>
  );

  const actions =
    items.length > 0 ? (
      <div
        className={cn(
          isSplit
            ? cn("flex shrink-0 flex-col gap-2 sm:flex-row md:gap-3", !hasDescription && "lg:mt-2")
            : cn(
                "mt-2 flex w-full max-w-full flex-col flex-wrap gap-2 sm:w-auto sm:flex-row md:gap-3",
                align === "left" ? "items-start" : "sm:justify-center md:w-auto",
              ),
          buttonWrapperClassName,
        )}
      >
        {items.map(renderButton)}
      </div>
    ) : null;

  // Split: text block on the left, actions pinned to the side (bottom-aligned) on desktop.
  if (isSplit) {
    return (
      <div
        className={cn(
          "flex w-full flex-col items-start gap-4 text-left md:flex-row md:justify-between md:gap-8",
          hasDescription ? "md:items-end" : "md:items-start",
          className,
        )}
      >
        <div className="flex flex-1 flex-col gap-4 md:gap-5">{introContent}</div>
        {actions}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:gap-5",
        styles.root,
        align !== "side-by-side" && (titleMaxWidth ? TITLE_MAX_W : "max-w-none"),
        className,
      )}
    >
      {introContent}
      {actions}
    </div>
  );
}
