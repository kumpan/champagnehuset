import { type Content, isFilled } from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";

import { Button } from "@/components/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import { createClient } from "@/prismicio";
import type { ArticleDocument } from "@/prismicio-types";
import type { ArticleProps } from "..";

type Props = ArticleProps & { slice: Content.ArticleSliceFeature };

export async function ArticleFeature({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, section_theme, remove_top_padding, image_side, article, link_label } =
    slice.primary;

  const client = await createClient();
  const articleDoc = isFilled.contentRelationship(article) ? await client.getByID<ArticleDocument>(article.id) : null;

  if (!articleDoc) return null;

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
            "flex flex-col gap-6 lg:items-center lg:gap-12 xl:gap-16",
            image_side ? "lg:flex-row" : "lg:flex-row-reverse",
          )}
        >
          <PrismicNextLink
            document={articleDoc}
            className="group block w-full shrink-0 overflow-hidden rounded-5 lg:w-1/2"
          >
            <PrismicNextImage
              field={articleDoc.data.meta_image}
              className="aspect-3/2 h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-103"
              fallbackAlt=""
            />
          </PrismicNextLink>
          <div className="flex w-full flex-col gap-4 md:gap-5">
            {hasIntroContent && (
              <SectionIntro
                overline={overline}
                overlineClassName={section_theme}
                title={title}
                description={description}
                descriptionClassName="text-pretty"
                align="left"
                sectionTheme={section_theme}
                textBalance={true}
              />
            )}
            <Button asChild size="lg" className="self-start">
              <PrismicNextLink document={articleDoc}>
                <span>{link_label || "Read article"}</span>
              </PrismicNextLink>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
