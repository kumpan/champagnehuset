import { type Content, isFilled } from "@prismicio/client";
import CustomMedia from "@/components/custom-media";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { cn } from "@/lib/utils";
import type { ImageProps } from "..";

const captionThemeClasses = {
  Bud: "text-ink-dim",
  Dust: "text-accent-ink-dim",
};

type Props = ImageProps & { slice: Content.ImageSliceShowcase };

export function ImageShowcase({ slice }: Props) {
  const { media, caption, remove_top_padding, section_theme } = slice.primary;
  const { image, video, filter } = media[0] ?? {};

  const hasMedia = isFilled.linkToMedia(video) || isFilled.image(image);
  if (!hasMedia) return null;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme}
    >
      <Container>
        <CustomMedia
          imageField={isFilled.linkToMedia(video) ? undefined : image}
          videoSrc={isFilled.linkToMedia(video) ? video.url : undefined}
          className="aspect-video w-full rounded-5"
          preload
          sectionTheme={section_theme}
          thumbnail="square md:main"
          filter={filter}
        />
        {caption && (
          <p className={cn("mt-3 text-balance text-sm md:mt-4 md:text-base", captionThemeClasses[section_theme])}>
            {caption}
          </p>
        )}
      </Container>
    </Section>
  );
}
