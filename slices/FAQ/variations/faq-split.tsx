import type { Content } from "@prismicio/client";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { hasSectionIntroContent } from "@/lib/utils";
import type { FAQProps } from "..";
import Accordion from "../Accordion";

type Props = FAQProps & { slice: Content.FaqSliceSplit };

const overlineThemeClasses = {
  Ocean: "bg-fill-raised text-ink",
  Sunrise: "bg-accent-fill-raised text-accent-ink",
};

export function FAQSplit({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const {
    overline,
    title,
    description,
    section_theme,
    remove_top_padding,
    faqlist,
  } = slice.primary;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme}
    >
      <Container>
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
          {hasIntroContent && (
            <div className="lg:sticky lg:top-24">
              <SectionIntro
                overline={overline}
                title={title}
                description={description}
                align="left"
                sectionTheme={section_theme}
                overlineClassName={overlineThemeClasses[section_theme]}
                textBalance={true}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5 lg:gap-2">
            {faqlist.map((item, index) => (
              <Accordion
                key={`faq-split-${item.question}-${index}`}
                question={item.question}
                answer={item.answer}
                sectionTheme={section_theme}
              />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
