import type { Content } from "@prismicio/client";
import { isFilled } from "@prismicio/client";

import CustomMedia from "@/components/custom-media";
import { CustomRichText } from "@/components/custom-rich-text";
import { resolveIcon } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { Section, type SectionTheme } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { CalloutProps } from "..";

const containerClasses: Record<string, string> = {
  Bud: "bg-fill-raised",
  Leaf: "bg-fill-raised",
  Bottle: "bg-brand text-brand-ink selection:bg-fill-raised selection:text-ink",
  Dust: "bg-spot-fill-dark/10",
  Slate: "bg-spot-fill-dark",
};

// Card insides read the card surface
const introClasses: Record<SectionTheme, SectionTheme> = {
  Bud: "Bud",
  Leaf: "Leaf",
  Bottle: "Bottle",
  Dust: "Dust",
  Slate: "Slate",
};

type Props = CalloutProps & { slice: Content.CalloutSliceDetails };

export function CalloutDetails({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, buttons, remove_top_padding, image_side, media, details } = slice.primary;
  const section_theme = (slice.primary.section_theme as string) === "Brand" ? "Bottle" : slice.primary.section_theme;
  const content_theme = introClasses[section_theme];
  const surface = section_theme === "Bottle" ? ("brand" as const) : undefined;

  const mediaItem = media[0];
  const hasMedia = mediaItem && (isFilled.image(mediaItem.image) || isFilled.linkToMedia(mediaItem.video));

  const detailsList = details.length > 0 && (
    <ul className="flex w-full flex-col">
      {details.map((detail, index) => {
        const Icon = resolveIcon(detail.detail_icon);
        return (
          <li key={`${index}-${detail.detail_icon}`} className="flex w-full items-center gap-2 py-2.5 md:py-3">
            {Icon && <Icon className="size-7 shrink-0 md:size-8" />}
            {isFilled.richText(detail.rich_text) && (
              <CustomRichText
                field={detail.rich_text}
                sectionTheme={content_theme}
                surface={surface}
                className={cn(
                  "prose-p:my-0 prose-p:font-medium prose-p:text-lg prose-p:leading-tight md:prose-p:text-xl",
                )}
              />
            )}
          </li>
        );
      })}
    </ul>
  );

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
            hasMedia && (image_side ? "lg:flex-row-reverse" : "lg:flex-row"),
          )}
        >
          <div
            className={cn(
              "flex flex-col p-4 pt-6 md:p-6 md:pt-8 lg:p-16",
              hasMedia && "lg:aspect-square lg:w-1/2 lg:justify-end",
            )}
          >
            {(hasIntroContent || detailsList) && (
              <SectionIntro
                overline={overline}
                title={title}
                description={description}
                descriptionClassName="text-pretty"
                buttons={buttons}
                align="left"
                sectionTheme={content_theme}
                surface={surface}
                buttonWrapperClassName="mt-4 mb-4 md:mb-2"
                textBalance={true}
              >
                {detailsList}
              </SectionIntro>
            )}
          </div>
          {hasMedia && mediaItem && (
            <div className="aspect-square lg:w-1/2">
              <CustomMedia
                imageField={isFilled.linkToMedia(mediaItem.video) ? undefined : mediaItem.image}
                videoSrc={isFilled.linkToMedia(mediaItem.video) ? mediaItem.video.url : undefined}
                className="h-full w-full rounded-0"
                preload
                sectionTheme={section_theme}
                filter={mediaItem.filter}
              />
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
