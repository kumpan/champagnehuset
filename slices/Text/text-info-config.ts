/**
 * All purchase-flow microcopy for the Text → Info (product detail) variation
 * lives here, so a CMS editor only picks the availability on the product
 * document and never retypes this copy. The sales-rep phone/email are the same
 * for every wine, so they're constants too; change them here if the rep changes.
 */

export type ConsumerAvailability =
  | "Systembolaget Beställningssortiment"
  | "Systembolaget Tillfälligt Sortiment"
  | "Private Import"
  | "Sold Out"
  | null;

export type RestaurantAvailability = "Available" | "Sold Out" | null;

export const RESTAURANT_CONTACT = {
  phoneLabel: "+46 (0) 70 724 34 74",
  phoneHref: "tel:+46707243474",
  email: "ida.timen@twscollective.se",
} as const;

export const CONTACT_PAGE_PATH = "/kontakt";

export const COPY = {
  systembolagetBestallning: {
    heading: "Köp via Systembolaget",
    body: "Finns i Systembolagets beställningssortiment, beställ på systembolaget.se och hämta i din butik.",
    button: "Beställ nu",
  },
  systembolagetTillfalligt: {
    heading: "Tillfälligt hos Systembolaget",
    body: "Släppt i Systembolagets tillfälliga sortiment i begränsad mängd, beställ på systembolaget.se så länge lagret räcker.",
    button: "Beställ nu",
  },
  systembolagetSoldOut: {
    heading: "Köp via Systembolaget",
    body: "Den här årgången är slutsåld hos Systembolaget. Håll utkik, nya släpp dyker upp löpande.",
    button: "Beställ nu",
  },
  privatimport: {
    heading: "Beställ via privatimport",
    body: "Flaskan finns inte i Systembolagets sortiment, men kan beställas via deras privatimportservice. Vi och vår importör sköter resten.",
    button: "Beställ nu",
  },
  restaurant: {
    heading: "För restaurang och krog",
    body: "Hela vårt sortiment kan beställas av dig som driver restaurang. Hör av dig så hjälper vi dig med priser, tillgång och leverans.",
    button: "Kom i kontakt",
  },
  soldOut: {
    heading: "Slutsåld",
    body: "Den här årgången är slutsåld. Håll utkik, nya släpp dyker upp löpande.",
  },
  pdf: "Ladda ner PDF",
  image: "Ladda ner produktbild",
} as const;

export type ConsumerBlock = {
  heading: string;
  body: string;
  button: string;
  /** Whether the "Beställ nu" button is clickable (in stock + has an order URL). */
  enabled: boolean;
};

export type PurchaseState =
  | { kind: "sold-out" }
  | { kind: "channels"; consumer: ConsumerBlock | null; restaurant: boolean };

/**
 * Turns the two availability selects into what the purchase column should render.
 *
 * - Restaurant block shows unless restaurant availability is "Sold Out".
 * - When BOTH consumer and restaurant are "Sold Out", the whole column collapses
 *   to a single sold-out message.
 * - A "Sold Out" consumer channel keeps the (disabled) Systembolaget button and
 *   swaps to the sold-out copy, matching the "slutsåld hos Systembolaget" state.
 */
export function resolvePurchase(
  consumer: ConsumerAvailability,
  restaurant: RestaurantAvailability,
  hasOrderUrl: boolean,
): PurchaseState {
  const restaurantSoldOut = restaurant === "Sold Out";

  if (consumer === "Sold Out" && restaurantSoldOut) {
    return { kind: "sold-out" };
  }

  let consumerBlock: ConsumerBlock | null = null;
  if (consumer === "Systembolaget Beställningssortiment") {
    consumerBlock = { ...COPY.systembolagetBestallning, enabled: hasOrderUrl };
  } else if (consumer === "Systembolaget Tillfälligt Sortiment") {
    consumerBlock = { ...COPY.systembolagetTillfalligt, enabled: hasOrderUrl };
  } else if (consumer === "Private Import") {
    consumerBlock = { ...COPY.privatimport, enabled: hasOrderUrl };
  } else if (consumer === "Sold Out") {
    consumerBlock = { ...COPY.systembolagetSoldOut, enabled: false };
  }

  return { kind: "channels", consumer: consumerBlock, restaurant: !restaurantSoldOut };
}
