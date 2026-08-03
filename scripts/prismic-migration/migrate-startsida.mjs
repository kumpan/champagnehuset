/**
 * Figma-to-Prismic page migration: rebuilds the "Startsida • Desktop" artboard
 * as a `page` document, one slice per Figma section. Content (headings, copy,
 * links, FAQ, cards) is transcribed verbatim from the Figma design; images use
 * the temp-0X media library assets (assigned deterministically); the two
 * document-reference slices (ProductGrid, ArticleList) are left auto-populating.
 *
 * Writes to a Migration Release (draft) — nothing goes live until you review +
 * publish it in the Prismic UI. The created page is tagged `ai-import` and
 * appended to manifest.json so cleanup.mjs can remove it.
 *
 * Target UID defaults to `startsida-test` (renders at /<lang>/startsida-test via
 * the [...uid] catch-all, so it never touches the live `home` page). Pass
 * `--uid home` to overwrite the real homepage instead (updates in place).
 *
 * Run: node --env-file=.env.local scripts/prismic-migration/migrate-startsida.mjs
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import * as prismic from "@prismicio/client";
import { compact, imageField, REPO, TAG } from "./lib.mjs";

const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken) {
  console.error(
    "Missing PRISMIC_WRITE_TOKEN — run with: node --env-file=.env.local scripts/prismic-migration/migrate-startsida.mjs",
  );
  process.exit(1);
}

const uidFlag = process.argv.indexOf("--uid");
const TARGET_UID = uidFlag !== -1 ? process.argv[uidFlag + 1] : "startsida-test";

// --- helpers -------------------------------------------------------------
function hash(seed) {
  return [...seed].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}
const heading = (text, type = "heading2") => [{ type, text, spans: [] }];
const paras = (texts) => texts.map((text) => ({ type: "paragraph", text, spans: [] }));
/** Web link, optionally with display text (for allowText fields). */
const link = (url, text) =>
  compact({ link_type: "Web", url, text, target: url.startsWith("http") ? "_blank" : undefined });
const overline = (text, icon = "none") => [{ overline_icon: icon, overline_text: text }];

/** Existing temp-0X assets from the media library (reused, never re-uploaded). */
async function fetchTempAssets() {
  const res = await fetch("https://asset-api.prismic.io/assets?limit=100&keyword=temp", {
    headers: { Authorization: `Bearer ${writeToken}`, repository: REPO },
  });
  if (!res.ok) throw new Error(`Asset API ${res.status}: ${await res.text()}`);
  const assets = (await res.json()).items
    .filter((a) => /^temp-\d+\.(png|jpe?g|webp)$/i.test(a.filename))
    .sort((a, b) => a.filename.localeCompare(b.filename));
  if (assets.length === 0) throw new Error("No temp-0X assets found in the media library");
  return assets;
}

const client = prismic.createWriteClient(REPO, { writeToken });
const repository = await client.getRepository();
const lang = repository.languages[0].id;
const tempAssets = await fetchTempAssets();
console.log(`Lang: ${lang} · temp assets: ${tempAssets.map((a) => a.filename).join(", ")}`);

/** Deterministic random temp image for a given slot, cropped to the field constraint. */
const img = (seed, constraint, alt) => imageField(tempAssets[hash(seed) % tempAssets.length], alt, constraint);
const HERO = { width: 1920, height: 1080 };
const CARD = { width: 1920, height: 1080 };
const SQUARE = { width: 1440, height: 1440 };

// --- slices (one per Figma section, in artboard order) -------------------
const slices = [
  // 1 · HeroBackdrop
  {
    slice_type: "hero",
    variation: "backdrop",
    primary: {
      section_theme: "Dust",
      alignment: false,
      title: heading("Små odlare.\nStora champagner.", "heading1"),
      description: paras([
        "Upptäck människorna, platserna och berättelserna bakom några av Champagnes mest spännande odlare.",
      ]),
      buttons: [],
      media: [{ image: img("hero", HERO, "Champagne vineyard") }],
    },
    items: [],
  },
  // 2 · ProductGrid (auto-populating)
  {
    slice_type: "product",
    variation: "grid",
    primary: {
      remove_top_padding: false,
      section_theme: "Bud",
      overline: overline(""),
      title: heading("Upptäck just nu"),
      description: [],
      button: [{ link: link("/champagner", "Se hela utbudet"), icon_left: "none", icon_right: "arrowUpRight" }],
      featured_products: [],
      product_limit: "4",
    },
    items: [],
  },
  // 3 · LinkQuick
  {
    slice_type: "link",
    variation: "quick",
    primary: {
      remove_top_padding: false,
      section_theme: "Bud",
      alignment: false,
      overline: overline(""),
      title: [],
      description: [],
      links: [
        link("/champagner", "Utforska champagner"),
        link("/odlare", "Möt odlarna"),
        link("/special-club", "Special Club"),
        link("/champagner", "Fakta om champagne"),
        link("/journalen", "Event & provningar"),
        link("/kontakt", "Kontakta oss"),
      ],
    },
    items: [],
  },
  // 4 · CalloutSplit (image left)
  {
    slice_type: "callout",
    variation: "split",
    primary: {
      remove_top_padding: false,
      section_theme: "Slate",
      alignment: false,
      image_side: false,
      overline: overline("Människorna bakom flaskorna"),
      title: heading("Varje champagne börjar långt innan korken dras ur."),
      description: paras([
        "I vingårdarna, hos familjerna som vårdar marken och hos odlarna som låter varje årgång berätta sin egen historia. Det är dessa människor vi har valt att arbeta med.",
      ]),
      buttons: [
        {
          link: link("/odlare", "Upptäck våra producenter"),
          variant: "default",
          icon_left: "none",
          icon_right: "arrowUpRight",
        },
      ],
      media: [{ filter: "Bottom Left", image: img("split1", SQUARE, "Producent i vingården") }],
    },
    items: [],
  },
  // 5 · LinkCards
  {
    slice_type: "link",
    variation: "cards",
    primary: {
      remove_top_padding: false,
      section_theme: "Dust",
      alignment: false,
      overline: overline(""),
      title: [],
      description: [],
      cards: [
        {
          image: img("card1", CARD, "Special Club"),
          title: "Special Club",
          description:
            "En handfull odlare, ett gemensamt löfte – champagne i sin mest personliga och kompromisslösa form.",
          links: link("/special-club"),
        },
        {
          image: img("card2", CARD, "Om oss"),
          title: "Om oss",
          description:
            "Ett litet champagnehus med stora förebilder, läs mer om vilka vi är, vår historia och varför vi valt att göra det här.",
          links: link("/om-oss"),
        },
        {
          image: img("card3", CARD, "Journalen"),
          title: "Journalen",
          description:
            "Nyheter, tankar och nedslag från champagnevärlden – skrivet för nyfikna, uppdaterat med jämna mellanrum.",
          links: link("/journalen"),
        },
      ],
    },
    items: [],
  },
  // 6 · ProductGrid #2 (auto-populating)
  {
    slice_type: "product",
    variation: "grid",
    primary: {
      remove_top_padding: false,
      section_theme: "Dust",
      overline: overline(""),
      title: heading("Upptäck mer"),
      description: [],
      button: [{ link: link("/champagner", "Se hela utbudet"), icon_left: "none", icon_right: "arrowUpRight" }],
      featured_products: [],
      product_limit: "4",
    },
    items: [],
  },
  // 7 · CalloutBackdrop (with image)
  {
    slice_type: "callout",
    variation: "backdrop",
    primary: {
      remove_top_padding: false,
      section_theme: "Slate",
      alignment: false,
      overline: overline(""),
      title: heading("De bästa flaskorna blir\nsällan huvudpersoner."),
      description: paras(["Men är ofta en del av det man minns."]),
      buttons: [],
      media: [{ filter: "Bottom Left", image: img("backdrop1", SQUARE, "Champagne") }],
    },
    items: [],
  },
  // 8 · CalloutBackdrop #2 (no image — solid theme)
  {
    slice_type: "callout",
    variation: "backdrop",
    primary: {
      remove_top_padding: false,
      section_theme: "Slate",
      alignment: false,
      overline: overline(""),
      title: heading("De bästa flaskorna blir\nsällan huvudpersoner."),
      description: paras(["Men är ofta en del av det man minns."]),
      buttons: [],
      media: [],
    },
    items: [],
  },
  // 9 · CalloutSplit #2 (image right, Brand theme)
  {
    slice_type: "callout",
    variation: "split",
    primary: {
      remove_top_padding: false,
      section_theme: "Brand",
      alignment: false,
      image_side: true,
      overline: overline("Människorna bakom flaskorna"),
      title: heading("Specialist på Special Club"),
      description: paras([
        "Vi representerar flera odlare inom Special Club – en sammanslutning av några av Champagnes mest kvalitetsdrivna producenter.",
        "Deras främsta årgångschampagner skapas för att spegla platsen, året och människorna bakom vinet.",
      ]),
      buttons: [
        {
          link: link("/special-club", "Läs mer om Special Club"),
          variant: "default",
          icon_left: "none",
          icon_right: "arrowUpRight",
        },
      ],
      media: [{ filter: "Bottom Left", image: img("split2", SQUARE, "Special Club") }],
    },
    items: [],
  },
  // 10 · CalloutDetails (NOTE: details variation has no image field — Figma's left image is omitted)
  {
    slice_type: "callout",
    variation: "details",
    primary: {
      remove_top_padding: false,
      section_theme: "Bud",
      overline: overline(""),
      title: heading("Champagnehusets vinklubb"),
      description: paras(["För människor som vill upptäcka mer."]),
      buttons: [{ link: link("/kontakt", "Anmäl"), variant: "default", icon_left: "badgeCheck", icon_right: "none" }],
      details: [
        { overline_icon: "check", overline_text: "Nyheter", rich_text: [] },
        { overline_icon: "check", overline_text: "Rekommendationer", rich_text: [] },
        { overline_icon: "check", overline_text: "Inbjudningar", rich_text: [] },
        { overline_icon: "check", overline_text: "Förhandslanseringar", rich_text: [] },
      ],
    },
    items: [],
  },
  // 11 · ArticleList (auto-populating)
  {
    slice_type: "article",
    variation: "list",
    primary: {
      remove_top_padding: false,
      section_theme: "Bud",
      show_pagination: false,
      filter_by_tag: "All",
      show_filter_chips: false,
      overline: overline(""),
      title: heading("Artiklar"),
      description: [],
      button: [{ link: link("/journalen", "Se fler artiklar"), icon_left: "none", icon_right: "arrowUpRight" }],
      featured_articles: [],
    },
    items: [],
  },
  // 12 · TextSplit
  {
    slice_type: "text",
    variation: "split",
    primary: {
      remove_top_padding: false,
      section_theme: "Bud",
      overline: overline("Om oss"),
      title: heading("Din genväg till den champagne de stora husen aldrig visar dig"),
      description: [],
      first_text_block: paras([
        "Champagnehuset är ett svenskt champagnehus specialiserat på odlarchampagne – viner från familjer som odlar sina egna druvor och gör champagne med tydlig avsändare. Sedan starten har fokus legat på att hitta producenter som gör något eget, snarare än de stora husens välkända etiketter. Varje flaska i sortimentet är vald med omsorg, ofta efter besök på plats i Champagne.",
      ]),
      second_text_block: paras([
        "För Champagnehuset är champagne mer än ett festligt vin – det är ett hantverk, en plats och framför allt människor. Genom provningar, guider och berättelser om producenterna vill de göra champagne enklare att förstå och roligare att upptäcka. Kvällarna är gjorda för nyfikna, inte för experter, och tanken är alltid densamma: rätt kunskap gör varje glas lite godare.",
      ]),
    },
    items: [],
  },
  // 13 · FAQList
  {
    slice_type: "faq",
    variation: "list",
    primary: {
      remove_top_padding: false,
      section_theme: "Bud",
      alignment: true,
      overline: overline("Vanliga frågor"),
      title: heading("Undrar du något?"),
      description: [],
      faqlist: [
        "Köttbulle pipeline ljus smart moln?",
        "Fjäril microservices bärs backlog, fika är obligatoriskt?",
        "Lighthouse, mysig vatten förälskelse?",
        "Kanban snöig lagom förträff starköl?",
        "Godis lampa vante smart julöl?",
        "Kräftskiva smart kärlek ale typografi smörgås?",
        "Stol krita törstig, öl lugn vimpel?",
        "Tegel molnet väntan smart rebase?",
      ].map((question) => ({
        question,
        answer: paras([
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        ]),
      })),
    },
    items: [],
  },
];

const data = compact({
  page_title: "Startsida",
  slices,
  meta_title: "Champagnehuset – Små odlare. Stora champagner.",
  meta_description: "Upptäck människorna, platserna och berättelserna bakom några av Champagnes mest spännande odlare.",
});

// --- run -----------------------------------------------------------------
const existing = await client.getByUID("page", TARGET_UID, { lang }).catch(() => null);
const migration = prismic.createMigration();
if (existing) {
  console.log(`Updating existing page "${TARGET_UID}" (${existing.id}) with ${slices.length} slices`);
  migration.updateDocument(
    { ...existing, tags: [...new Set([...(existing.tags ?? []), TAG])], data },
    `Page: ${TARGET_UID}`,
  );
} else {
  console.log(`Creating new page "${TARGET_UID}" with ${slices.length} slices`);
  migration.createDocument({ type: "page", uid: TARGET_UID, lang, tags: [TAG], data }, `Page: ${TARGET_UID}`);
}

await client.migrate(migration, {
  reporter: (event) => {
    if (event.type === "documents:creating") console.log(`  creating: ${event.data.document?.title ?? ""}`);
    else if (event.type === "documents:updating") console.log(`  updating: ${event.data.document?.title ?? ""}`);
    else if (event.type.endsWith(":created") || event.type.endsWith(":updated")) console.log(event.type);
  },
});

// Record in manifest (only for freshly-created docs; never queue the live home for deletion)
const created = migration._documents.filter((d) => d.document.id && !existing);
if (created.length > 0) {
  const manifestUrl = new URL("./manifest.json", import.meta.url);
  const prev = existsSync(manifestUrl) ? JSON.parse(readFileSync(manifestUrl, "utf8")) : { documents: [] };
  const rows = created.map((d) => ({ id: d.document.id, type: d.document.type, uid: d.document.uid }));
  prev.documents = [...prev.documents, ...rows.filter((r) => !prev.documents.some((p) => p.id === r.id))];
  writeFileSync(manifestUrl, JSON.stringify(prev, null, 2));
  console.log(`Recorded ${rows.length} doc(s) in manifest.json`);
}

console.log(`\nDone. Review + publish the Migration Release in the Prismic UI to make "${TARGET_UID}" queryable.`);
