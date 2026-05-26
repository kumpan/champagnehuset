import type { Content } from "@prismicio/client";
import ContactForm from "@/components/forms/contact-form";
import { type IconName, iconMap } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { CalloutProps } from "..";

function isIconName(value: unknown): value is IconName {
  return typeof value === "string" && value in iconMap;
}

export function CalloutForm({ slice }: CalloutProps & { slice: Content.CalloutSliceForm }) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const {
    overline,
    title,
    description,
    section_theme,
    remove_top_padding,
    form_side,
    value_statements,
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
        <div className={cn("flex flex-col gap-2 transition-colors duration-500 ease-in-out lg:gap-0")}>
          <div
            className={cn(
              "flex w-full grow flex-col gap-6 rounded-5 bg-fill-raised p-4 md:p-6 lg:gap-12 lg:rounded-r-8 lg:rounded-l-6 lg:p-12 xl:gap-16 xl:p-16",
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
                    const Icon = item.icon && isIconName(item.icon) ? iconMap[item.icon] : null;
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
              <ContactForm
                fields={slice.items}
                consentItems={consent_items}
                submit_button_text={submit_button_text ?? undefined}
                success_message={success_message}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
