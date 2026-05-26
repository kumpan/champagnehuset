import { type Content, isFilled } from "@prismicio/client";
import AnimatedNumber from "@/components/animated-number";
import CustomMedia from "@/components/custom-media";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { StatsProps } from "..";

const noMediaBgClasses = {
  Ocean: "bg-fill-raised",
  Sunrise: "bg-accent-fill-raised",
};

const colorLayerClasses = {
  Ocean: "bg-brand",
  Sunrise: "bg-accent",
};

const descriptionThemeClasses = {
  Ocean: "text-ink-dim",
  Sunrise: "text-accent-ink-dim",
};

const darkLayerClasses = {
  Ocean: "bg-fill-dark/20",
  Sunrise: "bg-accent-fill-dark/20",
};

const mediaThemeAlias = {
  Ocean: "Night",
  Sunrise: "Dawn",
} as const;

const mediaDescriptionClasses = {
  Ocean: "text-ink-flip/80",
  Sunrise: "text-accent-ink-flip/80",
};

const mediaNumberClasses = {
  Ocean: "text-ink-flip",
  Sunrise: "text-accent-ink-flip",
};

export function StatsBackdrop({ slice }: StatsProps & { slice: Content.StatsSliceBackdrop }) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, buttons, center_text, section_theme, remove_top_padding, stats, image, video } =
    slice.primary;

  const theme = section_theme;
  const hasMedia = isFilled.linkToMedia(video) || isFilled.image(image);
  const statsCount = stats.length;

  const layouts: Record<number, { grid: string; itemSpan?: (i: number) => string }> = {
    1: { grid: "grid-cols-1" },
    2: { grid: "grid-cols-1 md:grid-cols-2" },
    3: { grid: "grid-cols-1 lg:grid-cols-3" },
    4: { grid: "grid-cols-1 md:grid-cols-2" },
    5: {
      grid: "grid-cols-1 md:grid-cols-2 lg:grid-cols-6",
      itemSpan: (i) => cn(i === 4 && "md:col-span-2", i < 3 ? "lg:col-span-2" : "lg:col-span-3"),
    },
  };
  const layout = layouts[statsCount] ?? {
    grid: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={theme}
      className="isolate"
    >
      <Container>
        <div
          className={cn(
            "relative flex min-h-112 flex-col justify-center overflow-hidden rounded-5 px-4 py-12 md:rounded-6 md:px-12 md:py-20 lg:min-h-144 lg:p-16 xl:p-20",
            hasMedia ? "bg-fill-dark" : noMediaBgClasses[theme],
          )}
        >
          {hasMedia && (
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <CustomMedia
                imageField={isFilled.image(image) ? image : undefined}
                videoSrc={isFilled.linkToMedia(video) ? video.url : undefined}
                className="h-full w-full"
                preload
                sectionTheme={theme}
                thumbnail="vertical lg:main"
              />

              {/* Background Fade */}
              <div
                className={cn(
                  "absolute inset-0 mix-blend-overlay transition-colors duration-500 ease-in-out",
                  colorLayerClasses[theme],
                )}
              />
              <div
                className={cn(
                  "absolute inset-0 opacity-60 transition-colors duration-500 ease-in-out",
                  colorLayerClasses[theme],
                )}
              />
              <div
                className={cn(
                  "absolute inset-0 backdrop-blur-md backdrop-brightness-75 transition-colors duration-500 ease-in-out",
                  darkLayerClasses[theme],
                )}
              />
            </div>
          )}

          {hasIntroContent && (
            <SectionIntro
              overline={overline}
              title={title}
              description={description}
              buttons={buttons}
              align={center_text ? "center" : "left"}
              sectionTheme={hasMedia ? mediaThemeAlias[theme] : theme}
              className="relative w-full"
              textBalance={true}
            />
          )}

          {statsCount > 0 && (
            <div
              className={cn(
                "relative mt-8 grid gap-8 md:mt-16 md:gap-10 lg:mt-20 lg:gap-12",
                center_text ? "text-center" : "text-left",
                layout.grid,
              )}
            >
              {stats.map((stat, index) => (
                <div
                  key={`${stat.number}-${index}`}
                  className={cn(
                    "flex flex-col gap-1",
                    center_text ? "items-center" : "items-start",
                    layout.itemSpan?.(index),
                  )}
                >
                  <AnimatedNumber
                    valueText={stat.number ?? undefined}
                    size="Large"
                    className={cn(
                      "font-semibold text-5xl md:text-6xl lg:text-7xl",
                      hasMedia && mediaNumberClasses[theme],
                    )}
                  />
                  <p
                    className={cn(
                      "text-balance",
                      hasMedia ? mediaDescriptionClasses[theme] : descriptionThemeClasses[theme],
                    )}
                  >
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
