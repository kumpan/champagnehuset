import { type Content, isFilled } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import type { SliceComponentProps } from "@prismicio/react";
import { Button } from "@/components/button";
import { CustomRichText } from "@/components/custom-rich-text";
import { iconMap } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Overline } from "@/components/overline";
import { formatAlcohol, formatDosage, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { COPY, RESTAURANT_CONTACT, resolvePurchase } from "../config";

const ArrowRight = iconMap.arrowRight;
const PhoneCall = iconMap.phoneCall;
const AtSign = iconMap.atSign;
const Download = iconMap.download;

/** The dynamic-page template passes the current document in as slice context. */
type ProductDetailContext = {
  lang?: string;
  document?: Content.AllDocumentTypes;
};

const darkButton = "bg-brand-fill text-ink-flip hover:bg-brand-fill/90";

export function ProductDetailDefault({ slice, context }: SliceComponentProps<Content.ProductDetailSlice>) {
  const ctx = context as ProductDetailContext | undefined;
  const doc = ctx?.document;
  const product = doc?.type === "product" ? doc : undefined;
  const data = product?.data;

  const theme = slice.primary.section_theme || "Bud";

  // Editorial fields fall back to the producer / product name when left blank.
  const producerName = isFilled.contentRelationship(data?.product_producer)
    ? (data?.product_producer.data?.producer_name ?? undefined)
    : undefined;
  const overline = slice.primary.overline || producerName || "";
  const title = slice.primary.title || data?.product_name || "";

  // Spec rows — only the ones that have a value are rendered.
  const rows: { label: string; value: string }[] = [];
  const push = (label: string, value?: string | null) => {
    if (value) rows.push({ label, value });
  };
  if (data) {
    push("Artikelnummer", data.product_article_number);
    push("Pris", formatPrice(data.product_price));
    push("Volym", data.product_volume);
    push("Druvor", data.product_grapes);
    push("Dosage", formatDosage(data.product_dosage_grams));
    push("Alkohol", formatAlcohol(data.product_alcohol));
    push("Lagring", data.product_storage);
    push("Ursprung", [data.product_region, data.product_cru].filter(Boolean).join(", ") || null);
  }

  const hasOrderUrl = isFilled.link(data?.product_order_url);
  const purchase = resolvePurchase(
    data?.product_consumer_availability ?? null,
    data?.product_restaurant_availability ?? null,
    hasOrderUrl,
  );

  const pdfHref = product?.uid
    ? `/api/product-pdf?uid=${encodeURIComponent(product.uid)}&lang=${encodeURIComponent(product.lang)}`
    : null;

  return (
    <Section sectionTheme={theme} removeTopPadding={slice.primary.remove_top_padding}>
      <Container>
        <div className="grid gap-x-12 gap-y-14 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-24">
          {/* Left: overline, display title, purchase actions */}
          <div className="flex flex-col">
            {overline ? <Overline className="justify-start px-0 font-medium">{overline}</Overline> : null}
            {title ? (
              <h1 className="mt-3 font-primary text-6xl uppercase leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl xl:text-9xl">
                {title}
              </h1>
            ) : null}

            <div className="mt-10 lg:mt-16">
              {purchase.kind === "sold-out" ? (
                <div>
                  <h2 className="font-medium font-secondary text-xl">{COPY.soldOut.heading}</h2>
                  <p className="mt-2 text-ink-dim">{COPY.soldOut.body}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {purchase.consumer ? (
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="max-w-sm">
                        <h2 className="font-medium font-secondary text-xl">{purchase.consumer.heading}</h2>
                        <p className="mt-2 text-ink-dim">{purchase.consumer.body}</p>
                      </div>
                      {purchase.consumer.enabled && hasOrderUrl && data ? (
                        <Button asChild variant="secondary" size="lg" className="shrink-0">
                          <PrismicNextLink field={data.product_order_url}>
                            {purchase.consumer.button}
                            <ArrowRight />
                          </PrismicNextLink>
                        </Button>
                      ) : (
                        <Button variant="secondary" size="lg" className="shrink-0" disabled>
                          {purchase.consumer.button}
                          <ArrowRight />
                        </Button>
                      )}
                    </div>
                  ) : null}

                  {purchase.restaurant ? (
                    <div className={cn(purchase.consumer && "border-border border-t pt-8")}>
                      <h2 className="font-medium font-secondary text-xl">{COPY.restaurant.heading}</h2>
                      <p className="mt-2 max-w-md text-ink-dim">{COPY.restaurant.body}</p>
                      <p className="mt-4 text-ink-dim">
                        {RESTAURANT_CONTACT.phoneLabel}, {RESTAURANT_CONTACT.email}
                      </p>
                      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Button asChild size="lg" className={darkButton}>
                          <a href={RESTAURANT_CONTACT.phoneHref}>
                            <PhoneCall />
                            {COPY.restaurant.call}
                          </a>
                        </Button>
                        <Button asChild size="lg" className={darkButton}>
                          <a href={`mailto:${RESTAURANT_CONTACT.email}`}>
                            <AtSign />
                            {COPY.restaurant.mail}
                          </a>
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Right: body copy, spec table, PDF download */}
          <div className="flex flex-col gap-10">
            {isFilled.richText(slice.primary.body) ? (
              <CustomRichText field={slice.primary.body} sectionTheme={theme} />
            ) : null}

            {rows.length > 0 ? (
              <dl className="border-border border-t">
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-baseline justify-between gap-6 border-border border-b py-4"
                  >
                    <dt className="text-ink-dim">{row.label}</dt>
                    <dd className="text-right font-medium text-ink">{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {pdfHref ? (
              <Button asChild variant="outline" size="lg" className="w-full">
                <a href={pdfHref}>
                  {COPY.pdf}
                  <Download />
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
