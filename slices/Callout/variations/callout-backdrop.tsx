import { type Content, isFilled } from "@prismicio/client";
import CustomMedia from "@/components/custom-media";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { CalloutProps } from "..";

type Props = CalloutProps & { slice: Content.CalloutSliceBackdrop };

export function CalloutBackdrop({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { title, description, buttons, overline, alignment, remove_top_padding, media } = slice.primary;
  const section_theme = (slice.primary.section_theme as string) === "Brand" ? "Bottle" : slice.primary.section_theme;
  const { image, video, filter } = media[0] ?? {};

  const hasMedia = isFilled.linkToMedia(video) || isFilled.image(image);
  // With media, the image is the surface, so we force the Slate theme and text
  const theme = hasMedia ? "Slate" : section_theme;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      sectionTheme={section_theme}
      className={cn("py-0 md:py-0 lg:py-0 2xl:py-24", remove_top_padding && "2xl:pt-4")}
    >
      <Container className="max-w-none 2xl:max-w-360">
        <div
          className={cn(
            "relative isolate flex flex-col justify-end overflow-hidden",
            "min-h-112 md:min-h-144 lg:min-h-172",
            "-mx-4 rounded-none md:-mx-6 lg:-mx-8 2xl:mx-0 2xl:rounded-2",
          )}
        >
          {hasMedia && (
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <CustomMedia
                imageField={image && isFilled.image(image) ? image : undefined}
                videoSrc={video && isFilled.linkToMedia(video) ? video.url : undefined}
                className="h-full w-full rounded-none"
                preload
                sectionTheme="Slate"
                thumbnail="horizontal md:main"
                filter={filter}
              />

              {/* Bottom fade: layered like custom-media (blur → overlay mix → fade), spot-fill-dark */}
              <div className="absolute inset-x-0 top-1/3 bottom-0 backdrop-blur-[3px] [mask-image:linear-gradient(to_top,black,black_30%,transparent)]" />
              <div className="absolute inset-x-0 top-1/4 bottom-0 bg-linear-to-t from-spot-fill-dark/65 to-spot-fill-dark/0 mix-blend-overlay" />
              <div className="absolute inset-x-0 top-1/4 bottom-0 bg-linear-to-t from-spot-fill-dark/90 via-spot-fill-dark/40 to-spot-fill-dark/0" />
            </div>
          )}

          {hasIntroContent && (
            <Container
              className={cn(
                "relative flex w-full flex-col justify-end py-12 md:py-20 lg:py-24 2xl:p-12",
                !hasMedia && "2xl:px-0",
              )}
            >
              <SectionIntro
                overline={overline}
                title={title}
                description={description}
                buttons={buttons}
                align={alignment ? "center" : "left"}
                sectionTheme={theme}
                className={cn("w-full max-w-200", alignment && "mx-auto")}
                titleMaxWidth={false}
                textBalance
              />
            </Container>
          )}
        </div>
      </Container>
    </Section>
  );
}
