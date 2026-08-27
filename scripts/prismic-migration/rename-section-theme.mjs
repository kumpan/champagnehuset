#!/usr/bin/env node
/**
 * Renames the CMS section theme "Brand" to "Bottle": rewrites every slice whose
 * `primary.section_theme` is "Brand" across every document of every type. "Brand" lives on
 * as an internal-only theme key in the code, but is no longer a Select option in the CMS.
 *
 * Dry run by default — prints every change and touches nothing. Pass --apply to write.
 *
 *   node scripts/prismic-migration/rename-section-theme.mjs
 *   node scripts/prismic-migration/rename-section-theme.mjs --apply
 */
import * as prismic from "@prismicio/client";
import sm from "../../slicemachine.config.json" with { type: "json" };
import { findUnsplashAsset } from "./lib.mjs";

process.loadEnvFile(new URL("../../.env.local", import.meta.url));

const OLD = "Brand";
const NEW = "Bottle";

const APPLY = process.argv.includes("--apply");
const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken) {
  console.error("PRISMIC_WRITE_TOKEN is missing from .env.local");
  process.exit(1);
}

// Preflight: the renamed models must already be pushed to Prismic. Writing an option the
// remote model does not list fails with an unhelpful bare "Validation failed".
const res = await fetch("https://customtypes.prismic.io/slices", {
  headers: { Authorization: `Bearer ${writeToken}`, repository: sm.repositoryName },
});
if (!res.ok) {
  console.error(`Custom Types API slices ${res.status}: ${(await res.text()).slice(0, 200)}`);
  process.exit(1);
}
const stale = [];
for (const model of await res.json()) {
  for (const variation of model.variations ?? []) {
    const options = variation.primary?.section_theme?.config?.options;
    // Only selects still offering the old value are stale — some variations never had "Brand".
    if (Array.isArray(options) && options.includes(OLD)) {
      stale.push(`${model.id}.${variation.id}`);
    }
  }
}
if (stale.length > 0) {
  console.error(`Model drift: ${stale.length} section_theme Select(s) in Prismic still offer "${OLD}":\n`);
  for (const field of stale) console.error(`  ${field}`);
  console.error("\nPush your models with Slice Machine (pnpm dev → localhost:9999) before migrating.");
  process.exit(1);
}

// ── Run ────────────────────────────────────────────────────────────────────────────────────

const client = prismic.createWriteClient(sm.repositoryName, { writeToken });
const documents = await client.dangerouslyGetAll({ lang: "*" });
console.log(`fetched ${documents.length} published documents\n`);

const changes = [];
const pending = [];
const skipped = [];

for (const doc of documents) {
  const docLabel = `[${doc.type}${doc.uid ? `/${doc.uid}` : ""}:${doc.lang}]`;

  let touched = false;
  for (const slice of doc.data.slices ?? []) {
    if (slice.primary?.section_theme !== OLD) continue;
    slice.primary.section_theme = NEW;
    touched = true;
    changes.push(`${docLabel} ${slice.slice_type}.${slice.variation}: "${OLD}" → "${NEW}"`);
  }
  if (!touched) continue;

  // Unsplash-integration images make a document unwritable through the Migration API
  // ("Assets not found"), so report those for a hand edit instead of letting the run fail.
  const unsplash = findUnsplashAsset(doc.data);
  if (unsplash) skipped.push({ docLabel, unsplash });
  else pending.push({ doc, docLabel });
}

for (const line of changes) console.log(`  ${line}`);
if (skipped.length) {
  console.log(`\n${skipped.length} document(s) hold an Unsplash-integration image and cannot be`);
  console.log("updated through the Migration API — edit these in the Prismic UI:");
  for (const s of skipped) console.log(`  - ${s.docLabel}  (${s.unsplash})`);
}

console.log(`\n${pending.length} document(s) to write, ${skipped.length} skipped (${changes.length} slice edits).`);
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
