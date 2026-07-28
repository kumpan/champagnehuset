/**
 * Shared helpers for the Prismic migration scripts (migrate.mjs, repair.mjs).
 */

export const REPO = "champagnehuset";
export const TAG = "ai-import";

/** Deterministic per-uid hash, so "random" test data stays stable across reruns. */
function hash(seed) {
  return [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function pickFrom(options, seed) {
  return options[hash(seed) % options.length];
}

/** Existing bottle-0X assets from the media library (reused, never re-uploaded). */
export async function fetchBottleAssets(writeToken) {
  const response = await fetch("https://asset-api.prismic.io/assets?limit=100&keyword=bottle", {
    headers: { Authorization: `Bearer ${writeToken}`, repository: REPO },
  });
  if (!response.ok) throw new Error(`Asset API ${response.status}: ${await response.text()}`);
  const assets = (await response.json()).items
    .filter((asset) => /^bottle-\d+\.(png|jpe?g|webp)$/i.test(asset.filename))
    .sort((a, b) => a.filename.localeCompare(b.filename));
  if (assets.length === 0) throw new Error("No bottle-0X assets found in the media library");
  return assets;
}

/** The product type's Bottle Image constraint (customtypes/product/index.json).
 * Matches the uploaded assets exactly, so the computed edit is a no-op
 * (zoom 1, no crop, no upscale) and images serve exactly as uploaded. */
const PRODUCT_IMAGE_CONSTRAINT = { width: 640, height: 800 };

/**
 * Full image-field payload pointing at an existing media library asset.
 *
 * The `edit` params center-cover the asset in the type's constraint frame.
 * With the naive `{x:0, y:0, zoom:1}`, Prismic anchors the constraint crop
 * to the top-left corner (e.g. rect=0,0,600,800 on a 640x800 asset), which
 * shifts the subject off-center in the served file, and CSS can't fix it.
 */
export function imageField(asset, alt, constraint = PRODUCT_IMAGE_CONSTRAINT) {
  const zoom = Math.max(constraint.width / asset.width, constraint.height / asset.height);
  return {
    id: asset.id,
    url: asset.url,
    dimensions: { width: constraint.width, height: constraint.height },
    edit: {
      x: -(asset.width * zoom - constraint.width) / 2,
      y: -(asset.height * zoom - constraint.height) / 2,
      zoom,
      background: "transparent",
    },
    alt: alt ?? null,
    copyright: null,
  };
}

export function pickBottle(uid, assets) {
  return assets[hash(uid) % assets.length];
}

// --- Articles ------------------------------------------------------------

/** The article type's Article Image (4:3) and Meta Image constraints. */
export const ARTICLE_IMAGE_CONSTRAINT = { width: 1440, height: 1080 };
export const ARTICLE_META_CONSTRAINT = { width: 2400, height: 1260 };

/** Existing article-0X assets from the media library (reused, never re-uploaded). */
export async function fetchArticleAssets(writeToken) {
  const response = await fetch("https://asset-api.prismic.io/assets?limit=100&keyword=article", {
    headers: { Authorization: `Bearer ${writeToken}`, repository: REPO },
  });
  if (!response.ok) throw new Error(`Asset API ${response.status}: ${await response.text()}`);
  const assets = (await response.json()).items
    .filter((asset) => /^article-\d+\.(png|jpe?g|webp)$/i.test(asset.filename))
    .sort((a, b) => a.filename.localeCompare(b.filename));
  if (assets.length === 0) throw new Error("No article-0X assets found in the media library");
  return assets;
}

/** Deterministic random article image per uid (salted so it's independent of the date). */
export function pickArticleImage(uid, assets) {
  return assets[hash(`${uid}img`) % assets.length];
}

/**
 * Deterministic "random" date per uid, as an ISO YYYY-MM-DD string.
 * Spread across the window [from, to] so cards sort and read plausibly.
 */
export function randomDate(uid, from = "2024-08-01", to = "2026-07-20") {
  const start = Date.parse(from);
  const span = Date.parse(to) - start;
  const day = 24 * 60 * 60 * 1000;
  const offsetDays = hash(`${uid}date`) % Math.floor(span / day);
  return new Date(start + offsetDays * day).toISOString().slice(0, 10);
}

export function richText(paragraphs) {
  return paragraphs.map((text) => ({ type: "paragraph", text, spans: [] }));
}

/** Drop undefined values so optional fields are simply omitted. */
export function compact(fields) {
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
}

/**
 * TESTING MIGRATIONS ONLY: fills every missing product field with plausible,
 * type-appropriate data so search and filters can be exercised end to end.
 * Values are deterministic per uid. For a REAL migration, skip this step:
 * fields the source doesn't provide must stay empty.
 */
export function fillTestDefaults(product) {
  const uid = product.uid;
  const filled = { ...product };

  filled.articleNumber ??= String(70000 + (hash(`${uid}art`) % 29999));
  filled.price ??= String(399 + (hash(`${uid}price`) % 8) * 50);
  filled.alcohol ??= pickFrom(["12", "12,5"], `${uid}alc`);
  filled.dosageLevel ??= "Brut";
  filled.dosageGrams ??= String(4 + (hash(`${uid}dos`) % 5));
  filled.cru ??= pickFrom(["Grand Cru", "Premier Cru"], `${uid}cru`);
  filled.storage ??= pickFrom(
    ["Minst 36 mån på jästfällning", "Minst 48 mån på jästfällning", "Minst 60 mån på jästfällning"],
    `${uid}sto`,
  );
  filled.consumer ??= pickFrom(["Systembolaget", "Private Import"], `${uid}con`);
  filled.restaurant ??= pickFrom(["Available", "Sold Out"], `${uid}res`);
  filled.grapes ??= "50% Pinot Noir, 30% Chardonnay, 20% Pinot Meunier";
  filled.year ??= String(2012 + (hash(`${uid}year`) % 10));
  filled.orderUrl ??= "https://www.systembolaget.se/";
  if (filled.description.length === 0) {
    filled.description = [
      "Frisk och elegant champagne med toner av gröna äpplen, citrus, brioche och mineral. Krämig mousse och en lång, balanserad avslutning.",
    ];
  }
  return filled;
}

/** Builds the Migration API data payload for a product from data.json. */
export function buildProductData(product, producerRef, assets) {
  return compact({
    page_title: product.name,
    product_name: product.name,
    product_image: imageField(pickBottle(product.uid, assets), product.name),
    product_producer: producerRef,
    product_article_number: product.articleNumber,
    product_price: product.price,
    product_volume: product.volume,
    product_grapes: product.grapes,
    product_dosage: product.dosageLevel,
    product_dosage_grams: product.dosageGrams,
    product_alcohol: product.alcohol,
    product_region: product.region,
    product_cru: product.cru,
    product_style: product.style,
    product_special_club: product.club,
    product_vintage: product.vintage,
    product_year: product.year,
    product_consumer_availability: product.consumer,
    product_restaurant_availability: product.restaurant,
    product_storage: product.storage,
    product_order_url: product.orderUrl ? { link_type: "Web", url: product.orderUrl, target: "_blank" } : undefined,
    product_description: product.description.length > 0 ? richText(product.description) : undefined,
    meta_title: `${product.name} – ChampagneHuset`,
    meta_description: product.description[0]?.slice(0, 150),
  });
}
