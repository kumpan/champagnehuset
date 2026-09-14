#!/usr/bin/env node
/**
 * Brings existing content up to the article list model with URL filters and a page size:
 *
 * - Renames the article tag "News" to "Nyheter" on every article document and on
 *   `primary.filter_by_tag` of every article/list slice. "Event" and "Tips" keep their
 *   values and "Kunskap" is new, so nothing maps to it.
 * - Fills `primary.articles_per_page` with "4" on every article/list slice saved before the
 *   field existed, which is the count those lists always rendered.
 *
 * Dry run by default. Prints every change and touches nothing. Pass --apply to write.
 *
 *   node scripts/prismic-migration/article-list-tags-and-page-size.mjs
 *   node scripts/prismic-migration/article-list-tags-and-page-size.mjs --apply
 */
import * as prismic from "@prismicio/client";
import sm from "../../slicemachine.config.json" with { type: "json" };
import { findUnsplashAsset } from "./lib.mjs";

// A missing .env.local is reported by the token check below instead of a raw ENOENT
try {
  process.loadEnvFile(new URL("../../.env.local", import.meta.url));
} catch {}

const RENAMES = { News: "Nyheter" };
const TAGS = ["Event", "Tips", "Nyheter", "Kunskap"];
const PAGE_SIZE = "4";
const PAGE_SIZES = ["4", "8", "12"];

const APPLY = process.argv.includes("--apply");
const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken) {
  console.error("PRISMIC_WRITE_TOKEN is missing from .env.local");
  process.exit(1);
}

// Preflight: both renamed models must already be pushed to Prismic. Writing a value the
// remote model does not list fails with a bare "Validation failed".
const headers = { Authorization: `Bearer ${writeToken}`, repository: sm.repositoryName };
const fetchModels = async (endpoint) => {
  const res = await fetch(`https://customtypes.prismic.io/${endpoint}`, { headers });
  if (!res.ok) {
    console.error(`Custom Types API ${endpoint} ${res.status}: ${(await res.text()).slice(0, 200)}`);
    process.exit(1);
  }
  return res.json();
};
const [customTypes, slices] = await Promise.all([fetchModels("customtypes"), fetchModels("slices")]);

const tagOptions = customTypes.find((model) => model.id === "article")?.json?.Main?.tag?.config?.options;
const listPrimary = slices
  .find((model) => model.id === "article")
  ?.variations?.find((variation) => variation.id === "list")?.primary;
const filterOptions = listPrimary?.filter_by_tag?.config?.options;
const pageSizeOptions = listPrimary?.articles_per_page?.config?.options;

function assertPushed(label, options, expected) {
  const stale = Object.keys(RENAMES);
  const pushed =
    Array.isArray(options) && expected.every((o) => options.includes(o)) && !stale.some((o) => options.includes(o));
  if (pushed) return;
  console.error(`Model drift: ${label} in Prismic offers [${(options ?? []).join(", ")}].`);
  console.error("Push your models with Slice Machine (pnpm dev → localhost:9999) before migrating.");
  process.exit(1);
}
assertPushed("article.tag", tagOptions, TAGS);
assertPushed("article.list.filter_by_tag", filterOptions, ["All", ...TAGS]);
assertPushed("article.list.articles_per_page", pageSizeOptions, PAGE_SIZES);

const client = prismic.createWriteClient(sm.repositoryName, { writeToken });
const documents = await client.dangerouslyGetAll({ lang: "*" });
console.log(`fetched ${documents.length} published documents\n`);

const changes = [];
const pending = [];
const skipped = [];
const unknown = [];
const untagged = [];

for (const doc of documents) {
  const docLabel = `[${doc.type}${doc.uid ? `/${doc.uid}` : ""}:${doc.lang}]`;
  let touched = false;

  if (doc.type === "article") {
    const tag = doc.data.tag;
    if (Object.hasOwn(RENAMES, tag)) {
      doc.data.tag = RENAMES[tag];
      touched = true;
      changes.push(`${docLabel} tag: "${tag}" → "${RENAMES[tag]}"`);
    } else if (!tag) {
      untagged.push(docLabel);
    } else if (!TAGS.includes(tag)) {
      unknown.push(`${docLabel} tag: "${tag}"`);
    }
  }

  for (const slice of doc.data.slices ?? []) {
    if (slice.slice_type !== "article" || slice.variation !== "list") continue;
    const current = slice.primary?.filter_by_tag;
    if (Object.hasOwn(RENAMES, current)) {
      slice.primary.filter_by_tag = RENAMES[current];
      touched = true;
      changes.push(`${docLabel} filter_by_tag: "${current}" → "${RENAMES[current]}"`);
    }
    if (!PAGE_SIZES.includes(slice.primary?.articles_per_page)) {
      slice.primary.articles_per_page = PAGE_SIZE;
      touched = true;
      changes.push(`${docLabel} articles_per_page: (empty) → "${PAGE_SIZE}"`);
    }
  }
  if (!touched) continue;

  // Unsplash-integration images make a document unwritable through the Migration API
  // ("Assets not found"), so report those for a hand edit instead of letting the run fail.
  const unsplash = findUnsplashAsset(doc.data);
  if (unsplash) skipped.push({ docLabel, unsplash });
  else pending.push({ doc, docLabel });
}

for (const line of changes) console.log(`  ${line}`);
if (unknown.length) {
  console.log("\nArticles holding a tag the model no longer offers. Pick a new tag by hand in Prismic:");
  for (const line of unknown) console.log(`  - ${line}`);
}
if (untagged.length) {
  console.log("\nArticles without a tag never match a filter chip. Pick one by hand in Prismic:");
  for (const line of untagged) console.log(`  - ${line}`);
}
if (skipped.length) {
  console.log(`\n${skipped.length} document(s) hold an Unsplash-integration image and cannot be`);
  console.log("updated through the Migration API. Edit these in the Prismic UI:");
  for (const s of skipped) console.log(`  - ${s.docLabel}  (${s.unsplash})`);
}

console.log(`\n${pending.length} document(s) to write, ${skipped.length} skipped (${changes.length} field edits).`);
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
