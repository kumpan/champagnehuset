#!/usr/bin/env node
/**
 * Seeds the five `region` documents from the hardcoded copy in lib/regions.ts, so
 * text-details renders from Prismic instead of its fallback. Each map PNG in
 * assets/maps/ is uploaded as a new media library asset — none of them exist in
 * the library yet, so creating assets from the local files is correct here (the
 * raw-payload gotcha only applies to assets already in the library).
 *
 * Regions that already have a PUBLISHED document are skipped. Created documents
 * land in an unpublished Migration Release, which the skip check cannot see — so
 * re-running is only fully safe after the release has been published. A re-run
 * before publishing reports the UID conflicts as "pending publish" and moves on.
 *
 * Dry run by default — prints what would be created and touches nothing. Pass
 * --apply to write.
 *
 *   node scripts/prismic-migration/seed-regions.mjs
 *   node scripts/prismic-migration/seed-regions.mjs --apply
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as prismic from "@prismicio/client";
import sm from "../../slicemachine.config.json" with { type: "json" };

process.loadEnvFile(new URL("../../.env.local", import.meta.url));

const APPLY = process.argv.includes("--apply");
const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken) {
  console.error("PRISMIC_WRITE_TOKEN is missing from .env.local");
  process.exit(1);
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * Copy of the region content in lib/regions.ts. Field-for-field: name, headline,
 * facts (label + items → label + item_1/2/3) and body (paragraphs). Keep the two
 * in sync until every document is live and lib/regions.ts is deleted.
 */
const regions = [
  {
    name: "Côte des Blancs",
    headline: "Chardonnays kungarike",
    facts: [
      { label: "Området", items: ["Söder om Épernay", "Kritjord i världsklass", "Sex Grand Cru-byar"] },
      { label: "Stilen", items: ["Blanc de Blancs", "Elegans och mineralitet", "Lång lagringspotential"] },
    ],
    body: [
      "För många är Côte des Blancs själva sinnebilden av Chardonnay.",
      "De kalkrika jordarna skapar viner med energi, elegans och en mineralitet som gjort området världsberömt. Här ligger byar som Le Mesnil-sur-Oger, Cramant, Avize och Chouilly – namn som får många champagneälskare att stanna upp.",
      "Området är känt för några av världens mest lagringsdugliga Blanc de Blancs.",
    ],
  },
  {
    name: "Montagne de Reims",
    headline: "Pinot Noirs hemvist",
    facts: [
      { label: "Området", items: ["Mellan Reims och Épernay", "Skogklädd platå", "Tio Grand Cru-byar"] },
      { label: "Stilen", items: ["Pinot Noir i huvudrollen", "Kropp och struktur", "Kraft med finess"] },
    ],
    body: [
      "Mellan Reims och Épernay breder Montagne de Reims ut sig med skogsklädda höjder och några av regionens mest berömda byar.",
      "Här trivs framför allt Pinot Noir, som ofta bidrar med struktur, djup och lagringspotential. Byar som Verzy, Verzenay, Bouzy och Ambonnay hör till områdets mest välkända.",
      "Många av Champagnes mest kraftfulla och uttrycksfulla viner har sitt ursprung här.",
    ],
  },
  {
    name: "Vallée de la Marne",
    headline: "Där Meunier trivs som bäst",
    facts: [
      { label: "Området", items: ["Längs floden Marne", "Lera och märgel", "Champagnes största odlingsyta"] },
      { label: "Stilen", items: ["Meunier i centrum", "Frukt och generositet", "Njutbar redan ung"] },
    ],
    body: [
      "Längs floden Marne förändras landskapet. Jordarna blir djupare och klimatet något mildare.",
      "Här dominerar Pinot Meunier, en druva som länge spelat en viktig roll i Champagne men som först på senare år fått det erkännande den förtjänar.",
      "Vinerna bjuder ofta på generös frukt, charm och tillgänglighet redan i unga år.",
    ],
  },
  {
    name: "Côte des Bar",
    headline: "Champagne med egen personlighet",
    facts: [
      { label: "Området", items: ["I Aube, längst söderut", "Kimmeridgisk märgel", "Närmare Chablis än Reims"] },
      { label: "Stilen", items: ["Pinot Noir dominerar", "Solmogen frukt", "Generös och varm"] },
    ],
    body: [
      "Längst i söder förändras både landskapet och jordarna.",
      "Côte des Bar ligger närmare Chablis än Reims och skiljer sig tydligt från övriga Champagne. Här dominerar Pinot Noir och många producenter arbetar småskaligt med stark koppling till sina vingårdar.",
      "Resultatet är ofta viner med kraft, energi och en tydlig känsla av ursprung.",
    ],
  },
  {
    name: "Côte de Sézanne",
    headline: "Den mindre kända grannen",
    facts: [
      { label: "Området", items: ["Söder om Côte des Blancs", "Sydostvända sluttningar", "Ett av regionens minsta"] },
      { label: "Stilen", items: ["Chardonnay dominerar", "Mogen, fyllig frukt", "Mjuk och tillgänglig"] },
    ],
    body: [
      "Söder om Côte des Blancs fortsätter de kalkrika jordarna, men landskapet blir mjukare och mindre omtalat.",
      "Här produceras ofta Chardonnay med lite mer generositet och rundare frukt, samtidigt som den friska karaktären finns kvar.",
      "Ett område som fortfarande gömmer många spännande upptäckter.",
    ],
  },
];

/** "Côte des Blancs" → "cote-des-blancs" — the document UID, also the map PNG's filename. */
function slugify(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

// ── Run ────────────────────────────────────────────────────────────────────────────────────

// Preflight: writing documents of a type Prismic does not know fails with an opaque error.
const modelRes = await fetch("https://customtypes.prismic.io/customtypes/region", {
  headers: { Authorization: `Bearer ${writeToken}`, repository: sm.repositoryName },
});
if (!modelRes.ok) {
  console.error("The `region` custom type is not in Prismic yet — push it with Slice Machine first.");
  process.exit(1);
}

const client = prismic.createWriteClient(sm.repositoryName, { writeToken });

const { languages } = await client.getRepository();
const lang = languages.find((l) => l.is_master)?.id ?? "sv-se";

// getAllByType throws ("No documents were found") when the repo has no region documents yet.
// Existing documents are skipped — re-running must never duplicate or overwrite editor content.
const existing = await client.getAllByType("region").catch(() => []);
const existingNames = new Set(existing.map((doc) => doc.data.name?.trim()));

const pending = regions.filter((region) => !existingNames.has(region.name));
for (const region of regions) {
  console.log(`  ${existingNames.has(region.name) ? "skip" : "create"}  ${region.name} (${slugify(region.name)})`);
}

if (pending.length === 0) {
  console.log("\nAll five region documents already exist — nothing to do.");
  process.exit(0);
}

if (!APPLY) {
  console.log(`\nDry run. Re-run with --apply to create ${pending.length} document(s) in language "${lang}".`);
  process.exit(0);
}

// One migration per document: the Migration API writes data in a second pass after creating
// empty shells, so keeping each document self-contained limits what a mid-run crash leaves behind.
console.log("\napplying…");
const failures = [];
for (const region of pending) {
  const uid = slugify(region.name);
  const filename = `${uid}.png`;
  const file = await fs.readFile(path.join(ROOT, "assets/maps", filename));

  const migration = prismic.createMigration();
  const mapAsset = migration.createAsset(new File([file], filename), filename, {
    alt: `Karta över ${region.name} i Champagne`,
  });
  migration.createDocument(
    {
      type: "region",
      uid,
      lang,
      data: {
        name: region.name,
        headline: region.headline,
        body: region.body.map((text) => ({ type: "paragraph", text, spans: [] })),
        map_image: mapAsset,
        facts: region.facts.map(({ label, items }) => ({
          label,
          item_1: items[0] ?? null,
          item_2: items[1] ?? null,
          item_3: items[2] ?? null,
        })),
      },
    },
    region.name,
  );

  try {
    await client.migrate(migration);
    console.log(`  ok   ${region.name}`);
  } catch (error) {
    const message = error.response?.message ?? error.message;
    // A uid conflict means an earlier run already created the document in a
    // still-unpublished Migration Release (invisible to the skip check above).
    if (/uid/i.test(message) && /taken|exists|already|unique/i.test(message)) {
      console.log(`  skip ${region.name}: already created, pending publish (${message})`);
      continue;
    }
    failures.push({ name: region.name, message });
    console.log(`  FAIL ${region.name}: ${message}`);
    // "Validation failed" alone says nothing; the details name the offending field and value.
    for (const d of error.response?.details ?? []) {
      console.log(`       ${d.property} = ${JSON.stringify(d.value)}`);
      console.log(`       ${d.error}`);
    }
  }
}

console.log(
  `\n${pending.length - failures.length} created, ${failures.length} failed, ${regions.length - pending.length} skipped.`,
);
console.log("The documents sit in an unpublished Migration Release — publish them in Prismic to go live.");
if (failures.length) process.exitCode = 1;
