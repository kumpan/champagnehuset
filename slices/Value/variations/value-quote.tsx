import type { Content } from "@prismicio/client";
import { isFilled } from "@prismicio/client";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { hasSectionIntroContent } from "@/lib/utils";
import { createClient } from "@/prismicio";
import type { EmployeeDocument } from "@/prismicio-types";
import type { ValueProps } from "..";
import { QuoteCarousel } from "../quote-carousel";

type Props = ValueProps & { slice: Content.ValueSliceQuote };

const overlineThemeClasses = {
  Ocean: "bg-fill-raised",
  Sunrise: "bg-accent-fill-raised",
};

export async function ValueQuote({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, quote, section_theme, remove_top_padding } = slice.primary;

  const client = await createClient();

  const resolvedQuotes = (
    await Promise.all(
      quote.map(async (item) => {
        if (!isFilled.contentRelationship(item.author)) return null;
        try {
          const employee = await client.getByID<EmployeeDocument>(item.author.id);
          return { text: item.text, employee };
        } catch {
          return null;
        }
      }),
    )
  ).filter((q): q is { text: string | null; employee: EmployeeDocument } => q !== null);

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme}
    >
      <Container className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12 xl:gap-20">
        {hasIntroContent && (
          <SectionIntro
            overline={overline}
            overlineClassName={overlineThemeClasses[section_theme]}
            title={title}
            description={description}
            align="left"
            sectionTheme={section_theme}
            className="w-full"
          />
        )}

        {resolvedQuotes.length > 0 && <QuoteCarousel quotes={resolvedQuotes} sectionTheme={section_theme || "Ocean"} />}
      </Container>
    </Section>
  );
}
