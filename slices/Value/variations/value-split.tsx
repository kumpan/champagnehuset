import type { Content } from "@prismicio/client";
import { iconMap } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { ValueProps } from "..";

const overlineThemeClasses = {
  Bud: "bg-fill-raised",
  Dust: "bg-accent-fill-raised",
};

const cardThemeClasses = {
  Bud: "bg-fill-raised text-ink",
  Dust: "bg-accent-fill-raised text-accent-ink",
};

const iconContainerThemeClasses = {
  Bud: "bg-fill",
  Dust: "bg-accent-fill",
};

const descriptionThemeClasses = {
  Bud: "text-ink-dim",
  Dust: "text-accent-ink-dim",
};

export function ValueSplit({ slice }: ValueProps & { slice: Content.ValueSliceSplit }) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, buttons, alignment, card_side, section_theme, remove_top_padding, statement } =
    slice.primary;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme}
    >
      <Container
        className={cn("flex flex-col gap-8 lg:gap-12 xl:gap-20", card_side ? "lg:flex-row-reverse" : "lg:flex-row")}
      >
        {hasIntroContent && (
          <SectionIntro
            overline={overline}
            overlineClassName={overlineThemeClasses[section_theme]}
            title={title}
            description={description}
            buttons={buttons}
            align={alignment ? "center" : "left"}
            sectionTheme={section_theme}
            className="w-full self-start lg:sticky lg:top-28"
          />
        )}
        {statement.length > 0 && (
          <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-1 lg:gap-3">
            {statement.map((statement, index) => {
              const Icon = iconMap[statement.icon as keyof typeof iconMap];
              return (
                <div
                  key={`${statement.title}-${index}`}
                  className={cn(
                    "flex flex-col gap-4 rounded-5 p-4 pb-5 transition-colors duration-500 ease-in-out md:gap-5 md:p-6 md:pb-6 lg:p-8 lg:pb-8",
                    cardThemeClasses[section_theme],
                  )}
                >
                  {Icon && (
                    <div
                      className={cn(
                        "flex size-22 shrink-0 items-center justify-center rounded-4 transition-colors duration-500 ease-in-out md:size-24 lg:size-28",
                        iconContainerThemeClasses[section_theme],
                      )}
                    >
                      <Icon className="icon-bold size-10 md:size-12 lg:size-14" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <h3 className="text-balance text-xl md:text-2xl">{statement.title}</h3>
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
