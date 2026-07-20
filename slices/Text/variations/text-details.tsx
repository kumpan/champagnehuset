import type { Content } from "@prismicio/client";

import { InfoBlock } from "@/components/info-block";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { hasSectionIntroContent } from "@/lib/utils";
import type { TextProps } from "..";

type Props = TextProps & { slice: Content.TextSliceDetails };

export function TextDetails({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, section_theme, remove_top_padding, details } = slice.primary;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme}
    >
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
          {hasIntroContent && (
            <div className="w-full lg:max-w-lg">
              <SectionIntro
                overline={overline}
                overlineClassName={section_theme}
                title={title}
                description={description}
                descriptionClassName="text-pretty"
                align="left"
                sectionTheme={section_theme}
                textBalance={true}
              />
            </div>
          )}
          {details.length > 0 && (
            <div className="flex w-full flex-col gap-3 md:gap-4">
              {details.map((detail, index) => (
                <InfoBlock
                  key={`${index}-${detail.overline_text}`}
                  overline_text={detail.overline_text}
                  overline_icon={detail.overline_icon}
                  rich_text={detail.rich_text}
                  sectionTheme={section_theme}
                  className={
                    {
                      Bud: "bg-fill-raised",
                      Dust: "bg-accent-fill-raised",
                    }[section_theme]
                  }
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
