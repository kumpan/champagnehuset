#!/usr/bin/env node
/**
 * Rewrites published content to match the reworked icon models:
 *
 *   1. Every icon Select value moves from a camelCase key (`arrowRight`) to the
 *      human-readable label the CMS now offers (`Arrow Right`).
 *   2. Values dropped by the curated Callout lists are remapped to the nearest survivor,
 *      or cleared to "none" when there is no equivalent.
 *   3. callout-contact's `contact_items` lose their `value` text field; the `link` becomes
 *      a real Link field whose text carries what `value` used to show.
 *
 * Dry run by default — prints every change and touches nothing. Pass --apply to write.
 *
 *   node scripts/prismic-migration/migrate-icons-and-contact-items.mjs
 *   node scripts/prismic-migration/migrate-icons-and-contact-items.mjs --apply
 */
import * as prismic from "@prismicio/client";
import sm from "../../slicemachine.config.json" with { type: "json" };
import {
  diffIconOptions,
  fetchTempAssets,
  findUnsplashAsset,
  ICON_FIELDS,
  loadAllowedLists,
  loadRemoteAllowedLists,
  migrateContactItem,
  migrateIcon,
  replaceUnsplashImages,
} from "./lib.mjs";

process.loadEnvFile(new URL("../../.env.local", import.meta.url));

const APPLY = process.argv.includes("--apply");
const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken) {
  console.error("PRISMIC_WRITE_TOKEN is missing from .env.local");
  process.exit(1);
}

const allowedLists = loadAllowedLists();
const changes = [];
const warnings = [];

// Preflight: the models on disk must already be pushed to Prismic. Writing an option the
// remote model does not list fails with an unhelpful bare "Validation failed".
const drift = diffIconOptions(allowedLists, await loadRemoteAllowedLists(sm.repositoryName, writeToken));
if (drift.length > 0) {
  console.error(`Model drift: ${drift.length} icon field(s) differ between your local models and Prismic.\n`);
  for (const d of drift.slice(0, 10)) console.error(`  ${d.field}\n    ${d.reason}`);
  if (drift.length > 10) console.error(`  …and ${drift.length - 10} more`);
  console.error("\nPush your models with Slice Machine (pnpm dev → localhost:9999) before migrating.");
  process.exit(1);
}

/** Rewrite every icon field inside one slice, using that variation's option list. */
function migrateSliceIcons(slice, docLabel) {
  const scope = `${slice.slice_type}.${slice.variation}`;

  const visit = (node, keyName, trail) => {
    if (Array.isArray(node)) {
      node.forEach((v, i) => {
        visit(v, keyName, `${trail}[${i}]`);
      });
      return;
    }
    if (!node || typeof node !== "object") return;

    for (const [k, v] of Object.entries(node)) {
      if (ICON_FIELDS.has(k) && typeof v === "string") {
        const { value, note } = migrateIcon(v, allowedLists[`${scope}.${k}`]);
        if (value !== v) {
          node[k] = value;
          changes.push(`${docLabel} ${trail}.${k}: "${v}" → "${value}"`);
        }
        if (note) warnings.push(`${docLabel} ${trail}.${k}: ${note}`);
        continue;
      }
      visit(v, k, `${trail}.${k}`);
    }
  };

  visit(slice.primary, null, scope);
  visit(slice.items, null, `${scope}.items`);
}

/** Collapse contact_items from {icon,label,value,link} to {icon,label,link}. */
function migrateContactItems(slice, docLabel) {
  if (slice.slice_type !== "callout" || slice.variation !== "contact") return;
  const items = slice.primary?.contact_items;
  if (!Array.isArray(items)) return;

  slice.primary.contact_items = items.map((item, i) => {
    const { link, note, alreadyMigrated } = migrateContactItem(item);
    if (alreadyMigrated) return item;
    if (note) warnings.push(`${docLabel} contact_items[${i}] (${item.label ?? "untitled"}): ${note}`);
    else changes.push(`${docLabel} contact_items[${i}]: link → ${link.url}`);
    return { icon: item.icon, label: item.label, link };
  });
}

/** Icon fields living directly on a custom type (navbar CTAs, footer socials). */
function migrateDocumentIcons(doc, docLabel) {
  const visit = (node, keyName, trail) => {
    if (Array.isArray(node)) {
      node.forEach((v, i) => {
        visit(v, keyName, `${trail}[${i}]`);
      });
      return;
    }
    if (!node || typeof node !== "object") return;

    for (const [k, v] of Object.entries(node)) {
      if (k === "slices" || k === "slices1") continue;
      if (ICON_FIELDS.has(k) && typeof v === "string") {
        const { value, note } = migrateIcon(v, allowedLists[`${doc.type}.${k}`]);
        if (value !== v) {
          node[k] = value;
          changes.push(`${docLabel} ${trail}.${k}: "${v}" → "${value}"`);
        }
        if (note) warnings.push(`${docLabel} ${trail}.${k}: ${note}`);
        continue;
      }
      visit(v, k, `${trail}.${k}`);
    }
  };
  visit(doc.data, null, doc.type);
}

// ── Run ────────────────────────────────────────────────────────────────────────────────────

const client = prismic.createWriteClient(sm.repositoryName, { writeToken });
const documents = await client.dangerouslyGetAll({ lang: "*" });
const tempAssets = await fetchTempAssets(sm.repositoryName, writeToken);
console.log(`fetched ${documents.length} published documents`);
console.log(`replacement pool: ${tempAssets.map((a) => a.filename).join(", ")}\n`);
if (tempAssets.length === 0) {
  console.error("No temp-* assets found in the media library — cannot replace Unsplash images.");
  process.exit(1);
}

const pending = [];
const skipped = [];

for (const doc of documents) {
  const before = JSON.stringify(doc.data);
  const docLabel = `[${doc.type}${doc.uid ? `/${doc.uid}` : ""}:${doc.lang}]`;

  // Unsplash-integration images make a document unwritable through the Migration API, so
  // swap them for media library assets before anything else.
  replaceUnsplashImages(doc.data, tempAssets, doc.id, (fieldPath, filename, oldAlt) => {
    changes.push(`${docLabel} ${fieldPath}: Unsplash → ${filename}`);
    if (oldAlt) warnings.push(`${docLabel} ${fieldPath}: alt text dropped ("${oldAlt}") — add a new one`);
  });

  migrateDocumentIcons(doc, docLabel);
  for (const slice of doc.data.slices ?? []) {
    migrateSliceIcons(slice, docLabel);
    migrateContactItems(slice, docLabel);
  }

  if (JSON.stringify(doc.data) === before) continue;

  const unsplash = findUnsplashAsset(doc.data);
  if (unsplash) skipped.push({ docLabel, unsplash });
  else pending.push({ doc, docLabel });
}

for (const line of changes) console.log(`  ${line}`);
if (warnings.length) {
  console.log(`\n${warnings.length} item(s) need a human look:`);
  for (const line of warnings) console.log(`  ! ${line}`);
}
if (skipped.length) {
  console.log(`\n${skipped.length} document(s) hold an Unsplash-integration image and cannot be`);
  console.log("updated through the Migration API — edit these in the Prismic UI:");
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
