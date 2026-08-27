import { type Content, isFilled } from "@prismicio/client";
import CustomMedia from "@/components/custom-media";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { ContactProps } from "..";

type Props = ContactProps & { slice: Content.ContactSliceRegister };

type RegisterContext = { lang?: string };

export function ContactRegister({ slice, context }: Props) {
  const lang = (context as RegisterContext | undefined)?.lang;
  const hasIntroContent = hasSectionIntroContent(slice);
  const {
    overline,
    title,
    description,
    image_side,
    image,
    remove_top_padding,
    email_label,
    email_placeholder,
    button_label,
    success_message,
  } = slice.primary;
  const section_theme = (slice.primary.section_theme as string) === "Brand" ? "Bottle" : slice.primary.section_theme;

  const contentTheme = section_theme === "Dust" ? "Dust" : "Leaf";
  const cardSurface = section_theme === "Dust" ? "bg-spot-fill-raised" : "bg-fill-raised";

  const hasImage = isFilled.image(image);

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
            "flex flex-col overflow-hidden rounded-2 shadow-float lg:items-stretch",
            hasImage ? (image_side ? "lg:flex-row-reverse" : "lg:flex-row") : "",
          )}
        >
          {/* Content */}
          <div className={cn("flex flex-1 flex-col justify-center gap-8 p-6 md:p-10 lg:p-12", cardSurface)}>
            {hasIntroContent && (
              <SectionIntro
                overline={overline}
                title={title}
                description={description}
                descriptionClassName="text-pretty"
                align="left"
                sectionTheme={contentTheme}
                titleMaxWidth={false}
              />
            )}

            <NewsletterForm
              layout="inline"
              emailLabel={email_label}
              placeholder={email_placeholder}
              buttonLabel={button_label}
              successMessage={success_message}
              lang={lang}
              sectionTheme={contentTheme}
              source="slice"
              buttonIcon
            />
          </div>

          {/* Image */}
          {hasImage && (
            <div className="relative aspect-square w-full md:aspect-3/2 lg:aspect-square lg:w-auto lg:flex-1">
              <CustomMedia
                imageField={image}
                className="h-full w-full rounded-none"
                sectionTheme={contentTheme}
                preload
              />
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
