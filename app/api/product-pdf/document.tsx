import path from "node:path";
import { type Content, isFilled, type RichTextField } from "@prismicio/client";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  formatAlcohol,
  formatDosage,
  formatGrapes,
  formatGrapesWithShares,
  formatPrice,
  productVolumes,
} from "@/lib/format";
import type { ConsumerAvailability } from "@/slices/Text/text-info-config";

/**
 * ChampagneHuset "Produktblad" — a product sheet hard-capped to one A4 page, in the site brand:
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

/**
 * The producer bio and the champagne description share a fixed text area beside the
 * bottle, sized so a two line title, the availability card and a four row spec grid
 * still fit above the footer. Copy that does not fit is cut at a word with an ellipsis.
 * The other numbers mirror the text styles below so the budget can be measured in points.
 */
const TEXT_AREA_HEIGHT = 205;
const TEXT_WIDTH = 595.28 - 42 * 2 - 188 - 26;
const LINE_HEIGHT = 10 * 1.45;
const PARAGRAPH_GAP = 5;
const LIST_GAP = 3;
const LIST_BULLET_WIDTH = 14;
const HEADING_HEIGHT = 15.1;
const SECTION_GAP = 14;
const DESCRIPTION_MIN_LINES = 3;

const s = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingHorizontal: 42,
    paddingBottom: 60,
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
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 20 },
  meta: { fontFamily: "Helvetica-Bold", fontSize: 8.5, letterSpacing: 1.6, color: c.inkDim },
  badge: { borderRadius: 2, paddingVertical: 3, paddingHorizontal: 7 },
  badgeText: { fontFamily: "Helvetica-Bold", fontSize: 7, letterSpacing: 1.2 },

  // Title
  title: { fontFamily: "Portray", fontSize: 33, letterSpacing: 0.5, lineHeight: 1.02, marginTop: 10 },
  subtitle: { marginTop: 6 },
  subtitleName: { fontFamily: "Portray", fontStyle: "italic", fontSize: 14, color: c.brand },
  subtitleMeta: { fontFamily: "Helvetica", fontSize: 10, color: c.inkDim },
  accent: { width: 46, height: 2.5, backgroundColor: c.gold, marginTop: 12 },

  // Body columns
  columns: { flexDirection: "row", gap: 26, marginTop: 16 },
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
  // Fixed height so long copy can never push the spec grid off the page
  textArea: { height: TEXT_AREA_HEIGHT, overflow: "hidden" },
  sectionHeading: { fontFamily: "Helvetica-Bold", fontSize: 8.5, letterSpacing: 1.8, color: c.brand, marginBottom: 6 },
  sectionSpaced: { marginTop: 14 },
  paragraph: { fontSize: 10, lineHeight: 1.45, color: c.inkDim, marginBottom: 5 },
  listRow: { flexDirection: "row", marginBottom: 3 },
  listBullet: { width: 14, fontSize: 10, color: c.gold },
  listText: { flex: 1, fontSize: 10, lineHeight: 1.45, color: c.inkDim },

  // Spec grid
  specCard: {
    marginTop: 16,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.hairline,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 18,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  specCell: { width: "33.333%", paddingVertical: 7, paddingLeft: 12 },
  specLabel: { fontFamily: "Helvetica-Bold", fontSize: 7, letterSpacing: 1.4, color: c.inkMute, marginBottom: 4 },
  specValue: { fontFamily: "Helvetica", fontSize: 11, color: c.ink },

  // Availability + prices
  availabilityWrap: { marginTop: "auto", paddingTop: 8 },
  availabilityCard: {
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.hairline,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  availabilityLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 1.4,
    color: c.brand,
    marginBottom: 8,
  },
  availabilityTiles: { flexDirection: "row", gap: 16 },
  availabilityTile: { flex: 1 },
  availabilityTileLabel: { fontFamily: "Helvetica-Bold", fontSize: 7, letterSpacing: 1.4, color: c.inkMute },
  availabilityPrice: { fontFamily: "Helvetica", fontSize: 14, color: c.ink, marginTop: 4 },
  availabilityChannel: { fontSize: 9, lineHeight: 1.35, color: c.inkDim, marginTop: 3 },

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

type AvailabilityTile = { label: string; channel: string | null; price: string | null };

/** One tile per sales channel: price on top, availability copy under it. */
function buildAvailability(data: Content.ProductDocument["data"]): AvailabilityTile[] {
  const consumer = data.product_consumer_availability;
  const consumerChannel = consumer ? CONSUMER_CHANNELS[consumer] : null;
  const restaurantChannel = data.product_restaurant_availability === "Available" ? "Tillgänglig" : null;

  const tiles: AvailabilityTile[] = [];
  const consumerPrice = formatPrice(data.product_price_consumer);
  const restaurantPrice = formatPrice(data.product_price_restaurant);
  if (consumerChannel || consumerPrice) {
    tiles.push({ label: "Privat", channel: consumerChannel, price: consumerPrice });
  }
  if (restaurantChannel || restaurantPrice) {
    tiles.push({ label: "Restaurang", channel: restaurantChannel, price: restaurantPrice });
  }
  return tiles;
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

/* ---------- Text budget ---------- */

type TextBlock = { type: string; text?: string; spans?: Span[] };
type Measure = (text: string) => number;

/** Width of a string at body size, using the same Helvetica metrics react-pdf lays out with. */
async function loadMeasure(): Promise<Measure> {
  const source = Font.getFont({ fontFamily: "Helvetica", fontWeight: 400, fontStyle: "normal" });
  await source.load();
  const font = source.data;
  if (!font) return (text) => text.length * 5;
  return (text) => (font.layout(text).advanceWidth * 10) / font.unitsPerEm;
}

/** Greedy word wrap, which is what the layout engine ends up with for plain prose. */
function countLines(text: string, width: number, measure: Measure): number {
  const space = measure(" ");
  let lines = 0;
  for (const line of text.split("\n")) {
    lines += 1;
    let current = 0;
    for (const word of line.split(/\s+/).filter(Boolean)) {
      const wordWidth = measure(word);
      if (current > 0 && current + space + wordWidth > width) {
        lines += 1;
        current = wordWidth;
      } else {
        current = current > 0 ? current + space + wordWidth : wordWidth;
      }
    }
  }
  return lines;
}

const isList = (block: TextBlock) => block.type === "list-item" || block.type === "o-list-item";

function blockHeight(block: TextBlock, measure: Measure): number {
  const list = isList(block);
  const lines = countLines(block.text ?? "", list ? TEXT_WIDTH - LIST_BULLET_WIDTH : TEXT_WIDTH, measure);
  return lines * LINE_HEIGHT + (list ? LIST_GAP : PARAGRAPH_GAP);
}

function sectionHeight(field: TextBlock[], measure: Measure): number {
  return field.reduce((sum, block) => (block.text ? sum + blockHeight(block, measure) : sum), HEADING_HEIGHT);
}

/** Keep as many whole words as fit in maxHeight and end with an ellipsis. Null when not even one word fits. */
function cutBlock(block: TextBlock, maxHeight: number, measure: Measure): TextBlock | null {
  const words = (block.text ?? "").split(/\s+/).filter(Boolean);
  let kept = "";
  for (let i = 1; i <= words.length; i++) {
    const candidate = words.slice(0, i).join(" ");
    if (blockHeight({ ...block, text: `${candidate}…` }, measure) > maxHeight) break;
    kept = candidate;
  }
  if (!kept) return null;
  const text = `${kept.replace(/[\s.,;:!?–-]+$/, "")}…`;
  const spans = (block.spans ?? [])
    .filter((span) => span.start < kept.length)
    .map((span) => ({ ...span, end: Math.min(span.end, kept.length) }));
  return { ...block, text, spans };
}

/** Blocks of one section that fit in maxHeight including its heading, and the height they take. */
function fitSection(field: TextBlock[], maxHeight: number, measure: Measure) {
  const blocks: TextBlock[] = [];
  let height = HEADING_HEIGHT;
  for (const block of field) {
    if (!block.text) continue;
    const needed = blockHeight(block, measure);
    if (height + needed <= maxHeight) {
      blocks.push(block);
      height += needed;
      continue;
    }
    const cut = cutBlock(block, maxHeight - height, measure);
    if (cut) {
      blocks.push(cut);
      height = maxHeight;
    }
    break;
  }
  return blocks.length > 0 ? { blocks: blocks as unknown as RichTextField, height } : null;
}

/** Share the text area between bio and description. A long bio still leaves the description a few lines. */
async function budgetTexts(bio: RichTextField | null, description: RichTextField | null) {
  const measure = await loadMeasure();
  const bioBlocks = bio as unknown as TextBlock[] | null;
  const descriptionBlocks = description as unknown as TextBlock[] | null;

  const reserved = descriptionBlocks
    ? Math.min(
        sectionHeight(descriptionBlocks, measure),
        HEADING_HEIGHT + DESCRIPTION_MIN_LINES * LINE_HEIGHT + PARAGRAPH_GAP,
      ) + SECTION_GAP
    : 0;
  const fittedBio = bioBlocks ? fitSection(bioBlocks, TEXT_AREA_HEIGHT - reserved, measure) : null;
  const used = fittedBio ? fittedBio.height + SECTION_GAP : 0;
  const fittedDescription = descriptionBlocks ? fitSection(descriptionBlocks, TEXT_AREA_HEIGHT - used, measure) : null;

  return { bio: fittedBio?.blocks ?? null, description: fittedDescription?.blocks ?? null };
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

export async function ProductPdfDocument({
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
  const { bio, description } = await budgetTexts(
    isFilled.richText(producerBio) ? producerBio : null,
    isFilled.richText(data.product_description) ? data.product_description : null,
  );

  const subMeta = [omitNone(data.product_dosage), data.product_vintage === "Yes" ? data.product_year : null]
    .filter(Boolean)
    .join(" · ");

  const contactLine = contacts?.filter(Boolean).join("    ·    ");
  const footerLeft = contactLine || `${BRAND.wordmark} · ${BRAND.site}`;
  const footerRight = contactLine ? `${BRAND.wordmark} · ${BRAND.site}` : BRAND.tagline;

  return (
    <Document title={name} author={producerName ?? BRAND.wordmark} creator={BRAND.wordmark}>
      <Page size="A4" style={s.page}>
        {/* Footer comes first in tree order, react-pdf drops fixed nodes placed after an overflowing block */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{footerLeft}</Text>
          <Text style={s.footerText}>{footerRight}</Text>
        </View>

        {/* One non-wrapping block keeps the sheet to a single page, overflow is clipped rather than spilling onto page two */}
        <View wrap={false}>
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
              <View style={s.textArea}>
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

              {/* Availability + prices, pinned to the bottom of the column beside the bottle */}
              {availability.length > 0 ? (
                <View style={s.availabilityWrap}>
                  <View style={s.availabilityCard}>
                    <Text style={s.availabilityLabel}>TILLGÄNGLIGHET</Text>
                    <View style={s.availabilityTiles}>
                      {availability.map((tile) => (
                        <View key={tile.label} style={s.availabilityTile}>
                          <Text style={s.availabilityTileLabel}>{tile.label.toUpperCase()}</Text>
                          {tile.price ? <Text style={s.availabilityPrice}>{tile.price}</Text> : null}
                          {tile.channel ? <Text style={s.availabilityChannel}>{tile.channel}</Text> : null}
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ) : null}
            </View>
          </View>

          {/* Spec grid */}
          {specs.length > 0 ? (
            <View style={s.specCard}>
              {specs.map((spec) => (
                <View key={spec.label} style={s.specCell}>
                  <Text style={s.specLabel}>{spec.label.toUpperCase()}</Text>
                  <Text style={s.specValue}>{spec.value}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}
