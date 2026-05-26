import { asLink, type Content, isFilled } from "@prismicio/client";
import { BreadcrumbNav } from "@/components/breadcrumb";
import CustomMedia from "@/components/custom-media";
import { InfoItems } from "@/components/info-items";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn } from "@/lib/utils";
import type { HeroProps } from "..";

type Props = HeroProps & { slice: Content.HeroSliceSplit };

const containerThemeClasses = {
  Ocean: "md:bg-fill-raised",
  Sunrise: "md:bg-accent-fill-raised",
};

const infoItemsThemeClasses = {
  Ocean: "bg-fill-raised md:bg-fill",
  Sunrise: "bg-accent-fill-raised md:bg-accent-fill",
};

const overlineThemeClasses = {
  Ocean: "bg-fill-raised md:bg-fill",
  Sunrise: "bg-accent-fill-raised md:bg-accent-fill",
};

export function HeroSplit({ slice, context }: Props) {
  const {
    overline,
    title,
    description,
    alignment,
    section_theme,
    media,
    details,
    buttons,
  } = slice.primary;

  const breadcrumbs = context?.breadcrumbs;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="border-t-0 pt-22 md:pt-24 lg:pt-28"
      sectionTheme={section_theme}
    >
      <Container
        className={cn(
          "flex flex-col gap-4 lg:flex-row lg:gap-3",
          alignment ? "lg:flex-row" : "lg:flex-row-reverse",
        )}
      >
        {media[0] && (
          <CustomMedia
            imageField={
              isFilled.linkToMedia(media[0].video) ? undefined : media[0].image
            }
            videoSrc={
              isFilled.linkToMedia(media[0].video)
                ? media[0].video.url
                : undefined
            }
            className="aspect-square h-auto w-full md:aspect-video lg:aspect-square lg:w-1/2"
            filter={media[0].filter}
            preload
          />
        )}
        <div
          className={cn(
            "flex w-full flex-col justify-center rounded-5 transition-colors duration-500 md:p-4 lg:aspect-square lg:w-1/2 lg:p-12",
            containerThemeClasses[section_theme],
          )}
        >
          {breadcrumbs && breadcrumbs.length > 1 && (
            <BreadcrumbNav
              items={breadcrumbs}
              className="mb-1.5 -ml-2"
              sectionTheme={section_theme}
            />
          )}
          <SectionIntro
            overline={overline}
            overlineClassName={overlineThemeClasses[section_theme]}
            title={title}
            description={description}
            align="left"
            buttons={buttons}
            sectionTheme={section_theme}
            buttonClassName="w-full md:w-auto"
          />
          {details && details.length > 0 && (
            <InfoItems
              className="mt-4"
              theme={section_theme}
              itemClassName={infoItemsThemeClasses[section_theme]}
              items={details.map((item) => ({
                icon: item.icon,
                label: item.label,
                value: item.text,
                href: isFilled.link(item.link) ? asLink(item.link) : null,
                clickable: isFilled.link(item.link),
              }))}
            />
          )}
        </div>
      </Container>
    </Section>
  );
}
