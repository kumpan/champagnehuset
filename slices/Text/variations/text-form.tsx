import { type Content, isFilled } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import ContactForm from "@/components/forms/contact-form";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import type { TextProps } from "..";

type Props = TextProps & { slice: Content.TextSliceForm };

export function TextForm({ slice }: Props) {
  const {
    section_theme,
    remove_top_padding,
    rich_text,
    form_intro,
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
    >
      <Container className="flex flex-col-reverse 3xl:gap-24 gap-8 lg:flex-row lg:gap-16">
        {isFilled.richText(rich_text) && (
          <div className="prose">
            <PrismicRichText field={rich_text} />
          </div>
        )}
        <div className="w-full 3xl:max-w-192 shrink-0 self-start rounded-4 bg-fill-raised p-4 md:p-10 lg:max-w-144">
          <ContactForm
            fields={slice.items}
            consentItems={consent_items}
            submit_button_text={submit_button_text ?? undefined}
            success_message={success_message}
            className="w-full"
            sectionTheme={section_theme || "Ocean"}
          >
            {isFilled.richText(form_intro) && (
              <div className="prose">
                <PrismicRichText field={form_intro} />
              </div>
            )}
          </ContactForm>
        </div>
      </Container>
    </Section>
  );
}
