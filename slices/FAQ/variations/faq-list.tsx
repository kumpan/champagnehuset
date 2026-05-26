import type { Content } from "@prismicio/client";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { hasSectionIntroContent } from "@/lib/utils";
import type { FAQProps } from "..";
import Accordion from "../Accordion";

type Props = FAQProps & { slice: Content.FaqSliceList };

const overlineThemeClasses = {
  Ocean: "bg-fill-raised text-ink",
  Sunrise: "bg-accent-fill-raised text-accent-ink",
};

export function FAQList({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const {
    overline,
    title,
    description,
    alignment,
    section_theme,
    remove_top_padding,
    faqlist,
  } = slice.primary;
  const sectionTheme = section_theme;

  const column1 = faqlist.filter((_, index) => index % 2 === 0);
  const column2 = faqlist.filter((_, index) => index % 2 === 1);

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={sectionTheme}
    >
      <Container>
        {hasIntroContent && (
          <SectionIntro
            overline={overline}
            title={title}
            description={description}
            align={alignment ? "center" : "left"}
            sectionTheme={sectionTheme}
            overlineClassName={overlineThemeClasses[sectionTheme]}
            textBalance={true}
          />
        )}

        <div className="mt-8 flex flex-col gap-1.5 md:hidden lg:mt-10">
          {faqlist.map((item, index) => (
            <Accordion
              key={`faq-${item.question}-${index}`}
              question={item.question}
              answer={item.answer}
              sectionTheme={sectionTheme}
            />
          ))}
        </div>

        <div className="mt-8 hidden gap-2 md:flex lg:mt-10">
          <div className="flex flex-1 flex-col gap-2">
            {column1.map((item, index) => (
              <Accordion
                key={`faq-col1-${item.question}-${index * 2}`}
                question={item.question}
                answer={item.answer}
                sectionTheme={sectionTheme}
              />
            ))}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            {column2.map((item, index) => (
              <Accordion
                key={`faq-col2-${item.question}-${index * 2 + 1}`}
                question={item.question}
                answer={item.answer}
                sectionTheme={sectionTheme}
              />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
