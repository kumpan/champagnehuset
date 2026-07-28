import { type Content, isFilled } from "@prismicio/client";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { hasSectionIntroContent } from "@/lib/utils";
import { createClient } from "@/prismicio";
import type { ArticleDocument } from "@/prismicio-types";
import type { ArticleProps } from "..";
import { ArticleGrid } from "../article-grid";

type Props = ArticleProps & { slice: Content.ArticleSliceList };

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

  // Fixed tag filter narrows the pool (curated or auto); "All" means no filter.
  const tagFilter = filter_by_tag && filter_by_tag !== "All" ? filter_by_tag : null;
  const articles = tagFilter ? pool.filter((article) => article.data.tag === tagFilter) : pool;

  // Chips are for the open feed. A fixed tag already narrows to one type, so hide them.
  const showChips = Boolean(show_filter_chips) && !tagFilter;

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
          sectionTheme={section_theme}
          // Defaults to true (the model default) so documents saved before this
          // field existed keep paginating rather than silently capping at 4.
          showPagination={show_pagination !== false}
          showChips={showChips}
          className="mt-8"
        />
      </Container>
    </Section>
  );
}
