import type { Content } from "@prismicio/client";
import { iconMap } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { ValueProps } from "..";

const iconContainerThemeClasses = {
  Bud: "bg-fill-raised",
  Dust: "bg-accent-fill-raised",
};

const descriptionThemeClasses = {
  Bud: "text-ink-dim",
  Dust: "text-accent-ink-dim",
};

export function ValueGrid({ slice }: ValueProps & { slice: Content.ValueSliceGrid }) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, buttons, section_theme, remove_top_padding, statement } = slice.primary;

  const gridCols =
    statement.length === 4
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      : statement.length === 2
        ? "grid-cols-1 md:grid-cols-2"
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
            align="center"
            sectionTheme={section_theme}
          />
        )}
        {statement.length > 0 && (
          <div className={cn("mt-8 grid gap-8 md:mt-12 md:gap-8 lg:mt-20 lg:gap-12", gridCols)}>
            {statement.map((statement, index) => {
              const Icon = iconMap[statement.icon as keyof typeof iconMap];
              return (
                <div
                  key={`${statement.title}-${index}`}
                  className="flex flex-col gap-2 md:items-center md:gap-3 md:text-center lg:gap-3"
                >
                  {Icon && (
                    <div
                      className={cn(
                        "flex size-20 shrink-0 items-center justify-center rounded-4 transition-colors duration-500 ease-in-out md:size-22 lg:size-26",
                        iconContainerThemeClasses[section_theme],
                      )}
                    >
                      <Icon className="icon-bold size-8 md:size-10 lg:size-12" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <h3 className="text-balance text-2xl md:text-2xl">{statement.title}</h3>
                    <p className={cn(descriptionThemeClasses[section_theme])}>{statement.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </Section>
  );
}
