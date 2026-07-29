import type { Content } from "@prismicio/client";

import { InfoItems } from "@/components/info-items";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { CalloutProps } from "..";

const containerClasses: Record<string, string> = {
  Bud: "bg-fill-raised",
  Dust: "bg-accent-fill-raised",
};

type Props = CalloutProps & { slice: Content.CalloutSliceContact };

export function CalloutContact({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, buttons, section_theme, remove_top_padding, contact_items } = slice.primary;

  const items = contact_items.map((item) => ({
    icon: item.icon,
    label: item.label,
    value: item.value,
    href: item.link,
    clickable: Boolean(item.link),
    theme: section_theme,
  }));

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
            "flex w-full flex-col gap-6 rounded-5 p-4 md:p-6 lg:flex-row lg:gap-12 lg:p-12 xl:gap-16 xl:p-16",
            containerClasses[section_theme],
          )}
        >
          <div className="flex w-full flex-col gap-6 self-center md:gap-8">
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
                buttonWrapperClassName="mt-3 md:mt-4"
                textBalance={true}
              />
            )}
          </div>
          {items.length > 0 && (
            <div className="w-full self-center lg:max-w-xl">
              <InfoItems items={items} theme={section_theme} />
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
