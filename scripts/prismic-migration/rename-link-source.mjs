#!/usr/bin/env node
/**
 * Renames the Link grid "Link Source" option "All Producers" to "Producers": rewrites
 * `primary.link_source` on every link/grid slice across every document of every type.
 *
 * Dry run by default. Prints every change and touches nothing. Pass --apply to write.
 *
 *   node scripts/prismic-migration/rename-link-source.mjs
 *   node scripts/prismic-migration/rename-link-source.mjs --apply
 */
import * as prismic from "@prismicio/client";
import sm from "../../slicemachine.config.json" with { type: "json" };
import { findUnsplashAsset } from "./lib.mjs";

process.loadEnvFile(new URL("../../.env.local", import.meta.url));

const SLICE_TYPE = "link";
const VARIATION = "grid";
const OLD = "All Producers";
const NEW = "Producers";

const APPLY = process.argv.includes("--apply");
const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken) {
  console.error("PRISMIC_WRITE_TOKEN is missing from .env.local");
  process.exit(1);
}

// Preflight: the renamed model must already be pushed to Prismic. Writing an option the
// remote model does not list fails with a bare "Validation failed".
const res = await fetch("https://customtypes.prismic.io/slices", {
  headers: {
    Authorization: `Bearer ${writeToken}`,
    repository: sm.repositoryName,
  },
});
if (!res.ok) {
  console.error(`Custom Types API slices ${res.status}: ${(await res.text()).slice(0, 200)}`);
  process.exit(1);
}
const remote = (await res.json()).find((model) => model.id === SLICE_TYPE);
const options = remote?.variations?.find((v) => v.id === VARIATION)?.primary?.link_source?.config?.options;
if (!Array.isArray(options) || !options.includes(NEW) || options.includes(OLD)) {
  console.error(
    `Model drift: ${SLICE_TYPE}.${VARIATION}.link_source in Prismic offers [${(options ?? []).join(", ")}].`,
  );
  console.error("Push your models with Slice Machine (pnpm dev → localhost:9999) before migrating.");
  process.exit(1);
}

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
    if (slice.slice_type !== SLICE_TYPE || slice.variation !== VARIATION) continue;
    if (slice.primary?.link_source !== OLD) continue;
    slice.primary.link_source = NEW;
    touched = true;
    changes.push(`${docLabel} link_source: "${OLD}" → "${NEW}"`);
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
  console.log("updated through the Migration API. Edit these in the Prismic UI:");
  for (const s of skipped) console.log(`  - ${s.docLabel}  (${s.unsplash})`);
}

console.log(`\n${pending.length} document(s) to write, ${skipped.length} skipped (${changes.length} slice edits).`);
console.log("Drafts and documents in unpublished releases are not covered. Check those by hand.");

if (!APPLY) {
  console.log("\nDry run. Re-run with --apply to write these changes to Prismic.");
  process.exit(0);
}

// One migration per document so a single unwritable document can't abort the whole batch.
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
    for (const d of error.response?.details ?? []) {
      console.log(`       ${d.property} = ${JSON.stringify(d.value)}`);
      console.log(`       ${d.error}`);
    }
  }
}

console.log(`\n${pending.length - failures.length} written, ${failures.length} failed, ${skipped.length} skipped.`);
if (failures.length) process.exitCode = 1;
