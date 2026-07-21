import type { Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { ArrowRight } from "lucide-react";
import CustomMedia from "@/components/custom-media";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { LinkProps } from "..";

type Props = LinkProps & { slice: Content.LinkSliceCards };

/**
 * Three across on desktop, except for counts that divide evenly in two — two
 * and four look lopsided in a three-column grid, so they get their own row
 * shape. Everything else (1, 3, 5, 6, …) falls back to three.
 */
function gridColumns(count: number) {
  return count === 2 || count === 4 ? "lg:grid-cols-2" : "lg:grid-cols-3";
}

export function LinkCards({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, alignment, section_theme, remove_top_padding, cards } = slice.primary;

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

        {cards.length > 0 && (
          /*
           * Below lg the cards scroll sideways and bleed to the viewport edge so
           * the next card peeks in and hints at the overflow. From lg up the same
           * markup becomes a plain grid.
           */
          <ul
            className={cn(
              "-mx-4 flex snap-x snap-mandatory list-none gap-3 overflow-x-auto px-4 scroll-pl-4 md:-mx-6 md:px-6 md:scroll-pl-6",
              "lg:mx-0 lg:grid lg:snap-none lg:overflow-visible lg:px-0 lg:pb-0",
              "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              gridColumns(cards.length),
            )}
          >
            {cards.map((card, index) => (
              <li
                key={`${index}-${card.title}`}
                className="w-[78%] shrink-0 snap-start sm:w-[52%] md:w-[40%] lg:w-auto"
              >
                <PrismicNextLink
                  field={card.links}
                  className="group relative isolate flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-2 p-4 text-ink-flip transition-all duration-300 ease-in-out md:p-5 hover:[&_svg]:[animation:var(--animate-wiggle-grow)]"
                >
                  <CustomMedia
                    imageField={card.image}
                    className="absolute inset-0 size-full rounded-0 object-cover transition-transform duration-1000 ease-out group-hover:scale-105 md:rounded-0 lg:rounded-0"
                    sectionTheme={section_theme}
                  />
                  {/*
                   * Color wash — a gradient that *blends* with the photo (overlay) rather than
                   * sitting flatly on top of it. `isolate` on the card above fences the blend to
                   * this card instead of mixing with the page behind it. Fade through a transparent
                   * version of the same hue (yellow-800/0), not `via-transparent` — plain
                   * transparent is transparent *black* and muddies the midpoint.
                   */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-yellow-600/60 via-yellow-800/0 to-yellow-900/70 mix-blend-overlay" />

                  {/*
                   * Progressive blur — one backdrop-blur layer, masked so it's fully present at the
                   * top and bottom edges and fades to nothing through the middle. The mask's alpha
                   * ramp (opaque → transparent → opaque) is what makes the blur feel gradual.
                   */}
                  <div className="pointer-events-none absolute inset-0 backdrop-blur-md [mask-image:linear-gradient(to_bottom,black,transparent_25%,transparent_75%,black)]" />

                  {/* Legibility fade — plain dark gradient so the title/description stay readable. */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-spot-fill-dark/30 via-spot-fill-dark/0 to-spot-fill-dark/70" />

                  <div className="relative flex items-start justify-between gap-3">
                    <h3 className="font-primary text-lg italic md:text-xl">{card.title}</h3>
                    <ArrowRight className="size-5 shrink-0" />
                  </div>

                  <p className="relative text-pretty font-secondary text-sm leading-snug md:text-base">
                    {card.description}
                  </p>
                </PrismicNextLink>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}
