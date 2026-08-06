import fs from "node:fs";
import mocksPkg from "../node_modules/.pnpm/@prismicio+mocks@2.14.0/node_modules/@prismicio/mocks/lib/index.js";

const { generateSliceMock } = mocksPkg;
const model = JSON.parse(fs.readFileSync("slices/Text/model.json", "utf8"));
const existing = JSON.parse(fs.readFileSync("slices/Text/mocks.json", "utf8"));
const have = new Set(existing.map((m) => m.variation));
const want = model.variations.map((v) => v.id);
const missing = want.filter((v) => !have.has(v));
console.log("existing:", [...have], "| generating:", missing);
for (const vId of missing) {
  const gen = generateSliceMock(model, { variation: vId });
  const mock = typeof gen === "function" ? gen() : gen;
  mock.variation = vId;
  existing.push(mock);
  console.log(`  + ${vId}: primary keys = ${Object.keys(mock.primary || {}).join(",")}`);
}
existing.sort((a, b) => want.indexOf(a.variation) - want.indexOf(b.variation));
fs.writeFileSync("slices/Text/mocks.json", `${JSON.stringify(existing, null, 2)}\n`);
console.log("wrote", existing.length, "variations");
