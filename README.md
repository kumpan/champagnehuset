# Champagnehuset

Next.js + Prismic site for [Champagnehuset](https://champagnehuset.se) — *små odlare, stora champagner.* Built on the Kumpan Next.js + Prismic starter template.

## Built With

- **[Next.js 16](https://nextjs.org/)** — React framework with App Router
- **[Prismic](https://prismic.io/)** — Headless CMS with Slice Machine
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Utility-first CSS
- **[Biome](https://biomejs.dev/)** — Formatter + linter (replaces Prettier & ESLint)
- **[Lucide Icons](https://lucide.dev/)** — Icon library
- **[pnpm](https://pnpm.io/)** — Fast package manager
- **[Husky](https://typicode.github.io/husky/)** — Git hooks for code quality

## Naming Conventions

Every slice name must be exactly **two words** in PascalCase: `[Prefix][Suffix]`.

**Rule #1 — Two words always**

- ✅ `HeroSplit`
- ❌ `Hero` (too short)
- ❌ `HeroHomeSection` (too long)

**Rule #2 — Section type as prefix**

The first word describes the type or category of the section. All similar sections share the same first word.

- Hero sections → `HeroShowcase`, `HeroSplit`
- Stats/numbers → `StatsSplit`, `StatsHighlight`
- Articles → `ArticleGrid`, `ArticleLatest`, `ArticleFeatured`

```bash
pnpm create-slice HeroSplit
```

## Variations vs. Separate Slices

When a section type has multiple layout options that share the same purpose, group them as **variations of one slice** rather than separate slices.

Prismic lets each variation define its own field set, so layouts can differ structurally while still appearing as a single entry in the insert menu. Editors pick the layout they want from a variation dropdown — instead of hunting through a list of loosely named slices that all do the same thing.

**Use variations when layouts share purpose but differ visually:**

```
Hero (slice)
├── backdrop  — full-bleed image/video with overlaid text
├── split     — text on one side, media on the other
└── stack     — centered text above a media block
```

**Create a separate slice when the purpose is meaningfully different:**

```
Hero       — page-opening hero section
CalloutSplit — mid-page promotional callout
```

In code, a single `index.tsx` file holds all the layout components and a dispatcher that `switch`es on `slice.variation`:

```tsx
export default function Hero({ slice }: HeroProps) {
  switch (slice.variation) {
    case "backdrop": return <HeroBackdrop slice={slice} />;
    case "split":    return <HeroSplit slice={slice} />;
    case "stack":    return <HeroStack slice={slice} />;
  }
}
```

## Color Tokens

Semantic colors use a theme-first **ink / fill** vocabulary. `fill` = background surface, `ink` = foreground text. Theme comes first, so autocomplete groups all accent tokens together.

| Token | Usage |
| --- | --- |
| `fill` / `fill-raised` / `fill-dark` | Page and section backgrounds |
| `ink` / `ink-dim` / `ink-flip` | Body text, muted text, text on dark |
| `accent-fill` / `accent-fill-raised` | Accent theme backgrounds |
| `accent-ink` / `accent-ink-dim` / `accent-ink-flip` | Accent theme text |
| `brand-fill` / `brand-ink` | Brand color backgrounds and text |
| `error-fill` / `error-ink` | Error state backgrounds and text |

## Section Themes

Every section takes a `Section Theme` from a Prismic dropdown. Theme names are drawn from the brand guidelines and the vineyard — concrete nouns rather than color words, so the palette stays recognizable even as the underlying hex values shift.

| Theme | Tone |
| --- | --- |
| `Bud` | Lightest green — near-white, barely tinted |
| `Leaf` | Light green — a visible step deeper than Bud |
| `Brand` | Colorful green — the saturated brand green |
| `Dust` | Light yellows — warm and pale |
| `Slate` | Dark browns — deep, grounding |

`Dust` comes straight from the brand guidelines, where it stands for the origin behind the product — knowledge, craft, and time. The greens follow the vine's own growth calendar, so the names carry their own order: a bud is paler than a leaf. Editors picking from the dropdown know which is lighter without needing a preview.

## Border Radius

The border radius scale mirrors the spacing scale exactly — 1 unit = 4px expressed in rem:

| Class          | Value     | px   |
| -------------- | --------- | ---- |
| `rounded-1`    | `0.25rem` | 4px  |
| `rounded-2`    | `0.5rem`  | 8px  |
| `rounded-4`    | `1rem`    | 16px |
| `rounded-6`    | `1.5rem`  | 24px |
| `rounded-8`    | `2rem`    | 32px |
| `rounded-full` | `9999px`  | pill |

This means the same number means the same size everywhere — `gap-4`, `h-4`, `w-4`, and `rounded-4` are all 1rem. No more guessing whether `rounded-lg` is 6px or 8px.

## CLI Commands

```bash
pnpm dev                  # Start dev server + Slice Machine
pnpm build                # Production build
pnpm start                # Run production server
pnpm create-slice         # Scaffold a new slice
pnpm create-slice-group   # scaffolds a grouped slice with variations
pnpm sync-slice           # Syncs slices added from other project
pnpm format               # Format all files
pnpm format:check         # Check formatting without writing
pnpm format:all           # Format + fix linting issues (unsafe)
pnpm check                # Lint check
```

## Prismic Commands

**Slice Machine** — open the Slice Machine UI in the browser:

```bash
npx start-slicemachine
```

Already included in `pnpm dev`, but useful to run standalone when you don't need the Next.js dev server.


## Slice Scripts

**`pnpm create-slice <Name>`** — scaffolds a single slice with one default variation.
```bash
pnpm create-slice CalloutSplit
```

**`pnpm create-slice-group <Name> <variation1> <variation2> ...`** — scaffolds a grouped slice with a `variations/` subfolder and one file per variation. If the slice already exists, it adds only the new variations and skips any that are already there.
```bash
pnpm create-slice-group Text extended highlight split longform
```

**`pnpm sync-slices`** — scans `slices/` and registers any missing entries in `slices/index.ts`. Useful when copying slices from another project without running the create script.