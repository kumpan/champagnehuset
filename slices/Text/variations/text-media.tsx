import type { Content } from "@prismicio/client";
import CustomMedia from "@/components/custom-media";
import { CustomRichText } from "@/components/custom-rich-text";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { cn } from "@/lib/utils";
import type { TextProps } from "..";

type Props = TextProps & { slice: Content.TextSliceMedia };

export function TextMedia({ slice }: Props) {
  const {
    text_side,
    remove_top_padding,
    section_theme,
    first_text_block,
    first_image,
    second_text_block,
    second_image,
  } = slice.primary;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme}
    >
      <Container
        className={cn("flex flex-col gap-2 md:gap-3 lg:gap-4", text_side ? "md:flex-row-reverse" : "md:flex-row")}
      >
        <div className={cn("flex w-full flex-1 shrink-0 flex-col gap-2 md:gap-1 lg:gap-2")}>
          <CustomRichText
            sectionTheme={section_theme}
            className="mx-auto max-w-2xl md:p-4 lg:p-8"
            field={first_text_block}
          />
          <CustomMedia
            className="aspect-video md:aspect-square"
            imageField={first_image[0]?.image}
            thumbnail="main md:square"
            filter={first_image[0]?.filter}
          />
        </div>
        <div className={cn("flex w-full flex-1 shrink-0 flex-col gap-2 md:gap-1 md:pt-8 lg:gap-2 lg:pt-24")}>
          <CustomMedia
            className="aspect-video md:aspect-square"
            imageField={second_image[0]?.image}
            thumbnail="main md:square"
            filter={second_image[0]?.filter}
          />
          <CustomRichText
            sectionTheme={section_theme}
            className="mx-auto max-w-2xl md:p-4 lg:p-8"
            field={second_text_block}
          />
        </div>
      </Container>
    </Section>
  );
}
