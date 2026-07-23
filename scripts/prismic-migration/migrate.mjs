/**
 * Test-content migration: pushes producers + products from data.json into a
 * Prismic Migration Release (drafts — nothing goes live until published in
 * the Prismic UI). Every created document is tagged `ai-import` and recorded
 * in manifest.json so cleanup.mjs can remove them later.
 *
 * Bottle images are NOT uploaded — each product is assigned one of the
 * existing `bottle-0X` assets already in the media library (deterministic
 * hash of the UID, so reruns pick the same image).
 *
 * Run: node --env-file=.env.local scripts/prismic-migration/migrate.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import * as prismic from "@prismicio/client";
import { REPO, TAG, buildProductData, fetchBottleAssets, fillTestDefaults, richText, compact } from "./lib.mjs";

const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken) {
  console.error("Missing PRISMIC_WRITE_TOKEN — run with: node --env-file=.env.local scripts/prismic-migration/migrate.mjs");
  process.exit(1);
}

const data = JSON.parse(readFileSync(new URL("./data.json", import.meta.url), "utf8"));
const client = prismic.createWriteClient(REPO, { writeToken });

// Master locale for new documents.
const repository = await client.getRepository();
const lang = repository.languages[0].id;
console.log(`Repository master locale: ${lang}`);

// Existing bottle-0X assets from the media library (reused, never re-uploaded).
const assets = await fetchBottleAssets(writeToken);
console.log(`Found ${assets.length} bottle assets`);

const migration = prismic.createMigration();

// --- Producers -----------------------------------------------------------
// Existing producers are linked by document ID; missing ones are created.
const producerRefs = Object.fromEntries(
  Object.entries(data.existingProducers).map(([uid, id]) => [uid, { link_type: "Document", id }]),
);

for (const producer of data.newProducers) {
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

// NOTE: the existing vincent-joudart document has a placeholder name
// ("Producer") but cannot be updated via the Migration API — its
// producer_image is an Unsplash-integration image, which the API rejects
// ("Assets not found"). Rename it manually in the Prismic UI instead.

// --- Products ------------------------------------------------------------
for (const rawProduct of data.products) {
  const product = fillTestDefaults(rawProduct); // TESTING ONLY — remove for real migrations
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

// --- Run -----------------------------------------------------------------
await client.migrate(migration, {
  reporter: (event) => {
    if (event.type === "documents:creating") {
      console.log(`  creating ${event.data.current}/${event.data.total}: ${event.data.document?.title ?? ""}`);
    } else if (event.type === "documents:updating") {
      console.log(`  updating ${event.data.current}/${event.data.total}`);
    } else if (!event.type.includes(":")) {
      console.log(event.type);
    } else if (event.type.endsWith(":created") || event.type.endsWith(":updated")) {
      console.log(event.type, JSON.stringify(event.data));
    }
  },
});

// --- Manifest (input for cleanup.mjs) ------------------------------------
const documents = migration._documents
  .filter((doc) => doc.document.id)
  .map((doc) => ({ id: doc.document.id, type: doc.document.type, uid: doc.document.uid }));

writeFileSync(
  new URL("./manifest.json", import.meta.url),
  JSON.stringify(
    {
      createdAt: new Date().toISOString(),
      repository: REPO,
      tag: TAG,
      note: "Documents created by migrate.mjs. The vincent-joudart name fix and the 8 bottle-0X assets are NOT listed — cleanup must never touch them.",
      documents: documents.filter((doc) => doc.id !== data.existingProducers["vincent-joudart"]),
    },
    null,
    2,
  ),
);
console.log(`\nDone. ${documents.length} documents in migration release. Manifest written to scripts/prismic-migration/manifest.json`);
console.log("Review + publish the migration release in the Prismic UI to make the documents queryable.");
