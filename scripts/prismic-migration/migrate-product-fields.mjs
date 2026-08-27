#!/usr/bin/env node
/**
 * Rewrites product documents to match the reworked product model:
 *
 *   1. `product_grapes[].grape` "Meunier" becomes "Pinot Meunier".
 *   2. `product_consumer_availability` "Systembolaget" becomes
 *      "Systembolaget Beställningssortiment" — the old single option split into
 *      Systembolaget's two assortments, and every existing document meant this one.
 *   3. An empty `product_volumes` group is seeded from the legacy `product_volume`
 *      Select, which stays on the model as a fallback for unmigrated documents.
 *
 * Dry run by default — prints every change and touches nothing. Pass --apply to write.
 *
 *   node scripts/prismic-migration/migrate-product-fields.mjs
 *   node scripts/prismic-migration/migrate-product-fields.mjs --apply
 */
import * as prismic from "@prismicio/client";
import sm from "../../slicemachine.config.json" with { type: "json" };
import { findUnsplashAsset } from "./lib.mjs";

process.loadEnvFile(new URL("../../.env.local", import.meta.url));

const APPLY = process.argv.includes("--apply");
const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken) {
  console.error("PRISMIC_WRITE_TOKEN is missing from .env.local");
  process.exit(1);
}

// Preflight: the reworked product model must already be pushed to Prismic. Writing a value
// the remote model does not list fails with an unhelpful bare "Validation failed".
const res = await fetch("https://customtypes.prismic.io/customtypes/product", {
  headers: { Authorization: `Bearer ${writeToken}`, repository: sm.repositoryName },
});
if (!res.ok) {
  console.error(`Custom Types API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  process.exit(1);
}
const remoteMain = (await res.json()).json.Main;
const modelGaps = [];
if (!remoteMain.product_grapes?.config?.fields?.grape?.config?.options?.includes("Pinot Meunier")) {
  modelGaps.push('product_grapes[].grape option "Pinot Meunier"');
}
if (!remoteMain.product_consumer_availability?.config?.options?.includes("Systembolaget Beställningssortiment")) {
  modelGaps.push('product_consumer_availability option "Systembolaget Beställningssortiment"');
}
if (!remoteMain.product_volumes) {
  modelGaps.push("product_volumes group");
}
if (modelGaps.length > 0) {
  console.error("The product model in Prismic is missing:");
  for (const gap of modelGaps) console.error(`  - ${gap}`);
  console.error("\nPush your models with Slice Machine (pnpm dev → localhost:9999) before migrating.");
  process.exit(1);
}

// ── Run ────────────────────────────────────────────────────────────────────────────────────

const client = prismic.createWriteClient(sm.repositoryName, { writeToken });
const documents = await client.getAllByType("product", { lang: "*" });
console.log(`fetched ${documents.length} published product documents\n`);

const changes = [];
const pending = [];
const skipped = [];

for (const doc of documents) {
  const before = JSON.stringify(doc.data);
  const docLabel = `[${doc.type}${doc.uid ? `/${doc.uid}` : ""}:${doc.lang}]`;
  const data = doc.data;

  for (const [i, item] of (data.product_grapes ?? []).entries()) {
    if (item.grape === "Meunier") {
      item.grape = "Pinot Meunier";
      changes.push(`${docLabel} product_grapes[${i}].grape: "Meunier" → "Pinot Meunier"`);
    }
  }

  if (data.product_consumer_availability === "Systembolaget") {
    data.product_consumer_availability = "Systembolaget Beställningssortiment";
    changes.push(`${docLabel} product_consumer_availability: "Systembolaget" → "Systembolaget Beställningssortiment"`);
  }

  const hasVolumes = (data.product_volumes ?? []).length > 0;
  if (!hasVolumes && typeof data.product_volume === "string" && data.product_volume !== "") {
    data.product_volumes = [{ volume: data.product_volume }];
    changes.push(`${docLabel} product_volumes: seeded from product_volume ("${data.product_volume}")`);
  }

  if (JSON.stringify(doc.data) === before) continue;

  // Unsplash-integration images make a document unwritable through the Migration API.
  const unsplash = findUnsplashAsset(doc.data);
  if (unsplash) skipped.push({ docLabel, unsplash });
  else pending.push({ doc, docLabel });
}

for (const line of changes) console.log(`  ${line}`);
if (skipped.length) {
  console.log(`\n${skipped.length} document(s) hold an Unsplash-integration image and cannot be`);
  console.log("updated through the Migration API — apply these changes in the Prismic UI:");
  for (const s of skipped) console.log(`  - ${s.docLabel}  (${s.unsplash})`);
}

console.log(`\n${pending.length} document(s) to write, ${skipped.length} skipped (${changes.length} field edits).`);
console.log("Drafts and documents in unpublished releases are not covered — check those by hand.");

if (!APPLY) {
  console.log("\nDry run. Re-run with --apply to write these changes to Prismic.");
  process.exit(0);
}

// One migration per document: the Migration API aborts a whole batch on the first rejection,
// which would let a single unwritable document block every other change.
console.log("\napplying…");
const failures = [];
for (const { doc, docLabel } of pending) {
  const migration = prismic.createMigration();
  migration.updateDocument(doc);
  try {
    await client.migrate(migration);
    console.log(`  ok   ${docLabel}`);
  } catch (error) {
    const message = error.response?.message ?? error.message;
    failures.push({ docLabel, message });
    console.log(`  FAIL ${docLabel}: ${message}`);
    // "Validation failed" alone says nothing; the details name the offending field and value.
    for (const d of error.response?.details ?? []) {
      console.log(`       ${d.property} = ${JSON.stringify(d.value)}`);
      console.log(`       ${d.error}`);
    }
  }
}

console.log(`\n${pending.length - failures.length} written, ${failures.length} failed, ${skipped.length} skipped.`);
if (failures.length) process.exitCode = 1;
