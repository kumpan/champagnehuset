import type { Content } from "@prismicio/client";
import { CustomRichText } from "@/components/custom-rich-text";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { hasSectionIntroContent } from "@/lib/utils";
import type { TextProps } from "..";

type Props = TextProps & { slice: Content.TextSliceExtended };

const overlineThemeClasses = {
  Ocean: "bg-fill-raised",
  Sunrise: "bg-accent-fill-raised",
};

export function TextExtended({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, section_theme, remove_top_padding, rich_text } = slice.primary;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme}
    >
      <Container>
        {hasIntroContent && (
          <SectionIntro
            overline={overline}
            overlineClassName={overlineThemeClasses[section_theme]}
            title={title}
            description={description}
            sectionTheme={section_theme}
            align="left"
          />
        )}
        {rich_text && (
          <div className="mt-6 md:mt-8 lg:mt-12">
            <CustomRichText
              className="ml-auto 3xl:max-w-4xl lg:max-w-2xl xl:max-w-3xl"
              sectionTheme={section_theme}
              field={rich_text}
            />
          </div>
        )}
      </Container>
    </Section>
  );
}
