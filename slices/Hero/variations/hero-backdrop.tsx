import { type Content, isFilled } from "@prismicio/client";

import { BreadcrumbNav } from "@/components/breadcrumb";
import CustomMedia from "@/components/custom-media";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { HeroProps } from "..";

type Props = HeroProps & { slice: Content.HeroSliceBackdrop };

export function HeroBackdrop({ slice, context }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { title, description, buttons, alignment, media } = slice.primary;
  const section_theme = slice.primary.section_theme;
  const { image, video } = media[0] ?? {};

  const hasMedia = isFilled.linkToMedia(video) || isFilled.image(image);
  // With media, the theme is always slate so text is legible.
  const theme = hasMedia ? "Slate" : section_theme;

  const breadcrumbs = context?.breadcrumbs;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      sectionTheme={theme}
      className={cn(
        "relative isolate flex flex-col justify-end overflow-hidden border-t-0",
        "3xl:min-h-256 min-h-144 pt-80 pb-12 md:min-h-192 md:pt-28 md:pb-16 lg:min-h-208 lg:pt-32 xl:min-h-232",
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
            sizes="100vw"
          />

          {/* Bottom fade layers: blur → overlay blend → color fade */}
          <div
            className={cn(
              "absolute inset-x-0 top-1/4 bottom-0 [mask-image:linear-gradient(to_top,black,black_30%,transparent)]",
              hasIntroContent && "backdrop-blur-[3px]",
            )}
          />
          <div
            className={cn(
              "absolute inset-x-0 top-1/5 bottom-0 bg-linear-to-t to-spot-fill-dark/0 mix-blend-overlay",
              hasIntroContent ? "from-spot-fill-dark/75" : "from-spot-fill-dark/25",
            )}
          />
          <div
            className={cn(
              "absolute inset-x-0 top-1/5 bottom-0 bg-linear-to-t via-spot-fill-dark/40 to-spot-fill-dark/0",
              hasIntroContent ? "from-spot-fill-dark/90" : "from-spot-fill-dark/30",
            )}
          />
        </div>
      )}

      <Container className="relative flex w-full flex-col justify-end">
        <div className={cn("flex w-full max-w-200 flex-col", alignment && "mx-auto items-center")}>
          {hasIntroContent && breadcrumbs && breadcrumbs.length > 1 && (
            <BreadcrumbNav
              items={breadcrumbs}
              colorMode={hasMedia ? "light" : "dark"}
              sectionTheme={hasMedia ? "Dust" : section_theme}
              className={cn("mb-3 md:mb-4", alignment && "justify-center")}
            />
          )}
          {hasIntroContent && (
            <SectionIntro
              title={title}
              titleAs="h1"
              description={description}
              descriptionClassName="md:text-lg lg:text-xl"
              buttons={buttons}
              align={alignment ? "center" : "left"}
              sectionTheme={theme}
              className="w-full"
              titleMaxWidth={false}
              textBalance
            />
          )}
        </div>
      </Container>
    </Section>
  );
}
