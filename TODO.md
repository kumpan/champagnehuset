# Theme Refactor TODO

Refactor all slice variations that repeatedly use `section_theme || "Ocean"` (or `"Sunrise"`) inline to instead declare a single `const theme` at the top of the component and reference `theme` everywhere.

## Pattern

**Before:**

```tsx
const { section_theme, ... } = slice.primary;

return (
  <Section sectionTheme={section_theme || "Ocean"}>
    <SectionIntro
      overlineClassName={overlineThemeClasses[section_theme || "Ocean"]}
      sectionTheme={section_theme || "Ocean"}
    />
    <div className={cn(cardClasses[section_theme || "Ocean"])} />
  </Section>
);
```

**After:**

```tsx
const { section_theme, ... } = slice.primary;
const theme = section_theme || "Ocean";

return (
  <Section sectionTheme={theme}>
    <SectionIntro
      overlineClassName={overlineThemeClasses[theme]}
      sectionTheme={theme}
    />
    <div className={cn(cardClasses[theme])} />
  </Section>
);
```

For slices with 4 theme values that alias down to 2 (`Brand` → `Ocean`, `Accent` → `Sunrise`), keep a `themeAlias` map and do:

```tsx
const theme = themeAlias[section_theme || "Ocean"];
```

## Files to update

Count is number of `section_theme || "..."` occurrences to replace.

- [ ] `slices/Process/variations/process-image.tsx` (9)
- [ ] `slices/Hero/variations/hero-split.tsx` (7)
- [ ] `slices/Process/variations/process-linear.tsx` (7)
- [ ] `slices/Process/variations/process-time.tsx` (7)
- [ ] `slices/FAQList/index.tsx` (6)
- [ ] `slices/Value/variations/value-cards.tsx` (6)
- [ ] `slices/Value/variations/value-split.tsx` (6)
- [ ] `slices/Value/variations/value-text.tsx` (6)
- [ ] `slices/CalloutSplit/index.tsx` (5)
- [ ] `slices/Text/variations/text-split.tsx` (5)
- [ ] `slices/Value/variations/value-grid.tsx` (5)
- [ ] `slices/Hero/variations/hero-backdrop.tsx` (4)
- [ ] `slices/Hero/variations/hero-stack.tsx` (4)
- [ ] `slices/Text/variations/text-extended.tsx` (4)
- [ ] `slices/Text/variations/text-highlight.tsx` (3)
- [ ] `slices/Text/variations/text-media.tsx` (3)
- [ ] `slices/StatsSplit/variations/stats-backdrop.tsx` (2)
- [ ] `slices/StatsSplit/variations/stats-split.tsx` (2)
- [ ] `slices/ImageStrip/index.tsx` (1)
- [ ] `slices/Text/variations/text-form.tsx` (1)
- [ ] `slices/Value/variations/value-quote.tsx` (1)

## Already done

- [x] `slices/StatsSplit/variations/stats-grid.tsx`
