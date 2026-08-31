import type { Content, ImageFieldImage } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { ArrowRight } from "lucide-react";
import CustomMedia from "@/components/custom-media";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import type { SectionTheme } from "@/components/section-intro";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import { createClient } from "@/prismicio";
import type { ProducerDocument } from "@/prismicio-types";
import type { LinkProps } from "..";

type Props = LinkProps & { slice: Content.LinkSliceGrid };

/** The card itself: a label bar sitting above the image plate. Inverted cards
 * carry the selection pair of the palette they wear, not the section's. */
const cardThemeClasses: Record<SectionTheme, string> = {
  Bud: "bg-fill-raised hover:bg-fill-raised/70",
  Leaf: "bg-fill-raised text-ink hover:bg-fill-raised/70",
  Bottle: "bg-brand text-brand-ink selection-light hover:bg-brand/90",
  Dust: "bg-spot-fill-dark text-spot-ink-flip selection-spot-raised hover:bg-spot-fill-dark/90",
  Slate: "bg-spot-fill-raised text-spot-ink selection-spot hover:bg-spot-fill-raised/90",
};

/**
 * Cards render the same whether they link to an authored link or a producer
 * document; only the `PrismicNextLink` target differs. Both sources normalize
 * into this shape.
 */
type GridItem = {
  key: string;
  title: string | null | undefined;
  image: ImageFieldImage | undefined;
  link: { document: ProducerDocument } | { field: Content.LinkSliceGridPrimaryCardsItem["links"] };
};

export async function LinkGrid({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, alignment, remove_top_padding, link_source, cards } = slice.primary;
  const section_theme = slice.primary.section_theme;

  let items: GridItem[];
  if (link_source === "All Producers") {
    const client = await createClient();
    const producers = await client.getAllByType("producer");
    items = producers.map((producer) => ({
      key: producer.id,
      title: producer.data.producer_name,
      image: producer.data.producer_image,
      link: { document: producer },
    }));
  } else {
    items = cards.map((card, index) => ({
      key: `${index}-${card.title}`,
      title: card.title,
      image: card.image,
      link: { field: card.links },
    }));
  }

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme}
    >
      <Container className="flex flex-col gap-6 md:gap-8 lg:gap-12">
        {hasIntroContent && (
          <SectionIntro
            overline={overline}
            title={title}
            description={description}
            align={alignment ? "center" : "left"}
            sectionTheme={section_theme}
          />
        )}

        {items.length > 0 && (
          <ul className="grid list-none grid-cols-2 gap-1 md:grid-cols-3 md:gap-2 lg:grid-cols-4">
            {items.map((item) => (
              <li key={item.key}>
                <PrismicNextLink
                  {...item.link}
                  className={cn(
                    "group flex h-full flex-col overflow-hidden rounded-2 transition-all duration-500 ease-in-out",
                    "hover:[&_svg]:[animation:var(--animate-wiggle-grow)]",
                    cardThemeClasses[section_theme],
                  )}
                >
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5 md:px-4 md:py-3">
                    <span className="line-clamp-1 font-medium text-xs md:text-sm">{item.title}</span>
                    {/* Hidden on mobile: cards are too narrow to spare the width. */}
                    <ArrowRight className="hidden size-4 shrink-0 md:block" />
                  </div>
                  <div className="px-1 pb-1 md:px-2 md:pb-2">
                    <div className="overflow-hidden rounded-1">
                      <CustomMedia
                        imageField={item.image}
                        className="aspect-[4/3] w-full rounded-0 object-contain duration-1000 ease-out group-hover:scale-103"
                        sectionTheme={section_theme}
                      />
                    </div>
                  </div>
                </PrismicNextLink>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}
