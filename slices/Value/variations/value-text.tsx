import type { Content } from "@prismicio/client";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { ValueProps } from "..";

const statementDescriptionThemeClasses = {
  Bud: "text-ink-dim",
  Leaf: "text-ink-dim",
  Bottle: "text-ink-dim",
  Dust: "text-spot-ink-dim",
  Slate: "text-spot-ink-flip",
};

const dividerThemeClasses = {
  Bud: "bg-brand",
  Leaf: "bg-brand",
  Bottle: "bg-brand",
  Dust: "bg-spot-ink-dim",
  Slate: "bg-current",
};

export function ValueText({ slice }: ValueProps & { slice: Content.ValueSliceText }) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, buttons, alignment, remove_top_padding, statement } = slice.primary;
  const section_theme = (slice.primary.section_theme as string) === "Brand" ? "Bottle" : slice.primary.section_theme;

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
            title={title}
            description={description}
            buttons={buttons}
            align={alignment ? "center" : "left"}
            sectionTheme={section_theme}
          />
        )}
        {statement.length > 0 && (
          <div className={cn("mt-8 grid 3xl:gap-16 gap-8 md:mt-12 md:gap-8 lg:mt-16 lg:gap-12", gridCols)}>
            {statement.map((item) => (
              <div key={item.title} className="flex flex-row gap-4 md:flex-col">
                <div
                  className={cn(
                    "h-full w-(--default-border-width) shrink-0 rounded-full md:hidden",
                    dividerThemeClasses[section_theme],
                  )}
                />
                <div className="py-2 md:py-0">
                  <h3 className="text-balance text-xl md:text-2xl lg:text-3xl">{item.title}</h3>
                  <div
                    className={cn(
                      "easeOut my-4 hidden h-(--default-border-width) rounded-full transition-colors md:block md:w-24 lg:w-32",
                      dividerThemeClasses[section_theme],
                    )}
                  />
                  <p className={cn(statementDescriptionThemeClasses[section_theme], "easeOut transition-colors")}>
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
