import { type Content, isFilled } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { ChevronRight } from "lucide-react";
import CustomMedia from "@/components/custom-media";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { LinkProps } from "..";

type Props = LinkProps & { slice: Content.LinkSliceGrid };

const overlineThemeClasses = {
  Ocean: "bg-fill-raised",
  Sunrise: "bg-accent-fill-raised",
};

const iconWrapperThemeClasses = {
  Ocean: "bg-fill-raised/60 group-hover:bg-fill-raised",
  Sunrise: "bg-accent-fill-raised/60 group-hover:bg-accent-fill-raised",
};

const cardTitleWrapperThemeClasses = {
  Ocean: "bg-brand text-brand-ink",
  Sunrise: "bg-accent text-accent-ink-flip",
};

const cardThemeClasses = {
  Ocean: "bg-fill-raised outline-brand/0 hover:outline-brand",
  Sunrise: "bg-accent-fill-raised outline-accent/0 hover:outline-accent",
};

export function LinkGrid({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, alignment, section_theme, remove_top_padding, cards } = slice.primary;

  const cardsCount = cards.length;

  const layouts: Record<number, { grid: string; itemSpan?: (i: number) => string }> = {
    1: { grid: "grid-cols-1" },
    2: { grid: "grid-cols-1 md:grid-cols-2" },
    3: { grid: "grid-cols-1 lg:grid-cols-3" },
    4: { grid: "grid-cols-1 md:grid-cols-2" },
    5: {
      grid: "grid-cols-1 md:grid-cols-2 lg:grid-cols-6",
      itemSpan: (i) => cn(i === 4 && "md:col-span-2", i < 3 ? "lg:col-span-2" : "lg:col-span-3"),
    },
  };
  const layout = layouts[cardsCount] ?? { grid: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" };

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme}
    >
      <Container>
        {hasIntroContent && (
          <SectionIntro
            overline={overline}
            overlineClassName={overlineThemeClasses[section_theme]}
            title={title}
            description={description}
            align={alignment ? "center" : "left"}
            sectionTheme={section_theme}
          />
        )}
        {cardsCount > 0 && (
          <div className={cn("mt-8 grid gap-2 md:gap-3", layout.grid)}>
            {cards.map((card, index) => {
              const hasMedia = isFilled.image(card.image);
              return (
                <PrismicNextLink
                  key={`${index}-${card.links}`}
                  field={card.links}
                  className={cn(
                    "group flex flex-col gap-2 rounded-t-6 rounded-b-5 p-2 outline-0 transition-all duration-300 ease-in-out hover:outline-4",
                    cardThemeClasses[section_theme],
                    layout.itemSpan?.(index),
                  )}
                >
                  <div className="relative overflow-hidden rounded-t-4 rounded-b-6">
                    {hasMedia ? (
                      <CustomMedia
                        imageField={card.image}
                        className="aspect-video w-full scale-100 rounded-0 transition-all duration-1000 ease-out group-hover:scale-102 md:rounded-0 lg:rounded-0"
                        sectionTheme={section_theme}
                      />
                    ) : (
                      <div
                        className={cn(
                          "flex aspect-4/3 w-full items-center justify-center px-4 transition-colors duration-300 ease-in-out lg:aspect-video",
                          cardTitleWrapperThemeClasses[section_theme],
                        )}
                      >
                        <h3 className="line-clamp-3 text-center text-3xl">{card.title}</h3>
                      </div>
                    )}
                    <div
                      className={cn(
                        "absolute right-2 bottom-2 flex h-14 items-center justify-center gap-0.5 rounded-4 px-5 backdrop-blur-sm backdrop-brightness-150 transition-colors duration-300 ease-in-out",
                        iconWrapperThemeClasses[section_theme],
                      )}
                    >
                      {card.links.text}
                      <ChevronRight className="-mr-1.5 size-6 group-hover:animate-wiggle-grow" />
                    </div>
                  </div>
                  <div
                    className={cn(
                      "mt-1 mb-2 flex flex-col px-2 md:mb-3 md:px-5 lg:mt-2 lg:mb-4 lg:px-6",
                      alignment && "text-center",
                    )}
                  >
                    {hasMedia && <h3 className="text-xl md:text-2xl">{card.title}</h3>}
                    <p>{card.description}</p>
                  </div>
                </PrismicNextLink>
              );
            })}
          </div>
        )}
      </Container>
    </Section>
  );
}
