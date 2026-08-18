import type { Content } from "@prismicio/client";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { hasSectionIntroContent } from "@/lib/utils";
import { createClient } from "@/prismicio";
import type { ProductProps } from "..";
import { SearchGrid } from "../search-grid";

type Props = ProductProps & { slice: Content.ProductSliceSearch };

type SearchContext = { lang?: string };

export async function ProductSearch({ slice, context }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, alignment, remove_top_padding, search_placeholder, no_results_text } =
    slice.primary;

  const lang = (context as SearchContext | undefined)?.lang;
  const client = await createClient();
  // Only the fields the grid, filters, and search need; whole documents would
  // ship every product's slice zone to the client.
  // getAllByType throws ("No documents were found") when the repo has no products yet.
  const products = await client
    .getAllByType("product", {
      // with `lang` so Prismic returns the right locale
      ...(lang ? { lang } : {}),
      fetch: [
        "product.product_name",
        "product.product_image",
        "product.product_producer",
        "product.product_year",
        "product.product_grapes",
        "product.product_dosage",
        "product.product_article_number",
        "product.product_region",
        "product.product_style",
        "product.product_special_club",
        "product.product_ecologic",
        "product.product_volume",
        "product.product_consumer_availability",
        "product.product_restaurant_availability",
      ],
      fetchLinks: ["producer.producer_name"],
      orderings: [{ field: "my.product.product_name", direction: "asc" }],
    })
    .catch(() => []);

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme="Bud"
    >
      <Container className="flex flex-col gap-6 md:gap-8">
        {hasIntroContent && (
          <SectionIntro
            overline={overline}
            title={title}
            description={description}
            align={alignment ? "center" : "left"}
            sectionTheme="Bud"
          />
        )}
        <SearchGrid
          products={products}
          searchPlaceholder={search_placeholder}
          noResultsText={no_results_text}
          lang={lang}
        />
      </Container>
    </Section>
  );
}
