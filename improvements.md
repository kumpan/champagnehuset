# Improvements

Findings from an audit against the `crmk` and `sliceship` siblings. Each entry:
what's wrong, why it matters, and the recommended fix.

> **Status:** a worklist, not a changelog. #1–#4 are fixed in the `crmk` sibling
> (commit `ca96352` for #1, #3, #4); #5 is open in `sliceship` too and tracked in
> its `improvements.md`; #9 is fixed in `crmk`.
>
> **#7 and #8 run the other way.** Both are already applied *here*, and the port
> direction is champagnehuset → `sliceship`/`crmk`, not the reverse. #8's
> `hasPaginatedListing()` guard is missing in `crmk`.
>
> **Already fixed here, don't re-port:** the Open Graph / Twitter
> wholesale-replacement trap (`lib/metadata.ts` re-declares `og:type`, `og:url`,
> `og:locale` and falls back to `DEFAULT_OG_IMAGE`) and the breadcrumb parent
> lookup passing `lang: doc.lang`. Both are still open in `sliceship`.

---

## 1. Language switcher 404s on exactly the pages that *are* translated

**Where:** `components/navbar/language-switcher.tsx`, `lib/available-locales.ts`,
`components/available-locales-setter.tsx`, both page routes

**The mechanism**

`navigateTo()` builds the target URL by swapping the locale prefix and keeping
the rest of the path:

```ts
const withoutLocale = pathname.replace(new RegExp(`^/${currentLocale}(?=/|$)`), "") || "/";
const targetPath = targetId === masterLocale ? withoutLocale : `/${targetId}${withoutLocale}`;
router.push(isLocaleAvailable(targetId) ? targetPath : home);
```

**UIDs are per-locale in Prismic.** `app/[lang]/[...uid]/page.tsx` says so in its
own comment — `/en-gb/about` and `/om-oss` are the same document. So the Swedish
`/om-oss` plus `en-gb` produces `/en-gb/om-oss`, which no document has, and the
route's canonical check calls `notFound()`.

The result is inverted: `isLocaleAvailable("en-gb")` returns **true** precisely
when a translation exists, which is when it sends the user to the fabricated
path and a 404. When the translation *doesn't* exist it correctly falls back to
home. The switcher only works today for pages whose UID happens to be identical
in every locale.

On a site with `product` and `producer` documents this is the common case, not
an edge case — product UIDs are the most likely to differ per locale.

**Second problem: the availability store is the wrong shape**

`lib/available-locales.ts` is a module-level `Set` mutated from a `useEffect` in
`AvailableLocalesSetter`. That design can only answer *"does a translation
exist?"* — a boolean — when the question the switcher needs answered is *"what
is its path?"*. Knowing the translation exists is useless if you then guess the
URL.

It also carries the usual module-global hazards: nothing resets it, so
`app/[lang]/not-found.tsx` (which doesn't render the setter) leaves the previous
page's locale set in place, and the value is invisible during SSR.

**Recommended fix** (port `crmk/lib/locale-paths.ts`)

Resolve the real paths on the server and pass them down as a prop:

```ts
// lib/locale-paths.ts
export async function resolveLocalePaths(doc: PrismicDocument, client: Client): Promise<Record<string, string>> {
  const paths: Record<string, string> = {};
  if (doc.url) paths[doc.lang] = doc.url;

  await Promise.all(
    doc.alternate_languages.map(async (alt) => {
      try {
        const altDoc = await client.getByID(alt.id, { lang: alt.lang });
        if (altDoc.url) paths[alt.lang] = altDoc.url;
      } catch {}
    }),
  );

  return paths;
}
```

`doc.url` is already correct for this routing — prefix-free for the master
locale, `/:lang/...` otherwise (see `buildRoutes` in `prismicio.ts`) — so no
string surgery is needed on the result.

Then in the switcher:

```tsx
<Link href={localePaths[locale.id] ?? homeFor(locale.id)}>…</Link>
```

Three follow-on wins:

- **Delete `lib/available-locales.ts` and `components/available-locales-setter.tsx`**,
  and drop the `AvailableLocalesSetter` render + `availableLocales` computation
  from `app/[lang]/page.tsx` and `app/[lang]/[...uid]/page.tsx`.
- **Use `<Link href>` instead of `router.push`.** The options are `<button>`s
  today, so translated pages have no crawlable link from the navigation and no
  prefetch on hover.
- The navbar lives in `app/[lang]/layout.tsx`, which doesn't know which document
  the page fetched. `crmk` solves this with a companion
  `getLocalePathsForPath(pathname, lang)` that re-resolves from the request path
  and relies on request-level fetch dedupe — pair it with the `x-pathname`
  header from #2.

**Note:** the fallback is deliberately *that locale's home page*, not a 404 —
silently, with no visual difference between a real translation and a bounce to
the root. `localePaths` carries what you'd need to dim or badge the option if
that should be signalled.

**Verify** by opening a translated product page in the non-master locale and
switching back and forth. Every hop should land on the translated document.

---

## 2. `x-locale` is set on the response, so nothing can read it

**Where:** `proxy.ts`, `app/[lang]/not-found.tsx`

**What's wrong**

Both proxy branches attach the locale to the *outgoing response*:

```ts
const response = NextResponse.next();
response.headers.set("x-locale", matched?.id ?? master);
```

`headers()` in a server component reads the **incoming request** headers. A
header set on the response is never visible there. The only way to inject a
request header from the proxy is the `request` option:

```ts
NextResponse.next({ request: { headers: requestHeaders } })
```

So `app/[lang]/not-found.tsx:14`:

```ts
return h.get("x-locale") ?? (await getMasterLocale());
```

**always takes the fallback.** Every 404 renders in the master locale, including
404s under `/en-gb/...`, and the `four_oh_four` singleton is fetched in the
wrong language.

**Fix**

Build a mutable header bag once, up top, and pass it through every branch:

```ts
const requestHeaders = new Headers(request.headers);
requestHeaders.set("x-locale", locale);
requestHeaders.set("x-pathname", pathname); // needed by the switcher fix in #1

const response = NextResponse.next({ request: { headers: requestHeaders } });
response.headers.set("x-locale", locale); // keep for debugging / CDN vary
```

The rewrite branch takes the same option:
`NextResponse.rewrite(url, { request: { headers: requestHeaders } })`.

Note the early-return branch (`/api/`, `/_next/`, `/slice-simulator`, dotted
paths) returns before any header is set. `crmk` moved the header construction
above that guard so the root layout can read `x-pathname` on `/slice-simulator`.

**Verify** by requesting a nonexistent path under a non-master locale
(`/en-gb/nope`) and confirming the 404 page renders English copy.

---

## 3. The entire site chrome renders in the master locale on translated pages

**Where:** `app/[lang]/layout.tsx:47-51`

**What's wrong**

Five singletons are fetched with no `lang`:

```ts
getSingleton<Content.NavbarDocument>("navbar"),
getSingleton<Content.CookieBannerDocument>("cookie_banner"),
getSingleton<Content.AgeGateDocument>("age_gate"),
getSingleton<Content.NewsletterDocument>("newsletter"),
getSingleton<Content.FooterDocument>("footer"),
```

`getSingleton` forwards straight to `client.getSingle(...)`, and Prismic's
`getSingle` **without a `lang` returns the master-locale variant**. The layout
already has `lang` from `params` — it just isn't passed.

So on `/en-gb/anything`: navigation labels, CTA text, footer links and address,
cookie banner copy, age-gate copy and its confirm/decline buttons, and the
newsletter modal all render in Swedish, wrapped in `<html lang="en-gb">`.

The rest of the codebase already knows the right pattern —
`app/[lang]/not-found.tsx:18` passes `{ lang }`, and
`slices/Text/variations/text-info.tsx:40` passes `ctx.lang` — which is what
makes this look like an oversight rather than a decision.

**Fix**

```ts
getSingleton<Content.NavbarDocument>("navbar", { lang }),
getSingleton<Content.CookieBannerDocument>("cookie_banner", { lang }),
getSingleton<Content.AgeGateDocument>("age_gate", { lang }),
getSingleton<Content.NewsletterDocument>("newsletter", { lang }),
getSingleton<Content.FooterDocument>("footer", { lang }),
```

`getSingleton` returns `null` on a throw, so a singleton with no variant in that
locale degrades to the existing `{navbarData && …}` / `{ageGate && …}` guards
rather than erroring. **Check that in Prismic before shipping** — if the
translations don't exist yet, passing `lang` will make the chrome *disappear* on
translated pages rather than fall back. If that's a real risk, fall back
explicitly:

```ts
const navbarData =
  (await getSingleton<Content.NavbarDocument>("navbar", { lang })) ??
  (await getSingleton<Content.NavbarDocument>("navbar"));
```

`app/api/product-pdf/route.ts:36` has the same issue in reverse — it passes
`lang ? { lang } : undefined`, so a PDF requested without an explicit `?lang=`
gets master-locale footer contact lines. The product page should always pass
`lang` when building the download link.

**Verify** by loading a non-master-locale page and reading the footer.

---

## 4. `AnimatedNumber` ships `0` to crawlers and mangles comma decimals

**Where:** `components/animated-number.tsx`

Four separate defects, all fixed in `crmk` commit `ca96352`.

**a) The server HTML contains `0`, not the number**

```ts
const [display, setDisplay] = useState<string>(formatWithSpaces(0, resolvedDecimals));
```

State is seeded with zero, so SSR emits `0` and only JS ever replaces it — and
only once the element scrolls into view. There's no `sr-only` copy of the
author's string either, so **crawlers, screen readers before the animation, and
no-JS visitors all see a literal `0`.**

Seed with the target instead:

```ts
const [display, setDisplay] = useState<string>(() => formatWithSpaces(target, resolvedDecimals, separator));
```

**b) …which then requires a mount guard**

Seeding with the target means a counter already on screen at load would snap
`target → 0` and count back up. Gate the animation on where the element actually
was at mount:

```ts
const visibleAtMount = useRef(false);
useIsomorphicLayoutEffect(() => {
  const rect = ref.current?.getBoundingClientRect();
  visibleAtMount.current = Boolean(rect && rect.top < window.innerHeight && rect.bottom > 0);
}, []);

useEffect(() => {
  if (!isInView || !hasNumber || visibleAtMount.current) return;
  // …animate
}, [...]);
```

`crmk` also widened the trigger to `margin: "0px 0px 120px 0px"` so the reset
happens just off-screen rather than as the number becomes visible.

**c) Comma decimals are parsed as integers**

```ts
const cleaned = numberStr.replace(/,/g, ""); // "12,5" -> "125"
```

This is a Swedish-first site: `12,5 %` renders as **125**. Normalise instead of
stripping, and keep the author's separator in the output:

```ts
const decimalSeparator = numberStr.includes(",") ? "," : ".";
const cleaned = numberStr.replace(",", ".");
```

…then thread `decimalSeparator` through `formatWithSpaces`.

**d) Non-numeric strings render a stray `0`**

`splitTextIntoParts` returns `numberStr: ""` when there's no digit, `parseNumber`
turns that into `value: 0`, and the component renders the author's text followed
by `0`. Bail out early:

```ts
const hasNumber = numberStr !== "";
if (!hasNumber) return <div ref={ref} className={classes}>{text}</div>;
```

**Also worth taking from the `crmk` version:** the `motion.span` wrapping
`display` animates nothing — it's a plain `<span>` there, one less motion node
per counter.

**Verify** with `curl` + grep on a page using the component: the HTML should
contain the real figure, not `0`. Then check a `12,5`-style value renders as
`12,5`.

---

## 5. FAQ answers are absent from the HTML while `FaqSchema` swears they're there

**Where:** `slices/FAQ/Accordion.tsx`, `components/structured-data/faq-schema.tsx`

**What's wrong**

The panel is conditionally mounted:

```tsx
<AnimatePresence initial={false}>
  {isActive && <m.div …>{/* answer */}</m.div>}
</AnimatePresence>
```

Collapsed accordions render **nothing** — the answer text is not in the server
HTML and not in the DOM until a click. Meanwhile `FaqSchema` emits every
question and answer from the same slice as `FAQPage` JSON-LD, on both
`app/[lang]/page.tsx` and `app/[lang]/[...uid]/page.tsx`.

Google's structured-data policy requires the marked-up content to be present on
the page — hidden behind an accordion is fine, absent is not. This is a
rich-result eligibility risk, and independently it means the FAQ copy is
invisible to crawlers.

**Fix** (mirror `crmk/slices/FAQ/Accordion.tsx`)

Keep the panel mounted and animate `height` between `0` and `auto`, marking it
`inert` when collapsed so it stays out of the tab order and the a11y tree:

```tsx
<m.div
  id={panelId}
  inert={!isActive}
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
  transition={{ duration: 0.5, ease: [0.5, 0, 0.1, 1] }}
  className="overflow-hidden"
>
```

Drop the `AnimatePresence` wrapper entirely — nothing unmounts anymore.

Carry over with it: **`aria-expanded={isActive}` and `aria-controls={panelId}`
on the button**, with a matching `id` on the panel. The current markup has
neither, so the accordion state is not announced at all.

(The outer wrapper here is a plain bottom border rather than a rounded filled
card, so unlike `crmk` no `overflow-hidden` is needed on it.)

**Verify** with `curl <page> | grep` for a phrase from a collapsed answer.

---

## 6. The age gate does not contain keyboard focus

**Where:** `components/age-gate.tsx`

**What's wrong**

The gate declares `role="dialog"` and `aria-modal="true"`, locks body scroll,
and makes its backdrop deliberately non-dismissible — but there is **no focus
management at all**: no initial focus, no focus trap, no restore on close, and
no `aria-labelledby` pointing at the title.

`aria-modal="true"` tells assistive tech that everything outside the dialog is
inert. Nothing enforces that here, so a keyboard user can `Tab` straight out of
the gate into the navigation and page behind it, and a screen-reader user can
browse the whole document. Scroll-locking `documentElement` hides the content
visually but leaves it fully reachable.

For a decorative modal that's a minor a11y bug. For an age gate — the one
component whose entire job is to block access until answered — it defeats the
purpose, and the `aria-modal` attribute is actively lying about it.

**Fix**

Move the gate to the native `<dialog>` element with `showModal()`, which gives
focus containment, the top layer, and inert background for free — and keeps the
non-dismissible behaviour if you `preventDefault()` the `cancel` event. If the
`motion` enter/exit animation has to stay, the manual equivalent is: focus the
confirm button on open, wrap-around `Tab`/`Shift+Tab` on the first and last
focusable elements, and add `aria-labelledby` referencing the title.

`components/newsletter-modal.tsx` has the same gap, though it's less serious
there — it has an Escape handler, labelled close buttons, and is dismissible.

**Verify** by opening the gate and pressing `Tab` repeatedly — focus should
never leave the dialog.

---

## 7. Icon pickers show editors raw code identifiers (fixed here, open in `sliceship`)

**Where:** `components/icons.tsx`, every icon `Select` in `slices/*/model.json` and
`customtypes/*/index.json`, `scripts/create-slice.js`, `scripts/create-slice-group.js`

**The mechanism**

Three separate problems that all come from treating the `iconMap` key as the CMS value.

*Editors read source identifiers.* The option list is the key itself, so a
marketer choosing an icon picks from `arrowUpRight`, `thermometerSnowflake`,
`bookOpenCheck`. Every other `Select` in both repos is already Title Case
(`Top Left`, `Brut Nature`, `Sold Out`, `301 - Permanent`), so the icon lists are
the sole exception and violate the naming rule in `AGENTS.md`.

*The lookup is copy-pasted.* `isIconName` is redeclared in **6 files** in
`sliceship` (`info-block`, `section-intro`, `info-items`, `Callout/callout-form`,
`Employee/employee-list`, `Employee/employee-marquee`), each paired with its own
`&& icon !== "none"` guard.

*Options drift from the registry.* `sliceship` offers **`gjensidigePlaster`** —
a leftover from an unrelated client — in its live models. It is not in `iconMap`,
so an editor can pick it and get no icon. `scripts/create-slice*.js` stamp their
own icon list into every new slice, which is how the drift spreads.

The scale in `sliceship` today: **62 icon Selects, 1734 camelCase options, 74
icons in `iconMap`**, and 5 content-icon fields (`Callout/form`, `Hero/split`,
`Value/cards|split|grid`) that receive a bulk dump rather than a curated list.

**Recommended fix**

One `resolveIcon()` in `components/icons.tsx` — strip spaces, lower-case the
first character, look up `iconMap` — replaces all six guards and every
`!== "none"` check with a single import. Working implementation and the content
migration are in this repo (`components/icons.tsx`, `scripts/prismic-migration/`).

Two non-obvious properties, verified here over all 99 icons: the
camelCase ⇄ Title Case round-trip is **lossless**, so no exception table is
needed; and the resolver is **back-compatible by construction**, because
stripping spaces is a no-op on an already-camelCase value. The second is a
property of the maths, not a fallback branch — making the match strict would
break unmigrated documents for nothing.

Decide the "no icon" sentinel (`none` / `None` / omit it entirely) before
migrating, not after: changing it later is a bigger content migration than the
rename itself. Prismic's Migration API also has failure modes worth reading
`AGENTS.md` for first — they are already handled in the scripts here.

**Verify** every model option resolves against `iconMap`, and that no stored
value fails to resolve.

---

## 8. ~~Article pagination is invisible to crawlers~~ — **fixed here** (`57574f0`), port to `sliceship`

Was: pagination lived in `useState`, every control was a `<button onClick>`, so
page 2+ had no URL and no `href`. Every article past page 1 sat in `sitemap.xml`
with zero internal inlinks — the *orphan page* finding that opened an Ahrefs
ticket on `crmk`.

Fixed by `57574f0`: `lib/pagination.ts` (`parsePageParam`, `hasPaginatedListing`),
URL-driven `buildHref` in `article-grid.tsx`, `next/link` + `rel="prev"/"next"`
in `pagination.tsx`, and a self-referencing canonical + ` – Sida N` title in
`lib/metadata.ts`.

**This repo's version was the better one and has now been ported back.**
`hasPaginatedListing()` gates the paginated metadata on the document actually
rendering a listing slice. `crmk` originally skipped it, so `crmk.se/om-oss?page=2`
returned a "– Sida 2" title and a self-canonical for a page with no pagination at
all. Ported to `crmk/lib/pagination.ts` on 2026-08-17, adapted: `crmk` has no
`show_pagination` field, so the guard reads `limit` (a fixed `3`/`6`/`9` renders
an unpaginated grid) and excludes the newsdesk variation, which paginates on
`?news=N`. `sliceship` should take this version, not `crmk`'s original.

---

## 9. Locale word maps stop at Swedish, so a second locale silently ships Swedish UI

**Where:** `lib/metadata.ts:12` (`PAGE_WORD`), `slices/Article/article-card.tsx:11`,
`slices/Article/variations/article-feature.tsx:79`, `components/newsletter-modal.tsx:53,95`

**What's wrong**

The site is Swedish-only *today*, and the code encodes that as a hard assumption
rather than a default. Four separate spots:

```ts
const PAGE_WORD: Record<string, string> = { "sv-se": "Sida" };          // metadata.ts:12
new Intl.DateTimeFormat("sv-SE", { … })                                  // article-card.tsx:11
{link_label || "Läs mer"}                                                // article-feature.tsx:79
aria-label="Stäng"                                                       // newsletter-modal.tsx:53, 95
```

Only the first is a map at all. The date formatter is a hard-coded locale string,
and the last two are literals with no lookup. Add `en-gb` in Prismic and the
English article listing renders English CMS copy around a Swedish "Läs mer"
button, Swedish month abbreviations, a Swedish `aria-label`, and — because
`PAGE_WORD["en-gb"]` misses — an English `"Page 2"` suffix. Half-translated is a
worse failure than untranslated: nothing errors, so nobody notices.

`lib/locale-labels.ts` already does this right (80+ locales, `?? fallbackName`),
which is the pattern to copy.

**Fix** (mirror `crmk`, commit pending)

One key set across every word map, keyed by **full locale tag** — that matches
Prismic's locale IDs, and `en-gb`/`en-eu`/`en-us` are genuinely separate CMS
locales, so keep them as separate entries even when the value repeats. Don't
factor the shared English object into a const and alias it three times; the
repetition is the point, each line stays independently editable:

```ts
const PAGE_WORD: Record<string, string> = {
  "sv-se": "Sida",
  "en-gb": "Page",
  "en-eu": "Page",
  "en-us": "Page",
  "fr-fr": "Page",
  "de-de": "Seite",
  // …da-dk, nb-no, nn-no, fi-fi, nl-nl, it-it, es-es, pt-pt, pl-pl
};
```

Look up with `map[lang?.toLowerCase() ?? FALLBACK] ?? FALLBACK_VALUE`. Then give
`article-card.tsx` a `localeMap` (`"sv-se" → "sv-SE"`) instead of the literal —
region matters for dates, `en-GB` and `en-US` order differently — and route
`"Läs mer"` and `"Stäng"` through maps of their own.

`crmk` carries the reference set of 15 locales across six files (`lib/metadata.ts`,
`lib/video-embed.ts`, `lib/format-date.ts`, `slices/Article/i18n.ts`,
`slices/Article/variations/article-feature.tsx`, `slices/Text/toc-accordion.tsx`).
Translations there are not native-reviewed — check Finnish/Polish before a
locale goes live.

**Verify** by adding a throwaway `en-gb` document in Prismic and reading the
listing: no Swedish should survive. Cheaper CI check — assert every word map in
the repo has an identical key set.

---

## Smaller notes

- **No hreflang or canonical in page `<head>`.** `app/sitemap.ts` builds
  `alternates.languages` correctly, but `lib/metadata.ts` sets no `alternates`
  at all. `crmk/lib/hreflang.ts` is the reference implementation and shares
  `resolveLocalePaths` with the switcher, so porting #1 makes this nearly free.
- **`getRepository()` runs on every proxied request.** `proxy.ts` awaits
  `getLocales()` + `getMasterLocale()` before it can route anything, and
  `createBaseClient` is only `force-cache`d in production. Worth confirming the
  cache holds under load; the locale list changes about once a year.
- **`revalidateTag("prismic", "max")` is stale-first by design.** Correct for
  Next 16, but `"max"` means the next visitor after a publish is served the
  *old* page while the new one is fetched in the background. If editors expect
  to hit refresh and see their change, `updateTag` is the immediate-consistency
  option. Worth a deliberate decision rather than a default.
- **`/api/newsletter/subscribe` has a honeypot but no rate limit.** The
  honeypot stops naive bots; anything targeted can still drive unlimited
  Mailchimp writes from one IP. A per-IP limit on the route is cheap insurance.
