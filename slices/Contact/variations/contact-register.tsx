import type { Content } from "@prismicio/client";
import ContactFormFields from "@/components/forms/contact-form";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { hasSectionIntroContent } from "@/lib/utils";
import type { ContactProps } from "..";

type Props = ContactProps & { slice: Content.ContactSliceRegister };

export function ContactRegister({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const {
    overline,
    title,
    description,
    section_theme,
    remove_top_padding,
    submit_button_text,
    success_message,
    consent_items,
  } = slice.primary;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme}
      className="selection:bg-brand selection:text-ink-flip"
    >
      <Container>
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-5 bg-fill-raised p-4 md:gap-8 md:p-8 lg:p-12">
          {hasIntroContent && (
            <SectionIntro
              overline={overline}
              overlineClassName={section_theme}
              title={title}
              description={description}
              descriptionClassName="text-pretty"
              align="center"
              textBalance={true}
            />
          )}
          <ContactFormFields
            fields={slice.items}
            consentItems={consent_items}
            submit_button_text={submit_button_text ?? undefined}
            success_message={success_message}
            className="w-full"
          />
        </div>
      </Container>
    </Section>
  );
}
