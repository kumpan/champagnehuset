import { type Content, isFilled } from "@prismicio/client";

import CustomMedia from "@/components/custom-media";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import type { CalloutProps } from "..";

type Props = CalloutProps & { slice: Content.CalloutSliceBackdrop };

export function CalloutBackdrop({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { title, description, buttons, overline, alignment, section_theme, remove_top_padding, media } = slice.primary;
  const { image, video, filter } = media[0] ?? {};

  const hasMedia = isFilled.linkToMedia(video) || isFilled.image(image);
  // With media, the image supplies the surface — force the dark Slate theme so text,
  // buttons and selection flip to light automatically. Without media, honour the
  // editor's chosen theme.
  const theme = hasMedia ? "Slate" : section_theme;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={theme}
      className={cn(
        "relative isolate flex flex-col justify-end overflow-hidden",
        "min-h-[28rem] md:min-h-[36rem] lg:min-h-[43rem]",
      )}
    >
      {hasMedia && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <CustomMedia
            imageField={image && isFilled.image(image) ? image : undefined}
            videoSrc={video && isFilled.linkToMedia(video) ? video.url : undefined}
            className="h-full w-full rounded-none"
            preload
            sectionTheme="Slate"
            thumbnail="horizontal md:main"
            filter={filter}
          />

          {/* Bottom fade — layered like custom-media (blur → overlay mix → fade), spot-fill-dark */}
          <div className="absolute inset-x-0 top-1/3 bottom-0 backdrop-blur-[3px] [mask-image:linear-gradient(to_top,black,black_30%,transparent)]" />
          <div className="absolute inset-x-0 top-1/4 bottom-0 bg-linear-to-t from-spot-fill-dark/65 to-spot-fill-dark/0 mix-blend-overlay" />
          <div className="absolute inset-x-0 top-1/4 bottom-0 bg-linear-to-t from-spot-fill-dark/90 via-spot-fill-dark/40 to-spot-fill-dark/0" />
        </div>
      )}

      {hasIntroContent && (
        <Container className="relative flex w-full flex-col justify-end">
          <SectionIntro
            overline={overline}
            title={title}
            description={description}
            buttons={buttons}
            align={alignment ? "center" : "left"}
            sectionTheme={theme}
            className={cn("w-full max-w-[50rem]", alignment && "mx-auto")}
            titleMaxWidth={false}
            textBalance
          />
        </Container>
      )}
    </Section>
  );
}
