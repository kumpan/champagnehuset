import { type Content, filter, isFilled } from "@prismicio/client";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import { createClient } from "@/prismicio";
import type { ProductDocument } from "@/prismicio-types";
import type { ProductProps } from "..";
import { ProductCard } from "../product-card";

type Props = ProductProps & { slice: Content.ProductSliceGrid };

/** The dynamic-page template passes the current document in as slice context. */
type GridContext = { document?: Content.AllDocumentTypes };

// Only what the card needs to render
const PRODUCT_FETCH = [
  "product.product_name",
  "product.product_image",
  "product.product_year",
  "product.product_producer",
];
const PRODUCER_FETCH_LINKS = ["producer.producer_name"];

/**
 * Small, curated sets should still fill the row instead of trailing off:
 * 3 items span the whole row (cols-3), pairs stay even (md cols-2), and lone
 * or triple items stack on mobile. Everything else uses the default 2→3→4.
 */
function gridColsClass(count: number): string {
  return cn(
    count === 1 || count === 3 ? "grid-cols-1" : "grid-cols-2",
    count === 2 || count === 4 || count === 6 ? "md:grid-cols-2" : "md:grid-cols-3",
    count === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4",
  );
}

export async function ProductGrid({ slice, context }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const {
    overline,
    title,
    description,
    button,
    remove_top_padding,
    featured_products,
    producer_filter,
    match_current_style,
    product_limit,
  } = slice.primary;
  const section_theme = slice.primary.section_theme;

  // Select default is "4"; anything unexpected also falls back to 4.
  const limit = product_limit === "No Limit" ? null : product_limit === "8" ? 8 : 4;

  // On a product page the current document is passed in as context; "Match
  // Current Product's Style" narrows the auto-fetch to same-style bottles.
  const ctx = context as GridContext | undefined;
  const currentProduct = ctx?.document?.type === "product" ? ctx.document : undefined;
  const styleToMatch =
    match_current_style &&
    currentProduct &&
    isFilled.select(currentProduct.data.product_style) &&
    currentProduct.data.product_style !== "None"
      ? currentProduct.data.product_style
      : null;

  const client = await createClient();

  const curated = (
    await Promise.all(
      featured_products.map((item) =>
        isFilled.contentRelationship(item.product)
          ? client.getByID<ProductDocument>(item.product.id, { fetchLinks: PRODUCER_FETCH_LINKS })
          : null,
      ),
    )
  ).filter((product): product is ProductDocument => product !== null);

  let products: ProductDocument[];
  if (curated.length > 0) {
    // Editorial order and count are intentional, so the limit doesn't touch them.
    products = curated;
  } else {
    const producerId = isFilled.contentRelationship(producer_filter) ? producer_filter.id : null;
    const filterList = [
      producerId ? filter.at("my.product.product_producer", producerId) : null,
      // Same style as the page's product, and never list the product itself.
      styleToMatch ? filter.at("my.product.product_style", styleToMatch) : null,
      styleToMatch && currentProduct ? filter.not("document.id", currentProduct.id) : null,
    ].filter((f): f is string => f !== null);
    const filters = filterList.length > 0 ? filterList : undefined;
    // A limited grid is a "latest bottles" showcase; the full browse stays A–Z.
    const orderings = limit
      ? [{ field: "document.first_publication_date", direction: "desc" as const }]
      : [{ field: "my.product.product_name", direction: "asc" as const }];

    if (limit) {
      const page = await client
        .getByType("product", {
          fetch: PRODUCT_FETCH,
          fetchLinks: PRODUCER_FETCH_LINKS,
          filters,
          orderings,
          pageSize: limit,
          page: 1,
        })
        .catch(() => null);
      products = page?.results ?? [];
    } else {
      products = await client
        .getAllByType("product", { fetch: PRODUCT_FETCH, fetchLinks: PRODUCER_FETCH_LINKS, filters, orderings })
        .catch(() => []);
    }
  }

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
        {products.length > 0 && (
          <div className={cn("mt-8 grid gap-x-3 gap-y-8 md:gap-x-4", gridColsClass(products.length))}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} className="w-full" sectionTheme={section_theme} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
