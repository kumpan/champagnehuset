import type { Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import type { SectionTheme } from "@/components/section-intro";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { LinkProps } from "..";

type Props = LinkProps & { slice: Content.LinkSliceQuick };

/**
 * Rows read as a divided list on mobile and as filled pills from `md` up, so
 * the fill and its hover state only kick in at that breakpoint.
 */
const rowThemeClasses: Record<SectionTheme, string> = {
  Bud: "md:bg-fill-raised md:hover:bg-fill-raised/70",
  Leaf: "md:bg-fill-raised md:hover:bg-fill-raised/70",
  Bottle: "md:bg-brand md:text-brand-ink md:selection-light md:hover:bg-brand/90",
  Dust: "md:bg-spot-ink/5 md:hover:bg-spot-ink/10",
  Slate: "md:bg-spot-ink-flip/10 md:hover:bg-spot-ink-flip/20",
};

/**
 * Desktop runs on a six-column grid where each link spans two, so three per row.
 * A row that would end short instead stretches its trailing links to fill the
 * remaining columns, so there is never a visible gap:
 *
 *   5 links → 3 spanning 2, then 2 spanning 3
 *   7 links → 6 spanning 2, then 1 spanning 6
 *
 * Two and four links never divide into thirds cleanly, so they drop to a
 * straight two-column layout instead.
 */
function quickLayout(count: number) {
  if (count === 2 || count === 4) {
    return { grid: "lg:grid-cols-2", span: () => "" };
  }

  const trailing = count % 3;

  return {
    grid: "lg:grid-cols-6",
    span: (index: number) => {
      const isTrailing = trailing > 0 && index >= count - trailing;
      if (!isTrailing) return "lg:col-span-2";
      return trailing === 1 ? "lg:col-span-6" : "lg:col-span-3";
    },
  };
}

export function LinkQuick({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, alignment, remove_top_padding, links } = slice.primary;
  const section_theme = (slice.primary.section_theme as string) === "Brand" ? "Bottle" : slice.primary.section_theme;

  const layout = quickLayout(links.length);

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

        {links.length > 0 && (
          <ul className={cn("grid list-none grid-cols-1 gap-0 md:grid-cols-2 md:gap-2", layout.grid)}>
            {links.map((link, index) => (
              <li key={`${index}-${link.text}`} className={layout.span(index)}>
                <PrismicNextLink
                  field={link}
                  className={cn(
                    "group flex items-center justify-between gap-3 border-current/20 border-b px-1 py-4 text-sm transition-colors duration-300 ease-out",
                    "md:rounded-1 md:border-0 md:px-6 md:py-5 md:text-base",
                    rowThemeClasses[section_theme],
                  )}
                >
                  <span className="text-pretty md:text-lg">{link.text}</span>
                  <ChevronRight className="size-5 shrink-0 opacity-65 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100 md:size-6" />
                </PrismicNextLink>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}
