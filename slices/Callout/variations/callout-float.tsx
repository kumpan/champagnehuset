import type { Content } from "@prismicio/client";
import { isFilled } from "@prismicio/client";
import CustomMedia from "@/components/custom-media";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { CalloutProps } from "..";

const containerClasses = {
  Ocean: "bg-fill-raised",
  Sunrise: "bg-accent-fill-raised",
};

export function CalloutFloat({ slice }: CalloutProps & { slice: Content.CalloutSliceFloat }) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, buttons, image_size, image_side, section_theme, remove_top_padding, media } =
    slice.primary;

  return (
    <>
      {image_size ? (
        <Section
          data-slice-type={slice.slice_type}
          data-slice-variation={slice.variation}
          removeTopPadding={remove_top_padding}
          sectionTheme={section_theme}
        >
          <Container>
            <div
              className={cn(
                "flex flex-col gap-2 transition-colors duration-500 ease-in-out lg:gap-0 lg:pb-12",
                image_side ? "lg:flex-row" : "lg:flex-row-reverse",
              )}
            >
              <div
                className={cn(
                  "flex w-full grow rounded-5 p-4 md:p-6 lg:rounded-r-8 lg:rounded-l-6 lg:p-8 xl:p-12 xl:py-20",
                  image_side ? "lg:-mr-12 lg:pr-20 xl:pr-24" : "lg:-ml-12 lg:pl-20 xl:pl-24",
                  containerClasses[section_theme],
                )}
              >
                {hasIntroContent && (
                  <SectionIntro
                    overline={overline}
                    overlineClassName={section_theme}
                    title={title}
                    description={description}
                    descriptionClassName="text-pretty"
                    buttons={buttons}
                    align="left"
                    sectionTheme={section_theme}
                    buttonWrapperClassName="mt-3 md:mt-4"
                    textBalance={true}
                  />
                )}
              </div>

              <div className="aspect-square 3xl:w-96 w-full shrink-0 overflow-hidden rounded-5 md:aspect-3/2 lg:mt-12 lg:-mb-12 lg:aspect-auto lg:w-128">
                {media[0] && (
                  <CustomMedia
                    imageField={isFilled.linkToMedia(media[0].video) ? undefined : media[0].image}
                    videoSrc={isFilled.linkToMedia(media[0].video) ? media[0].video.url : undefined}
                    className="h-full w-full rounded-0 md:rounded-0 lg:rounded-0"
                    preload
                    sectionTheme={section_theme}
                    thumbnail="square md:main lg:vertical"
                    filter={media[0].filter}
                  />
                )}
              </div>
            </div>
          </Container>
        </Section>
      ) : (
        <Section
          data-slice-type={slice.slice_type}
          data-slice-variation={slice.variation}
          removeTopPadding={remove_top_padding}
          sectionTheme={section_theme}
        >
          <Container>
            <div
              className={cn(
                "flex flex-col gap-2 transition-colors duration-500 ease-in-out lg:gap-0",
                image_side ? "lg:flex-row" : "lg:flex-row-reverse",
              )}
            >
              <div
                className={cn(
                  "relative z-10 flex w-full 3xl:max-w-152 shrink-0 rounded-5 p-4 md:p-6 lg:mt-12 lg:max-w-112 lg:p-8 xl:max-w-136",
                  containerClasses[section_theme],
                )}
              >
                {hasIntroContent && (
                  <SectionIntro
                    overline={overline}
                    overlineClassName={section_theme}
                    title={title}
                    description={description}
                    descriptionClassName="text-pretty"
                    buttons={buttons}
                    align="left"
                    sectionTheme={section_theme}
                    buttonWrapperClassName="mt-3 md:mt-4"
                    textBalance={true}
                  />
                )}
              </div>
              <div
                className={cn(
                  "relative z-0 aspect-square w-full self-stretch overflow-hidden rounded-5 md:aspect-3/2 lg:mb-12 lg:aspect-auto",
                  image_side ? "lg:-ml-12" : "lg:-mr-12",
                )}
              >
                {media[0] && (
                  <CustomMedia
                    imageField={isFilled.linkToMedia(media[0].video) ? undefined : media[0].image}
                    videoSrc={isFilled.linkToMedia(media[0].video) ? media[0].video.url : undefined}
                    className="h-full w-full rounded-0 md:rounded-0 lg:rounded-0"
                    preload
                    sectionTheme={section_theme}
                    thumbnail="square md:main"
                    filter={media[0].filter}
                  />
                )}
              </div>
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
