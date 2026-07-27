import type { Content } from "@prismicio/client";
import { isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import type { JSXMapSerializer } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { components as richTextComponents } from "@/components/rich-text/rich-text-components";
import { toAnchorId } from "@/lib/utils";
import { createClient } from "@/prismicio";
import type { EmployeeDocument } from "@/prismicio-types";
import type { TextProps } from "..";
import { TocAccordion } from "./toc-accordion";
import { TocDesktop } from "./toc-desktop";

type Props = TextProps & { slice: Content.TextSliceLongform };

type HeadingNode = { text: string };

function heading(Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") {
  return ({ node, children }: { node: HeadingNode; children: React.ReactNode }) => (
    <Tag id={toAnchorId(node.text)} className="scroll-mt-40 lg:scroll-mt-28">
      {children}
    </Tag>
  );
}

const articleComponents: JSXMapSerializer = {
  ...richTextComponents,
  heading1: heading("h1"),
  heading2: heading("h2"),
  heading3: heading("h3"),
  heading4: heading("h4"),
  heading5: heading("h5"),
  heading6: heading("h6"),
};

const HEADING_TYPES = new Set(["heading1", "heading2", "heading3", "heading4", "heading5", "heading6"]);

export async function TextLongform({ slice }: Props) {
  const { remove_top_padding, rich_text, author } = slice.primary;

  const tocHeadings = (rich_text ?? [])
    .filter((node) => HEADING_TYPES.has(node.type) && "text" in node)
    .map((node) => node as unknown as HeadingNode);

  let authorDoc: EmployeeDocument | null = null;
  if (isFilled.contentRelationship(author)) {
    const client = await createClient();
    try {
      authorDoc = await client.getByID<EmployeeDocument>(author.id);
    } catch {
      authorDoc = null;
    }
  }

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
    >
      <Container className="flex flex-col gap-8 lg:flex-row">
        {/* Mobile */}
        {tocHeadings.length > 0 && (
          <aside className="sticky top-21 md:top-24 lg:hidden">
            <TocAccordion headings={tocHeadings} />
          </aside>
        )}

        {/* Desktop */}
        {tocHeadings.length > 0 && (
          <aside className="hidden 3xl:w-144 pb-8 lg:block lg:w-96 lg:shrink-0 xl:w-112">
            <TocDesktop headings={tocHeadings} removeTopPadding={remove_top_padding} />
          </aside>
        )}

        {/* Text Content */}
        {rich_text && (
          <div>
            <div className="prose w-full min-w-0">
              <PrismicRichText field={rich_text} components={articleComponents} />
            </div>
            {authorDoc && (
              <Link href={authorDoc.url ?? "#"} className="mt-8 flex items-center gap-3">
                <PrismicNextImage className="size-16 rounded-4" field={authorDoc.data.employee_image} />
                <div className="space-y-0">
                  {authorDoc.data.employee_name && (
                    <p className="font-bold md:text-lg">{authorDoc.data.employee_name}</p>
                  )}
                  {authorDoc.data.employee_title && (
                    <p className="text-sm md:text-base">{authorDoc.data.employee_title}</p>
                  )}
                </div>
              </Link>
            )}
          </div>
        )}
      </Container>
    </Section>
  );
}
