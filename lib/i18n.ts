/**
 * Every UI string the code owns — the ones no editor ever touches because they
 * are structural (aria-labels, filter group names, pagination words) rather
 * than marketing copy. Editor-owned copy belongs in Prismic, not here.
 *
 * ## Keyed by language, not locale
 *
 * `t("en-gb")`, `t("en-us")` and `t("en-eu")` all resolve to the `en` entry, so
 * adding a regional variant in Prismic needs **no code change at all**. Only a
 * genuinely new *language* needs an entry here — which is unavoidable, since
 * someone has to write it. Use `byLocale` for the rare string where two regions
 * of the same language genuinely differ.
 *
 * The 13 languages below cover roughly 40 of Prismic's locale options:
 *
 *   en → en-gb, en-us, en-eu, en-au, en-ca, en-nz, en-ie, en-za, en-in
 *   de → de-de, de-at, de-ch      fr → fr-fr, fr-be, fr-ch, fr-ca
 *   es → es-es, es-mx, es-ar, …   pt → pt-pt, pt-br
 *   nl → nl-nl, nl-be             it, da, nb, nn, fi, pl → one locale each
 *
 * Two subtleties this shortcut does *not* handle. Norwegian Bokmål and Nynorsk
 * are separate subtags (`nb` / `nn`), so both need their own entry — they are
 * not regions of one language. And `zh-cn` / `zh-tw` both reduce to `zh` while
 * being different scripts, so Chinese would need `byLocale` entries rather than
 * a single `zh` object.
 *
 * Dates, sorting and number formatting deliberately live nowhere in this file:
 * `Intl` already knows every locale, and it accepts Prismic's lowercase ids
 * (`"sv-se"`) directly. Pass `lang` to `Intl.DateTimeFormat` / `localeCompare`
 * rather than adding entries here.
 *
 * ## Adding a language
 *
 * Add one object to `byLanguage`. `Record<string, Dict>` makes a half-filled
 * entry a **type error**, so the compiler — not a comment — is what keeps the
 * languages in sync.
 *
 * Half of these strings are wine-trade vocabulary, not generic UI — `Årgång` is
 * *Millésime* in French and *Jahrgang* in German, not "year"; `Odlare` is
 * *Vigneron*, not "farmer"; `Druva` is *Cépage*, not "grape". Get those from
 * someone who sells wine in the language, not from a general translator.
 * **`fi` and `pl` here have not been reviewed by a native speaker** — check
 * them before either locale goes live.
 */

const sv = {
  // Pagination / metadata
  page: "Sida",

  // Generic UI
  readMore: "Läs mer",
  all: "Alla",
  yes: "Ja",
  close: "Stäng",
  search: "Sök",

  // Product search + filters
  filter: "Filtrera",
  clearFilters: "Rensa filter",
  noProductsMatch: "Inga produkter matchar din sökning.",
  filterAvailability: "Tillgänglighet",
  filterProducer: "Odlare",
  filterRegion: "Region",
  filterStyle: "Stil",
  filterGrape: "Druva",
  filterClub: "Special Club",
  filterEcologic: "Ekologisk",
  filterYear: "Årgång",
  filterVolume: "Volym",
  availabilityPrivateImport: "Privatimport",
  availabilityRestaurant: "Restaurang",

  // Article tags (CMS stores the English value, visitors see this)
  tagEvent: "Event",
  tagNews: "Nyheter",
  tagTips: "Tips",

  // Age gate
  ageGateConfirm: "Ja",
  ageGateDecline: "Nej",
  ageGateBack: "Tillbaka",
  ageGateNotice: "Du behöver vara 25 år för att besöka sidan.",

  // Newsletter
  newsletterThanks: "Tack! Kolla din inkorg för att bekräfta.",
};

export type Dict = typeof sv;

/**
 * The site's master locale language. A locale with no entry here renders in
 * Swedish rather than blank — the same thing an untranslated document does.
 */
const FALLBACK_LANGUAGE = "sv";

const byLanguage: Record<string, Dict> = {
  sv,

  en: {
    // Pagination / metadata
    page: "Page",

    // Generic UI
    readMore: "Read more",
    all: "All",
    yes: "Yes",
    close: "Close",
    search: "Search",

    // Product search + filters
    filter: "Filter",
    clearFilters: "Clear filters",
    noProductsMatch: "No products match your search.",
    filterAvailability: "Availability",
    filterProducer: "Grower",
    filterRegion: "Region",
    filterStyle: "Style",
    filterGrape: "Grape",
    filterClub: "Special Club",
    filterEcologic: "Organic",
    filterYear: "Vintage",
    filterVolume: "Volume",
    availabilityPrivateImport: "Private Import",
    availabilityRestaurant: "Restaurant",

    // Article tags
    tagEvent: "Event",
    tagNews: "News",
    tagTips: "Tips",

    // Age gate
    ageGateConfirm: "Yes",
    ageGateDecline: "No",
    ageGateBack: "Back",
    ageGateNotice: "You must be 25 or older to visit this site.",

    // Newsletter
    newsletterThanks: "Thanks! Check your inbox to confirm.",
  },

  de: {
    // Pagination / metadata
    page: "Seite",

    // Generic UI
    readMore: "Mehr lesen",
    all: "Alle",
    yes: "Ja",
    close: "Schließen",
    search: "Suchen",

    // Product search + filters
    filter: "Filtern",
    clearFilters: "Filter zurücksetzen",
    noProductsMatch: "Keine Produkte entsprechen Ihrer Suche.",
    filterAvailability: "Verfügbarkeit",
    filterProducer: "Winzer",
    filterRegion: "Region",
    filterStyle: "Stil",
    filterGrape: "Rebsorte",
    filterClub: "Special Club",
    filterEcologic: "Bio",
    filterYear: "Jahrgang",
    filterVolume: "Volumen",
    availabilityPrivateImport: "Privatimport",
    availabilityRestaurant: "Restaurant",

    // Article tags
    tagEvent: "Event",
    tagNews: "Neuigkeiten",
    tagTips: "Tipps",

    // Age gate
    ageGateConfirm: "Ja",
    ageGateDecline: "Nein",
    ageGateBack: "Zurück",
    ageGateNotice: "Sie müssen 25 Jahre alt sein, um diese Seite zu besuchen.",

    // Newsletter
    newsletterThanks: "Danke! Bitte bestätigen Sie über den Link in Ihrem Posteingang.",
  },

  fr: {
    // Pagination / metadata
    page: "Page",

    // Generic UI
    readMore: "Lire la suite",
    all: "Tous",
    yes: "Oui",
    close: "Fermer",
    search: "Rechercher",

    // Product search + filters
    filter: "Filtrer",
    clearFilters: "Effacer les filtres",
    noProductsMatch: "Aucun produit ne correspond à votre recherche.",
    filterAvailability: "Disponibilité",
    filterProducer: "Vigneron",
    filterRegion: "Région",
    filterStyle: "Style",
    filterGrape: "Cépage",
    filterClub: "Special Club",
    filterEcologic: "Biologique",
    filterYear: "Millésime",
    filterVolume: "Volume",
    availabilityPrivateImport: "Importation privée",
    availabilityRestaurant: "Restaurant",

    // Article tags
    tagEvent: "Événement",
    tagNews: "Actualités",
    tagTips: "Conseils",

    // Age gate
    ageGateConfirm: "Oui",
    ageGateDecline: "Non",
    ageGateBack: "Retour",
    ageGateNotice: "Vous devez avoir 25 ans pour visiter ce site.",

    // Newsletter
    newsletterThanks: "Merci ! Vérifiez votre boîte de réception pour confirmer.",
  },

  it: {
    // Pagination / metadata
    page: "Pagina",

    // Generic UI
    readMore: "Leggi di più",
    all: "Tutti",
    yes: "Sì",
    close: "Chiudi",
    search: "Cerca",

    // Product search + filters
    filter: "Filtra",
    clearFilters: "Cancella filtri",
    noProductsMatch: "Nessun prodotto corrisponde alla tua ricerca.",
    filterAvailability: "Disponibilità",
    filterProducer: "Viticoltore",
    filterRegion: "Regione",
    filterStyle: "Stile",
    filterGrape: "Vitigno",
    filterClub: "Special Club",
    filterEcologic: "Biologico",
    filterYear: "Annata",
    filterVolume: "Volume",
    availabilityPrivateImport: "Importazione privata",
    availabilityRestaurant: "Ristorante",

    // Article tags
    tagEvent: "Evento",
    tagNews: "Notizie",
    tagTips: "Consigli",

    // Age gate
    ageGateConfirm: "Sì",
    ageGateDecline: "No",
    ageGateBack: "Indietro",
    ageGateNotice: "Devi avere 25 anni per visitare questo sito.",

    // Newsletter
    newsletterThanks: "Grazie! Controlla la tua casella di posta per confermare.",
  },

  es: {
    // Pagination / metadata
    page: "Página",

    // Generic UI
    readMore: "Leer más",
    all: "Todos",
    yes: "Sí",
    close: "Cerrar",
    search: "Buscar",

    // Product search + filters
    filter: "Filtrar",
    clearFilters: "Borrar filtros",
    noProductsMatch: "Ningún producto coincide con tu búsqueda.",
    filterAvailability: "Disponibilidad",
    filterProducer: "Viticultor",
    filterRegion: "Región",
    filterStyle: "Estilo",
    filterGrape: "Variedad",
    filterClub: "Special Club",
    filterEcologic: "Ecológico",
    filterYear: "Añada",
    filterVolume: "Volumen",
    availabilityPrivateImport: "Importación privada",
    availabilityRestaurant: "Restaurante",

    // Article tags
    tagEvent: "Evento",
    tagNews: "Noticias",
    tagTips: "Consejos",

    // Age gate
    ageGateConfirm: "Sí",
    ageGateDecline: "No",
    ageGateBack: "Volver",
    ageGateNotice: "Debes tener 25 años para visitar este sitio.",

    // Newsletter
    newsletterThanks: "¡Gracias! Revisa tu bandeja de entrada para confirmar.",
  },

  pt: {
    // Pagination / metadata
    page: "Página",

    // Generic UI
    readMore: "Ler mais",
    all: "Todos",
    yes: "Sim",
    close: "Fechar",
    search: "Pesquisar",

    // Product search + filters
    filter: "Filtrar",
    clearFilters: "Limpar filtros",
    noProductsMatch: "Nenhum produto corresponde à sua pesquisa.",
    filterAvailability: "Disponibilidade",
    filterProducer: "Viticultor",
    filterRegion: "Região",
    filterStyle: "Estilo",
    filterGrape: "Casta",
    filterClub: "Special Club",
    filterEcologic: "Biológico",
    filterYear: "Colheita",
    filterVolume: "Volume",
    availabilityPrivateImport: "Importação privada",
    availabilityRestaurant: "Restaurante",

    // Article tags
    tagEvent: "Evento",
    tagNews: "Notícias",
    tagTips: "Dicas",

    // Age gate
    ageGateConfirm: "Sim",
    ageGateDecline: "Não",
    ageGateBack: "Voltar",
    ageGateNotice: "Tem de ter 25 anos para visitar este site.",

    // Newsletter
    newsletterThanks: "Obrigado! Verifique a sua caixa de entrada para confirmar.",
  },

  nl: {
    // Pagination / metadata
    page: "Pagina",

    // Generic UI
    readMore: "Lees meer",
    all: "Alle",
    yes: "Ja",
    close: "Sluiten",
    search: "Zoeken",

    // Product search + filters
    filter: "Filteren",
    clearFilters: "Filters wissen",
    noProductsMatch: "Geen producten komen overeen met je zoekopdracht.",
    filterAvailability: "Beschikbaarheid",
    filterProducer: "Wijnboer",
    filterRegion: "Regio",
    filterStyle: "Stijl",
    filterGrape: "Druif",
    filterClub: "Special Club",
    filterEcologic: "Biologisch",
    filterYear: "Jaargang",
    filterVolume: "Volume",
    availabilityPrivateImport: "Privé-import",
    availabilityRestaurant: "Restaurant",

    // Article tags
    tagEvent: "Evenement",
    tagNews: "Nieuws",
    tagTips: "Tips",

    // Age gate
    ageGateConfirm: "Ja",
    ageGateDecline: "Nee",
    ageGateBack: "Terug",
    ageGateNotice: "Je moet 25 jaar zijn om deze site te bezoeken.",

    // Newsletter
    newsletterThanks: "Bedankt! Check je inbox om te bevestigen.",
  },

  da: {
    // Pagination / metadata
    page: "Side",

    // Generic UI
    readMore: "Læs mere",
    all: "Alle",
    yes: "Ja",
    close: "Luk",
    search: "Søg",

    // Product search + filters
    filter: "Filtrér",
    clearFilters: "Ryd filtre",
    noProductsMatch: "Ingen produkter matcher din søgning.",
    filterAvailability: "Tilgængelighed",
    filterProducer: "Vinbonde",
    filterRegion: "Region",
    filterStyle: "Stil",
    filterGrape: "Drue",
    filterClub: "Special Club",
    filterEcologic: "Økologisk",
    filterYear: "Årgang",
    filterVolume: "Volumen",
    availabilityPrivateImport: "Privatimport",
    availabilityRestaurant: "Restaurant",

    // Article tags
    tagEvent: "Event",
    tagNews: "Nyheder",
    tagTips: "Tips",

    // Age gate
    ageGateConfirm: "Ja",
    ageGateDecline: "Nej",
    ageGateBack: "Tilbage",
    ageGateNotice: "Du skal være 25 år for at besøge siden.",

    // Newsletter
    newsletterThanks: "Tak! Tjek din indbakke for at bekræfte.",
  },

  nb: {
    // Pagination / metadata
    page: "Side",

    // Generic UI
    readMore: "Les mer",
    all: "Alle",
    yes: "Ja",
    close: "Lukk",
    search: "Søk",

    // Product search + filters
    filter: "Filtrer",
    clearFilters: "Fjern filtre",
    noProductsMatch: "Ingen produkter samsvarer med søket ditt.",
    filterAvailability: "Tilgjengelighet",
    filterProducer: "Vinbonde",
    filterRegion: "Region",
    filterStyle: "Stil",
    filterGrape: "Drue",
    filterClub: "Special Club",
    filterEcologic: "Økologisk",
    filterYear: "Årgang",
    filterVolume: "Volum",
    availabilityPrivateImport: "Privatimport",
    availabilityRestaurant: "Restaurant",

    // Article tags
    tagEvent: "Event",
    tagNews: "Nyheter",
    tagTips: "Tips",

    // Age gate
    ageGateConfirm: "Ja",
    ageGateDecline: "Nei",
    ageGateBack: "Tilbake",
    ageGateNotice: "Du må være 25 år for å besøke siden.",

    // Newsletter
    newsletterThanks: "Takk! Sjekk innboksen din for å bekrefte.",
  },

  nn: {
    // Pagination / metadata
    page: "Side",

    // Generic UI
    readMore: "Les meir",
    all: "Alle",
    yes: "Ja",
    close: "Lukk",
    search: "Søk",

    // Product search + filters
    filter: "Filtrer",
    clearFilters: "Fjern filter",
    noProductsMatch: "Ingen produkt samsvarar med søket ditt.",
    filterAvailability: "Tilgjenge",
    filterProducer: "Vinbonde",
    filterRegion: "Region",
    filterStyle: "Stil",
    filterGrape: "Drue",
    filterClub: "Special Club",
    filterEcologic: "Økologisk",
    filterYear: "Årgang",
    filterVolume: "Volum",
    availabilityPrivateImport: "Privatimport",
    availabilityRestaurant: "Restaurant",

    // Article tags
    tagEvent: "Event",
    tagNews: "Nyheiter",
    tagTips: "Tips",

    // Age gate
    ageGateConfirm: "Ja",
    ageGateDecline: "Nei",
    ageGateBack: "Tilbake",
    ageGateNotice: "Du må vere 25 år for å vitje sida.",

    // Newsletter
    newsletterThanks: "Takk! Sjekk innboksen din for å stadfeste.",
  },

  fi: {
    // Pagination / metadata
    page: "Sivu",

    // Generic UI
    readMore: "Lue lisää",
    all: "Kaikki",
    yes: "Kyllä",
    close: "Sulje",
    search: "Hae",

    // Product search + filters
    filter: "Suodata",
    clearFilters: "Tyhjennä suodattimet",
    noProductsMatch: "Yksikään tuote ei vastaa hakuasi.",
    filterAvailability: "Saatavuus",
    filterProducer: "Viljelijä",
    filterRegion: "Alue",
    filterStyle: "Tyyli",
    filterGrape: "Rypäle",
    filterClub: "Special Club",
    filterEcologic: "Luomu",
    filterYear: "Vuosikerta",
    filterVolume: "Tilavuus",
    availabilityPrivateImport: "Yksityistuonti",
    availabilityRestaurant: "Ravintola",

    // Article tags
    tagEvent: "Tapahtuma",
    tagNews: "Uutiset",
    tagTips: "Vinkit",

    // Age gate
    ageGateConfirm: "Kyllä",
    ageGateDecline: "Ei",
    ageGateBack: "Takaisin",
    ageGateNotice: "Sinun on oltava 25-vuotias vieraillaksesi sivustolla.",

    // Newsletter
    newsletterThanks: "Kiitos! Vahvista tilaus sähköpostistasi.",
  },

  pl: {
    // Pagination / metadata
    page: "Strona",

    // Generic UI
    readMore: "Czytaj więcej",
    all: "Wszystkie",
    yes: "Tak",
    close: "Zamknij",
    search: "Szukaj",

    // Product search + filters
    filter: "Filtruj",
    clearFilters: "Wyczyść filtry",
    noProductsMatch: "Żaden produkt nie pasuje do wyszukiwania.",
    filterAvailability: "Dostępność",
    filterProducer: "Winiarz",
    filterRegion: "Region",
    filterStyle: "Styl",
    filterGrape: "Szczep",
    filterClub: "Special Club",
    filterEcologic: "Ekologiczne",
    filterYear: "Rocznik",
    filterVolume: "Pojemność",
    availabilityPrivateImport: "Import prywatny",
    availabilityRestaurant: "Restauracja",

    // Article tags
    tagEvent: "Wydarzenie",
    tagNews: "Aktualności",
    tagTips: "Porady",

    // Age gate
    ageGateConfirm: "Tak",
    ageGateDecline: "Nie",
    ageGateBack: "Wstecz",
    ageGateNotice: "Musisz mieć 25 lat, aby odwiedzić tę stronę.",

    // Newsletter
    newsletterThanks: "Dziękujemy! Sprawdź skrzynkę odbiorczą, aby potwierdzić.",
  },
};

/**
 * Overrides for the rare string where two regions of one language differ.
 * Everything omitted falls through to the language entry, so this stays empty
 * until a real difference shows up.
 */
const byLocale: Record<string, Partial<Dict>> = {};

const cache = new Map<string, Dict>();

/** Copy for a Prismic locale id (`"sv-se"`, `"en-gb"`). Unknown → master language. */
export function t(lang: string | null | undefined): Dict {
  const locale = (lang ?? "").toLowerCase();

  const cached = cache.get(locale);
  if (cached) return cached;

  const language = locale.split("-")[0];
  const base = byLanguage[language] ?? byLanguage[FALLBACK_LANGUAGE];
  const override = byLocale[locale];
  const resolved = override ? { ...base, ...override } : base;

  cache.set(locale, resolved);
  return resolved;
}
