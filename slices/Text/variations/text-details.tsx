import { type Content, isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { components } from "@/components/rich-text/rich-text-components";
import type { SectionTheme } from "@/components/section-intro";
import { getRegion } from "@/lib/regions";
import { cn } from "@/lib/utils";
import { createClient } from "@/prismicio";
import type { RegionDocument } from "@/prismicio-types";
import type { TextProps } from "..";

type Props = TextProps & { slice: Content.TextSliceDetails };

const displayHeading = "font-primary! text-3xl text-pretty italic md:text-4xl lg:text-5xl 2xl:text-6xl";

const bodyThemeClasses: Record<SectionTheme, string> = {
  Bud: "text-ink-dim",
  Leaf: "text-ink-dim",
  Brand: "",
  Dust: "text-spot-ink-dim",
  Slate: "",
};

export async function TextDetails({ slice }: Props) {
  const { section_theme, region: regionName } = slice.primary;

  const client = await createClient();
  // getAllByType throws ("No documents were found") when the repo has no region documents yet.
  const regionDocs = await client.getAllByType("region").catch(() => []);
  const regionDoc = regionDocs.find((doc) => doc.data.name?.trim() === regionName);

  if (regionDoc) return <RegionDetails slice={slice} region={regionDoc} />;

  // Hardcoded copy from lib/regions.ts covers regions whose Prismic document does not exist yet.
  const region = getRegion(regionName);

  if (!region) return null;

  return (
    <Section data-slice-type={slice.slice_type} data-slice-variation={slice.variation} sectionTheme={section_theme}>
      <Container className="grid gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
        {/* Name, key facts and map */}
        <div className="flex flex-col gap-4 lg:gap-4">
          <h2 className={displayHeading}>{region.name}</h2>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {region.facts.map((list) => (
              <div key={list.label} className="flex flex-col gap-2">
                <h3 className="text-base">{list.label}</h3>
                <ul
                  className={cn(
                    "flex list-disc flex-col gap-1 text-pretty pl-5 marker:text-current/60",
                    bodyThemeClasses[section_theme],
                    "easeOut transition-colors duration-500",
                  )}
                >
                  {list.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Image
            src={region.map}
            alt={`Karta över ${region.name} i Champagne`}
            sizes="(min-width: 64rem) 50vw, 100vw"
            placeholder="blur"
            className="h-auto w-full rounded-2"
          />
        </div>

        {/* Headline and prose */}
        <div className="flex flex-col gap-2 lg:gap-4">
          <h3 className={displayHeading}>{region.headline}</h3>
          <div
            className={cn(
              "flex max-w-xl flex-col gap-4 text-pretty",
              bodyThemeClasses[section_theme],
              "easeOut transition-colors duration-500",
            )}
          >
            {region.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function RegionDetails({ slice, region }: { slice: Props["slice"]; region: RegionDocument }) {
  const { section_theme } = slice.primary;
  const { name, headline, body, map_image, facts } = region.data;
  const regionName = name?.trim();

  return (
    <Section data-slice-type={slice.slice_type} data-slice-variation={slice.variation} sectionTheme={section_theme}>
      <Container className="grid gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
        {/* Name, key facts and map */}
        <div className="flex flex-col gap-4 lg:gap-4">
          <h2 className={displayHeading}>{regionName}</h2>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {facts.map((list) => (
              <div key={list.label} className="flex flex-col gap-2">
                <h3 className="text-base">{list.label}</h3>
                <ul
                  className={cn(
                    "flex list-disc flex-col gap-1 text-pretty pl-5 marker:text-current/60",
                    bodyThemeClasses[section_theme],
                    "easeOut transition-colors duration-500",
                  )}
                >
                  {[list.item_1, list.item_2, list.item_3].filter(isFilled.keyText).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {isFilled.image(map_image) && (
            <PrismicNextImage
              field={{ ...map_image, alt: map_image.alt ?? `Karta över ${regionName} i Champagne` }}
              sizes="(min-width: 64rem) 50vw, 100vw"
              className="h-auto w-full rounded-2"
            />
          )}
        </div>

        {/* Headline and prose */}
        {(isFilled.keyText(headline) || isFilled.richText(body)) && (
          <div className="flex flex-col gap-2 lg:gap-4">
            {isFilled.keyText(headline) && <h3 className={displayHeading}>{headline}</h3>}
            {isFilled.richText(body) && (
              <div
                className={cn(
                  "flex max-w-xl flex-col gap-4 text-pretty",
                  bodyThemeClasses[section_theme],
                  "easeOut transition-colors duration-500",
                )}
              >
                <PrismicRichText field={body} components={components} />
              </div>
            )}
          </div>
        )}
      </Container>
    </Section>
  );
}
