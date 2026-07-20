import type { Content } from "@prismicio/client";
import AnimatedNumber from "@/components/animated-number";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { TextProps } from "..";

const overlineThemeClasses = {
  Bud: "bg-fill-raised",
  Dust: "bg-accent-fill-raised",
};

const factDescriptionThemeClasses = {
  Bud: "text-ink-dim",
  Dust: "text-accent-ink-dim",
};

const dividerThemeClasses = {
  Bud: "bg-brand",
  Dust: "bg-accent",
};

type Props = TextProps & { slice: Content.TextSliceFacts };

export function TextInfo({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, buttons, alignment, section_theme, remove_top_padding, facts } = slice.primary;

  const theme = section_theme || "Bud";
  const factCount = facts.length;

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
  const layout = layouts[factCount] ?? {
    grid: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={theme}
    >
      <Container>
        {hasIntroContent && (
          <SectionIntro
            overline={overline}
            overlineClassName={overlineThemeClasses[theme]}
            title={title}
            description={description}
            buttons={buttons}
            align={alignment ? "center" : "left"}
            sectionTheme={theme}
          />
        )}
        {factCount > 0 && (
          <div className={cn("mt-8 grid 3xl:gap-16 gap-8 md:mt-12 md:gap-8 lg:mt-16 lg:gap-12", layout.grid)}>
            {facts.map((fact, index) => (
              <div
                key={`${fact.number}-${index}`}
                className={cn("flex flex-row gap-4 md:flex-col", layout.itemSpan?.(index))}
              >
                <div className={cn("h-full w-1 shrink-0 rounded-full md:hidden", dividerThemeClasses[theme])} />
                <div className="py-2 md:py-0">
                  <AnimatedNumber
                    valueText={fact.number ?? undefined}
                    size="Large"
                    className="font-semibold text-5xl md:text-6xl lg:text-7xl"
                  />
                  <div
                    className={cn("my-4 hidden h-1 rounded-full md:block md:w-24 lg:w-32", dividerThemeClasses[theme])}
                  />
                  <p className={cn(factDescriptionThemeClasses[theme])}>{fact.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
