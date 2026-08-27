import { cn } from "@/lib/utils";

export type SectionTheme = "Bud" | "Leaf" | "Bottle" | "Dust" | "Slate";

const sectionThemeClasses: Record<string, string> = {
  Bud: "bg-fill text-ink selection:bg-brand selection:text-brand-ink",
  Leaf: "bg-spot-fill-raised text-ink selection:bg-brand selection:text-brand-ink",
  Bottle: "bg-spot-fill-raised text-ink selection:bg-brand selection:text-brand-ink",
  Dust: "bg-spot-fill-raised text-spot-ink selection:bg-spot-fill selection:text-spot-ink-flip",
  Slate: "bg-spot-fill text-spot-ink-flip selection:bg-spot-fill-raised selection:text-spot-ink",
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
        "relative py-12 transition-colors duration-500 ease-in-out md:py-20 lg:py-24",
        sectionThemeClasses[sectionTheme],
        removeTopPadding && "pt-1 md:pt-2 lg:pt-4",
        removeBottomPadding && "pb-1 md:pb-2 lg:pb-4",
        className,
      )}
    >
      <div className="absolute top-3 left-3 flex h-10 items-center rounded-2 bg-indigo-100 px-4 font-medium text-indigo-950">
        {sectionTheme}
      </div>
      {children}
    </section>
  );
};

export { Section };
