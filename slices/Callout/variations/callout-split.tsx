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

export function CalloutSplit({ slice }: CalloutProps & { slice: Content.CalloutSliceSplit }) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, buttons, alignment, image_side, section_theme, remove_top_padding, media } =
    slice.primary;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme}
    >
      <Container>
        <div
          className={cn(
            "flex flex-col overflow-hidden rounded-t-5 rounded-b-8 p-4 transition-colors duration-500 ease-in-out lg:rounded-r-8 lg:rounded-l-6",
            containerClasses[section_theme],
            image_side ? "lg:flex-row-reverse" : "lg:flex-row",
          )}
        >
          <div
            className={cn("flex md:p-6 lg:aspect-square lg:w-1/2 lg:p-8", alignment && "items-center justify-center")}
          >
            {hasIntroContent && (
              <SectionIntro
                overline={overline}
                overlineClassName={section_theme}
                title={title}
                description={description}
                buttons={buttons}
                align={alignment ? "center" : "left"}
                sectionTheme={section_theme}
                buttonWrapperClassName={cn("mt-4 mb-4 md:mb-2", alignment ? "lg:mt-6" : "lg:mt-auto")}
                className={cn(!alignment && "h-full")}
                textBalance={true}
              />
            )}
          </div>
          <div className="aspect-square lg:w-1/2">
            {media[0] && (
              <CustomMedia
                imageField={isFilled.linkToMedia(media[0].video) ? undefined : media[0].image}
                videoSrc={isFilled.linkToMedia(media[0].video) ? media[0].video.url : undefined}
                className="h-full w-full"
                preload
                sectionTheme={section_theme}
                filter={media[0].filter}
              />
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
