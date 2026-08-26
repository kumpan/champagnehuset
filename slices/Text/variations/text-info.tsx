import { type Content, isFilled } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import Link from "next/link";
import { Button } from "@/components/button";
import { CustomRichText } from "@/components/custom-rich-text";
import { iconMap } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Overline } from "@/components/overline";
import { getSingleton } from "@/lib/cms";
import { formatAlcohol, formatDosage, formatGrapesWithShares, productVolumes } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SpecialClubDocument } from "@/prismicio-types";
import type { TextProps } from "..";
import { CONTACT_PAGE_PATH, COPY, RESTAURANT_CONTACT, resolvePurchase } from "../text-info-config";

const ArrowRight = iconMap.arrowRight;
const Download = iconMap.download;

/** The dynamic-page template passes the current document in as slice context. */
type InfoContext = {
  lang?: string;
  document?: Content.AllDocumentTypes;
};

/**
 * Href for the original high-resolution asset: strip the URL's crop/compression
 * params, then let imgix's `dl` param set Content-Disposition: attachment so
 * the browser saves the file (a bare `<a download>` is ignored cross-origin).
 */
function imageDownloadHref(url: string, uid: string): string {
  const src = new URL(url);
  const ext = src.pathname.match(/\.(\w+)$/)?.[1] ?? "jpg";
  src.search = "";
  src.searchParams.set("dl", `${uid}.${ext}`);
  return src.toString();
}

type Props = TextProps & { slice: Content.TextSliceInfo };

export async function TextInfo({ slice, context }: Props) {
  const ctx = context as InfoContext | undefined;
  const doc = ctx?.document;
  const product = doc?.type === "product" ? doc : undefined;
  const data = product?.data;
  const { section_theme } = slice.primary;

  // The editable Special Club blurb only renders on product pages
  // that are also a Special Club champagnes
  const isSpecialClub = data?.product_special_club === "Yes";
  const specialClub = isSpecialClub
    ? await getSingleton<SpecialClubDocument>("special_club", ctx?.lang ? { lang: ctx.lang } : undefined)
    : null;

  // Editorial fields fall back to the producer / product name when left blank
  const producerName = isFilled.contentRelationship(data?.product_producer)
    ? (data?.product_producer.data?.producer_name ?? undefined)
    : undefined;
  const overline = slice.primary.overline || producerName || "";
  const title = slice.primary.title || data?.product_name || "";

  // Spec rows: only ones with a value are rendered.
  const rows: { label: string; value: string }[] = [];
  const push = (label: string, value?: string | null) => {
    if (value) rows.push({ label, value });
  };
  if (data) {
    push("Artikelnummer", data.product_article_number);
    push("Volym", productVolumes(data).join(", ") || null);
    push("Druvor", formatGrapesWithShares(data.product_grapes));
    push("Dosage", formatDosage(data.product_dosage_grams));
    push("Alkohol", formatAlcohol(data.product_alcohol));
    push("Lagring", data.product_storage);
    push(
      "Ursprung",
      [data.product_region, data.product_cru === "None" ? null : data.product_cru].filter(Boolean).join(", ") || null,
    );
  }

  const hasOrderUrl = isFilled.link(data?.product_order_url);
  const consumerPrice = data?.product_price_consumer || null;
  const restaurantPrice = data?.product_price_restaurant || null;
  const purchase = resolvePurchase(
    data?.product_consumer_availability ?? null,
    data?.product_restaurant_availability ?? null,
    hasOrderUrl,
  );

  const pdfHref = product?.uid
    ? `/api/product-pdf?uid=${encodeURIComponent(product.uid)}&lang=${encodeURIComponent(product.lang)}`
    : null;
  const image = data?.product_image;
  const imageHref = product?.uid && isFilled.image(image) ? imageDownloadHref(image.url, product.uid) : null;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={slice.primary.remove_top_padding}
      sectionTheme={section_theme}
    >
      <Container>
        <div className="grid gap-x-12 gap-y-14 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-24">
          {/* Left: overline, display title, purchase actions */}
          <div className="flex flex-col">
            {overline ? <Overline className="justify-start px-0 font-medium">{overline}</Overline> : null}
            {title ? (
              <h1 className="mt-3 font-primary text-6xl uppercase leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl xl:text-10xl">
                {title}
              </h1>
            ) : null}

            <div className="mt-10 lg:mt-16">
              {purchase.kind === "sold-out" ? (
                <div>
                  <h3 className="font-medium text-xl">{COPY.soldOut.heading}</h3>
                  <p className="mt-2">{COPY.soldOut.body}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {purchase.consumer ? (
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="max-w-sm">
                        <h3 className="font-medium text-xl">{purchase.consumer.heading}</h3>
                        <p className="mt-2">{purchase.consumer.body}</p>
                        {consumerPrice ? <p className="mt-3 font-medium text-lg">{consumerPrice}</p> : null}
                      </div>
                      {purchase.consumer.enabled && hasOrderUrl && data ? (
                        <Button asChild variant="secondary" sectionTheme={section_theme} size="lg" className="shrink-0">
                          <PrismicNextLink field={data.product_order_url}>
                            {purchase.consumer.button}
                            <ArrowRight />
                          </PrismicNextLink>
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="lg"
                          sectionTheme={section_theme}
                          className="shrink-0"
                          disabled
                        >
                          {purchase.consumer.button}
                          <ArrowRight />
                        </Button>
                      )}
                    </div>
                  ) : null}

                  {purchase.restaurant ? (
                    <div
                      className={cn(
                        "flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between",
                        purchase.consumer && "border-current/20 border-t pt-8",
                      )}
                    >
                      <div className="max-w-sm">
                        <h3 className="font-medium text-xl">{COPY.restaurant.heading}</h3>
                        <p className="mt-2">{COPY.restaurant.body}</p>
                        <p className="mt-2">
                          {RESTAURANT_CONTACT.phoneLabel}, {RESTAURANT_CONTACT.email}
                        </p>
                        {restaurantPrice ? <p className="mt-3 font-medium text-lg">{restaurantPrice}</p> : null}
                      </div>
                      <Button asChild variant="secondary" sectionTheme={section_theme} size="lg" className="shrink-0">
                        <Link href={CONTACT_PAGE_PATH}>
                          {COPY.restaurant.button}
                          <ArrowRight />
                        </Link>
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Right: body copy, spec table, PDF download */}
          <div className="flex flex-col gap-10">
            {isFilled.richText(slice.primary.body) ? (
              <CustomRichText field={slice.primary.body} sectionTheme={section_theme} />
            ) : null}

            {rows.length > 0 ? (
              <dl className="border-current/20 border-t">
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-baseline justify-between gap-6 border-current/20 border-b py-4"
                  >
                    <dt>{row.label}</dt>
                    <dd className="text-right font-medium">{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {pdfHref || imageHref ? (
              <div className="flex flex-col gap-3">
                {pdfHref ? (
                  <Button asChild variant="secondary" sectionTheme={section_theme} size="lg" className="w-full">
                    <a href={pdfHref}>
                      {COPY.pdf}
                      <Download />
                    </a>
                  </Button>
                ) : null}
                {imageHref ? (
                  <Button asChild variant="secondary" sectionTheme={section_theme} size="lg" className="w-full">
                    <a href={imageHref}>
                      {COPY.image}
                      <Download />
                    </a>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* Special Club blurb: product pages flagged as Special Club only */}
        {specialClub &&
        (specialClub.data.tagline ||
          isFilled.richText(specialClub.data.title) ||
          isFilled.richText(specialClub.data.body)) ? (
          <div className="mt-14 border-current/20 border-t pt-14 lg:mt-20 lg:pt-16">
            <div className="grid gap-x-10 gap-y-4 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-24">
              <div className="flex flex-col">
                {specialClub.data.tagline ? (
                  <Overline className="justify-start px-0 font-medium">{specialClub.data.tagline}</Overline>
                ) : null}
                {isFilled.richText(specialClub.data.title) ? (
                  <CustomRichText field={specialClub.data.title} sectionTheme={section_theme} className="mt-3" />
                ) : null}
              </div>
              {isFilled.richText(specialClub.data.body) ? (
                <CustomRichText className="lg:mt-1.5" field={specialClub.data.body} sectionTheme={section_theme} />
              ) : null}
            </div>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
