import { type Content, type ImageFieldImage, isFilled } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { ArrowRight } from "lucide-react";
import CustomMedia from "@/components/custom-media";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { hasSectionIntroContent } from "@/lib/utils";
import { createClient } from "@/prismicio";
import type { ProducerDocument } from "@/prismicio-types";
import type { LinkProps } from "..";

type Props = LinkProps & { slice: Content.LinkSliceGrid };

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
  const { overline, title, description, alignment, remove_top_padding, link_source, featured_producers, cards } =
    slice.primary;
  const section_theme = slice.primary.section_theme;

  let items: GridItem[];
  if (link_source === "Producers") {
    const client = await createClient();
    const featured = (
      await Promise.all(
        featured_producers.map((item) =>
          isFilled.contentRelationship(item.producer) ? client.getByID<ProducerDocument>(item.producer.id) : null,
        ),
      )
    ).filter((producer): producer is ProducerDocument => producer !== null);

    // A curated list keeps the editor's order. Otherwise every producer, A to Z.
    const producers =
      featured.length > 0
        ? featured
        : (await client.getAllByType("producer")).sort((a, b) =>
            (a.data.producer_name ?? "").localeCompare(b.data.producer_name ?? "", "sv"),
          );
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
          <ul className="grid list-none grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4">
            {items.map((item) => (
              <li key={item.key}>
                <PrismicNextLink
                  {...item.link}
                  className="group relative isolate flex aspect-3/4 flex-col justify-end overflow-hidden rounded-2 p-4 text-ink-flip transition-all duration-300 ease-in-out md:p-5 hover:[&_svg]:[animation:var(--animate-wiggle-grow)]"
                >
                  <CustomMedia
                    imageField={item.image}
                    className="absolute inset-0 size-full rounded-0 object-cover transition-transform duration-1500 ease-out group-hover:scale-103"
                    sectionTheme={section_theme}
                    sizes="(min-width: 64rem) 25vw, (min-width: 48rem) 33vw, 50vw"
                  />

                  <div className="relative -mx-4 -mb-4 px-4 pt-12 pb-4 md:-mx-5 md:-mb-5 md:px-5 md:pt-16 md:pb-5">
                    {/* Bottom Fade */}
                    <div className="pointer-events-none absolute inset-0 backdrop-blur-md [mask-image:linear-gradient(to_top,black,transparent)]" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-spot-fill-dark/50 to-spot-fill-dark/0" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-spot-fill/50 to-spot-fill/0 mix-blend-overlay" />
                    <div className="relative flex items-end justify-between gap-3">
                      <h3 className="text-pretty font-primary text-lg md:text-xl">{item.title}</h3>
                      {/* Hidden on mobile: cards are too narrow to spare the width. */}
                      <ArrowRight className="mb-0.5 size-5 shrink-0 md:mb-0 md:block md:size-6.5" />
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
