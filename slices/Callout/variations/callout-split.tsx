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
  Leaf: "bg-fill",
  Brand: "bg-fill-raised",
  Dust: "bg-spot-fill",
  Slate: "bg-spot-fill-raised",
};

const introClasses: Record<SectionTheme, SectionTheme> = {
  Bud: "Bud",
  Leaf: "Leaf",
  Brand: "Leaf",
  Dust: "Slate",
  Slate: "Dust",
};

export async function CalloutSplit({ slice }: CalloutProps & { slice: Content.CalloutSliceSplit }) {
  const {
    overline,
    title,
    description,
    buttons,
    alignment,
    image_side,
    section_theme,
    remove_top_padding,
    media,
    producer,
  } = slice.primary;

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
            "-mx-4 flex flex-col overflow-hidden rounded-none transition-colors duration-500 ease-in-out md:-mx-6 lg:mx-0 lg:rounded-2",
            containerClasses[section_theme],
            image_side ? "lg:flex-row-reverse" : "lg:flex-row",
          )}
        >
          <div
            className={cn(
              "flex px-4 py-6 md:px-6 md:py-10 lg:aspect-square lg:w-1/2 lg:p-12",
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
                sectionTheme={introClasses[section_theme]}
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
