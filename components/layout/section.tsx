import { cn } from "@/lib/utils";

// "Brand" is internal-only (content on a brand-green surface, e.g. the footer);
// the CMS-facing equivalent is "Bottle".
export type SectionTheme = "Bud" | "Leaf" | "Bottle" | "Brand" | "Dust" | "Slate";

const sectionThemeClasses: Record<string, string> = {
  Bud: "bg-fill text-ink selection:bg-brand selection:text-brand-ink",
  Leaf: "bg-spot-fill-raised text-ink selection:bg-brand selection:text-brand-ink",
  // Section-level "Brand" only occurs via stale stored values in the two slices
  // that skip normalizeSectionTheme; render those as Bottle. The on-green Brand
  // styling lives in per-component maps (Button, SectionIntro, CustomRichText).
  Bottle: "bg-spot-fill-raised text-ink selection:bg-brand selection:text-brand-ink",
  Brand: "bg-spot-fill-raised text-ink selection:bg-brand selection:text-brand-ink",
  Dust: "bg-spot-fill-raised text-spot-ink selection:bg-spot-fill selection:text-spot-ink-flip",
  Slate: "bg-spot-fill text-spot-ink-flip selection:bg-spot-fill-raised selection:text-spot-ink",
};

/**
 * Maps a CMS `section_theme` value to a valid theme key: the retired CMS value
 * "Brand" becomes "Bottle", and anything unknown falls back to "Bud" so stale
 * documents never index theme records with a missing key.
 */
export function normalizeSectionTheme(value: string | null | undefined): SectionTheme {
  if (value === "Brand") return "Bottle";
  if (value === "Bud" || value === "Leaf" || value === "Bottle" || value === "Dust" || value === "Slate") return value;
  return "Bud";
}

const Section = ({
  children,
  className,
  removeTopPadding = false,
  removeBottomPadding = false,
  sectionTheme = "Bud",
}: {
  children: React.ReactNode;
  className?: string;
  removeTopPadding?: boolean;
  removeBottomPadding?: boolean;
  sectionTheme?: string;
}) => {
  return (
    <section
      className={cn(
        "py-12 transition-colors duration-500 ease-in-out md:py-20 lg:py-24",
        sectionThemeClasses[sectionTheme],
        removeTopPadding && "pt-1 md:pt-2 lg:pt-4",
        removeBottomPadding && "pb-1 md:pb-2 lg:pb-4",
        className,
      )}
    >
      {children}
    </section>
  );
};

export { Section };
