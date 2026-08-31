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
  ...props
}: React.ComponentProps<"section"> & {
  removeTopPadding?: boolean;
  removeBottomPadding?: boolean;
  sectionTheme?: string;
  "data-slice-type"?: string;
  "data-slice-variation"?: string;
}) => {
  const sliceName = [props["data-slice-type"], props["data-slice-variation"]].filter(Boolean).join("-");

  return (
    <section
      {...props}
      className={cn(
        "py-12 transition-colors duration-500 ease-in-out md:py-20 lg:py-24",
        sectionThemeClasses[sectionTheme],
        removeTopPadding && "pt-1 md:pt-2 lg:pt-4",
        removeBottomPadding && "pb-1 md:pb-2 lg:pb-4",
        className,
      )}
    >
      {children}

      {process.env.NODE_ENV !== "production" && sliceName && (
        <div className="pointer-events-none sticky bottom-4 z-50 h-0">
          <span className="absolute right-16 bottom-0 flex h-10 items-center rounded-3 bg-indigo-400/20 px-3 font-medium text-indigo-950/70 text-sm backdrop-blur-lg backdrop-brightness-200">
            {sliceName}
          </span>
        </div>
      )}
    </section>
  );
};

export { Section };
