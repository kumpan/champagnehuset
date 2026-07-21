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

type Props = LinkProps & { slice: Content.LinkSliceGrid };

/** The card itself — a label bar sitting above the image plate. */
const cardThemeClasses: Record<SectionTheme, string> = {
  Bud: "bg-fill-raised text-ink hover:bg-fill-raised/70",
  Leaf: "bg-fill text-ink hover:bg-fill/70",
  Brand: "bg-ink-flip/10 text-ink-flip hover:bg-ink-flip/20",
  Dust: "bg-spot-ink/5 text-spot-ink hover:bg-spot-ink/10",
  Slate: "bg-spot-ink-flip/10 text-spot-ink-flip hover:bg-spot-ink-flip/20",
};

export function LinkGrid({ slice }: Props) {
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
          <ul className="grid list-none grid-cols-2 gap-1 md:grid-cols-3 md:gap-2 lg:grid-cols-4">
            {cards.map((card, index) => (
              <li key={`${index}-${card.title}`}>
                <PrismicNextLink
                  field={card.links}
                  className={cn(
                    "group flex h-full flex-col overflow-hidden rounded-2 transition-all duration-300 ease-in-out",
                    "hover:[&_svg]:[animation:var(--animate-wiggle-grow)]",
                    cardThemeClasses[section_theme],
                  )}
                >
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5 md:px-4 md:py-3">
                    <span className="line-clamp-1 font-medium text-xs md:text-sm">{card.title}</span>
                    {/* Hidden on mobile — the cards are too narrow to spare the width. */}
                    <ArrowRight className="hidden size-4 shrink-0 md:block" />
                  </div>
                  <div className="px-1 md:px-2 pb-1 md:pb-2">
                    <CustomMedia
                      imageField={card.image}
                      className="aspect-[4/3] w-full rounded-1 object-contain"
                      sectionTheme={section_theme}
                    />
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
