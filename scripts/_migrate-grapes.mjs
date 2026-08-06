/**
 * One-off content migration: convert every product's legacy free-text
 * `product_grapes` string (e.g. "60% Pinot Noir, 40% Chardonnay") into the new
 * repeatable Group shape [{ grape: <Select value> }], ordered dominant-first.
 * Percentages are parsed only to order the grapes, then dropped (the Group has
 * no percentage field). Also drops the orphaned `product_price` field, which
 * was removed from the custom type (the Migration API rejects fields not in the
 * current model).
 *
 * Writes land in a Prismic Migration Release — publish it in the dashboard to
 * apply. Safe to re-run (idempotent: sets the same group each time).
 *
 * Run: node --env-file=.env.local scripts/_migrate-grapes.mjs [--limit N] [--commit]
 *   without --commit it is a DRY RUN (no writes).
 */
import * as prismic from "@prismicio/client";

const REPO = "champagnehuset";
const CANON = {
  chardonnay: "Chardonnay",
  "pinot noir": "Pinot Noir",
  "pinot meunier": "Meunier",
  meunier: "Meunier",
  "pinot blanc": "Pinot Blanc",
  "pinot gris": "Pinot Gris",
  arbane: "Arbane",
  "petit meslier": "Petit Meslier",
};
const normalize = (name) => CANON[name.toLowerCase().replace(/\s+/g, " ").trim()] ?? null;

function parseGrapes(str) {
  const items = [];
  const re = /(\d+(?:[.,]\d+)?)\s*%\s*([^0-9]+?)(?=\s*\d+(?:[.,]\d+)?\s*%|$)/g;
  for (let m = re.exec(str); m !== null; m = re.exec(str)) {
    items.push({ pct: parseFloat(m[1].replace(",", ".")), grape: normalize(m[2].replace(/[,;/&]+$/, "").trim()) });
  }
  if (items.length === 0 && str.trim()) {
    for (const part of str.split(/[,/&]|\boch\b/i)) {
      const raw = part.trim();
      if (raw) items.push({ pct: null, grape: normalize(raw) });
    }
  }
  items.sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1));
  return items;
}

const args = process.argv.slice(2);
const commit = args.includes("--commit");
const limitArg = args.indexOf("--limit");
const limit = limitArg !== -1 ? Number(args[limitArg + 1]) : Infinity;

const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (commit && !writeToken) {
  console.error(
    "Missing PRISMIC_WRITE_TOKEN — run with: node --env-file=.env.local scripts/_migrate-grapes.mjs --commit",
  );
  process.exit(1);
}

const client = prismic.createClient(REPO);
let docs = await client.getAllByType("product", { lang: "*" });
docs = docs.slice(0, limit);
console.log(`${commit ? "COMMIT" : "DRY RUN"} — ${docs.length} product document(s)\n`);

// Prepare each doc; collect any grape strings that don't map cleanly.
const prepared = [];
const unmapped = [];
for (const doc of docs) {
  const before = doc.data.product_grapes;
  if (typeof before !== "string") continue; // already migrated
  const parsed = parseGrapes(before);
  const bad = parsed.filter((p) => !p.grape);
  if (parsed.length === 0 || bad.length) {
    unmapped.push(`${doc.uid}: "${before}" -> unmapped ${JSON.stringify(bad)}`);
    continue;
  }
  doc.data.product_grapes = parsed.map((p) => ({ grape: p.grape }));
  delete doc.data.product_price; // orphaned: removed from the custom type
  prepared.push({ doc, before });
}

if (unmapped.length) {
  console.error(`⚠ ${unmapped.length} unmapped grape strings — aborting before any write:`);
  for (const u of unmapped) console.error(`   ${u}`);
  process.exit(1);
}
console.log(`${prepared.length} to update, ${docs.length - prepared.length} already migrated/skipped.\n`);

if (!commit) {
  for (const { doc, before } of prepared) {
    console.log(`  → ${doc.uid}: "${before}"  ->  [${doc.data.product_grapes.map((g) => g.grape).join(", ")}]`);
  }
  console.log("\nDRY RUN complete — no writes. Re-run with --commit to apply.");
  process.exit(0);
}

// Per-document migration so one bad asset can't abort the whole run.
const writeClient = prismic.createWriteClient(REPO, { writeToken });
let ok = 0;
const failed = [];
for (const { doc } of prepared) {
  try {
    const migration = prismic.createMigration();
    migration.updateDocument(doc, doc.data.meta_title || doc.uid);
    await writeClient.migrate(migration, { reporter: () => {} });
    ok++;
    console.log(`  ✓ ${doc.uid}  [${doc.data.product_grapes.map((g) => g.grape).join(", ")}]`);
  } catch (e) {
    const reason = e?.response?.message || e?.message || String(e);
    failed.push({ uid: doc.uid, id: doc.id, reason });
    console.log(`  ✗ ${doc.uid}: ${reason}`);
  }
}

console.log(`\nDone: ${ok} updated, ${failed.length} failed.`);
if (failed.length) {
  console.log("\nFAILED (need manual handling in Prismic UI — likely broken/Unsplash image asset):");
  for (const f of failed) console.log(`  ${f.uid} (${f.id}): ${f.reason}`);
}
console.log("\nUpdates are staged in the Migration Release — publish it in Prismic to apply.");
