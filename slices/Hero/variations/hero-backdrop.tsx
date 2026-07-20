"use client";

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
  const { title, description, buttons, alignment, section_theme, media } = slice.primary;
  const { image, video } = media[0] ?? {};

  const hasMedia = isFilled.linkToMedia(video) || isFilled.image(image);

  const breadcrumbs = context?.breadcrumbs;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn(
        hasIntroContent && "items-center justify-center",
        "pt-21 md:pt-24 lg:pt-26",
        "border-t-0",
        "isolate",
      )}
      sectionTheme={section_theme}
    >
      <Container>
        <div
          className={cn(
            "relative flex h-full 3xl:min-h-224 min-h-104 flex-col justify-end overflow-hidden rounded-5 px-4 py-4 md:min-h-144 md:px-16 md:py-16 lg:aspect-video",
            hasMedia && "min-h-128",
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
                  />
                </div>
              )}

              {/* Background Fade */}
              {hasIntroContent && (
                <>
                  <div className="absolute top-64 right-0 bottom-0 left-0 bg-linear-to-t from-brand/75 to-brand/0 mix-blend-overlay" />
                  <div className="absolute top-64 right-0 bottom-0 left-0 bg-linear-to-t from-brand/5 to-brand/0" />
                  <div className="absolute top-48 right-0 bottom-0 left-0 bg-linear-to-t from-fill-dark/80 to-fill-dark/0" />
                </>
              )}
            </div>
          )}
          {breadcrumbs && breadcrumbs.length > 1 && (
            <BreadcrumbNav
              items={breadcrumbs}
              colorMode={hasMedia ? "light" : "dark"}
              className="relative mb-3 md:mb-4"
            />
          )}
          {hasIntroContent && (
            <SectionIntro
              title={title}
              description={description}
              buttons={buttons}
              align={alignment ? "center" : "left"}
              sectionTheme={hasMedia ? "Night" : section_theme}
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
