import type { Content } from "@prismicio/client";
import { asLink, isFilled } from "@prismicio/client";

import CustomMedia from "@/components/custom-media";
import { InfoItems } from "@/components/info-items";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { CalloutProps } from "..";

const containerClasses: Record<string, string> = {
  Bud: "bg-fill-raised",
  Leaf: "bg-fill",
  Brand: "bg-fill-raised/15",
  Dust: "bg-spot-fill-dark/10",
  Slate: "bg-spot-fill-dark",
};

type Props = CalloutProps & { slice: Content.CalloutSliceContact };

export function CalloutContact({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, buttons, section_theme, remove_top_padding, image_side, media, contact_items } =
    slice.primary;

  const mediaItem = media[0];
  const hasMedia = mediaItem && (isFilled.image(mediaItem.image) || isFilled.linkToMedia(mediaItem.video));

  // The link carries both halves of a row: its text is the displayed value (and what the
  // copy button copies), its URL the tel:/mailto:/maps target.
  const items = contact_items.map((item) => ({
    icon: item.icon,
    label: item.label,
    value: item.link.text,
    href: asLink(item.link),
    clickable: isFilled.link(item.link),
    theme: section_theme,
  }));

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
              "flex flex-col justify-center gap-6 p-4 pt-6 md:gap-8 md:p-6 md:pt-8 lg:p-12",
              hasMedia && "lg:aspect-square lg:w-1/2",
            )}
          >
            {hasIntroContent && (
              <SectionIntro
                overline={overline}
                overlineClassName={section_theme}
                title={title}
                description={description}
                descriptionClassName="text-pretty"
                buttons={buttons}
                align="left"
                sectionTheme={section_theme}
                buttonWrapperClassName="mt-3 md:mt-4"
                textBalance={true}
              />
            )}
            {items.length > 0 && <InfoItems items={items} theme={section_theme} />}
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
