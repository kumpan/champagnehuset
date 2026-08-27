import { cn } from "@/lib/utils";

export type SectionTheme = "Bud" | "Leaf" | "Bottle" | "Dust" | "Slate";

const sectionThemeClasses: Record<string, string> = {
  Bud: "bg-fill text-ink selection-brand",
  Leaf: "bg-spot-fill-raised text-ink selection-brand",
  Bottle: "bg-spot-fill-raised text-ink selection-brand",
  Dust: "bg-spot-fill-raised text-spot-ink selection-spot",
  Slate: "bg-spot-fill text-spot-ink-flip selection-spot-raised",
};

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
