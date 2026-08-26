import type { Content } from "@prismicio/client";

import { CustomRichText } from "@/components/custom-rich-text";
import { Container } from "@/components/layout/container";
import { normalizeSectionTheme, Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { hasSectionIntroContent } from "@/lib/utils";
import type { TextProps } from "..";

type Props = TextProps & { slice: Content.TextSliceSplit };

export function TextSplit({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, remove_top_padding, first_text_block, second_text_block } = slice.primary;
  const section_theme = normalizeSectionTheme(slice.primary.section_theme);

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
            align="left"
            sectionTheme={section_theme}
          />
        )}
        <div className="flex flex-col 3xl:gap-20 gap-6 md:gap-8 lg:flex-row lg:gap-8 xl:gap-12 2xl:gap-16">
          <CustomRichText sectionTheme={section_theme} field={first_text_block} className="w-full" />
          <CustomRichText sectionTheme={section_theme} field={second_text_block} className="w-full" />
        </div>
      </Container>
    </Section>
  );
}
