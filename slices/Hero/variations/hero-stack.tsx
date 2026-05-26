import type { Content } from "@prismicio/client";
import { isFilled } from "@prismicio/client";
import { BreadcrumbNav } from "@/components/breadcrumb";
import CustomMedia from "@/components/custom-media";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { hasSectionIntroContent } from "@/lib/utils";
import type { HeroProps } from "..";

type Props = HeroProps & { slice: Content.HeroSliceStack };

const overlineThemeClasses = {
  Ocean: "bg-fill-raised",
  Sunrise: "bg-accent-fill-raised",
};

export function HeroStack({ slice, context }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, buttons, section_theme, media } =
    slice.primary;

  const breadcrumbs = context?.breadcrumbs;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="border-t-0 pt-32 md:pt-40 lg:pt-48"
      sectionTheme={section_theme}
    >
      <Container>
        {breadcrumbs && breadcrumbs.length > 1 && (
          <BreadcrumbNav
            className="mx-auto mb-8 flex justify-center md:mb-4"
            items={breadcrumbs}
            colorMode="dark"
            sectionTheme={section_theme}
          />
        )}
        {hasIntroContent && (
          <SectionIntro
            overline={overline}
            overlineClassName={overlineThemeClasses[section_theme]}
            title={title}
            description={description}
            buttons={buttons}
            align="center"
            textBalance={true}
            sectionTheme={section_theme}
          />
        )}
        {media[0] && (
          <CustomMedia
            className="mt-8 aspect-video w-full"
            thumbnail="square md:main"
            imageField={
              isFilled.linkToMedia(media[0].video) ? undefined : media[0].image
            }
            videoSrc={
              isFilled.linkToMedia(media[0].video)
                ? media[0].video.url
                : undefined
            }
            filter={media[0].filter}
          />
        )}
      </Container>
    </Section>
  );
}
