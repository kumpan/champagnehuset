import type { Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { LinkProps } from "..";

type Props = LinkProps & { slice: Content.LinkSliceQuick };

const overlineThemeClasses = {
  Ocean: "bg-fill-raised",
  Sunrise: "bg-accent-fill-raised",
};

const linkThemeClasses = {
  Ocean: "bg-fill-raised outline-brand/0 hover:outline-brand",
  Sunrise: "bg-accent-fill-raised outline-accent/0 hover:outline-accent",
};

export function LinkQuick({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, alignment, section_theme, remove_top_padding, links } = slice.primary;

  const grid = cn(
    "grid-cols-1",
    links.length % 2 === 0 && "md:grid-cols-2",
    links.length % 3 === 0 && "lg:grid-cols-3",
  );

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
        {links.length > 0 && (
          <div className={cn("mt-8 grid gap-2 lg:gap-3", grid)}>
            {links.map((link) => (
              <PrismicNextLink
                key={link.key}
                field={link}
                className={cn(
                  "group flex h-16 items-center justify-between rounded-4 px-4 text-lg outline-0 transition-all duration-300 ease-in-out hover:outline-4 md:h-18 md:px-7 md:text-xl lg:h-20 lg:px-7",
                  linkThemeClasses[section_theme],
                )}
              >
                {link.text}
                <ChevronRight className="-mr-0.5 size-6 group-hover:animate-wiggle-grow md:size-7" />
              </PrismicNextLink>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
