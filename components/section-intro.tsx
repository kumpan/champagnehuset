import { isFilled, type KeyTextField, type LinkField, type RichTextField } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import type { ReactNode } from "react";
import type { ButtonVariant } from "@/components/button";
import { Button } from "@/components/button";
import { CustomRichText } from "@/components/custom-rich-text";
import type { IconName } from "@/components/icons";
import { iconMap } from "@/components/icons";
import { Overline } from "@/components/overline";
import { cn } from "@/lib/utils";

type SectionButtonVariant = ButtonVariant;

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

const overlineThemeClasses = {
  Bud: "text-ink",
  Leaf: "text-ink",
  Brand: "text-ink-flip",
  Dust: "text-spot-ink",
  Slate: "text-spot-ink-flip",
};

const buttonThemeClasses = {
  Bud: "",
  Leaf: "",
  Brand: "",
  Dust: "",
  Slate: "",
};

export type SectionTheme = keyof typeof overlineThemeClasses;

interface SectionIntroProps {
  overline?: KeyTextField | ReadonlyArray<CmsOverlineItem>;
  title?: RichTextField;
  description?: RichTextField;
  descriptionClassName?: string;
  children?: ReactNode | ReactNode[];
  buttons?: ReadonlyArray<CmsButtonItem>;
  align?: "left" | "center" | "side-by-side";
  className?: string;
  overlineClassName?: string;
  sectionTheme?: SectionTheme;
  titleMaxWidth?: boolean;
  textBalance?: boolean;
  buttonVariant?: ButtonVariant;
  buttonClassName?: string;
  buttonWrapperClassName?: string;
}

// ─── Helpers ───

function isVariant(value: unknown): value is SectionButtonVariant {
  return value === "default" || value === "secondary" || value === "outline" || value === "ghost";
}

function isIconName(value: unknown): value is IconName {
  return typeof value === "string" && value in iconMap;
}

// ─── Component ───

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
  const isLeftAligned = align === "left";
  const isSideBySide = align === "side-by-side";

  const items: ReadonlyArray<CmsButtonItem> = Array.isArray(buttons) ? buttons : [];

  const overlineItem = Array.isArray(overline) ? overline[0] : undefined;
  const overlineText = typeof overline === "string" ? overline : overlineItem?.overline_text;
  const overlineIconKey = overlineItem?.overline_icon;
  const OverlineIcon =
    overlineIconKey && overlineIconKey !== "none" && isIconName(overlineIconKey) ? iconMap[overlineIconKey] : undefined;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:gap-5",
        isLeftAligned ? "text-left" : "mx-auto items-center text-center",
        isSideBySide ? "w-full items-start text-left" : titleMaxWidth ? "max-w-4xl xl:max-w-5xl" : "max-w-none",
        className,
      )}
    >
      {/* Overline */}
      {isFilled.keyText(overlineText) && (
        <Overline className={cn(overlineThemeClasses[sectionTheme], overlineClassName)}>
          {OverlineIcon && <OverlineIcon className="size-5" />}
          {overlineText}
        </Overline>
      )}

      <div
        className={cn(
          "flex w-full gap-0.5 md:gap-1 lg:gap-1",
          isLeftAligned ? "items-start" : "items-center",
          isSideBySide ? "flex-col items-start md:gap-2 lg:flex-row lg:gap-12" : "flex-col",
        )}
      >
        {/* Title */}
        {isFilled.richText(title) && (
          <CustomRichText
            sectionTheme={sectionTheme}
            className={cn(
              "prose-headings:mb-0! transition-colors",
              titleMaxWidth ? "max-w-4xl xl:max-w-5xl" : "max-w-none",
              textBalance && "text-balance",
              isSideBySide && "w-full",
            )}
            field={title}
          />
        )}

        {/* Description */}
        {isFilled.richText(description) && (
          <CustomRichText
            sectionTheme={sectionTheme}
            className={cn(
              "max-w-xl text-pretty",
              isSideBySide && "prose-p:mt-2! prose-p:mb-0! lg:mt-4 lg:max-w-md",
              descriptionClassName,
            )}
            field={description}
          />
        )}
      </div>

      {children}

      {/* Buttons */}
      {items.length > 0 && (
        <div
          className={cn(
            "mt-2 flex w-full max-w-full flex-col flex-wrap gap-2 sm:w-auto sm:flex-row md:gap-3",
            isLeftAligned ? "items-start" : "sm:justify-center md:w-auto",
            buttonWrapperClassName,
          )}
        >
          {items.map((btn, index) => {
            const { link } = btn;
            if (!isFilled.link(link)) return null;

            const variant: SectionButtonVariant = buttonVariant ?? (isVariant(btn.variant) ? btn.variant : "default");
            const leftKey = btn.icon_left;
            const rightKey = btn.icon_right;
            const LeftIcon = leftKey && leftKey !== "none" && isIconName(leftKey) ? iconMap[leftKey] : undefined;
            const RightIcon = rightKey && rightKey !== "none" && isIconName(rightKey) ? iconMap[rightKey] : undefined;

            const linkKey = "url" in link && link.url ? link.url : `btn-${index}`;
            return (
              <Button
                key={linkKey}
                className={cn(buttonThemeClasses[sectionTheme], buttonClassName)}
                variant={variant}
                size="lg"
                asChild
              >
                <PrismicNextLink field={link}>
                  {LeftIcon ? <LeftIcon /> : null}
                  <span>{link.text}</span>
                  {RightIcon ? <RightIcon /> : null}
                </PrismicNextLink>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
