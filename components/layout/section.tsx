import { cn } from "@/lib/utils";

const sectionThemeClasses: Record<string, string> = {
  Ocean: "bg-fill text-ink",
  Sunrise: "bg-accent-fill text-accent-ink",
};

const Section = ({
  children,
  className,
  removeTopPadding = false,
  removeBottomPadding = false,
  sectionTheme = "Ocean",
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
        " py-12 transition-colors duration-500 ease-in-out md:py-20 lg:py-24",
        sectionThemeClasses[sectionTheme],
        removeTopPadding && "pt-1 md:pt-2 lg:pt-4",
        removeBottomPadding && "pb-1 md:pb-2 lg:pb-4",
        sectionTheme === "Ocean"
          ? "selection:bg-brand selection:text-brand-ink"
          : "selection:bg-accent selection:text-accent-ink-flip",
        className,
      )}
    >
      {children}
    </section>
  );
};

export { Section };
