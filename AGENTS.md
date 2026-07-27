<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:component-rules -->

# No third-party UI component libraries

All UI components are built from scratch using React and Tailwind.

**Never install or import from:**

- `@radix-ui/*` (Radix UI primitives)
- `shadcn/ui` (component registry)
- `class-variance-authority` / `cva`
- `@headlessui/*`, `@ark-ui/*`, or any other component primitive library

- Use `lib/utils.ts` `cn()` for class merging and variant maps (plain objects)
- Use `lib/slot.tsx` for the `asChild` render pattern

**`motion/react` is allowed, with constraints:**

- Use the `m` component (not `motion`) — it requires `LazyMotion` to be in scope, cutting the bundle from ~34kb to ~4.6kb initial
- `LazyMotion` with `domMax` is mounted once globally in `app/layout.tsx` via `components/motion-provider.tsx` — do not add it anywhere else. It is `domMax` (not `domAnimation`) because layout animations (`layout` prop, `AnimatePresence mode="popLayout"`) need the layout-projection features
- Only reach for `motion/react` where CSS genuinely cannot do the job: exit animations (`AnimatePresence`), layout/FLIP position animations (`layout`), orchestrated multi-element sequences, or physics/gesture-driven values
- Do not use `m` for things CSS handles fine: fade-ins, slide-ins, hover scale, simple scroll reveals

**Hover effects only on interactive elements:**

- A hover effect is an affordance — it signals "you can interact with this." Only add hover states (scale, color shift, underline, elevation, etc.) to elements that are actually clickable: links, buttons, and other controls.
- Never put hover effects on static content. If a card, image, or tile is not a link/button, it gets no `hover:` / `group-hover:` styling. A hover response on a non-clickable item reads as a broken or misleading affordance.
- If you want a card to feel interactive, make the whole card a link first, then add the hover effect — don't add the effect to something inert.
<!-- END:component-rules -->

<!-- BEGIN:color-rules -->

# Color tokens

Colors are **semantic tokens** defined in `app/globals.css` (`@theme`). The suffix tells you what a token is _for_ — respect it, don't pick tokens by hue:

- **`ink` = text / foreground** (as in the ink you write with): `text-ink` (primary), `text-ink-dim` (muted), `text-ink-flip` (text on a dark/inverted surface).
- **`fill` = backgrounds / surfaces**: `bg-fill` (base), `bg-fill-raised` (raised), `bg-fill-dark` (dark surface).
- **`border` = borders**: `border-border`.
- **`brand`** is a fillable brand surface (`bg-brand`) whose on-brand text is **`brand-ink`** (`text-brand-ink`); **`brand-fill`** is the dark brand surface. The `accent-*` (blue) and `spot-*` (yellow) palettes mirror the same `fill` / `ink` structure.

**Never use an `ink` token as a background, or a `fill` token as text.** `ink` is text, `fill` is background. Pair them: `bg-fill text-ink`, `bg-brand text-brand-ink`, `bg-brand-fill text-ink-flip`. Prefer the `Section` component (`components/layout/section.tsx`) — its theme classes already pair background + text correctly.

**Buttons theme themselves.** In a themed section, pass the section's theme to `<Button sectionTheme={section_theme}>` (and to `SectionIntro`, which forwards it) — never hand-roll a per-theme button class map inside a slice. All per-theme button styling (background, hover, text, focus outline, selection) for every variant lives in the `themeClasses` block in `components/button.tsx`; retune the theme there, in one place.

<!-- END:color-rules -->

<!-- BEGIN:naming-rules -->

# Naming Conventions

## CMS (Prismic model labels)

- Field labels use **Title Case**: `First Name`, `Section Theme`, `Remove Top Padding`
- **Select option values are English too**, like labels — `Available`, `Sold Out`, `Private Import`, never `Tillgänglig`, `Slutsåld`, `Privatimport`. The only exception is established proper nouns with no English form: brand names (`Systembolaget`) and French champagne/region terms (`Côte des Blancs`, `Brut Nature`, `Grand Cru`, `Blanc de Blancs`). This applies to CMS choices only — visitor-facing UI copy the slice renders stays in the site language (Swedish).
- Boolean placeholder text describes the state, not the action: `placeholder_false: "Text is Left-Aligned"`, `placeholder_true: "Text is Centered"`
- Group field labels are nouns, not instructions: `Buttons`, not `Add Buttons`
- Slice names in Slice Machine use **PascalCase**: `HeroBackdrop`, `FAQList`, `StatsSplit`
- Slice API IDs (used in `slice_type`) are **snake_case**: `hero_backdrop`, `faqlist`, `stats_split`

## Components & files

- React component files use **kebab-case**: `hero-backdrop.tsx`, `section-intro.tsx`
- Component exports use **PascalCase**: `export function HeroBackdrop`, `export function SectionIntro`
- Slice folders use **PascalCase** matching the Slice Machine name: `slices/HeroBackdrop/`, `slices/FAQList/`

## Slices registry

- Every new slice must be registered in `slices/index.ts` using its `slice_type` as the key
- Keys are always **snake_case** matching the Prismic API ID exactly: `faqlist`, `hero_backdrop`

## Mocks & placeholder content

- Mock data must use **English**, generic, template-appropriate copy — never project-specific or language-specific remnants
- Placeholder text in model fields describes what goes in the field: `"How do I get started?"`, not lorem ipsum or leftover client copy

## Middlware & Proxy
- There is no middleware file in next16
- Do not use Middleware
- The correct file is Proxy.ts, it has replaced Middleware entierly

# Prismic content migrations

Scripts live in `scripts/prismic-migration/` (Migration API, auth via `PRISMIC_WRITE_TOKEN` in `.env.local`). All migrated documents are tagged `ai-import` and their IDs recorded in `manifest.json` so `cleanup.mjs` can delete them later.

**Testing migrations (current mode):** every product field must be filled so search and filters can be exercised — when the source has no value, fill in plausible, type-appropriate data (a reasonable price, an article number, an alcohol %, an availability, etc.). The deterministic filler is `fillTestDefaults()` in `scripts/prismic-migration/lib.mjs`; both `migrate.mjs` and `repair.mjs` apply it.

**Real migrations:** never invent data. Remove the `fillTestDefaults()` call and leave fields the source doesn't provide empty.

Migration API gotchas learned the hard way:
- The client creates documents as **empty shells** first and writes data in a second pass — if the run crashes mid-way, run `repair.mjs` (documents must be published first; IDs are unreachable in an unpublished Migration Release).
- Documents whose fields hold **Unsplash-integration images** cannot be updated via the API ("Assets not found") — edit those in the Prismic UI.
- Reference existing media library assets with a full raw image payload (`{ id, url, dimensions, edit, alt, copyright }`) — `migration.createAsset()` would re-download and duplicate them.
- When the asset's aspect ratio differs from the image field's constraint, `edit: {x:0, y:0, zoom:1}` anchors the constraint crop **top-left** (subject drifts off-center in the served URL; CSS can't fix it). Compute a center-cover `edit` instead — see `imageField()` in `scripts/prismic-migration/lib.mjs`.
- Deleting a media library asset does not purge the CDN file — documents keep serving old URLs until re-pointed at new asset IDs (a document migration, not a library operation).
<!-- END:naming-rules -->
