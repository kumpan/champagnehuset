import type { Content, ImageField, RichTextField } from "@prismicio/client";
import { isFilled } from "@prismicio/client";
import CustomMedia from "@/components/custom-media";
import { Container } from "@/components/layout/container";
import { Section, type SectionTheme } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import { createClient } from "@/prismicio";
import type { ProducerDocument } from "@/prismicio-types";
import type { CalloutProps } from "..";

const containerClasses = {
  Bud: "bg-fill-raised",
  Leaf: "bg-fill-raised",
  Bottle: "bg-brand text-brand-ink selection-light",
  Dust: "bg-spot-fill selection-spot-raised",
  Slate: "bg-spot-fill-raised selection-spot",
};

// What the card interior wears per section theme: the nearest real theme plus,
// for the brand-green card, the surface no theme matches.
const interior: Record<SectionTheme, { theme: SectionTheme; surface?: "brand" }> = {
  Bud: { theme: "Bud" },
  Leaf: { theme: "Leaf" },
  Bottle: { theme: "Bottle", surface: "brand" },
  Dust: { theme: "Slate" },
  Slate: { theme: "Dust" },
};

export async function CalloutSplit({ slice }: CalloutProps & { slice: Content.CalloutSliceSplit }) {
  const { overline, title, description, buttons, alignment, image_side, remove_top_padding, media, producer } =
    slice.primary;
  const section_theme = (slice.primary.section_theme as string) === "Brand" ? "Bottle" : slice.primary.section_theme;
  const { theme: content_theme, surface } = interior[section_theme];

  let producerDoc: ProducerDocument | null = null;
  if (isFilled.contentRelationship(producer)) {
    const client = await createClient();
    producerDoc = await client.getByID<ProducerDocument>(producer.id).catch(() => null);
  }

  let producerDescription: RichTextField | undefined;
  let producerImage: ImageField<never> | undefined;
  if (producerDoc) {
    const { producer_about, producer_bio, producer_feature_image, producer_image } = producerDoc.data;
    producerDescription = isFilled.richText(producer_about)
      ? producer_about
      : isFilled.richText(producer_bio)
        ? producer_bio
        : undefined;
    producerImage = isFilled.image(producer_feature_image)
      ? producer_feature_image
      : isFilled.image(producer_image)
        ? producer_image
        : undefined;
  }

  const hasIntroContent = hasSectionIntroContent(slice) || producerDescription !== undefined;

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
            // Contained card by default; bleeds to the full viewport on lg/xl
            // (cancelling Container's lg gutter), contained again from 2xl.
            "flex flex-col overflow-hidden rounded-2 transition-colors duration-500 ease-in-out lg:-mx-8 lg:rounded-none 2xl:mx-0 2xl:rounded-2",
            containerClasses[section_theme],
            image_side ? "lg:flex-row-reverse" : "lg:flex-row",
          )}
        >
          <div
            className={cn(
              "flex p-6 md:p-10 lg:aspect-square lg:w-1/2 lg:p-16 2xl:p-12",
              alignment && "items-center justify-center",
            )}
          >
            {/* Content */}
            {hasIntroContent && (
              <SectionIntro
                overline={overline}
                title={title}
                description={producerDescription ?? description}
                buttons={buttons}
                align={alignment ? "center" : "left"}
                sectionTheme={content_theme}
                surface={surface}
                buttonWrapperClassName="mt-4 mb-4 md:mb-2 lg:mt-6"
                className={cn(!alignment && "h-full justify-end")}
                textBalance={true}
              />
            )}
          </div>
          <div className="aspect-square lg:w-1/2">
            {producerImage ? (
              <CustomMedia
                imageField={producerImage}
                className="h-full w-full rounded-0"
                preload
                sectionTheme={section_theme}
                filter={media[0]?.filter}
              />
            ) : (
              media[0] && (
                <CustomMedia
                  imageField={isFilled.linkToMedia(media[0].video) ? undefined : media[0].image}
                  videoSrc={isFilled.linkToMedia(media[0].video) ? media[0].video.url : undefined}
                  className="h-full w-full rounded-0"
                  preload
                  sectionTheme={section_theme}
                  filter={media[0].filter}
                />
              )
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
