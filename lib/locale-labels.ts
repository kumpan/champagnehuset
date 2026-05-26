// Short display labels for the language switcher.
// Add entries here for any locale you want to override.
// Locales not listed fall back to the name Prismic provides.
const LOCALE_LABELS: Record<string, string> = {
  // English
  "en-us": "EN",
  "en-gb": "EN",
  "en-au": "EN",
  "en-ca": "EN",
  "en-nz": "EN",
  "en-ie": "EN",
  "en-za": "EN",
  "en-in": "EN",
  "en-eu": "EN",

  // Nordic
  "sv-se": "SV",
  "nb-no": "NO",
  "nn-no": "NO",
  "da-dk": "DA",
  "fi-fi": "FI",
  "is-is": "IS",

  // Western Europe
  "de-de": "DE",
  "de-at": "DE",
  "de-ch": "DE",
  "fr-fr": "FR",
  "fr-be": "FR",
  "fr-ch": "FR",
  "fr-ca": "FR",
  "es-es": "ES",
  "es-mx": "ES",
  "es-ar": "ES",
  "es-co": "ES",
  "es-cl": "ES",
  "es-419": "ES",
  "pt-pt": "PT",
  "pt-br": "PT",
  "it-it": "IT",
  "nl-nl": "NL",
  "nl-be": "NL",

  // Eastern Europe
  "pl-pl": "PL",
  "cs-cz": "CS",
  "sk-sk": "SK",
  "hu-hu": "HU",
  "ro-ro": "RO",
  "bg-bg": "BG",
  "hr-hr": "HR",
  "sr-rs": "SR",
  "sl-si": "SL",
  "uk-ua": "UK",
  "ru-ru": "RU",

  // Baltic
  "et-ee": "ET",
  "lv-lv": "LV",
  "lt-lt": "LT",

  // Southern Europe
  "el-gr": "EL",
  "tr-tr": "TR",

  // Middle East
  "ar-sa": "AR",
  "ar-ae": "AR",
  "ar-eg": "AR",
  "he-il": "HE",
  "fa-ir": "FA",

  // Asia Pacific
  "zh-cn": "ZH",
  "zh-tw": "ZH",
  "zh-hk": "ZH",
  "ja-jp": "JA",
  "ko-kr": "KO",
  "th-th": "TH",
  "vi-vn": "VI",
  "id-id": "ID",
  "ms-my": "MS",
  "hi-in": "HI",
  "bn-bd": "BN",
  "ta-in": "TA",
};

export function getLocaleLabel(id: string, fallbackName: string): string {
  return LOCALE_LABELS[id] ?? fallbackName;
}
