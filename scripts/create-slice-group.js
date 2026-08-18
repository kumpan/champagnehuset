#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

// ── Name helpers ───────────────────────────────────────────────────────────────

/** kebab-case, snake_case, camelCase, PascalCase → PascalCase */
function toPascalCase(str) {
  return str.replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, (_, c) => c.toUpperCase());
}

/** PascalCase → snake_case */
function toSnakeCase(pascalStr) {
  return pascalStr.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}

/** PascalCase or camelCase → kebab-case */
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/_/g, "-");
}

/** "my-variation" → "My Variation" (for Prismic labels) */
function toLabel(str) {
  return str
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Paths ──────────────────────────────────────────────────────────────────────

const SLICES_DIR = fs.existsSync("./slices") ? "./slices" : "./src/slices";
const INDEX_PATH = path.join(SLICES_DIR, "index.ts");

// ── Shared field definitions ───────────────────────────────────────────────────

const OVERLINE_FIELD = {
  type: "Group",
  config: {
    label: "Overline",
    repeat: false,
    fields: {
      overline_icon: {
        type: "Select",
        config: {
          label: "Overline Icon",
          placeholder: "",
          options: [
            "None",
            "Amphora",
            "Apple",
            "At Sign",
            "Award",
            "Badge Check",
            "Badge Info",
            "Banana",
            "Book Open Check",
            "Bottle Wine",
            "Briefcase Business",
            "Calendar Check",
            "Calendar Days",
            "Check",
            "Chef Hat",
            "Cherry",
            "Circle Play",
            "Circle Star",
            "Citrus",
            "Clipboard Check",
            "Clock",
            "Concierge Bell",
            "Cookie",
            "Copy",
            "Croissant",
            "Crown",
            "Download",
            "Droplets",
            "External Link",
            "Facebook",
            "File Badge",
            "File Text",
            "Fish",
            "Flame",
            "Flask Conical",
            "Flower 2",
            "Gem",
            "Glass Water",
            "Globe",
            "Grape",
            "Handshake",
            "House Heart",
            "Instagram",
            "Layers",
            "Leaf",
            "Linkedin",
            "List",
            "Lock",
            "Lock Keyhole",
            "Lock Keyhole Open",
            "Lock Open",
            "Log In",
            "Mail",
            "Map Pin",
            "Martini",
            "Medal",
            "Mountain",
            "Nut",
            "Phone Call",
            "Phone Incoming",
            "Phone Outgoing",
            "Plus",
            "Search",
            "Shield Check",
            "Shield Ellipsis",
            "Snowflake",
            "Sparkles",
            "Sprout",
            "Star",
            "Sun",
            "Thermometer Snowflake",
            "Trash",
            "Trophy",
            "User",
            "User Cog",
            "User Round Check",
            "Users",
            "User Star",
            "Utensils Crossed",
            "Wheat",
            "Wine",
            "Youtube",
          ],
          default_value: "None",
        },
      },
      overline_text: {
        type: "Text",
        config: { label: "Overline Text", placeholder: "" },
      },
    },
  },
};

const BUTTONS_FIELD = {
  type: "Group",
  config: {
    label: "Buttons",
    repeat: true,
    fields: {
      link: {
        type: "Link",
        config: { label: "Link", allowText: true, allowTargetBlank: true },
      },
      variant: {
        type: "Select",
        config: {
          label: "Variant",
          placeholder: "",
          options: ["default", "secondary", "outline", "ghost"],
          default_value: "default",
        },
      },
      icon_left: {
        type: "Select",
        config: {
          label: "Left Icon",
          placeholder: "",
          options: [
            "None",
            "Arrow Down",
            "Arrow Left",
            "Arrow Right",
            "Arrow Up",
            "Arrow Up Right",
            "At Sign",
            "Badge Check",
            "Badge Info",
            "Book Open Check",
            "Briefcase Business",
            "Check",
            "Chevron Down",
            "Chevron Left",
            "Chevron Right",
            "Circle Play",
            "Circle Star",
            "Clipboard Check",
            "Mail",
            "Phone Call",
            "Phone Incoming",
            "Phone Outgoing",
          ],
          default_value: "None",
        },
      },
      icon_right: {
        type: "Select",
        config: {
          label: "Right Icon",
          placeholder: "",
          options: [
            "None",
            "Arrow Down",
            "Arrow Left",
            "Arrow Right",
            "Arrow Up",
            "Arrow Up Right",
            "At Sign",
            "Badge Check",
            "Badge Info",
            "Book Open Check",
            "Briefcase Business",
            "Check",
            "Chevron Down",
            "Chevron Left",
            "Chevron Right",
            "Circle Play",
            "Circle Star",
            "Clipboard Check",
            "Mail",
            "Phone Call",
            "Phone Incoming",
            "Phone Outgoing",
          ],
          default_value: "None",
        },
      },
    },
  },
};

const DEFAULT_PRIMARY = {
  remove_top_padding: {
    type: "Boolean",
    config: {
      label: "Remove Top Padding",
      placeholder_false: "Keep Padding",
      placeholder_true: "Padding is Removed",
      default_value: false,
    },
  },
  section_theme: {
    type: "Select",
    config: {
      label: "Section Theme",
      placeholder: "",
      options: ["Bud", "Dust"],
      default_value: "Bud",
    },
  },
  alignment: {
    type: "Boolean",
    config: {
      label: "Center Text",
      placeholder_false: "Text is Left-Aligned",
      placeholder_true: "Text is Centered",
      default_value: true,
    },
  },
  overline: OVERLINE_FIELD,
  title: {
    type: "StructuredText",
    config: {
      label: "Title",
      placeholder: "",
      allowTargetBlank: true,
      multi: "heading2,heading3,heading4",
    },
  },
  description: {
    type: "StructuredText",
    config: {
      label: "Description",
      placeholder: "",
      allowTargetBlank: true,
      multi: "strong,em,paragraph,hyperlink,list-item,o-list-item,embed,preformatted",
    },
  },
  buttons: BUTTONS_FIELD,
};

// ── File generators ────────────────────────────────────────────────────────────

function makeModel(snakeName, pascalName, variations) {
  return {
    id: snakeName,
    type: "SharedSlice",
    name: pascalName,
    description: pascalName,
    variations: variations.map((v) => ({
      id: v.id,
      name: v.label,
      docURL: "...",
      version: "initial",
      description: v.label,
      imageUrl: "",
      primary: DEFAULT_PRIMARY,
      items: {},
    })),
  };
}

function makeIndexTsx(pascalName, _snakeName, variations) {
  const kebabName = toKebabCase(pascalName);

  const importLines = variations
    .map((v) => {
      const compName = `${pascalName}${toPascalCase(v.id)}`;
      return `import { ${compName} } from "./variations/${kebabName}-${v.id}";`;
    })
    .join("\n");

  const caseLines = variations
    .map((v) => {
      const compName = `${pascalName}${toPascalCase(v.id)}`;
      return `    case "${v.id}": return <${compName} {...props} slice={props.slice} />;`;
    })
    .join("\n");

  return `import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

${importLines}

export type ${pascalName}Props = SliceComponentProps<Content.${pascalName}Slice>;

export default function ${pascalName}(props: ${pascalName}Props) {
  switch (props.slice.variation) {
${caseLines}
  }
}
`;
}

function makeVariationTsx(pascalName, variationId) {
  const compName = `${pascalName}${toPascalCase(variationId)}`;
  const parentProps = `${pascalName}Props`;
  const variationType = `Content.${pascalName}Slice${toPascalCase(variationId)}`;

  return `import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { hasSectionIntroContent } from "@/lib/utils";
import type { ${parentProps} } from "..";

type Props = ${parentProps} & { slice: ${variationType} };

export function ${compName}({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, buttons, alignment, section_theme, remove_top_padding } =
    slice.primary;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme}
    >
      <Container>
        {hasIntroContent && (
          <SectionIntro
            overline={overline}
            title={title}
            description={description}
            buttons={buttons}
            align={alignment ? "center" : "left"}
            sectionTheme={section_theme}
          />
        )}
      </Container>
    </Section>
  );
}
`;
}

// ── Registry update ────────────────────────────────────────────────────────────

function updateSlicesIndex(snakeName, pascalName) {
  let content;

  try {
    content = fs.readFileSync(INDEX_PATH, "utf8");
  } catch {
    content = 'import dynamic from "next/dynamic";\n\nexport const components = {};\n';
  }

  if (!content.includes('"next/dynamic"') && !content.includes("'next/dynamic'")) {
    content = `import dynamic from "next/dynamic";\n\n${content}`;
  }

  const COMPONENTS_RE = /export const components(?::[^=]+)?\s*=\s*\{([\s\S]*?)\};/;
  const match = content.match(COMPONENTS_RE);

  if (!match) {
    console.warn("  Could not find `export const components` in index.ts — skipping index update.");
    return;
  }

  const existingBody = match[1];
  const newEntry = `  ${snakeName}: dynamic(() => import("./${pascalName}")),`;

  if (existingBody.includes(`${snakeName}:`)) {
    console.log(`  Entry for "${snakeName}" already exists in index.ts — skipping.`);
    return;
  }

  const lines = existingBody
    .split("\n")
    .filter((l) => l.trim())
    .concat(newEntry)
    .sort((a, b) => a.trim().split(":")[0].trim().localeCompare(b.trim().split(":")[0].trim()));

  const newContent = content.replace(COMPONENTS_RE, `export const components = {\n${lines.join("\n")}\n};`);

  fs.writeFileSync(INDEX_PATH, newContent);
  console.log(`  Updated ${SLICES_DIR}/index.ts`);
}

// ── Main ───────────────────────────────────────────────────────────────────────

function createSliceGroup(rawName, rawVariations) {
  const pascalName = toPascalCase(rawName);
  const snakeName = toSnakeCase(pascalName);
  const kebabName = toKebabCase(pascalName);

  if (!pascalName || !/^[A-Z][A-Za-z0-9]*$/.test(pascalName)) {
    console.error(`Error: "${rawName}" is not a valid slice name.`);
    console.error("Use letters and numbers only, e.g. Text or text-section.");
    process.exit(1);
  }

  if (rawVariations.length < 2) {
    console.error("Error: a slice group needs at least 2 variations.");
    console.error(`Usage: pnpm create-slice-group <SliceName> <variation1> <variation2> ...`);
    process.exit(1);
  }

  const variations = rawVariations.map((v) => ({
    // IDs are always simple lowercase (strip non-alpha)
    id: v
      .toLowerCase()
      .replace(/[-_\s]+/g, "-")
      .replace(/[^a-z0-9-]/g, ""),
    label: toLabel(v),
  }));

  const sliceDir = path.join(SLICES_DIR, pascalName);
  const variationsDir = path.join(sliceDir, "variations");
  const isNew = !fs.existsSync(sliceDir);

  try {
    fs.mkdirSync(variationsDir, { recursive: true });

    if (isNew) {
      // ── Fresh slice ──────────────────────────────────────────────────────────

      fs.writeFileSync(
        path.join(sliceDir, "model.json"),
        JSON.stringify(makeModel(snakeName, pascalName, variations), null, 2),
      );
      console.log(`  Created model.json  (${variations.length} variations)`);

      fs.writeFileSync(path.join(sliceDir, "index.tsx"), makeIndexTsx(pascalName, snakeName, variations));
      console.log(`  Created index.tsx   (dispatcher)`);

      for (const v of variations) {
        const fileName = `${kebabName}-${v.id}.tsx`;
        fs.writeFileSync(path.join(variationsDir, fileName), makeVariationTsx(pascalName, v.id));
        console.log(`  Created variations/${fileName}`);
      }

      updateSlicesIndex(snakeName, pascalName);
    } else {
      // ── Add variations to existing slice ────────────────────────────────────
      console.log(`  Slice "${pascalName}" already exists — adding new variations only.\n`);

      // model.json — append non-duplicate variations
      const modelPath = path.join(sliceDir, "model.json");
      const model = JSON.parse(fs.readFileSync(modelPath, "utf8"));
      const existingIds = new Set(model.variations.map((v) => v.id));
      const newModelVariations = variations.filter((v) => !existingIds.has(v.id));

      if (newModelVariations.length) {
        model.variations.push(
          ...newModelVariations.map((v) => ({
            id: v.id,
            name: v.label,
            docURL: "...",
            version: "initial",
            description: v.label,
            imageUrl: "",
            primary: DEFAULT_PRIMARY,
            items: {},
          })),
        );
        fs.writeFileSync(modelPath, JSON.stringify(model, null, 2));
        console.log(`  Updated model.json  (+${newModelVariations.length} variations)`);
      } else {
        console.log(`  model.json — no new variations to add`);
      }

      // index.tsx — inject new imports and case lines
      const indexPath = path.join(sliceDir, "index.tsx");
      let indexContent = fs.readFileSync(indexPath, "utf8");
      let indexChanged = false;

      for (const v of variations) {
        const compName = `${pascalName}${toPascalCase(v.id)}`;
        const fileName = `${kebabName}-${v.id}`;
        const importLine = `import { ${compName} } from "./variations/${fileName}";`;
        const caseLine = `    case "${v.id}": return <${compName} {...props} slice={props.slice} />;`;

        if (!indexContent.includes(importLine)) {
          // Insert after the last ./variations/ import line
          indexContent = indexContent.replace(
            /(import \{[^}]+\} from "\.\/variations\/[^"]+";)(?![\s\S]*import \{[^}]+\} from "\.\/variations\/)/,
            `$1\n${importLine}`,
          );
          indexChanged = true;
        }

        if (!indexContent.includes(`case "${v.id}":`)) {
          // Insert before the closing } of the switch block
          indexContent = indexContent.replace(/(\s+)\}(\s*\}\s*$)/, `$1  ${caseLine.trim()}\n$1}$2`);
          indexChanged = true;
        }
      }

      if (indexChanged) {
        fs.writeFileSync(indexPath, indexContent);
        console.log(`  Updated index.tsx   (new imports + case lines)`);
      } else {
        console.log(`  index.tsx — no changes needed`);
      }

      // slices/index.ts — already registered, skip
      console.log(`  slices/index.ts — already registered, skipping`);
    }

    // variations/*.tsx — always skip if file exists
    let created = 0;
    let skipped = 0;
    for (const v of variations) {
      const fileName = `${kebabName}-${v.id}.tsx`;
      const filePath = path.join(variationsDir, fileName);
      if (fs.existsSync(filePath)) {
        console.log(`  Skipped  variations/${fileName}  (already exists)`);
        skipped++;
      } else {
        fs.writeFileSync(filePath, makeVariationTsx(pascalName, v.id));
        console.log(`  Created  variations/${fileName}`);
        created++;
      }
    }

    const compliments = [
      "A whole group of slices. Look at you go.",
      "Variations? In this economy? Respect.",
      "That structure is clean. You are clean. Correlation noted.",
      "Not one slice. Not two. A whole group. Legend.",
      "The dispatcher pattern appreciates you for understanding it.",
      "Every variation file you just generated is going to age beautifully.",
      "You could teach a masterclass on slice architecture.",
      "This folder structure is going to make a junior dev cry tears of joy.",
      "Multiple variations, zero chaos. That's your brand.",
      "The index.tsx is thin and the variations are focused. Perfection.",
    ];
    const compliment = compliments[Math.floor(Math.random() * compliments.length)];

    const action = isNew ? "created" : "updated";
    console.log(`\nSlice group "${pascalName}" ${action} at ${sliceDir}/`);
    if (created > 0 || skipped > 0) {
      console.log(`Variations: ${created} created, ${skipped} skipped`);
    }
    console.log(`\n${compliment}`);
  } catch (error) {
    console.error("Error creating slice group:", error.message);
    process.exit(1);
  }
}

// ── CLI ────────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.length < 3) {
  console.log("Usage: pnpm create-slice-group <SliceName> <variation1> <variation2> [variation3 ...]");
  console.log("");
  console.log("Examples:");
  console.log("  pnpm create-slice-group Text extended highlight split longform");
  console.log("  pnpm create-slice-group Stats split grid highlight");
  console.log("  pnpm create-slice-group Callout inline banner full-width");
  process.exit(1);
}

createSliceGroup(args[0], args.slice(1));
