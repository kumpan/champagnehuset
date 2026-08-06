import { isFilled } from "@prismicio/client";
import type { ProductDocument } from "@/prismicio-types";

/**
 * Pure filter/search logic for the Product Search variation. Everything derives
 * from the fetched products: an option no product has never renders, and a group
 * with zero options disappears entirely.
 */

export type FilterGroupId =
  | "availability"
  | "producer"
  | "region"
  | "style"
  | "grape"
  | "club"
  | "ecologic"
  | "year"
  | "volume";

export type FilterOption = { value: string; label: string };
export type FilterGroup = { id: FilterGroupId; label: string; options: FilterOption[] };
export type FilterSelection = Partial<Record<FilterGroupId, string[]>>;

/** Design order for the sidebar, top to bottom. */
const GROUP_IDS: FilterGroupId[] = [
  "availability",
  "producer",
  "region",
  "style",
  "grape",
  "club",
  "ecologic",
  "year",
  "volume",
];

/** Visitor-facing group labels (site language). */
const GROUP_LABELS: Record<FilterGroupId, string> = {
  availability: "Tillgänglighet",
  producer: "Odlare",
  region: "Region",
  style: "Stil",
  grape: "Druva",
  club: "Special Club",
  ecologic: "Ekologisk",
  year: "Årgång",
  volume: "Volym",
};

/**
 * Availability is a merged facet: Systembolaget/Privatimport come from
 * consumer availability, Restaurang from restaurant availability.
 */
const AVAILABILITY_OPTIONS: FilterOption[] = [
  { value: "systembolaget", label: "Systembolaget" },
  { value: "privatimport", label: "Privatimport" },
  { value: "restaurang", label: "Restaurang" },
];

/** Mirrors the curated option order in the product custom type selects. */
const REGION_ORDER = ["Côte des Blancs", "Montagne de Reims", "Vallée de la Marne", "Côte des Bar", "Côte de Sézanne"];
const STYLE_ORDER = ["Blanc de Blancs", "Blanc de Noirs", "Rosé", "Assemblage", "Special Club"];
const GRAPE_ORDER = ["Chardonnay", "Pinot Noir", "Meunier", "Arbane", "Petit Meslier", "Pinot Blanc", "Pinot Gris"];

export function producerNameOf(product: ProductDocument): string | null {
  const producer = product.data.product_producer;
  return isFilled.contentRelationship(producer) ? (producer.data?.producer_name ?? null) : null;
}

/** "187 ml" → 187, "1,5 L" → 1500, so volumes sort by size, not label. */
function volumeToMl(volume: string): number {
  const amount = Number.parseFloat(volume.replace(",", ".").replace(/[^\d.]/g, ""));
  return /l/i.test(volume) && !/ml/i.test(volume) ? amount * 1000 : amount;
}

/** The value(s) a product contributes to a filter group. */
function facetValues(product: ProductDocument, groupId: FilterGroupId): string[] {
  const {
    product_consumer_availability,
    product_restaurant_availability,
    product_region,
    product_style,
    product_grapes,
    product_special_club,
    product_ecologic,
    product_year,
    product_volume,
  } = product.data;

  switch (groupId) {
    case "availability": {
      const values: string[] = [];
      if (product_consumer_availability === "Systembolaget") values.push("systembolaget");
      if (product_consumer_availability === "Private Import") values.push("privatimport");
      if (product_restaurant_availability === "Available") values.push("restaurang");
      return values;
    }
    case "producer": {
      const name = producerNameOf(product);
      return name ? [name] : [];
    }
    case "region":
      return product_region ? [product_region] : [];
    case "style":
      return product_style ? [product_style] : [];
    case "grape":
      return product_grapes.flatMap((entry) => (entry.grape ? [entry.grape] : []));
    case "club":
      return product_special_club === "Yes" ? ["yes"] : [];
    case "ecologic":
      return product_ecologic === "Yes" ? ["yes"] : [];
    case "year":
      return product_year?.trim() ? [product_year.trim()] : [];
    case "volume":
      return product_volume ? [product_volume] : [];
  }
}

function sortByKnownOrder(values: string[], order: string[]): string[] {
  const rank = (value: string) => {
    const index = order.indexOf(value);
    return index === -1 ? order.length : index;
  };
  return values.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b, "sv"));
}

/** Build the filter groups from what actually exists in the product set. */
export function deriveFilterGroups(products: ProductDocument[]): FilterGroup[] {
  return GROUP_IDS.map((id) => {
    const present = new Set(products.flatMap((product) => facetValues(product, id)));

    let options: FilterOption[];
    switch (id) {
      case "availability":
        options = AVAILABILITY_OPTIONS.filter((option) => present.has(option.value));
        break;
      case "grape":
        options = sortByKnownOrder([...present], GRAPE_ORDER).map((value) => ({ value, label: value }));
        break;
      case "club":
        options = present.has("yes") ? [{ value: "yes", label: "Ja" }] : [];
        break;
      case "ecologic":
        options = present.has("yes") ? [{ value: "yes", label: "Ja" }] : [];
        break;
      case "year":
        options = [...present].sort((a, b) => Number(b) - Number(a)).map((value) => ({ value, label: value }));
        break;
      case "volume":
        options = [...present].sort((a, b) => volumeToMl(a) - volumeToMl(b)).map((value) => ({ value, label: value }));
        break;
      case "region":
        options = sortByKnownOrder([...present], REGION_ORDER).map((value) => ({ value, label: value }));
        break;
      case "style":
        options = sortByKnownOrder([...present], STYLE_ORDER).map((value) => ({ value, label: value }));
        break;
      case "producer":
        options = [...present].sort((a, b) => a.localeCompare(b, "sv")).map((value) => ({ value, label: value }));
        break;
    }

    return { id, label: GROUP_LABELS[id], options };
  }).filter((group) => group.options.length > 0);
}

/** OR within a group, AND across groups. */
export function matchesSelection(product: ProductDocument, selection: FilterSelection): boolean {
  return GROUP_IDS.every((id) => {
    const selected = selection[id];
    if (!selected || selected.length === 0) return true;
    const values = facetValues(product, id);
    return selected.some((value) => values.includes(value));
  });
}

export function countActiveFilters(selection: FilterSelection): number {
  return Object.values(selection).reduce((total, values) => total + values.length, 0);
}

/* ------------------------------- Search ------------------------------- */

/** Lowercase + strip diacritics so "cote" matches "Côte" and "rose" matches "Rosé". */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export type SearchDoc = {
  /** Normalized product name, ranked highest. */
  primary: string;
  primaryWords: string[];
  /** Normalized producer, region, style, grapes, dosage, article number, year. */
  secondary: string;
};

export function buildSearchIndex(products: ProductDocument[]): SearchDoc[] {
  return products.map((product) => {
    const { product_name, product_region, product_style, product_dosage, product_article_number } = product.data;
    const primary = normalizeText(product_name ?? "");
    const secondary = normalizeText(
      [
        producerNameOf(product),
        product_region,
        product_style,
        product_dosage,
        product_article_number,
        ...facetValues(product, "grape"),
        ...facetValues(product, "year"),
      ]
        .filter(Boolean)
        .join(" "),
    );
    return { primary, primaryWords: primary.split(/\s+/), secondary };
  });
}

/** Every token must match somewhere (AND); higher scores rank first. */
function searchScore(doc: SearchDoc, tokens: string[]): number {
  let score = 0;
  for (const token of tokens) {
    if (doc.primary.startsWith(token)) score += 4;
    else if (doc.primaryWords.some((word) => word.startsWith(token))) score += 3;
    else if (doc.primary.includes(token)) score += 2;
    else if (doc.secondary.includes(token)) score += 1;
    else return 0;
  }
  return score;
}

/** Apply search + filters. `index` must be parallel to `products`. */
export function filterProducts(
  products: ProductDocument[],
  index: SearchDoc[],
  query: string,
  selection: FilterSelection,
): ProductDocument[] {
  const tokens = normalizeText(query).split(/\s+/).filter(Boolean);

  const scored = products.flatMap((product, i) => {
    if (!matchesSelection(product, selection)) return [];
    if (tokens.length === 0) return [{ product, score: 0 }];
    const score = searchScore(index[i], tokens);
    return score > 0 ? [{ product, score }] : [];
  });

  if (tokens.length > 0) scored.sort((a, b) => b.score - a.score);
  return scored.map((entry) => entry.product);
}

/* ------------------------------ URL state ------------------------------ */

const QUERY_PARAM = "q";

/** Parse `?q=…&region=…` back into state, keeping only values that exist. */
export function readStateFromSearch(
  search: string,
  groups: FilterGroup[],
): { query: string; selection: FilterSelection } {
  const params = new URLSearchParams(search);
  const selection: FilterSelection = {};
  for (const group of groups) {
    const valid = new Set(group.options.map((option) => option.value));
    const values = params.getAll(group.id).filter((value) => valid.has(value));
    if (values.length > 0) selection[group.id] = values;
  }
  return { query: params.get(QUERY_PARAM) ?? "", selection };
}

/** Serialize state to a search string ("" when nothing is active). */
export function buildSearchString(query: string, selection: FilterSelection): string {
  const params = new URLSearchParams();
  if (query.trim()) params.set(QUERY_PARAM, query.trim());
  for (const id of GROUP_IDS) {
    for (const value of selection[id] ?? []) params.append(id, value);
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}
