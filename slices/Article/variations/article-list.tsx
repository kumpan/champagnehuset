import { type Content, isFilled } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { Button } from "@/components/button";
import { type IconName, iconMap } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import { createClient } from "@/prismicio";
import type { ArticleDocument } from "@/prismicio-types";
import type { ArticleProps } from "..";
import { ArticleCard } from "../article-card";

type Props = ArticleProps & { slice: Content.ArticleSliceList };

function isIconName(value: unknown): value is IconName {
  return typeof value === "string" && value in iconMap;
}

// TODO: placeholder — static markup only, wire up real page-based pagination.
function PaginationPlaceholder() {
  const ChevronLeft = iconMap.chevronLeft;
  const ChevronRight = iconMap.chevronRight;
  return (
    <div className="flex items-center justify-center gap-4 pt-3">
      <span className="flex size-14 items-center justify-center rounded-2 bg-fill-dark/10">
        <ChevronLeft className="size-8 opacity-50" />
      </span>
      <div className="flex items-center">
        {[1, 2, 3, 4].map((page) => (
          <span
            key={page}
            className={cn(
              "flex size-8 items-center justify-center rounded-2 font-medium text-base",
              page === 1 && "bg-brand text-brand-ink",
            )}
          >
            {page}
          </span>
        ))}
      </div>
      <span className="flex size-14 items-center justify-center rounded-2 bg-brand text-brand-ink">
        <ChevronRight className="size-8" />
      </span>
    </div>
  );
}

export async function ArticleList({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, alignment, button, section_theme, remove_top_padding, featured_articles } =
    slice.primary;

  const client = await createClient();

  const curated = (
    await Promise.all(
      featured_articles.map((item) =>
        isFilled.contentRelationship(item.article) ? client.getByID<ArticleDocument>(item.article.id) : null,
      ),
    )
  ).filter((article): article is ArticleDocument => article !== null);

  const articles =
    curated.length > 0
      ? curated
      : await client.getAllByType("article", {
          orderings: [{ field: "my.article.article_date", direction: "desc" }],
        });

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme}
    >
      <Container>
        {(hasIntroContent || (button[0] && isFilled.link(button[0].link))) && (
          <div
            className={cn(
              "flex flex-col gap-4 md:gap-8",
              alignment ? "items-center justify-center" : "items-start justify-between md:flex-row md:items-end",
            )}
          >
            {hasIntroContent && (
              <SectionIntro
                overline={overline}
                title={title}
                description={description}
                align={alignment ? "center" : "left"}
                sectionTheme={section_theme}
                className={alignment ? undefined : "flex-1"}
              />
            )}
            {button[0] &&
              isFilled.link(button[0].link) &&
              (() => {
                const btn = button[0];
                const LeftIcon = isIconName(btn.icon_left) ? iconMap[btn.icon_left] : null;
                const RightIcon = isIconName(btn.icon_right) ? iconMap[btn.icon_right] : null;
                return (
                  <Button asChild size="lg" sectionTheme={section_theme} className="shrink-0">
                    <PrismicNextLink field={btn.link}>
                      {LeftIcon && <LeftIcon />}
                      <span>{btn.link.text}</span>
                      {RightIcon && <RightIcon />}
                    </PrismicNextLink>
                  </Button>
                );
              })()}
          </div>
        )}
        {articles.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} sectionTheme={section_theme} className="w-full" />
            ))}
          </div>
        )}
        <PaginationPlaceholder />
      </Container>
    </Section>
  );
}
