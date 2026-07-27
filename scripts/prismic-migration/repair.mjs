/**
 * Re-PUTs every migrated product with its full data and resolved producer
 * links. Used after migrate.mjs when documents need their data rewritten
 * (the Migration API client creates documents as empty shells and only
 * writes data in a second pass — if that pass fails, run this).
 *
 * TESTING MODE: missing fields are filled with plausible deterministic
 * data (see fillTestDefaults in lib.mjs) so search/filters can be tested.
 * For a real migration, remove the fillTestDefaults call.
 *
 * Prerequisite: the documents must be PUBLISHED (IDs are only queryable
 * once published).
 *
 * Run: node --env-file=.env.local scripts/prismic-migration/repair.mjs
 *
 * The PUTs land in a new Migration Release — publish it when done.
 * Also rewrites manifest.json with all ai-import document IDs.
 */
import { readFileSync, writeFileSync } from "node:fs";
import * as prismic from "@prismicio/client";
import { REPO, TAG, buildProductData, fetchBottleAssets, fillTestDefaults } from "./lib.mjs";

const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken) {
  console.error("Missing PRISMIC_WRITE_TOKEN — run with: node --env-file=.env.local scripts/prismic-migration/repair.mjs");
  process.exit(1);
}

const data = JSON.parse(readFileSync(new URL("./data.json", import.meta.url), "utf8"));
const client = prismic.createClient(REPO);

// Harvest IDs of the published ai-import documents.
const imported = await client.getAllByTag(TAG, { pageSize: 100 });
if (imported.length === 0) {
  console.error("No documents tagged ai-import found. Publish the Migration Release in Prismic first, then re-run.");
  process.exit(1);
}
console.log(`Found ${imported.length} published ai-import documents`);

const idByUid = Object.fromEntries(imported.map((doc) => [doc.uid, doc.id]));

// Producer uid → document id, resolved from ALL published producers
// (includes pre-existing ones that were never part of the migration).
const publishedProducers = await client.getAllByType("producer", { pageSize: 100 });
const producerIds = Object.fromEntries(publishedProducers.map((doc) => [doc.uid, doc.id]));

const assets = await fetchBottleAssets(writeToken);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

console.log(`Repairing ${data.products.length} product(s)`);

for (const rawProduct of data.products) {
  const product = fillTestDefaults(rawProduct); // TESTING ONLY — remove for real migrations
  const id = idByUid[product.uid];
  if (!id) {
    console.error(`  SKIP ${product.uid}: not found among published documents`);
    continue;
  }
  const payload = {
    title: `Product: ${product.name} (${product.producer})`,
    uid: product.uid,
    tags: [TAG],
    data: buildProductData(product, { link_type: "Document", id: producerIds[product.producer] }, assets),
  };

  const response = await fetch(`https://migration.prismic.io/documents/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${writeToken}`, repository: REPO, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (response.ok) {
    console.log(`  repaired ${product.uid} -> ${product.producer}`);
  } else {
    console.error(`  FAILED ${product.uid}: ${response.status} ${await response.text()}`);
  }
  await sleep(1500);
}

// Manifest for cleanup.mjs — every ai-import document, id + type + uid.
writeFileSync(
  new URL("./manifest.json", import.meta.url),
  JSON.stringify(
    {
      createdAt: new Date().toISOString(),
      repository: REPO,
      tag: TAG,
      note: "Documents created by migrate.mjs. The pre-existing producers and the 8 bottle-0X assets are NOT listed — cleanup must never touch them.",
      documents: imported.map((doc) => ({ id: doc.id, type: doc.type, uid: doc.uid })),
    },
    null,
    2,
  ),
);
console.log("\nDone. Manifest written to scripts/prismic-migration/manifest.json");
console.log("Publish the new Migration Release in Prismic to apply the changes.");
