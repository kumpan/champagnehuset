import { asText, type Content, isFilled } from "@prismicio/client";
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatAlcohol, formatDosage, formatPrice } from "@/lib/format";

/**
 * A first-pass layout so the download works end-to-end — the visual design is
 * intentionally minimal and will be revisited. Uses the built-in Helvetica so
 * no font registration is needed.
 */
const colors = {
  ink: "#232e24",
  inkDim: "#55605a",
  brand: "#456149",
  border: "#cfd9d0",
  fill: "#eaf0ec",
};

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", color: colors.ink, fontSize: 11, backgroundColor: "#ffffff" },
  overline: { fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: colors.brand, marginBottom: 8 },
  title: { fontFamily: "Helvetica-Bold", fontSize: 26, marginBottom: 24, lineHeight: 1.1 },
  columns: { flexDirection: "row", gap: 28 },
  imageWrap: {
    width: 170,
    height: 226,
    backgroundColor: colors.fill,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  image: { objectFit: "contain" },
  details: { flex: 1 },
  description: { color: colors.inkDim, lineHeight: 1.5, marginBottom: 18 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 7,
  },
  label: { color: colors.inkDim },
  value: { fontFamily: "Helvetica-Bold" },
  table: { borderTopWidth: 1, borderTopColor: colors.border },
});

function specRows(data: Content.ProductDocument["data"]): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  const push = (label: string, value?: string | null) => {
    if (value) rows.push({ label, value });
  };
  push("Artikelnummer", data.product_article_number);
  push("Pris", formatPrice(data.product_price));
  push("Volym", data.product_volume);
  push("Druvor", data.product_grapes);
  push("Dosage", formatDosage(data.product_dosage_grams));
  push("Alkohol", formatAlcohol(data.product_alcohol));
  push("Lagring", data.product_storage);
  push("Ursprung", [data.product_region, data.product_cru].filter(Boolean).join(", ") || null);
  return rows;
}

export function ProductPdfDocument({ product }: { product: Content.ProductDocument }) {
  const data = product.data;
  const producerName = isFilled.contentRelationship(data.product_producer)
    ? (data.product_producer.data?.producer_name ?? undefined)
    : undefined;
  const rows = specRows(data);
  const imageUrl = isFilled.image(data.product_image) ? data.product_image.url : null;
  const description = isFilled.richText(data.product_description) ? asText(data.product_description) : null;

  return (
    <Document title={data.product_name ?? "Product"} author={producerName}>
      <Page size="A4" style={styles.page}>
        {producerName ? <Text style={styles.overline}>{producerName}</Text> : null}
        <Text style={styles.title}>{data.product_name ?? "Product"}</Text>

        <View style={styles.columns}>
          {imageUrl ? (
            <View style={styles.imageWrap}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={imageUrl} style={styles.image} />
            </View>
          ) : null}

          <View style={styles.details}>
            {description ? <Text style={styles.description}>{description}</Text> : null}
            <View style={styles.table}>
              {rows.map((row) => (
                <View key={row.label} style={styles.row}>
                  <Text style={styles.label}>{row.label}</Text>
                  <Text style={styles.value}>{row.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
