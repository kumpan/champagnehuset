import type { Content } from "@prismicio/client";

import { InfoBlock } from "@/components/info-block";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { CalloutProps } from "..";

const containerClasses = {
  Bud: "bg-fill-raised",
  Dust: "bg-accent-fill-raised",
};

type Props = CalloutProps & { slice: Content.CalloutSliceDetails };

export function CalloutDetails({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, buttons, section_theme, remove_top_padding, details } = slice.primary;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme}
    >
      <Container>
        <div
          className={cn(
            "flex w-full flex-col gap-8 rounded-5 p-4 md:p-6 lg:gap-12 lg:p-12 xl:p-16",
            containerClasses[section_theme],
          )}
        >
          {hasIntroContent && (
            <SectionIntro
              overline={overline}
              overlineClassName={section_theme}
              title={title}
              description={description}
              descriptionClassName="text-pretty"
              buttons={buttons}
              align="left"
              sectionTheme={section_theme}
              textBalance={true}
            />
          )}
          {details.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2 md:gap-4">
              {details.map((detail, index) => (
                <InfoBlock
                  key={`${index}-${detail.overline_text}`}
                  overline_text={detail.overline_text}
                  overline_icon={detail.overline_icon}
                  rich_text={detail.rich_text}
                  sectionTheme={section_theme}
                  className={{ Bud: "bg-fill", Dust: "bg-accent-fill" }[section_theme]}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
