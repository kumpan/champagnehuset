import type { Content } from "@prismicio/client";
import ContactFormFields from "@/components/forms/contact-form";
import { resolveIcon } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { normalizeSectionTheme, Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { ContactProps } from "..";

type Props = ContactProps & { slice: Content.ContactSliceForm };

export function ContactForm({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const {
    overline,
    title,
    description,
    remove_top_padding,
    form_side,
    value_statements,
    submit_button_text,
    success_message,
    consent_items,
  } = slice.primary;
  const section_theme = normalizeSectionTheme(slice.primary.section_theme);

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme}
      className="selection:bg-brand selection:text-ink-flip"
    >
      <Container>
        <div className={cn("flex flex-col gap-2 transition-colors duration-500 ease-in-out lg:gap-0")}>
          <div
            className={cn(
              "relative flex w-full grow flex-col gap-6 overflow-hidden rounded-2 bg-fill-raised p-4 md:p-6 lg:gap-12 lg:p-12 xl:gap-16 xl:p-16",
              form_side ? "lg:flex-row" : "lg:flex-row-reverse",
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
                  align="left"
                  buttonWrapperClassName="mt-3 md:mt-4"
                  textBalance={true}
                />
              )}
              {value_statements.length > 0 && (
                <ul className="flex flex-col gap-3 md:gap-4">
                  {value_statements.map((item, index) => {
                    const Icon = resolveIcon(item.icon);
                    if (!item.text && !Icon) return null;
                    return (
                      <li key={`${index}-${item.text}`} className="flex items-center gap-2 md:gap-2">
                        {Icon && (
                          <span className="shrink-0 text-ink">
                            <Icon className="icon-bold size-9 md:size-11" />
                          </span>
                        )}
                        {item.text && (
                          <span className="text-pretty text-base leading-snug md:text-lg">{item.text}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="w-full">
              <ContactFormFields
                fields={slice.items}
                consentItems={consent_items}
                submit_button_text={submit_button_text ?? undefined}
                success_message={success_message}
                className="w-full"
              />
              <div className="absolute inset-0 flex items-center justify-center text-balance bg-fill-dark/70 p-4 text-center text-ink-flip text-lg backdrop-blur-lg md:text-2xl">
                This form feature is only a placeholder. It's not functionally fully built yet.
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
