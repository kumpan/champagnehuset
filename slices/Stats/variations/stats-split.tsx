import type { Content } from "@prismicio/client";
import AnimatedNumber from "@/components/animated-number";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { StatsProps } from "..";

const introBgClasses = {
  Ocean: "bg-fill-raised",
  Sunrise: "bg-accent-fill-raised",
  Brand: "bg-fill-raised",
  Accent: "bg-accent-fill-raised",
};

const cardThemeClasses = {
  Ocean: "bg-fill-raised text-ink",
  Sunrise: "bg-accent-fill-raised text-accent-ink",
  Brand: "bg-brand text-brand-ink",
  Accent: "bg-accent text-accent-ink-flip",
};

const themeAlias = {
  Ocean: "Ocean",
  Sunrise: "Sunrise",
  Brand: "Ocean",
  Accent: "Sunrise",
} as const;

export function StatsSplit({ slice }: StatsProps & { slice: Content.StatsSliceSplit }) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, buttons, stats_side, center_text, section_theme, remove_top_padding, stats } =
    slice.primary;

  const statsCount = slice.primary.stats.length;

  // Determine grid layout based on number of items
  const getGridClasses = () => {
    if (statsCount === 1) return "grid-cols-1";
    if (statsCount === 2) return "md:grid-cols-1";
    if (statsCount === 3) return "lg:grid-cols-2";
    if (statsCount === 4) return "lg:grid-cols-2";
    return "md:grid-cols-2"; // default for 5+
  };

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={themeAlias[section_theme] || "Ocean"}
    >
      <Container
        className={cn("flex flex-col gap-2 md:gap-2 lg:flex-row", stats_side ? "lg:flex-row" : "lg:flex-row-reverse")}
      >
        {hasIntroContent && (
          <div
            className={cn(
              "flex w-full items-center rounded-5 p-4 transition-colors duration-500 md:rounded-6 md:p-8 lg:w-1/2 lg:p-12 xl:p-20",
              introBgClasses[section_theme],
              !center_text && "aspect-square",
            )}
          >
            <SectionIntro
              overline={overline}
              title={title}
              description={description}
              buttons={buttons}
              align={center_text ? "center" : "left"}
              textBalance={true}
              className={cn(!center_text && "h-full")}
              sectionTheme={themeAlias[section_theme]}
              buttonClassName="w-full md:w-auto"
              buttonWrapperClassName={cn(!center_text ? "mt-auto" : "mt-2 md:mt-8")}
            />
          </div>
        )}
        <div className={cn("grid gap-2 text-center md:gap-2 lg:w-1/2", getGridClasses())}>
          {stats.map((stat, index) => (
            <div
              key={`${stat.number}-${index}`}
              className={cn(
                "flex min-w-32 flex-col items-center justify-center rounded-5 px-4 py-10 transition-colors duration-500 md:min-h-48 lg:min-h-64 lg:px-8 xl:min-h-64 2xl:min-h-72",
                cardThemeClasses[section_theme],
                statsCount === 3 && index === 2 && "lg:col-span-2",
              )}
            >
              <AnimatedNumber
                valueText={stat.number ?? undefined}
                size="Large"
                className="w-full font-semibold text-5xl xl:text-6xl"
              />
              <p className="w-full max-w-lg text-balance">{stat.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
