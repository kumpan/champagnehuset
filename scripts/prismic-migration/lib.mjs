import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** Every CMS field name that holds an icon Select value. */
export const ICON_FIELDS = new Set(["icon", "detail_icon", "overline_icon", "icon_left", "icon_right"]);

/** `arrowRight` → `Arrow Right`, `flower2` → `Flower 2`. Already-labelled input passes through. */
export function toLabel(key) {
  if (key === "") return key;
  return key
    .replace(/(?<=[a-z])(?=[A-Z])|(?<=[A-Za-z])(?=\d)/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Nearest surviving icon for values the curated lists dropped, so a published page keeps
 * its visual intent instead of silently losing its icon. Anything unlisted falls to "none".
 */
const FALLBACKS = {
  medal: "Award",
  trophy: "Award",
  star: "Award",
  circleStar: "Award",
  gem: "Crown",
  clipboardCheck: "Badge Check",
  fileBadge: "Badge Check",
  fileText: "Badge Check",
  userRoundCheck: "Badge Check",
  snowflake: "Thermometer Snowflake",
  amphora: "Bottle Wine",
  martini: "Bottle Wine",
  glassWater: "Bottle Wine",
  chefHat: "Utensils Crossed",
  apple: "Leaf",
  cherry: "Leaf",
  citrus: "Leaf",
  banana: "Leaf",
  nut: "Leaf",
  fish: "Leaf",
  croissant: "Leaf",
  wheat: "Leaf",
  flower2: "Leaf",
  droplets: "Leaf",
  sprout: "Leaf",
  calendarDays: "Calendar Check",
  phoneOutgoing: "Phone Call",
  user: "User Star",
  users: "User Star",
  userCog: "User Star",
  conciergeBell: "User Star",
  badgeCheck: "Badge Info",
  check: "Badge Info",
};

/**
 * Map a stored icon value onto a field's current option list.
 * Returns { value, note } — note is set whenever the result is not a plain relabel.
 */
export function migrateIcon(stored, allowed) {
  if (typeof stored !== "string" || stored === "") return { value: stored };

  const label = toLabel(stored);
  if (!allowed || allowed.includes(label)) return { value: label };

  const fallback = FALLBACKS[stored];
  if (fallback && allowed.includes(fallback)) {
    return { value: fallback, note: `${stored} → ${fallback} (dropped from list)` };
  }
  // Lists without a "None" sentinel clear to empty rather than to an arbitrary first icon.
  const cleared = allowed.includes("None") ? "None" : "";
  return { value: cleared, note: `${stored} → ${cleared || "(empty)"} (no equivalent)` };
}

// ── Option lists, read from the models on disk so there is one source of truth ─────────────

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

/** Collect every icon option list from a set of models, keyed by field path. */
export function extractIconOptions(sliceModels, customTypeModels) {
  const allowed = {};

  for (const model of sliceModels) {
    for (const variation of model.variations ?? []) {
      walk(variation.primary, null, (fieldName, node) => {
        allowed[`${model.id}.${variation.id}.${fieldName}`] = node.config.options;
      });
    }
  }
  for (const model of customTypeModels) {
    walk(model.json, null, (fieldName, node) => {
      allowed[`${model.id}.${fieldName}`] = node.config.options;
    });
  }

  return allowed;
}

/** Icon option lists from the models on disk. */
export function loadAllowedLists() {
  return extractIconOptions(
    fs.globSync(path.join(ROOT, "slices/*/model.json")).map(readJSON),
    fs.globSync(path.join(ROOT, "customtypes/*/index.json")).map(readJSON),
  );
}

/** Icon option lists from the models actually live in Prismic. */
export async function loadRemoteAllowedLists(repositoryName, writeToken) {
  const headers = { Authorization: `Bearer ${writeToken}`, repository: repositoryName };
  const get = async (endpoint) => {
    const res = await fetch(`https://customtypes.prismic.io/${endpoint}`, { headers });
    if (!res.ok) throw new Error(`Custom Types API ${endpoint} ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return res.json();
  };
  const [slices, customTypes] = await Promise.all([get("slices"), get("customtypes")]);
  return extractIconOptions(slices, customTypes);
}

/**
 * Compare local icon option lists against the ones live in Prismic.
 *
 * Writing a value the remote model does not list fails with a bare "Validation failed", so
 * catch the drift up front rather than after a whole run has been rejected.
 */
export function diffIconOptions(local, remote) {
  const drift = [];
  for (const [field, localOptions] of Object.entries(local)) {
    const remoteOptions = remote[field];
    if (!remoteOptions) {
      drift.push({ field, reason: "field missing from the models in Prismic" });
      continue;
    }
    const missing = localOptions.filter((o) => !remoteOptions.includes(o));
    const extra = remoteOptions.filter((o) => !localOptions.includes(o));
    if (missing.length || extra.length) {
      drift.push({
        field,
        reason: `Prismic is missing [${missing.join(", ")}]${extra.length ? ` and still offers [${extra.join(", ")}]` : ""}`,
      });
    }
  }
  return drift;
}

function walk(node, keyName, onIconSelect) {
  if (Array.isArray(node)) {
    for (const v of node) walk(v, keyName, onIconSelect);
    return;
  }
  if (!node || typeof node !== "object") return;
  if (node.type === "Select" && ICON_FIELDS.has(keyName)) {
    onIconSelect(keyName, node);
    return;
  }
  for (const [k, v] of Object.entries(node)) walk(v, k, onIconSelect);
}

/**
 * Build an image field payload pointing at an existing media library asset.
 *
 * `migration.createAsset()` would re-download and duplicate the asset, so reference it raw.
 * The crop is centred: the largest rect of the target's aspect ratio that fits inside the
 * source, centred on both axes. A naive `{x:0, y:0, zoom:1}` anchors top-left instead, which
 * drifts the subject off-centre in the served URL where no CSS can rescue it.
 *
 * Prismic derives the served rect as:
 *   rectHeight = sourceHeight / zoom
 *   rectWidth  = rectHeight * (targetWidth / targetHeight)
 *   origin     = (edit.x, edit.y)
 */
export function imageField(asset, target, { alt = null, copyright = null } = {}) {
  const sourceRatio = asset.width / asset.height;
  const targetRatio = target.width / target.height;

  const rectHeight = sourceRatio > targetRatio ? asset.height : Math.round(asset.width / targetRatio);
  const rectWidth = Math.round(rectHeight * targetRatio);

  const x = Math.round((asset.width - rectWidth) / 2);
  const y = Math.round((asset.height - rectHeight) / 2);
  const zoom = asset.height / rectHeight;

  const rect = `${x}%2C${y}%2C${rectWidth}%2C${rectHeight}`;
  const base = asset.url.split("?")[0];

  return {
    dimensions: { width: target.width, height: target.height },
    alt,
    copyright,
    url: `${base}?auto=format%2Ccompress&rect=${rect}&w=${target.width}&h=${target.height}`,
    id: asset.id,
    edit: { x, y, zoom, background: "transparent" },
  };
}

/** Media library assets named temp-01…temp-0N, sorted by filename. */
export async function fetchTempAssets(repositoryName, writeToken) {
  const res = await fetch("https://asset-api.prismic.io/assets?limit=100", {
    headers: { Authorization: `Bearer ${writeToken}`, repository: repositoryName },
  });
  if (!res.ok) throw new Error(`Asset API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const { items = [] } = await res.json();
  return items.filter((a) => /^temp-\d+\./i.test(a.filename)).sort((a, b) => a.filename.localeCompare(b.filename));
}

/**
 * Pick an asset from `assets` using a stable hash of `seed`, so a dry run reports exactly
 * what a later --apply will write. Varied across fields, reproducible across runs.
 */
export function pickAsset(assets, seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return assets[hash % assets.length];
}

/**
 * Swap every Unsplash-backed image field for a media library asset, rebuilding the main
 * view and each thumbnail from that field's own declared dimensions. `alt` is dropped: the
 * old value describes the Unsplash photo, so carrying it onto a different image would be
 * worse than leaving it empty.
 */
export function replaceUnsplashImages(data, assets, seed, onReplace) {
  (function walk(node, path) {
    if (Array.isArray(node)) {
      node.forEach((v, i) => {
        walk(v, `${path}[${i}]`);
      });
      return;
    }
    if (!node || typeof node !== "object") return;

    for (const [key, value] of Object.entries(node)) {
      const fieldPath = path ? `${path}.${key}` : key;
      const isUnsplashImage =
        value &&
        typeof value === "object" &&
        typeof value.url === "string" &&
        value.url.includes("images.unsplash.com");

      if (isUnsplashImage && value.dimensions) {
        const asset = pickAsset(assets, `${seed}:${fieldPath}`);
        const replaced = imageField(asset, value.dimensions, { copyright: value.copyright ?? null });
        for (const [viewName, view] of Object.entries(value)) {
          if (view && typeof view === "object" && view.dimensions && typeof view.url === "string") {
            replaced[viewName] = imageField(asset, view.dimensions, { copyright: view.copyright ?? null });
          }
        }
        node[key] = replaced;
        onReplace(fieldPath, asset.filename, value.alt);
        continue;
      }
      walk(value, fieldPath);
    }
  })(data, "");
}

/**
 * The Migration API refuses to update any document holding an Unsplash-integration image
 * ("Assets not found: <photoID>") because those assets never enter the media library.
 * Used as a guard after replacement, so anything still Unsplash-backed is reported rather
 * than sent to an API call that would abort.
 */
export function findUnsplashAsset(data) {
  let found = null;
  (function walk(node) {
    if (found || !node || typeof node !== "object") return;
    if (typeof node.url === "string" && node.url.includes("images.unsplash.com")) {
      found = node.url.split("?")[0];
      return;
    }
    for (const v of Object.values(node)) walk(v);
  })(data);
  return found;
}

// ── callout-contact: `value` + text `link` → a single Link field carrying text ─────────────

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[\d\s\-()./]{6,}$/;

/**
 * Build the replacement Link for one contact item.
 * Only derives a URL it can be certain of — anything else is reported for a human to fill in
 * rather than guessed at.
 */
export function migrateContactItem(item) {
  // Already migrated: `link` is a Link object, not the old free-text field. Leave it alone —
  // re-running must never clobber a link that has already been converted.
  if (item.link && typeof item.link === "object") return { link: item.link, alreadyMigrated: true };

  const text = (item.value ?? "").trim();
  const rawLink = typeof item.link === "string" ? item.link.trim() : "";

  // Already a usable URL: keep it, use the old `value` as the display text.
  if (rawLink && /^(https?:|tel:|mailto:)/i.test(rawLink)) {
    return { link: { link_type: "Web", url: rawLink, text: text || rawLink } };
  }

  // A bare address was typed into the old free-text link field.
  const candidate = rawLink || text;
  if (EMAIL.test(candidate)) {
    return { link: { link_type: "Web", url: `mailto:${candidate}`, text: text || candidate } };
  }
  if (PHONE.test(candidate)) {
    return {
      link: { link_type: "Web", url: `tel:${candidate.replace(/[^\d+]/g, "")}`, text: text || candidate },
    };
  }

  return {
    link: { link_type: "Any" },
    note: candidate
      ? `no URL could be derived for "${candidate}" — add a link by hand (e.g. a maps URL)`
      : "empty contact item",
  };
}
