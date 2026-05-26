import type { Content } from "@prismicio/client";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { ValueProps } from "..";

const overlineThemeClasses = {
  Ocean: "bg-fill-raised",
  Sunrise: "bg-accent-fill-raised",
};

const statementDescriptionThemeClasses = {
  Ocean: "text-ink-dim",
  Sunrise: "text-accent-ink-dim",
};

const dividerThemeClasses = {
  Ocean: "bg-brand",
  Sunrise: "bg-accent",
};

export function ValueText({
  slice,
}: ValueProps & { slice: Content.ValueSliceText }) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const {
    overline,
    title,
    description,
    buttons,
    alignment,
    section_theme,
    remove_top_padding,
    statement,
  } = slice.primary;

  const gridCols =
    statement.length === 2 || statement.length === 4
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme}
    >
      <Container>
        {hasIntroContent && (
          <SectionIntro
            overline={overline}
            overlineClassName={overlineThemeClasses[section_theme]}
            title={title}
            description={description}
            buttons={buttons}
            align={alignment ? "center" : "left"}
            sectionTheme={section_theme}
          />
        )}
        {statement.length > 0 && (
          <div
            className={cn(
              "mt-8 grid 3xl:gap-16 gap-8 md:mt-12 md:gap-8 lg:mt-16 lg:gap-12",
              gridCols,
            )}
          >
            {statement.map((item) => (
              <div key={item.title} className="flex flex-row gap-4 md:flex-col">
                <div
                  className={cn(
                    "h-full w-1 shrink-0 rounded-full md:hidden",
                    dividerThemeClasses[section_theme],
                  )}
                />
                <div className="py-2 md:py-0">
                  <h3 className="text-balance text-xl md:text-2xl lg:text-3xl">
                    {item.title}
                  </h3>
                  <div
                    className={cn(
                      "my-4 hidden h-1 rounded-full md:block md:w-24 lg:w-32",
                      dividerThemeClasses[section_theme],
                    )}
                  />
                  <p
                    className={cn(
                      statementDescriptionThemeClasses[section_theme],
                    )}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
