import type { Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { ArrowRight } from "lucide-react";
import CustomMedia from "@/components/custom-media";
import { Container } from "@/components/layout/container";
import { normalizeSectionTheme, Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { LinkProps } from "..";

type Props = LinkProps & { slice: Content.LinkSliceTiles };

/**
 * Two across by default. Counts divisible by three (3, 6), plus 5 (a tidier last
 * row at three than at two), get a third column. Single-column through md.
 */
function gridColumns(count: number) {
  return count === 3 || count === 5 || count === 6 ? "lg:grid-cols-3" : "lg:grid-cols-2";
}

export function LinkTiles({ slice }: Props) {
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
          <ul
            className={cn(
              "grid list-none grid-cols-1 gap-x-6 gap-y-5 lg:gap-x-8 lg:gap-y-6",
              gridColumns(cards.length),
            )}
          >
            {cards.map((card, index) => (
              <li key={`${index}-${card.title}`} className="group">
                <PrismicNextLink
                  field={card.links}
                  className="relative isolate flex aspect-video flex-col justify-between overflow-hidden rounded-2 p-4 text-ink-flip transition-all duration-300 ease-in-out md:p-5 hover:[&_svg]:[animation:var(--animate-wiggle-grow)]"
                >
                  <CustomMedia
                    imageField={card.image}
                    className="absolute inset-0 size-full rounded-0 object-cover transition-transform duration-1000 ease-out group-hover:scale-103"
                    sectionTheme={section_theme}
                  />

                  {/* Top Fade */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-6/20">
                    <div className="absolute inset-0 backdrop-blur-md [mask-image:linear-gradient(to_bottom,black,transparent)]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-spot-fill-dark/75 to-spot-fill-dark/0" />
                    <div className="absolute inset-0 bg-gradient-to-b from-yellow-600/25 to-yellow-600/0 mix-blend-overlay" />
                  </div>

                  <div className="relative flex items-start justify-between gap-3">
                    <h3 className="mt-0.25 font-primary text-xl md:mt-0 md:text-2xl">{card.title}</h3>
                    <ArrowRight className="size-6 shrink-0 md:size-7" />
                  </div>

                  <div className="relative -mx-4 -mb-4 px-4 pt-12 pb-4 transition-[padding] duration-500 ease-out group-hover:pt-16 md:-mx-5 md:-mb-5 md:px-5 md:pt-16 md:pb-5 md:group-hover:pt-20">
                    {/* Bottom Fade, grows on hover via the wrapper's top padding */}
                    <div className="pointer-events-none absolute inset-0 backdrop-blur-md [mask-image:linear-gradient(to_top,black,transparent)]" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-spot-fill-dark/50 to-spot-fill-dark/0" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-spot-fill/50 to-spot-fill/0 mix-blend-overlay" />
                    <p className="relative line-clamp-2 text-pretty text-sm leading-snug md:line-clamp-3">
                      {card.description}
                    </p>
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
