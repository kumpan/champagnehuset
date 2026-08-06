import { type Content, isFilled } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import articleModel from "@/customtypes/article/index.json";
import { hasSectionIntroContent } from "@/lib/utils";
import { createClient } from "@/prismicio";
import type { ArticleDocument } from "@/prismicio-types";
import type { ArticleProps } from "..";
import { ArticleGrid } from "../article-grid";
import { PAGE_SIZE } from "../constants";

type Props = ArticleProps & { slice: Content.ArticleSliceList };

// Canonical chip order comes from the `tag` select field model file.
const TAG_ORDER = articleModel.json.Main.tag.config.options;

export async function ArticleList({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const {
    overline,
    title,
    description,
    button,
    section_theme,
    remove_top_padding,
    featured_articles,
    filter_by_tag,
    show_pagination,
    show_filter_chips,
  } = slice.primary;

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
  const curated = curatedIds.map((id) => curatedById.get(id)).filter((doc) => doc !== undefined);

  const pool =
    curated.length > 0
      ? curated
      : await client.getAllByType("article", {
          orderings: [{ field: "my.article.article_date", direction: "desc" }],
        });

  // Fixed tag filter narrows the pool; "All" means no filter.
  const tagFilter = filter_by_tag && filter_by_tag !== "All" ? filter_by_tag : null;
  const articles = tagFilter ? pool.filter((article) => article.data.tag === tagFilter) : pool;

  // Chips are for the open feed, when a fixed tag i set hide the filter chips
  const showChips = Boolean(show_filter_chips) && !tagFilter;

  // ArticleGrid paginates client-side and only renders the current page into the
  // DOM, so a crawler would otherwise see just the first page of article links.
  // When this is a full paginated feed with more articles than fit on page one,
  // emit a server-rendered crawlable <a href> to every article. display:none
  // keeps it out of the tab order and the a11y tree (the visible grid already
  // serves those users) while Googlebot still reads the links from the HTML.
  const showPagination = show_pagination !== false;
  const showCrawlableIndex = showPagination && articles.length > PAGE_SIZE;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme}
    >
      <Container>
        {(hasIntroContent || (button[0] && isFilled.link(button[0].link))) && (
          <SectionIntro
            overline={overline}
            title={title}
            description={description}
            buttons={button}
            align="split"
            sectionTheme={section_theme}
          />
        )}
        <ArticleGrid
          articles={articles}
          tagOrder={TAG_ORDER}
          sectionTheme={section_theme}
          showPagination={showPagination}
          showChips={showChips}
          className="mt-8"
        />
        {showCrawlableIndex && (
          <nav aria-hidden="true" className="hidden">
            <ul>
              {articles.map((article) => (
                <li key={article.id}>
                  <PrismicNextLink document={article}>{article.data.article_title}</PrismicNextLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </Container>
    </Section>
  );
}
