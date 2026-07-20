import type { Content } from "@prismicio/client";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { hasSectionIntroContent } from "@/lib/utils";
import { createClient } from "@/prismicio";
import type { ProductProps } from "..";
import { SearchGrid } from "../search-grid";

type Props = ProductProps & { slice: Content.ProductSliceSearch };

export async function ProductSearch({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const {
    overline,
    title,
    description,
    alignment,
    section_theme,
    remove_top_padding,
    search_placeholder,
    no_results_text,
  } = slice.primary;

  const client = await createClient();
  const products = await client.getAllByType("product");

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme}
    >
      <Container className="flex flex-col gap-6 md:gap-8">
        {hasIntroContent && (
          <SectionIntro
            overline={overline}
            title={title}
            description={description}
            align={alignment ? "center" : "left"}
            sectionTheme={section_theme}
          />
        )}
        <SearchGrid
          products={products}
          sectionTheme={section_theme}
          searchPlaceholder={search_placeholder}
          noResultsText={no_results_text}
        />
      </Container>
    </Section>
  );
}
