#!/usr/bin/env node

/**
 * Scans the slices/ folder and registers any slice that is missing from
 * slices/index.ts. Safe to run multiple times — existing entries are untouched
 *
 * Nice for when you copy slices from another project
 *
 * Usage: pnpm sync-slices
 */

const fs = require("node:fs");
const path = require("node:path");

const SLICES_DIR = fs.existsSync("./slices") ? "./slices" : "./src/slices";
const INDEX_PATH = path.join(SLICES_DIR, "index.ts");

// ── Name helpers ───────────────────────────────────────────────────────────────

/** PascalCase → snake_case  (e.g. HeroBackdrop → hero_backdrop) */
function toSnakeCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}

// ── Discover slice folders ─────────────────────────────────────────────────────

function discoverSlices() {
  return fs
    .readdirSync(SLICES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(SLICES_DIR, entry.name, "index.tsx")))
    .map((entry) => ({
      pascalName: entry.name,
      snakeName: toSnakeCase(entry.name),
    }));
}

// ── Read / write index.ts ──────────────────────────────────────────────────────

function readIndex() {
  try {
    return fs.readFileSync(INDEX_PATH, "utf8");
  } catch {
    return 'import dynamic from "next/dynamic";\n\nexport const components = {};\n';
  }
}

const COMPONENTS_RE = /export const components(?::[^=]+)?\s*=\s*\{([\s\S]*?)\};/;

function syncIndex(slices) {
  let content = readIndex();

  if (!content.includes('"next/dynamic"') && !content.includes("'next/dynamic'")) {
    content = `import dynamic from "next/dynamic";\n\n${content}`;
  }

  const match = content.match(COMPONENTS_RE);
  if (!match) {
    console.error("Could not find `export const components` in index.ts — aborting.");
    process.exit(1);
  }

  const existingBody = match[1];
  const missing = slices.filter((s) => !existingBody.includes(`${s.snakeName}:`));

  if (missing.length === 0) {
    console.log("✓ slices/index.ts is already up to date.");
    return;
  }

  const newEntries = missing.map((s) => `  ${s.snakeName}: dynamic(() => import("./${s.pascalName}")),`);

  const allLines = existingBody
    .split("\n")
    .filter((line) => line.trim())
    .concat(newEntries)
    .sort((a, b) => {
      const keyA = a.trim().split(":")[0].trim();
      const keyB = b.trim().split(":")[0].trim();
      return keyA.localeCompare(keyB);
    });

  const newContent = content.replace(COMPONENTS_RE, `export const components = {\n${allLines.join("\n")}\n};`);

  fs.writeFileSync(INDEX_PATH, newContent);

  for (const s of missing) {
    console.log(`  + registered "${s.snakeName}" → ${s.pascalName}`);
  }
  console.log(`\n✓ slices/index.ts updated (${missing.length} slice${missing.length === 1 ? "" : "s"} added).`);
}

// ── Run ────────────────────────────────────────────────────────────────────────

const slices = discoverSlices();
console.log(`Found ${slices.length} slice folder${slices.length === 1 ? "" : "s"} in ${SLICES_DIR}/\n`);
syncIndex(slices);
