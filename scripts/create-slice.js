#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

// ── Name helpers ───────────────────────────────────────────────────────────────

/** Accepts kebab-case, snake_case, camelCase, or PascalCase → PascalCase */
function toPascalCase(str) {
  return str.replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, (_, c) => c.toUpperCase());
}

/** PascalCase → snake_case */
function toSnakeCase(pascalStr) {
  return pascalStr.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}

// ── Resolve slices directory ───────────────────────────────────────────────────

const SLICES_DIR = fs.existsSync("./slices") ? "./slices" : "./src/slices";
const INDEX_PATH = path.join(SLICES_DIR, "index.ts");

// ── Template definition ────────────────────────────────────────────────────────

const template = {
  fields: {
    primary: {
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
      overline: {
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
                  "none",
                  "atSign",
                  "badgeCheck",
                  "badgeInfo",
                  "bookOpenCheck",
                  "briefcaseBusiness",
                  "check",
                  "circleGauge",
                  "circleStar",
                  "clock",
                  "crown",
                  "dog",
                  "fileBadge",
                  "fileText",
                  "gem",
                  "handshake",
                  "headset",
                  "hourglass",
                  "houseHeart",
                  "layers",
                  "lock",
                  "lockKeyhole",
                  "lockKeyholeOpen",
                  "mail",
                  "moon",
                  "moonStar",
                  "mountainSnow",
                  "phoneCall",
                  "plane",
                  "search",
                  "ship",
                  "shieldCheck",
                  "shieldEllipsis",
                  "sun",
                  "triangle",
                  "trophy",
                ],
                default_value: "none",
              },
            },
            overline_text: {
              type: "Text",
              config: {
                label: "Overline Text",
                placeholder: "",
              },
            },
          },
        },
      },
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
      buttons: {
        type: "Group",
        config: {
          label: "Buttons",
          repeat: true,
          fields: {
            link: {
              type: "Link",
              config: {
                label: "Link",
                allowText: true,
                allowTargetBlank: true,
              },
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
                  "none",
                  "arrowDown",
                  "arrowLeft",
                  "arrowRight",
                  "arrowUp",
                  "arrowUpRight",
                  "atSign",
                  "badgeCheck",
                  "badgeInfo",
                  "bookOpenCheck",
                  "briefcaseBusiness",
                  "check",
                  "chevronDown",
                  "chevronLeft",
                  "chevronRight",
                  "circlePlay",
                  "circleStar",
                  "clipboardCheck",
                  "headset",
                  "mail",
                  "phoneCall",
                  "phoneIncoming",
                  "phoneOutgoing",
                ],
                default_value: "none",
              },
            },
            icon_right: {
              type: "Select",
              config: {
                label: "Right Icon",
                placeholder: "",
                options: [
                  "none",
                  "arrowDown",
                  "arrowLeft",
                  "arrowRight",
                  "arrowUp",
                  "arrowUpRight",
                  "atSign",
                  "badgeCheck",
                  "badgeInfo",
                  "bookOpenCheck",
                  "briefcaseBusiness",
                  "check",
                  "chevronDown",
                  "chevronLeft",
                  "chevronRight",
                  "circlePlay",
                  "circleStar",
                  "clipboardCheck",
                  "headset",
                  "mail",
                  "phoneCall",
                  "phoneIncoming",
                  "phoneOutgoing",
                ],
                default_value: "none",
              },
            },
          },
        },
      },
    },
  },
  component: `
import type { Content } from '@prismicio/client';
import type { SliceComponentProps } from '@prismicio/react';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { SectionIntro } from '@/components/section-intro';
import { hasSectionIntroContent } from '@/lib/utils';

export type {{sliceName}}Props = SliceComponentProps<Content.{{sliceName}}Slice>;

export default function {{sliceName}}({ slice }: {{sliceName}}Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const {
    overline,
    title,
    description,
    buttons,
    alignment,
    section_theme,
    remove_top_padding,
  } = slice.primary;

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
};`,
};

// ── Update slices/index.ts ─────────────────────────────────────────────────────

function updateSlicesIndex(snakeName, pascalName) {
  let content;

  try {
    content = fs.readFileSync(INDEX_PATH, "utf8");
  } catch {
    // index.ts missing — create a fresh one
    content = 'import dynamic from "next/dynamic";\n\nexport const components = {};\n';
  }

  // Ensure `import dynamic` is present
  if (!content.includes('"next/dynamic"') && !content.includes("'next/dynamic'")) {
    content = `import dynamic from "next/dynamic";\n\n${content}`;
  }

  // Match export with or without a type annotation: `export const components[: Type] = {`
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

  // Collect existing lines, append new entry, sort alphabetically by key
  const lines = existingBody
    .split("\n")
    .filter((line) => line.trim())
    .concat(newEntry)
    .sort((a, b) => {
      const keyA = a.trim().split(":")[0].trim();
      const keyB = b.trim().split(":")[0].trim();
      return keyA.localeCompare(keyB);
    });

  const newContent = content.replace(COMPONENTS_RE, `export const components = {\n${lines.join("\n")}\n};`);

  fs.writeFileSync(INDEX_PATH, newContent);
  console.log(`  Updated ${SLICES_DIR}/index.ts`);
}

// ── Create slice ───────────────────────────────────────────────────────────────

function createSlice(rawName) {
  // Normalise: accept kebab-case, snake_case, camelCase, PascalCase
  const pascalName = toPascalCase(rawName);
  const snakeName = toSnakeCase(pascalName);

  if (!pascalName || !/^[A-Z][A-Za-z0-9]*$/.test(pascalName)) {
    console.error(`Error: "${rawName}" is not a valid slice name.`);
    console.error("Use letters and numbers only, e.g. MyHero or my-hero.");
    process.exit(1);
  }

  const sliceDir = path.join(SLICES_DIR, pascalName);

  if (fs.existsSync(sliceDir)) {
    console.error(`Error: Slice "${pascalName}" already exists at ${sliceDir}`);
    process.exit(1);
  }

  try {
    fs.mkdirSync(sliceDir, { recursive: true });

    // model.json
    const model = {
      id: snakeName,
      type: "SharedSlice",
      name: pascalName,
      description: pascalName,
      variations: [
        {
          id: "default",
          name: "Default",
          docURL: "...",
          version: "initial",
          description: "Default",
          imageUrl: "",
          primary: template.fields.primary || {},
          items: template.fields.items || {},
        },
      ],
    };

    fs.writeFileSync(path.join(sliceDir, "model.json"), JSON.stringify(model, null, 2));

    // index.tsx
    const componentCode = template.component.replace(/{{sliceName}}/g, pascalName);
    fs.writeFileSync(path.join(sliceDir, "index.tsx"), componentCode);

    // Register in slices/index.ts
    updateSlicesIndex(snakeName, pascalName);

    const compliments = [
      "You're looking really nice today.",
      "That slice? Clean. Just like your code.",
      "Honestly, you might be the best developer on the team.",
      "Not everyone could pull that off. You did.",
      "Your commit history is basically a work of art.",
      "If slices were people, this one would be you — outstanding.",
      "Scientists are still trying to understand how you're this good.",
      "You radiate main character energy.",
      "Your future self is going to be so grateful you wrote this.",
      "Somewhere out there, a senior dev just nodded in approval.",
      "You make this look effortless. It is not effortless. Well done.",
      "This slice is going to change lives. Your haircut is also great.",
      "The codebase is measurably better because of you.",
      "Rumor has it this slice compiles 15% faster just because you made it.",
      "Every keystroke you've ever typed has led to this moment.",
      "You are a beacon of calm in a sea of undefined is not a function.",
      "If there were a Nobel Prize for slices, consider yourself nominated.",
      "You didn't just create a slice. You created a legacy.",
      "Your variable names actually make sense. Rare. Powerful.",
      "The vibes you bring to this codebase are immaculate.",
      "Stack Overflow could never replace you.",
      "Whoever reviews this PR is in for a treat.",
      "You're out here shipping features like it's nothing.",
      "Big brain. Good slice. Tremendous day.",
      "That's it. That's the message. You're just really great.",
    ];
    const compliment = compliments[Math.floor(Math.random() * compliments.length)];

    console.log(`\nSlice "${pascalName}" created at ${sliceDir}/`);
    console.log(`\n${compliment}`);
  } catch (error) {
    console.error("Error creating slice:", error.message);
    process.exit(1);
  }
}

// ── CLI ───────────

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.log("Usage: pnpm create-slice <slice-name>");
  console.log("Examples:");
  console.log("  pnpm create-slice MyHero");
  console.log("  pnpm create-slice my-hero");
  process.exit(1);
}

createSlice(args[0]);
