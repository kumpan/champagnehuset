import type { Content } from "@prismicio/client";
import { asLink, isFilled } from "@prismicio/client";

import CustomMedia from "@/components/custom-media";
import { InfoItems } from "@/components/info-items";
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

// Info rows need a fill one step apart from the card behind them: light "Bud"
// rows (bg-fill) read on both the green Bottle card and the bg-fill-raised
// Leaf card.
const itemClasses: Record<SectionTheme, SectionTheme> = {
  Bud: "Bud",
  Leaf: "Bud",
  Bottle: "Bud",
  Dust: "Dust",
  Slate: "Slate",
};

type Props = CalloutProps & { slice: Content.CalloutSliceContact };

export function CalloutContact({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, buttons, remove_top_padding, image_side, media, contact_items } = slice.primary;
  const section_theme = (slice.primary.section_theme as string) === "Brand" ? "Bottle" : slice.primary.section_theme;
  const content_theme = introClasses[section_theme];
  const item_theme = itemClasses[section_theme];

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
    theme: item_theme,
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
                title={title}
                description={description}
                descriptionClassName="text-pretty"
                buttons={buttons}
                align="left"
                sectionTheme={content_theme}
                surface={section_theme === "Bottle" ? "brand" : undefined}
                buttonWrapperClassName="mt-3 md:mt-4"
                textBalance={true}
              />
            )}
            {items.length > 0 && <InfoItems items={items} theme={item_theme} />}
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
