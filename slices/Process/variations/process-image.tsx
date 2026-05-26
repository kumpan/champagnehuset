import type { Content } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import CustomMedia from "@/components/custom-media";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { ProcessProps } from "..";

type Props = ProcessProps & { slice: Content.ProcessSliceImage };

const overlineThemeClasses = {
  Ocean: "bg-fill-raised",
  Sunrise: "bg-accent-fill-raised",
};

const timeThemeClasses = {
  Ocean: "bg-brand text-brand-ink",
  Sunrise: "bg-accent text-accent-ink-flip",
};

export function ProcessImage({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, section_theme, remove_top_padding } =
    slice.primary;

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
            align="center"
            sectionTheme={section_theme}
          />
        )}
        <div className="mt-8 flex flex-col gap-2 md:mt-12 md:gap-3 lg:gap-4">
          {slice.primary.step.map((step, index) => (
            <div
              className="group flex flex-col gap-8"
              key={`${step.title}-${index}`}
            >
              {/* Desktop */}
              <div
                className={cn(
                  "hidden flex-col gap-8 lg:flex",
                  index % 2 === 0
                    ? "lg:flex-row lg:text-right"
                    : "lg:flex-row-reverse",
                )}
              >
                <div className="w-full space-y-1.5">
                  <h4 className="text-xl md:text-2xl">{step.title}</h4>
                  <PrismicRichText field={step.description} />
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div
                    className={cn(
                      "flex size-28 shrink-0 items-center justify-center rounded-4 text-5xl",
                      timeThemeClasses[section_theme],
                    )}
                  >
                    {String(index + 1)}
                  </div>
                  <div
                    className={cn(
                      "h-full w-1 rounded-full group-last:hidden",
                      timeThemeClasses[section_theme],
                    )}
                  />
                </div>
                <CustomMedia
                  imageField={step.image}
                  className="mb-6 aspect-square w-full md:aspect-video"
                  sectionTheme={section_theme}
                  filter={step.filter}
                />
              </div>

              {/* Mobile */}
              <div className="flex flex-row gap-4 lg:hidden">
                <div className="flex flex-col items-center gap-2 md:gap-3">
                  <div
                    className={cn(
                      "flex size-14 shrink-0 items-center justify-center rounded-4 text-2xl md:size-22 md:text-5xl",
                      timeThemeClasses[section_theme],
                    )}
                  >
                    {String(index + 1)}
                  </div>
                  <div
                    className={cn(
                      "h-full w-1 rounded-full group-last:hidden",
                      timeThemeClasses[section_theme],
                    )}
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-4">
                  <div className="wrap-break-word w-full">
                    <h4 className="text-xl md:text-2xl">{step.title}</h4>
                    <PrismicRichText field={step.description} />
                  </div>

                  <CustomMedia
                    imageField={step.image}
                    thumbnail="square md:main"
                    className="mb-8 aspect-square md:aspect-video"
                    sectionTheme={section_theme}
                    filter={step.filter}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
