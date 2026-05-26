import type { Content } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { ProcessProps } from "..";

type Props = ProcessProps & { slice: Content.ProcessSliceTime };

const overlineThemeClasses = {
  Ocean: "bg-fill-raised",
  Sunrise: "bg-accent-fill-raised",
};

const timeClasses = {
  Ocean: "bg-brand text-brand-ink",
  Sunrise: "bg-accent text-accent-ink-flip",
};

export function ProcessTime({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, section_theme, remove_top_padding } = slice.primary;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme || "Ocean"}
    >
      <Container>
        {hasIntroContent && (
          <SectionIntro
            overline={overline}
            overlineClassName={overlineThemeClasses[section_theme || "Ocean"]}
            title={title}
            description={description}
            align="center"
            sectionTheme={section_theme || "Ocean"}
          />
        )}
        <div className="mt-8 flex flex-col gap-3 md:mt-12 lg:gap-4">
          {slice.primary.step.map((step, index) => (
            <div className="group flex flex-col gap-8" key={`${step.title}-${index}`}>
              {/* Desktop */}
              <div
                className={cn(
                  "hidden flex-col gap-8 lg:flex",
                  index % 2 === 0 ? "lg:flex-row lg:text-right" : "lg:flex-row-reverse",
                )}
              >
                <div className="mb-12 w-full space-y-1.5">
                  <h4 className="text-xl md:text-2xl">{step.title}</h4>
                  <PrismicRichText field={step.description} />
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div
                    className={cn(
                      "flex h-22 w-48 shrink-0 items-center justify-center rounded-4 text-5xl",
                      timeClasses[section_theme || "Ocean"],
                    )}
                  >
                    {step.time}
                  </div>
                  <div
                    className={cn(
                      "h-full min-h-12 w-1 rounded-full group-last:hidden",
                      timeClasses[section_theme || "Ocean"],
                    )}
                  />
                </div>

                <div className="w-full" />
              </div>

              {/* Mobile */}
              <div className="flex flex-col gap-3 lg:hidden">
                <div className="flex flex-row items-center gap-3">
                  <div
                    className={cn(
                      "flex h-12 xs:h-14 w-22 xs:w-26 shrink-0 items-center justify-center rounded-3 text-xl xs:text-2xl md:h-18 md:w-36 md:rounded-4 md:text-4xl",
                      timeClasses[section_theme || "Ocean"],
                    )}
                  >
                    {step.time}
                  </div>
                  <h4 className="wrap-break-wordline-clamp-2 text-xl md:text-2xl">{step.title}</h4>
                </div>

                <div className="flex flex-row">
                  <div
                    className={cn(
                      "mr-4 ml-11 xs:ml-13 w-1 shrink-0 rounded-full group-last:hidden md:mr-8 md:ml-18",
                      timeClasses[section_theme || "Ocean"],
                    )}
                  />
                  <div className="mt-2 mb-6 md:mt-4 md:mb-8">
                    <PrismicRichText field={step.description} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
