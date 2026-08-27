import type { Content } from "@prismicio/client";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { ValueProps } from "..";

export function ValueSplit({ slice }: ValueProps & { slice: Content.ValueSliceSplit }) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, buttons, alignment, card_side, remove_top_padding, statement } = slice.primary;
  const section_theme = (slice.primary.section_theme as string) === "Brand" ? "Bottle" : slice.primary.section_theme;

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
            title={title}
            description={description}
            buttons={buttons}
            align={alignment ? "center" : "left"}
            sectionTheme={section_theme}
            className="w-full self-start lg:sticky lg:top-28"
          />
        )}
        {statement.length > 0 && (
          <div className="flex w-full flex-col gap-6 lg:gap-8">
            {statement.map((statement, index) => {
              return (
                <div
                  key={`${statement.title}-${index}`}
                  className={cn(
                    "flex flex-col gap-1 not-last:border-b border-b-current/20 pb-6 transition-colors duration-500 ease-in-out lg:not-last:pb-8",
                  )}
                >
                  <h3 className="text-balance text-xl md:text-2xl">{statement.title}</h3>
                  <p>{statement.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </Section>
  );
}
