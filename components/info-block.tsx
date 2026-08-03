import type { RichTextField } from "@prismicio/client";
import { isFilled } from "@prismicio/client";
import { CustomRichText } from "@/components/custom-rich-text";
import { type IconName, iconMap } from "@/components/icons";
import { cn } from "@/lib/utils";

function isIconName(v: unknown): v is IconName {
  return typeof v === "string" && v in iconMap;
}

interface InfoBlockProps {
  detail_icon?: string | null;
  rich_text: RichTextField;
  sectionTheme?: string;
  className?: string;
}

export function InfoBlock({ detail_icon, rich_text, sectionTheme, className }: InfoBlockProps) {
  const Icon = detail_icon && isIconName(detail_icon) ? iconMap[detail_icon] : null;

  return (
    <div className={cn("rounded-1 bg-fill-raised p-4 md:rounded-2", className)}>
      {Icon && <Icon />}
      {isFilled.richText(rich_text) && <CustomRichText field={rich_text} sectionTheme={sectionTheme} />}
    </div>
  );
}
