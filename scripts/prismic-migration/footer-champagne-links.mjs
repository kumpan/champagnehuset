#!/usr/bin/env node
/**
 * Points the footer's "Champagner" column at filtered views of the product search page.
 * The links were authored as placeholders ("abc"). Each one becomes a relative Web link
 * carrying the query string the Product Search slice reads on arrival, see
 * slices/Product/search.ts for the param names.
 *
 * "Nyheter & lanseringar" is left alone, there is no facet for it yet.
 *
 * Dry run by default. Prints every change and touches nothing. Pass --apply to write.
 *
 *   node scripts/prismic-migration/footer-champagne-links.mjs
 *   node scripts/prismic-migration/footer-champagne-links.mjs --apply
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

/** Footer link text → filter params. Volumes list every large format the model offers. */
const LARGE_FORMATS = ["1,5 L", "3 L", "6 L", "9 L", "12 L", "15 L"];
const FILTERS = {
  "Blanc de Blancs": { style: ["Blanc de Blancs"] },
  "Blanc de Noirs": { style: ["Blanc de Noirs"] },
  Årgångschampagne: { vintage: ["yes"] },
  "Magnum & storflaskor": { volume: LARGE_FORMATS },
  Restaurangsortiment: { availability: ["restaurang"] },
};

function searchString(filters) {
  const params = new URLSearchParams();
  for (const [group, values] of Object.entries(filters)) for (const value of values) params.append(group, value);
  return `?${params.toString()}`;
}

const client = prismic.createWriteClient(sm.repositoryName, { writeToken });
const { languages } = await client.getRepository();
const masterLang = languages.find((l) => l.is_master).id;

/** Routed path of the page holding the Product Search slice for a locale, or null. */
async function findSearchPath(lang) {
  const pages = await client.getAllByType("page", { lang });
  const page = pages.find((p) =>
    (p.data.slices ?? []).some((s) => s.slice_type === "product" && s.variation === "search"),
  );
  if (!page) return null;
  // Mirrors buildRoutes in prismicio.ts, parents are not fetched here so a nested page would need a hand edit
  const parent = page.data.parent;
  if (parent && parent.link_type === "Document" && parent.uid) {
    console.warn(`  ${page.uid} is nested under ${parent.uid}, check the generated path`);
    return lang === masterLang ? `/${parent.uid}/${page.uid}` : `/${lang}/${parent.uid}/${page.uid}`;
  }
  return lang === masterLang ? `/${page.uid}` : `/${lang}/${page.uid}`;
}

const footers = await client.getAllByType("footer", { lang: "*" });
console.log(`fetched ${footers.length} footer document(s)\n`);

const pending = [];
const skipped = [];

for (const doc of footers) {
  const docLabel = `[footer:${doc.lang}]`;
  const searchPath = await findSearchPath(doc.lang);
  if (!searchPath) {
    console.log(`${docLabel} no page with a Product Search slice in this locale, skipping`);
    continue;
  }

  let touched = false;
  for (const group of doc.data.links ?? []) {
    const links = Array.isArray(group.link) ? group.link : group.link ? [group.link] : [];
    links.forEach((link, i) => {
      const filters = FILTERS[link.text?.trim()];
      if (!filters) return;
      const url = `${searchPath}${searchString(filters)}`;
      if (link.link_type === "Web" && link.url === url) return;
      const before = link.link_type === "Web" ? link.url : `${link.link_type}:${link.uid ?? link.id ?? ""}`;
      links[i] = { link_type: "Web", key: link.key, url, text: link.text };
      touched = true;
      console.log(`${docLabel} "${link.text}": ${before} → ${url}`);
    });
    if (Array.isArray(group.link)) group.link = links;
    else if (links.length) group.link = links[0];
  }
  if (!touched) {
    console.log(`${docLabel} already up to date`);
    continue;
  }

  const unsplash = findUnsplashAsset(doc.data);
  if (unsplash) skipped.push({ docLabel, unsplash });
  else pending.push({ doc, docLabel });
}

if (skipped.length) {
  console.log(`\n${skipped.length} document(s) hold an Unsplash-integration image and cannot be`);
  console.log("updated through the Migration API. Edit these in the Prismic UI:");
  for (const s of skipped) console.log(`  - ${s.docLabel}  (${s.unsplash})`);
}

console.log(`\n${pending.length} document(s) to write, ${skipped.length} skipped.`);

if (!APPLY) {
  console.log("\nDry run. Re-run with --apply to write these changes to Prismic.");
  process.exit(0);
}

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
