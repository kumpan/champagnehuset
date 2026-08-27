import type { Content } from "@prismicio/client";
import { isFilled } from "@prismicio/client";
import CustomMedia from "@/components/custom-media";
import { Container } from "@/components/layout/container";
import { Section, type SectionTheme } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { CalloutProps } from "..";

const containerClasses = {
  Bud: "bg-fill-raised",
  Leaf: "bg-fill-raised",
  Bottle: "bg-brand text-brand-ink selection-light",
  Dust: "bg-spot-fill selection-spot-raised",
  Slate: "bg-spot-fill-raised selection-spot",
};

// What the card interior wears per section theme: the nearest real theme plus,
// for the brand-green card, the surface no theme matches.
const interior: Record<SectionTheme, { theme: SectionTheme; surface?: "brand" }> = {
  Bud: { theme: "Bud" },
  Leaf: { theme: "Leaf" },
  Bottle: { theme: "Bottle", surface: "brand" },
  Dust: { theme: "Slate" },
  Slate: { theme: "Dust" },
};

export function CalloutSplit({ slice }: CalloutProps & { slice: Content.CalloutSliceSplit }) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, buttons, alignment, image_side, remove_top_padding, media } = slice.primary;
  const section_theme = (slice.primary.section_theme as string) === "Brand" ? "Bottle" : slice.primary.section_theme;
  const { theme: content_theme, surface } = interior[section_theme];

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
            "flex flex-col overflow-hidden rounded-2 transition-colors duration-500 ease-in-out",
            containerClasses[section_theme],
            image_side ? "lg:flex-row-reverse" : "lg:flex-row",
          )}
        >
          <div
            className={cn(
              "flex p-6 md:p-10 lg:aspect-square lg:w-1/2 lg:p-12",
              alignment && "items-center justify-center",
            )}
          >
            {/* Content */}
            {hasIntroContent && (
              <SectionIntro
                overline={overline}
                title={title}
                description={description}
                buttons={buttons}
                align={alignment ? "center" : "left"}
                sectionTheme={content_theme}
                surface={surface}
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
                className="h-full w-full rounded-0"
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
