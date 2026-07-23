/**
 * Test-content migration: pushes producers + products from data.json into a
 * Prismic Migration Release (drafts — nothing goes live until published in
 * the Prismic UI). Every created document is tagged `ai-import` and recorded
 * in manifest.json so cleanup.mjs can remove them later.
 *
 * Incremental: documents whose UID is already PUBLISHED are skipped, so
 * data.json is cumulative and the script can be re-run per batch. Publish
 * the previous batch before running the next one — unpublished documents
 * in a Migration Release can't be detected and would cause duplicate-UID
 * errors.
 *
 * Producer links resolve dynamically: published producers are linked by ID
 * (including pre-existing ones not in data.json), missing ones are created.
 *
 * TESTING MODE: missing product fields are filled with plausible
 * deterministic data (fillTestDefaults in lib.mjs) so search/filters can be
 * exercised. For a REAL migration, remove that call and leave gaps empty.
 *
 * Bottle images are NOT uploaded — each product is assigned one of the
 * existing `bottle-0X` assets already in the media library.
 *
 * Run: node --env-file=.env.local scripts/prismic-migration/migrate.mjs
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import * as prismic from "@prismicio/client";
import { REPO, TAG, buildProductData, fetchBottleAssets, fillTestDefaults, richText, compact } from "./lib.mjs";

const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken) {
  console.error("Missing PRISMIC_WRITE_TOKEN — run with: node --env-file=.env.local scripts/prismic-migration/migrate.mjs");
  process.exit(1);
}

const data = JSON.parse(readFileSync(new URL("./data.json", import.meta.url), "utf8"));
const client = prismic.createWriteClient(REPO, { writeToken });

const repository = await client.getRepository();
const lang = repository.languages[0].id;

// Published documents — used to skip already-migrated UIDs and to link
// producers (including pre-existing ones that data.json doesn't create).
const publishedProducers = await client.getAllByType("producer", { pageSize: 100 });
const publishedProducts = await client.getAllByType("product", { pageSize: 100 });
const producerIdByUid = Object.fromEntries(publishedProducers.map((doc) => [doc.uid, doc.id]));
const publishedProductUids = new Set(publishedProducts.map((doc) => doc.uid));
console.log(`Published: ${publishedProducers.length} producers, ${publishedProducts.length} products`);

const assets = await fetchBottleAssets(writeToken);
const migration = prismic.createMigration();

// --- Producers -----------------------------------------------------------
const producerRefs = Object.fromEntries(
  Object.entries(producerIdByUid).map(([uid, id]) => [uid, { link_type: "Document", id }]),
);

let newProducerCount = 0;
for (const producer of data.producers) {
  if (producerRefs[producer.uid]) continue; // already published
  newProducerCount += 1;
  producerRefs[producer.uid] = migration.createDocument(
    {
      type: "producer",
      uid: producer.uid,
      lang,
      tags: [TAG],
      data: compact({
        page_title: producer.name,
        producer_name: producer.name,
        producer_region: producer.region,
        producer_village: producer.village,
        producer_bio: producer.bio.length > 0 ? richText(producer.bio) : undefined,
      }),
    },
    `Producer: ${producer.name}`,
  );
}

// --- Products ------------------------------------------------------------
let newProductCount = 0;
for (const rawProduct of data.products) {
  if (publishedProductUids.has(rawProduct.uid)) continue; // already published
  const product = fillTestDefaults(rawProduct); // TESTING ONLY — remove for real migrations
  if (!producerRefs[product.producer]) {
    console.error(`Unknown producer "${product.producer}" for ${product.uid} — aborting before any write.`);
    process.exit(1);
  }
  newProductCount += 1;
  migration.createDocument(
    {
      type: "product",
      uid: product.uid,
      lang,
      tags: [TAG],
      data: buildProductData(product, producerRefs[product.producer], assets),
    },
    `Product: ${product.name} (${product.producer})`,
  );
}

console.log(`To create: ${newProducerCount} producers, ${newProductCount} products`);
if (newProducerCount + newProductCount === 0) {
  console.log("Nothing to do.");
  process.exit(0);
}

// --- Run -----------------------------------------------------------------
await client.migrate(migration, {
  reporter: (event) => {
    if (event.type === "documents:creating") {
      console.log(`  creating ${event.data.current}/${event.data.total}: ${event.data.document?.title ?? ""}`);
    } else if (event.type === "documents:updating") {
      if (event.data.current % 10 === 1) console.log(`  updating ${event.data.current}/${event.data.total}`);
    } else if (event.type.endsWith(":created") || event.type.endsWith(":updated")) {
      console.log(event.type, JSON.stringify(event.data));
    }
  },
});

// --- Manifest (input for cleanup.mjs) — merged across batches ------------
const manifestUrl = new URL("./manifest.json", import.meta.url);
const previous = existsSync(manifestUrl) ? JSON.parse(readFileSync(manifestUrl, "utf8")).documents : [];
const created = migration._documents
  .filter((doc) => doc.document.id)
  .map((doc) => ({ id: doc.document.id, type: doc.document.type, uid: doc.document.uid }));
const documents = [...previous, ...created.filter((doc) => !previous.some((p) => p.id === doc.id))];

writeFileSync(
  manifestUrl,
  JSON.stringify(
    {
      createdAt: new Date().toISOString(),
      repository: REPO,
      tag: TAG,
      note: "Documents created by migrate.mjs. The pre-existing producers and the 8 bottle-0X assets are NOT listed — cleanup must never touch them.",
      documents,
    },
    null,
    2,
  ),
);
console.log(`\nDone. ${created.length} documents created (${documents.length} total in manifest).`);
console.log("Review + publish the Migration Release in the Prismic UI to make them queryable.");
