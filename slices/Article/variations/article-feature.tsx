import { type Content, isFilled } from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";

import { Button } from "@/components/button";
import { iconMap } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { createClient } from "@/prismicio";
import type { ArticleDocument } from "@/prismicio-types";
import type { ArticleProps } from "..";
import { formatArticleDate } from "../article-card";

type Props = ArticleProps & { slice: Content.ArticleSliceFeature };

// TODO: placeholder, rough pass at the featured-rows layout, to be redone.

const dimThemeClasses = {
  Bud: "text-ink-dim",
  Dust: "text-accent-ink-dim",
};

export async function ArticleFeature({ slice }: Props) {
  const { section_theme, remove_top_padding, featured_articles, link_label } = slice.primary;
  const ArrowRight = iconMap.arrowRight;

  const client = await createClient();

  // One getByIDs (not getByID per item, which throws on any unresolved reference)
  // so unpublished/deleted/stale featured references are dropped, not fatal.
  // getByIDs ignores the requested order, so re-sort into the editor's curated order.
  const curatedIds = featured_articles
    .map((item) => item.article)
    .filter(isFilled.contentRelationship)
    .map((relationship) => relationship.id);
  const curatedById = new Map(
    curatedIds.length > 0
      ? (await client.getByIDs<ArticleDocument>(curatedIds, { lang: "*" })).results.map((doc) => [doc.id, doc])
      : [],
  );
  const articles = curatedIds.map((id) => curatedById.get(id)).filter((doc) => doc !== undefined);

  if (articles.length === 0) return null;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme}
    >
      <Container>
        <div className="flex flex-col">
          {articles.map((article) => {
            const { tag, article_title, article_image, article_date } = article.data;
            const date = formatArticleDate(article_date ?? article.first_publication_date);
            return (
              <article
                key={article.id}
                className="flex flex-col gap-2 border-border border-b py-4 last:border-b-0 md:flex-row md:items-center md:gap-8 md:py-6 md:even:flex-row-reverse"
              >
                <PrismicNextLink
                  document={article}
                  className="group block w-full shrink-0 overflow-hidden rounded-1 md:w-2/5"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <PrismicNextImage
                    field={article_image}
                    className="aspect-3/2 h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-103 md:aspect-5/4"
                    fallbackAlt=""
                  />
                </PrismicNextLink>
                <div className="flex flex-1 flex-col items-start gap-2 md:gap-6 md:py-8">
                  <div className="flex flex-col gap-2 md:pb-4">
                    <div className={`flex items-center gap-2 text-base md:text-lg ${dimThemeClasses[section_theme]}`}>
                      {tag && <span>{tag}</span>}
                      {tag && date && <span aria-hidden="true">•</span>}
                      {date && <span>{date}</span>}
                    </div>
                    <PrismicNextLink document={article}>
                      <h3 className="text-balance font-medium text-xl leading-tight md:font-normal md:font-primary md:text-4xl md:leading-[1.2] xl:text-5xl">
                        {article_title}
                      </h3>
                    </PrismicNextLink>
                  </div>
                  <Button asChild sectionTheme={section_theme} className="hidden md:inline-flex">
                    <PrismicNextLink document={article}>
                      <span>{link_label || "Läs mer"}</span>
                      <ArrowRight />
                    </PrismicNextLink>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
