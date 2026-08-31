import path from "node:path";
import { type Content, isFilled, type RichTextField } from "@prismicio/client";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatAlcohol, formatDosage, formatGrapes, formatGrapesWithShares, productVolumes } from "@/lib/format";
import type { ConsumerAvailability } from "@/slices/Text/text-info-config";

/**
 * ChampagneHuset "Produktblad" — a one-page product sheet in the site brand:
 * The Portray display serif (registered from the same local woff2 the site
 * ships) over a neutral sans, on the green-ink / champagne-gold palette from `globals.css`.
 */

Font.register({
  family: "Portray",
  fonts: [
    { src: path.join(process.cwd(), "app/fonts/ThePortrayRegular.woff2"), fontWeight: 400 },
    { src: path.join(process.cwd(), "app/fonts/ThePortrayItalic.woff2"), fontWeight: 400, fontStyle: "italic" },
  ],
});
// Don't split mid-word.
Font.registerHyphenationCallback((word) => [word]);

const BRAND = {
  wordmark: "ChampagneHuset",
  kicker: "PRODUKTBLAD",
  tagline: "Små odlare, stora champagner.",
  site: "champagnehuset.se",
  country: "Frankrike",
} as const;

const c = {
  paper: "#eef1ec",
  card: "#ffffff",
  ink: "#232f24",
  inkDim: "#59685c",
  inkMute: "#8a978c",
  brand: "#46624a",
  gold: "#bf9f4c",
  line: "#d6ded7",
  hairline: "#e2e8e2",
  badgeBg: "#e3ece5",
  badgeInk: "#3c5540",
  goldBadgeBg: "#f2e9cf",
  goldBadgeInk: "#7c6320",
} as const;

const s = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingHorizontal: 42,
    paddingBottom: 66,
    backgroundColor: c.paper,
    color: c.ink,
    fontFamily: "Helvetica",
    fontSize: 10,
  },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  wordmark: { fontFamily: "Portray", fontStyle: "italic", fontSize: 15, color: c.brand },
  kicker: { fontFamily: "Helvetica-Bold", fontSize: 8, letterSpacing: 2.4, color: c.inkMute },
  rule: { height: 1, backgroundColor: c.line, marginTop: 12 },

  // Category + badges
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 26 },
  meta: { fontFamily: "Helvetica-Bold", fontSize: 8.5, letterSpacing: 1.6, color: c.inkDim },
  badge: { borderRadius: 2, paddingVertical: 3, paddingHorizontal: 7 },
  badgeText: { fontFamily: "Helvetica-Bold", fontSize: 7, letterSpacing: 1.2 },

  // Title
  title: { fontFamily: "Portray", fontSize: 33, letterSpacing: 0.5, lineHeight: 1.02, marginTop: 10 },
  subtitle: { marginTop: 8 },
  subtitleName: { fontFamily: "Portray", fontStyle: "italic", fontSize: 14, color: c.brand },
  subtitleMeta: { fontFamily: "Helvetica", fontSize: 10, color: c.inkDim },
  accent: { width: 46, height: 2.5, backgroundColor: c.gold, marginTop: 14 },

  // Body columns
  columns: { flexDirection: "row", gap: 26, marginTop: 26 },
  imageColumn: { width: 188 },
  imagePanel: {
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.hairline,
    borderRadius: 4,
    overflow: "hidden",
  },
  imagePanelEmpty: { height: 250, alignItems: "center", justifyContent: "center" },
  image: { width: "100%" },
  imageCaption: { marginTop: 8, fontSize: 7.5, letterSpacing: 1, color: c.inkMute, textAlign: "center" },

  body: { flex: 1 },
  sectionHeading: { fontFamily: "Helvetica-Bold", fontSize: 8.5, letterSpacing: 1.8, color: c.brand, marginBottom: 6 },
  sectionSpaced: { marginTop: 14 },
  paragraph: { fontSize: 10, lineHeight: 1.5, color: c.inkDim, marginBottom: 6 },
  listRow: { flexDirection: "row", marginBottom: 3 },
  listBullet: { width: 14, fontSize: 10, color: c.gold },
  listText: { flex: 1, fontSize: 10, lineHeight: 1.45, color: c.inkDim },

  // Spec grid
  specCard: {
    marginTop: 26,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.hairline,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 18,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  specCell: { width: "33.333%", paddingVertical: 11, paddingLeft: 12 },
  specLabel: { fontFamily: "Helvetica-Bold", fontSize: 7, letterSpacing: 1.4, color: c.inkMute, marginBottom: 4 },
  specValue: { fontFamily: "Helvetica", fontSize: 11, color: c.ink },

  // Availability + prices
  availabilityCard: {
    marginTop: 10,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.hairline,
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 30,
  },
  availabilityLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 1.4,
    color: c.inkMute,
    marginBottom: 6,
  },
  availabilityRows: { gap: 5 },
  availabilityRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: 12 },
  availabilityChannel: { fontFamily: "Helvetica", fontSize: 11, color: c.ink },
  availabilityPrice: { fontFamily: "Helvetica", fontSize: 11, color: c.ink },
  availabilityPriceLabel: { fontFamily: "Helvetica-Bold", fontSize: 7, letterSpacing: 1.4, color: c.inkMute },

  // Footer
  footer: {
    position: "absolute",
    left: 42,
    right: 42,
    bottom: 30,
    borderTopWidth: 1,
    borderTopColor: c.line,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 8, letterSpacing: 0.3, color: c.inkMute },
});

type Spec = { label: string; value: string };

/** Selects use "None" as their explicit empty option — treat it like an unfilled field. */
function omitNone(value: string | null | undefined): string | null {
  return !value || value === "None" ? null : value;
}

function buildSpecs(data: Content.ProductDocument["data"], producerName?: string, village?: string | null): Spec[] {
  const specs: Spec[] = [];
  const push = (label: string, value?: string | null) => {
    const clean = omitNone(value);
    if (clean) specs.push({ label, value: clean });
  };

  push("Producent", producerName ?? null);
  push("Region", [omitNone(data.product_region), omitNone(data.product_cru)].filter(Boolean).join(" · ") || null);
  push("By", village ?? null);
  push("Druvor", formatGrapesWithShares(data.product_grapes));
  push("Stil", data.product_style);
  push(
    "Dosage",
    [omitNone(data.product_dosage), formatDosage(data.product_dosage_grams)].filter(Boolean).join(" · ") || null,
  );
  push("Alkohol", formatAlcohol(data.product_alcohol));
  push("Årgång", data.product_vintage === "Yes" ? data.product_year : null);
  push("Volym", productVolumes(data).join(", ") || null);
  push("Lagring", data.product_storage);
  push("Land", BRAND.country);
  push("Artikelnummer", data.product_article_number);

  return specs;
}

/** Swedish visitor copy for the English-stored consumer availability values. */
const CONSUMER_CHANNELS: Record<Exclude<ConsumerAvailability, null>, string> = {
  "Systembolaget Beställningssortiment": "Systembolaget – beställningssortiment",
  "Systembolaget Tillfälligt Sortiment": "Systembolaget – tillfälligt sortiment",
  "Private Import": "Privatimport",
  "Sold Out": "Slutsåld",
};

type AvailabilityRow = { channel: string | null; priceLabel: string; price: string | null };

/** One row per sales channel: availability copy left, price (when filled) right. */
function buildAvailability(data: Content.ProductDocument["data"]): AvailabilityRow[] {
  const consumer = data.product_consumer_availability;
  const consumerChannel = consumer ? CONSUMER_CHANNELS[consumer] : null;
  const restaurantChannel = data.product_restaurant_availability === "Available" ? "Tillgänglig för restaurang" : null;

  const rows: AvailabilityRow[] = [];
  if (consumerChannel || data.product_price_consumer) {
    rows.push({ channel: consumerChannel, priceLabel: "Pris privat", price: data.product_price_consumer || null });
  }
  if (restaurantChannel || data.product_price_restaurant) {
    rows.push({
      channel: restaurantChannel,
      priceLabel: "Pris restaurang",
      price: data.product_price_restaurant || null,
    });
  }
  return rows;
}

/** Category / origin line, e.g. "BLANC DE BLANCS · CÔTE DES BLANCS, FRANKRIKE". */
function buildMetaLine(data: Content.ProductDocument["data"]): string {
  const lead = omitNone(data.product_style) || formatGrapes(data.product_grapes) || "Champagne";
  const origin = [omitNone(data.product_region), BRAND.country].filter(Boolean).join(", ");
  return [lead, origin].filter(Boolean).join(" · ").toUpperCase();
}

type Badge = { text: string; gold?: boolean };

function buildBadges(data: Content.ProductDocument["data"]): Badge[] {
  const badges: Badge[] = [];
  const cru = omitNone(data.product_cru);
  if (cru) badges.push({ text: cru, gold: true });
  if (data.product_ecologic === "Yes") badges.push({ text: "Ekologisk" });
  if (data.product_vintage === "Yes") badges.push({ text: "Årgångschampagne" });
  return badges;
}

/* ---------- Rich text → PDF ---------- */

type Span = { start: number; end: number; type: string };
type Segment = { text: string; bold: boolean; italic: boolean };

/** Split a block's text into runs that share the same bold/italic styling. */
function inlineSegments(text: string, spans: Span[]): Segment[] {
  if (!text) return [];
  const bold = new Array(text.length).fill(false);
  const italic = new Array(text.length).fill(false);
  for (const span of spans) {
    for (let i = span.start; i < span.end && i < text.length; i++) {
      if (span.type === "strong") bold[i] = true;
      if (span.type === "em") italic[i] = true;
    }
  }
  const segments: Segment[] = [];
  let current: Segment | null = null;
  for (let i = 0; i < text.length; i++) {
    if (!current || current.bold !== bold[i] || current.italic !== italic[i]) {
      current = { text: "", bold: bold[i], italic: italic[i] };
      segments.push(current);
    }
    current.text += text[i];
  }
  return segments;
}

function inlineFont(bold: boolean, italic: boolean): string {
  if (bold && italic) return "Helvetica-BoldOblique";
  if (bold) return "Helvetica-Bold";
  if (italic) return "Helvetica-Oblique";
  return "Helvetica";
}

function Inline({ text, spans }: { text: string; spans: Span[] }) {
  return (
    <>
      {inlineSegments(text, spans).map((seg, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: styled runs of one static string, never reordered.
        <Text key={i} style={{ fontFamily: inlineFont(seg.bold, seg.italic) }}>
          {seg.text}
        </Text>
      ))}
    </>
  );
}

function Description({ field }: { field: RichTextField }) {
  let ordinal = 0;
  return (
    <>
      {field.map((block, i) => {
        // biome-ignore lint/suspicious/noExplicitAny: the Prismic block union is awkward to narrow structurally.
        const b = block as any;
        const spans: Span[] = b.spans ?? [];
        if (block.type === "list-item") {
          ordinal = 0;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: static rich-text blocks, never reordered.
            <View key={i} style={s.listRow} wrap={false}>
              <Text style={s.listBullet}>•</Text>
              <Text style={s.listText}>
                <Inline text={b.text} spans={spans} />
              </Text>
            </View>
          );
        }
        if (block.type === "o-list-item") {
          ordinal += 1;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: static rich-text blocks, never reordered.
            <View key={i} style={s.listRow} wrap={false}>
              <Text style={s.listBullet}>{`${ordinal}.`}</Text>
              <Text style={s.listText}>
                <Inline text={b.text} spans={spans} />
              </Text>
            </View>
          );
        }
        ordinal = 0;
        if (!b.text) return null;
        const heading = typeof block.type === "string" && block.type.startsWith("heading");
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: static rich-text blocks, never reordered.
          <Text key={i} style={heading ? [s.paragraph, { fontFamily: "Helvetica-Bold", color: c.ink }] : s.paragraph}>
            <Inline text={b.text} spans={spans} />
          </Text>
        );
      })}
    </>
  );
}

/* ---------- Document ---------- */

export function ProductPdfDocument({
  product,
  imageSrc,
  contacts,
  producerVillage,
  producerBio,
}: {
  product: Content.ProductDocument;
  imageSrc?: string | null;
  contacts?: string[];
  /** Producer's commune and bio, fetched from the linked producer document. */
  producerVillage?: string | null;
  producerBio?: RichTextField | null;
}) {
  const data = product.data;
  const producerName = isFilled.contentRelationship(data.product_producer)
    ? (data.product_producer.data?.producer_name ?? undefined)
    : undefined;

  const name = data.product_name || "Champagne";
  const specs = buildSpecs(data, producerName, producerVillage);
  const availability = buildAvailability(data);
  const metaLine = buildMetaLine(data);
  const badges = buildBadges(data);
  const bio = isFilled.richText(producerBio) ? producerBio : null;
  const description = isFilled.richText(data.product_description) ? data.product_description : null;

  const subMeta = [omitNone(data.product_dosage), data.product_vintage === "Yes" ? data.product_year : null]
    .filter(Boolean)
    .join(" · ");

  const contactLine = contacts?.filter(Boolean).join("    ·    ");
  const footerLeft = contactLine || `${BRAND.wordmark} · ${BRAND.site}`;
  const footerRight = contactLine ? `${BRAND.wordmark} · ${BRAND.site}` : BRAND.tagline;

  return (
    <Document title={name} author={producerName ?? BRAND.wordmark} creator={BRAND.wordmark}>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.wordmark}>{BRAND.wordmark}</Text>
          <Text style={s.kicker}>{BRAND.kicker}</Text>
        </View>
        <View style={s.rule} />

        {/* Category + badges */}
        <View style={s.metaRow}>
          {metaLine ? <Text style={s.meta}>{metaLine}</Text> : null}
          {badges.map((badge) => (
            <View key={badge.text} style={[s.badge, { backgroundColor: badge.gold ? c.goldBadgeBg : c.badgeBg }]}>
              <Text style={[s.badgeText, { color: badge.gold ? c.goldBadgeInk : c.badgeInk }]}>
                {badge.text.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>

        {/* Title + subtitle */}
        <Text style={s.title}>{name.toUpperCase()}</Text>
        {producerName || subMeta ? (
          <Text style={s.subtitle}>
            {producerName ? <Text style={s.subtitleName}>{producerName}</Text> : null}
            {producerName && subMeta ? <Text style={s.subtitleMeta}>{"  ·  "}</Text> : null}
            {subMeta ? <Text style={s.subtitleMeta}>{subMeta}</Text> : null}
          </Text>
        ) : null}
        <View style={s.accent} />

        {/* Body: image + description */}
        <View style={s.columns}>
          <View style={s.imageColumn}>
            {imageSrc ? (
              <View style={s.imagePanel}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={imageSrc} style={s.image} />
              </View>
            ) : (
              <View style={[s.imagePanel, s.imagePanelEmpty]}>
                <Text style={{ fontSize: 8, color: c.inkMute }}>Ingen bild</Text>
              </View>
            )}
            {data.product_article_number ? (
              <Text style={s.imageCaption}>{`ART. ${data.product_article_number}`}</Text>
            ) : null}
          </View>

          <View style={s.body}>
            {bio ? (
              <View>
                <Text style={s.sectionHeading}>
                  {producerName ? `OM ${producerName.toUpperCase()}` : "OM PRODUCENTEN"}
                </Text>
                <Description field={bio} />
              </View>
            ) : null}
            {description ? (
              <View>
                <Text style={bio ? [s.sectionHeading, s.sectionSpaced] : s.sectionHeading}>OM CHAMPAGNEN</Text>
                <Description field={description} />
              </View>
            ) : null}
          </View>
        </View>

        {/* Spec grid */}
        {specs.length > 0 ? (
          <View style={s.specCard} wrap={false}>
            {specs.map((spec) => (
              <View key={spec.label} style={s.specCell}>
                <Text style={s.specLabel}>{spec.label.toUpperCase()}</Text>
                <Text style={s.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Availability + prices */}
        {availability.length > 0 ? (
          <View style={s.availabilityCard} wrap={false}>
            <Text style={s.availabilityLabel}>TILLGÄNGLIGHET</Text>
            <View style={s.availabilityRows}>
              {availability.map((row) => (
                <View key={row.priceLabel} style={s.availabilityRow}>
                  {/* Empty spacer keeps a lone price right-aligned under space-between. */}
                  {row.channel ? <Text style={s.availabilityChannel}>{row.channel}</Text> : <Text />}
                  {row.price ? (
                    <Text style={s.availabilityPrice}>
                      <Text style={s.availabilityPriceLabel}>{`${row.priceLabel.toUpperCase()}  `}</Text>
                      {row.price}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{footerLeft}</Text>
          <Text style={s.footerText}>{footerRight}</Text>
        </View>
      </Page>
    </Document>
  );
}
