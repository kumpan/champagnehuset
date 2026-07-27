/**
 * Deletes the documents created by migrate.mjs (listed in manifest.json).
 * Only touches documents in the manifest — never the pre-existing producers,
 * the vincent-joudart name fix, or the bottle-0X media library assets.
 *
 * Dry run (default):  node --env-file=.env.local scripts/prismic-migration/cleanup.mjs
 * Actually delete:    node --env-file=.env.local scripts/prismic-migration/cleanup.mjs --yes
 * Single document:    node --env-file=.env.local scripts/prismic-migration/cleanup.mjs --yes --uid <uid>
 */
import { readFileSync } from "node:fs";

const REPO = "champagnehuset";

const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken) {
  console.error(
    "Missing PRISMIC_WRITE_TOKEN — run with: node --env-file=.env.local scripts/prismic-migration/cleanup.mjs",
  );
  process.exit(1);
}

const confirmed = process.argv.includes("--yes");
const uidFlag = process.argv.indexOf("--uid");
const onlyUid = uidFlag !== -1 ? process.argv[uidFlag + 1] : null;

const manifest = JSON.parse(readFileSync(new URL("./manifest.json", import.meta.url), "utf8"));
const targets = manifest.documents.filter((doc) => (onlyUid ? doc.uid === onlyUid : true));

console.log(`${targets.length} document(s) targeted for deletion from "${REPO}":`);
for (const doc of targets) console.log(`  - ${doc.type}/${doc.uid} (${doc.id})`);

if (!confirmed) {
  console.log("\nDry run — nothing deleted. Re-run with --yes to delete.");
  process.exit(0);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let deleted = 0;
let failed = 0;
for (const doc of targets) {
  const response = await fetch(`https://migration.prismic.io/documents/${doc.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${writeToken}`, repository: REPO },
  });
  if (response.ok) {
    deleted += 1;
    console.log(`deleted ${doc.type}/${doc.uid}`);
  } else {
    failed += 1;
    console.error(`FAILED ${doc.type}/${doc.uid}: ${response.status} ${await response.text()}`);
  }
  await sleep(1500); // stay under the Migration API rate limit
}

console.log(`\nDone. ${deleted} deleted, ${failed} failed.`);
if (failed === 0 && !onlyUid) console.log("You can now delete manifest.json, or keep it as a record.");
