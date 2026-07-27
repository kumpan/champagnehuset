import { type Content, isFilled } from "@prismicio/client";
import CustomMedia from "@/components/custom-media";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { cn } from "@/lib/utils";
import type { ImageProps } from "..";

export type ImageShowcaseProps = ImageProps & { slice: Content.ImageSliceShowcase };

const getMediaKey = (item: Content.ImageSliceShowcasePrimaryMediaItem, index: number) => {
  if (item.image.id) return item.image.id;
  if (isFilled.linkToMedia(item.video)) return item.video.id;
  return index;
};

export function ImageShowcase({ slice }: ImageShowcaseProps) {
  const { media, remove_top_padding, section_theme } = slice.primary;
  const filteredMedia = media.filter((item) => isFilled.image(item.image) || isFilled.linkToMedia(item.video));
  const mediaCount = filteredMedia.length;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      className={section_theme}
    >
      <Container
        className={cn(
          "grid gap-1 md:gap-2",
          mediaCount === 1 && "grid-cols-1 md:grid-cols-1 lg:grid-cols-1",
          mediaCount === 2 && "grid-cols-2 md:grid-cols-2 lg:grid-cols-2",
          mediaCount === 3 && "grid-cols-1 md:grid-cols-1 lg:grid-cols-3",
          mediaCount === 4 && "grid-cols-2 md:grid-cols-2 lg:grid-cols-2",
        )}
      >
        {filteredMedia.map((item, index) => (
          <>
            <CustomMedia
              key={getMediaKey(item, index)}
              imageField={isFilled.linkToMedia(item.video) ? undefined : item.image}
              videoSrc={isFilled.linkToMedia(item.video) ? item.video.url : undefined}
              indexedDelay={true}
              filter={item.filter}
              index={index}
              className={cn(
                "aspect-square rounded-lg",
                mediaCount === 1 && "aspect-square md:aspect-video lg:aspect-video",
                mediaCount === 2 && "aspect-square md:aspect-square lg:aspect-3/2",
                mediaCount === 3 && "aspect-video md:aspect-video lg:aspect-square",
                mediaCount === 4 && "aspect-square md:aspect-square lg:aspect-video",
              )}
            />
          </>
        ))}
      </Container>
    </Section>
  );
}
