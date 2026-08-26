import type { Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { ArrowRight } from "lucide-react";
import CustomMedia from "@/components/custom-media";
import { Container } from "@/components/layout/container";
import { normalizeSectionTheme, Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { LinkProps } from "..";

type Props = LinkProps & { slice: Content.LinkSliceCards };

/**
 * Three across on desktop, except counts that divide evenly in two: two and
 * four look lopsided in a three-column grid, so they get their own row shape.
 * Everything else (1, 3, 5, 6, …) falls back to three.
 */
function gridColumns(count: number) {
  return count === 2 || count === 4 ? "lg:grid-cols-2" : "lg:grid-cols-3";
}

export function LinkCards({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, alignment, remove_top_padding, cards } = slice.primary;
  const section_theme = normalizeSectionTheme(slice.primary.section_theme);

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
              "-mx-4 flex snap-x snap-mandatory scroll-pl-4 list-none gap-3 overflow-x-auto px-4 md:-mx-6 md:scroll-pl-6 md:px-6",
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
                  className="group relative isolate flex aspect-3/4 flex-col justify-between overflow-hidden rounded-2 p-4 text-ink-flip transition-all duration-300 ease-in-out md:p-5 hover:[&_svg]:[animation:var(--animate-wiggle-grow)]"
                >
                  <CustomMedia
                    imageField={card.image}
                    className="absolute inset-0 size-full rounded-0 object-cover transition-transform duration-1500 ease-out group-hover:scale-103"
                    sectionTheme={section_theme}
                  />

                  {/* Top Fade */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-5/20">
                    <div className="absolute inset-0 backdrop-blur-md [mask-image:linear-gradient(to_bottom,black,transparent)]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-spot-fill-dark/75 to-spot-fill-dark/0" />
                    <div className="absolute inset-0 bg-gradient-to-b from-yellow-600/25 to-yellow-600/0 mix-blend-overlay" />
                  </div>

                  <div className="relative flex items-start justify-between gap-3">
                    <h3 className="mt-0.25 font-primary text-xl md:mt-0 md:text-2xl">{card.title}</h3>
                    <ArrowRight className="size-6 shrink-0 md:size-7" />
                  </div>

                  <div className="relative -mx-4 -mb-4 px-4 pt-18 pb-4 md:-mx-5 md:-mb-5 md:px-5 md:pt-24 md:pb-5">
                    {/* Bottom Fade, responsive height */}
                    <div className="pointer-events-none absolute inset-0 backdrop-blur-md [mask-image:linear-gradient(to_top,black,transparent)]" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-spot-fill-dark/50 to-spot-fill-dark/0" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-spot-fill/50 to-spot-fill/0 mix-blend-overlay" />
                    <p className="relative line-clamp-6 text-pretty leading-snug">{card.description}</p>
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
