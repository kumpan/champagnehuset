import { type Content, isFilled } from "@prismicio/client";

import CustomMedia from "@/components/custom-media";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { CalloutProps } from "..";

type Props = CalloutProps & { slice: Content.CalloutSliceCard };

export function CalloutCard({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { title, description, buttons, overline, alignment, section_theme, remove_top_padding, media } = slice.primary;
  const { image, video, filter } = media[0] ?? {};

  const hasMedia = isFilled.linkToMedia(video) || isFilled.image(image);

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
            "relative flex min-h-96 flex-col justify-end overflow-hidden rounded-5 px-4 py-4 md:min-h-120 md:px-16 md:py-16",
            !hasMedia &&
              {
                Bud: "bg-fill-raised text-ink-flip",
                Dust: "bg-accent-fill-raised text-accent-ink-flip",
              }[section_theme],
            alignment ? "items-center" : "items-start",
          )}
        >
          {hasMedia && (
            <div className="pointer-events-none absolute inset-0 bg-fill-dark" aria-hidden>
              {image && isFilled.image(image) && (
                <div className="relative h-full w-full">
                  <CustomMedia
                    imageField={image}
                    videoSrc={video && isFilled.linkToMedia(video) ? video.url : undefined}
                    className="h-full w-full"
                    preload
                    sectionTheme={section_theme}
                    thumbnail="horizontal md:main"
                    filter={filter}
                  />
                </div>
              )}
              {hasIntroContent && (
                <>
                  <div className="absolute top-40 right-0 bottom-0 left-0 bg-linear-to-t from-brand/75 to-brand/0 mix-blend-overlay" />
                  <div className="absolute top-40 right-0 bottom-0 left-0 bg-linear-to-t from-brand/5 to-brand/0" />
                  <div className="absolute top-32 right-0 bottom-0 left-0 bg-linear-to-t from-fill-dark/80 to-fill-dark/0" />
                </>
              )}
            </div>
          )}
          {hasIntroContent && (
            <SectionIntro
              overline={overline}
              title={title}
              description={description}
              buttons={buttons}
              align={alignment ? "center" : "left"}
              sectionTheme={hasMedia ? "Bud" : section_theme}
              className="relative w-full"
              titleMaxWidth={false}
              textBalance={true}
              buttonVariant={hasMedia ? "secondary" : "default"}
            />
          )}
        </div>
      </Container>
    </Section>
  );
}
