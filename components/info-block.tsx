import type { RichTextField } from "@prismicio/client";
import { isFilled } from "@prismicio/client";
import { CustomRichText } from "@/components/custom-rich-text";
import { type IconName, iconMap } from "@/components/icons";
import { Overline } from "@/components/overline";
import { cn } from "@/lib/utils";

function isIconName(v: unknown): v is IconName {
  return typeof v === "string" && v in iconMap;
}

interface InfoBlockProps {
  overline_text?: string | null;
  overline_icon?: string | null;
  rich_text: RichTextField;
  sectionTheme?: string;
  className?: string;
}

export function InfoBlock({ overline_text, overline_icon, rich_text, sectionTheme, className }: InfoBlockProps) {
  const Icon = overline_icon && isIconName(overline_icon) ? iconMap[overline_icon] : null;

  return (
    <div className={cn("rounded-1 bg-fill-raised p-4 md:rounded-2", className)}>
      {overline_text && (
        <Overline className="mb-3">
          {Icon && <Icon />}
          {overline_text}
        </Overline>
      )}
      {isFilled.richText(rich_text) && <CustomRichText field={rich_text} sectionTheme={sectionTheme} />}
    </div>
  );
}
