import fs from "node:fs";
import mocksPkg from "../node_modules/.pnpm/@prismicio+mocks@2.14.0/node_modules/@prismicio/mocks/lib/index.js";
import lzPkg from "../node_modules/.pnpm/lz-string@1.5.0/node_modules/lz-string/libs/lz-string.js";

const { renderSliceMock } = mocksPkg;
const LZString = lzPkg;
// args: sliceDir variationId
const [dir, variation] = process.argv.slice(2);
const model = JSON.parse(fs.readFileSync(`slices/${dir}/model.json`, "utf8"));
const mocks = JSON.parse(fs.readFileSync(`slices/${dir}/mocks.json`, "utf8"));
const mock = mocks.find((m) => m.variation === variation) || mocks[0];
const api = renderSliceMock(model, mock);
const state = LZString.compressToEncodedURIComponent(JSON.stringify([api]));
process.stdout.write(state);
