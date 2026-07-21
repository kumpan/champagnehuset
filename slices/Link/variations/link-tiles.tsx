import type { Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { ArrowRight } from "lucide-react";
import CustomMedia from "@/components/custom-media";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import type { SectionTheme } from "@/components/section-intro";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { LinkProps } from "..";

type Props = LinkProps & { slice: Content.LinkSliceTiles };

const descriptionThemeClasses: Record<SectionTheme, string> = {
  Bud: "text-ink-dim",
  Leaf: "text-ink-dim",
  Brand: "text-ink-flip/80",
  Dust: "text-spot-ink-dim",
  Slate: "text-spot-ink-flip/80",
};

/**
 * Two across by default. Counts that divide by three (3, 6) — plus 5, which
 * leaves a tidier last row at three than at two — get a third column.
 * Stays single-column through md.
 */
function gridColumns(count: number) {
  return count === 3 || count === 5 || count === 6 ? "lg:grid-cols-3" : "lg:grid-cols-2";
}

export function LinkTiles({ slice }: Props) {
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
          <ul
            className={cn(
              "grid list-none grid-cols-1 gap-x-6 gap-y-5 lg:gap-x-8 lg:gap-y-6",
              gridColumns(cards.length),
            )}
          >
            {cards.map((card, index) => (
              <li
                key={`${index}-${card.title}`}
                className="group border-current/20 not-last:border-b not-last:pb-4 lg:not-last:border-b-0 lg:not-last:pb-0"
              >
                <PrismicNextLink
                  field={card.links}
                  className="flex h-full flex-col gap-3 transition-all duration-300 ease-in-out hover:[&_svg]:[animation:var(--animate-wiggle-grow)]"
                >
                  <div className="overflow-hidden rounded-2">
                    <CustomMedia
                      imageField={card.image}
                      className="aspect-video w-full rounded-0 object-cover transition-transform duration-1000 ease-out group-hover:scale-103"
                      sectionTheme={section_theme}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-base md:text-lg">{card.title}</h3>
                      <ArrowRight className="size-5 shrink-0" />
                    </div>
                    <p className={cn("text-pretty text-sm leading-snug", descriptionThemeClasses[section_theme])}>
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
