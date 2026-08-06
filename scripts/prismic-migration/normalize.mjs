/**
 * Promotes the already-migrated documents to their production shape, in place.
 * For every published document (page, product, producer, article) it applies:
 *
 *   - Task 5: renames the document to a friendly, prefix-free title
 *             ("Product: X (Y)" → "X (Y)", "Page: om-oss" → the page title).
 *   - Task 8: removes the `ai-import` tag.
 *   - Task 7: SEO — strips the "– ChampagneHuset" suffix from meta_title,
 *             backfills meta_description, and gives every doc a meta_image.
 *   - Task 3: remaps legacy article tags (Guide→Tips, Tasting→Event) to the 3.
 *   - Task 4: gives each producer a temp-0X producer_image if it lacks one.
 *   - Task 1/2: backfills product_ecologic and converts product_grapes to the
 *               new variety Group, and drops the removed product_price field.
 *
 * It uses the SDK `updateDocument` spread pattern ({ ...doc.data }), so slices,
 * images and links already on each document are PRESERVED — only the targeted
 * fields change. Updates land in a Migration Release (draft); nothing goes live
 * until you publish it in the Prismic UI.
 *
 * PREREQUISITE: push the updated custom types (product grape Group + ecologic +
 * removed price, article tags) to the Prismic repo in Slice Machine FIRST, or the
 * Migration API will reject the new fields.
 *
 * Run (preview, no writes): node --env-file=.env.local scripts/prismic-migration/normalize.mjs --dry
 * Run (apply):              node --env-file=.env.local scripts/prismic-migration/normalize.mjs
 */
import { readFileSync } from "node:fs";
import * as prismic from "@prismicio/client";
import { asText, isFilled } from "@prismicio/client";
import {
  fetchTempAssets,
  imageField,
  META_CONSTRAINT,
  PRODUCER_IMAGE_CONSTRAINT,
  parseGrapes,
  pickTemp,
  REPO,
  TAG,
} from "./lib.mjs";

const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken) {
  console.error(
    "Missing PRISMIC_WRITE_TOKEN — run with: node --env-file=.env.local scripts/prismic-migration/normalize.mjs",
  );
  process.exit(1);
}

const dryRun = process.argv.includes("--dry");

/** Article tags no longer in the model → one of the 3 allowed values. */
const TAG_REMAP = { Guide: "Tips", Tasting: "Event" };

const data = JSON.parse(readFileSync(new URL("./data.json", import.meta.url), "utf8"));
const productByUid = Object.fromEntries(data.products.map((p) => [p.uid, p]));

const hash = (seed) => [...seed].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
const yesNo = (seed) => (hash(seed) % 2 === 0 ? "Yes" : "No");
const titleFromUid = (uid) => uid.replace(/-/g, " ").replace(/^\p{L}/u, (c) => c.toUpperCase());

/** Drop a trailing " – ChampagneHuset" / " | ChampagneHuset" brand suffix. */
const stripBrand = (title) => (title || "").replace(/\s*[–—|-]\s*ChampagneHuset\s*$/iu, "").trim();

/** Plain text from a rich-text field or string, first 150 chars. */
const summarize = (field) => {
  if (!field) return undefined;
  const text = typeof field === "string" ? field : asText(field);
  return text ? text.slice(0, 150) : undefined;
};

const client = prismic.createWriteClient(REPO, { writeToken });
const repository = await client.getRepository();
const lang = repository.languages[0].id;
const tempAssets = await fetchTempAssets(writeToken);

const migration = prismic.createMigration();
const summary = [];

// --- Producers -----------------------------------------------------------
const producers = await client.getAllByType("producer", { lang });
// Producer name per id, so product titles resolve the linked producer WITHOUT
// fetchLinks (which would nest .data into the link and complicate the round-trip).
const producerNameById = Object.fromEntries(producers.map((p) => [p.id, p.data.producer_name]));
for (const doc of producers) {
  const d = { ...doc.data };
  const name = d.producer_name || titleFromUid(doc.uid);

  if (!isFilled.image(d.producer_image)) {
    d.producer_image = imageField(pickTemp(doc.uid, tempAssets), name, PRODUCER_IMAGE_CONSTRAINT);
  }
  d.meta_title = stripBrand(d.meta_title) || name;
  d.meta_description = d.meta_description || summarize(doc.data.producer_bio);
  if (!isFilled.image(d.meta_image)) {
    d.meta_image = imageField(pickTemp(doc.uid, tempAssets), name, META_CONSTRAINT);
  }

  queue(doc, d, name);
}

// --- Products ------------------------------------------------------------
for (const doc of await client.getAllByType("product", { lang })) {
  const d = { ...doc.data };
  const producerName = isFilled.contentRelationship(doc.data.product_producer)
    ? producerNameById[doc.data.product_producer.id]
    : undefined;
  const productName = d.product_name || titleFromUid(doc.uid);
  const name = producerName ? `${productName} (${producerName})` : productName;

  // Task 2: grapes → variety Group (parse the old free-text or data.json blend).
  const grapesSource =
    (typeof doc.data.product_grapes === "string" ? doc.data.product_grapes : "") || productByUid[doc.uid]?.grapes || "";
  const grapes = parseGrapes(grapesSource);
  d.product_grapes = grapes.length ? grapes : Array.isArray(doc.data.product_grapes) ? doc.data.product_grapes : [];

  // Task 1: ecologic yes/no (deterministic when unset).
  d.product_ecologic = doc.data.product_ecologic || yesNo(`${doc.uid}eco`);
  // Task 9: drop the removed price field (orphaned data).
  delete d.product_price;

  d.meta_title = stripBrand(d.meta_title) || productName;
  d.meta_description = d.meta_description || summarize(doc.data.product_description);
  if (!isFilled.image(d.meta_image)) {
    d.meta_image = imageField(pickTemp(doc.uid, tempAssets), productName, META_CONSTRAINT);
  }

  queue(doc, d, name);
}

// --- Articles ------------------------------------------------------------
for (const doc of await client.getAllByType("article", { lang })) {
  const d = { ...doc.data };
  const name = d.article_title || titleFromUid(doc.uid);

  d.tag = TAG_REMAP[d.tag] ?? d.tag; // Task 3
  d.meta_title = stripBrand(d.meta_title) || name;
  d.meta_description = d.meta_description || summarize(doc.data.article_description);
  if (!isFilled.image(d.meta_image)) {
    d.meta_image = imageField(pickTemp(doc.uid, tempAssets), name, META_CONSTRAINT);
  }

  queue(doc, d, name);
}

// --- Pages ---------------------------------------------------------------
for (const doc of await client.getAllByType("page", { lang })) {
  const d = { ...doc.data };
  const name = d.page_title || titleFromUid(doc.uid);

  d.meta_title = stripBrand(d.meta_title) || name;
  if (!isFilled.image(d.meta_image)) {
    d.meta_image = imageField(pickTemp(doc.uid, tempAssets), name, META_CONSTRAINT);
  }

  queue(doc, d, name);
}

/** Strip the ai-import tag (Task 8) and stage the document for update. */
function queue(doc, data, name) {
  const tags = (doc.tags ?? []).filter((tag) => tag !== TAG);
  summary.push(
    `  ${doc.type.padEnd(9)} ${doc.uid.padEnd(42)} → "${name}"${tags.length ? "" : "  [ai-import removed]"}`,
  );
  if (!dryRun) migration.updateDocument({ ...doc, tags, data }, name);
}

console.log(`Documents to normalize: ${summary.length}`);
console.log(summary.join("\n"));

if (dryRun) {
  console.log("\nDry run — no writes. Re-run without --dry to apply.");
  process.exit(0);
}

await client.migrate(migration, {
  reporter: (event) => {
    if (event.type === "documents:updating" && event.data.current % 10 === 1) {
      console.log(`  updating ${event.data.current}/${event.data.total}`);
    }
  },
});

console.log("\nDone. Review + publish the Migration Release in the Prismic UI to apply the changes.");
