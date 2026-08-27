import { type Content, isFilled } from "@prismicio/client";

import CustomMedia from "@/components/custom-media";
import { Container } from "@/components/layout/container";
import { Section, type SectionTheme } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { CalloutProps } from "..";

type Props = CalloutProps & { slice: Content.CalloutSliceCard };

const containerClasses: Record<string, string> = {
  Bud: "bg-fill-raised md:bg-fill/85 md:backdrop-brightness-110",
  Leaf: "bg-fill-raised md:bg-fill-raised/85 md:backdrop-brightness-110",
  Bottle:
    "bg-brand text-brand-ink md:bg-brand/92 md:backdrop-brightness-75 selection:bg-fill-raised selection:text-ink",
  Dust: "bg-spot-fill md:bg-spot-fill/92 md:backdrop-brightness-50",
  Slate: "bg-spot-fill-raised md:bg-spot-fill-raised/85 md:backdrop-brightness-125",
};

const containerClassesNoMedia: Record<string, string> = {
  Bud: "bg-fill-raised md:bg-fill-raised",
  Leaf: "bg-fill-raised md:bg-fill-raised",
  Bottle:
    "bg-brand text-brand-ink md:bg-brand/92 md:backdrop-brightness-75 selection:bg-fill-raised selection:text-ink",
  Dust: "bg-spot-fill md:bg-spot-fill/92 md:backdrop-brightness-50",
  Slate: "bg-spot-fill-raised md:bg-spot-fill-raised/85 md:backdrop-brightness-125",
};

// Card interiors read the card's surface, not the section's; the Bottle card
// additionally renders its content with surface="brand".
const introClasses: Record<SectionTheme, SectionTheme> = {
  Bud: "Bud",
  Leaf: "Leaf",
  Bottle: "Bottle",
  Dust: "Slate",
  Slate: "Dust",
};

export function CalloutCard({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, buttons, alignment, remove_top_padding, media } = slice.primary;
  const section_theme = (slice.primary.section_theme as string) === "Brand" ? "Bottle" : slice.primary.section_theme;
  const { image, video, filter } = media[0] ?? {};
  const hasMedia = isFilled.linkToMedia(video) || isFilled.image(image);

  // Card horizontal placement over the media. Text are centered only when the card is centered
  const isCenter = alignment === "Center";
  const isRight = alignment === "Right";

  const intro = hasIntroContent && (
    <SectionIntro
      overline={overline}
      title={title}
      description={description}
      buttons={buttons}
      align={isCenter ? "center" : "left"}
      sectionTheme={introClasses[section_theme]}
      surface={section_theme === "Bottle" ? "brand" : undefined}
      className="w-full"
      titleMaxWidth={false}
      textBalance
    />
  );

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme}
    >
      <Container>
        {hasMedia ? (
          <div
            className={cn(
              "flex flex-col gap-2 md:relative md:min-h-136 md:flex-row md:items-center md:gap-0 md:overflow-hidden md:rounded-2 md:p-6 lg:min-h-152",
              isCenter ? "md:justify-center" : isRight ? "md:justify-end" : "md:justify-start",
            )}
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-2 md:absolute md:inset-0 md:aspect-auto md:h-full md:rounded-0">
              <CustomMedia
                imageField={isFilled.linkToMedia(video) ? undefined : image}
                videoSrc={isFilled.linkToMedia(video) ? video.url : undefined}
                className="h-full w-full rounded-0"
                preload
                sectionTheme={section_theme}
                thumbnail="square md:main"
                filter={filter}
              />
            </div>

            {intro && (
              <div
                className={cn(
                  "relative z-20 w-full rounded-2 p-4 md:w-auto md:p-8 md:backdrop-blur-md",
                  containerClasses[section_theme],
                  isCenter ? "md:max-w-144" : "md:max-w-128",
                )}
              >
                {intro}
              </div>
            )}
          </div>
        ) : (
          // No media
          <div
            className={cn(
              "flex min-h-96 items-center rounded-2 p-6 md:min-h-120 md:p-12",
              containerClassesNoMedia[section_theme],
              isCenter ? "justify-center text-center" : isRight ? "justify-end" : "justify-start",
            )}
          >
            {intro && <div className={cn("w-full", isCenter ? "max-w-3xl" : "max-w-2xl")}>{intro}</div>}
          </div>
        )}
      </Container>
    </Section>
  );
}
