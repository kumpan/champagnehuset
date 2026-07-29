/**
 * Test-content migration: pushes made-up Journalen articles from articles.json
 * into a Prismic Migration Release (drafts, nothing goes live until published
 * in the Prismic UI). Every created document is tagged `ai-import` and recorded
 * in manifest.json so cleanup.mjs can remove them later.
 *
 * The articles have NO slices, only the page-type fields are filled:
 * title, description, a random date, a random article-0X image, a tag, and a
 * parent link to the Journalen page. Image/date are deterministic per uid so
 * reruns are stable.
 *
 * Incremental: UIDs already PUBLISHED are skipped (publish the previous batch
 * before running again, or duplicate-UID errors will occur).
 *
 * TESTING MODE: all content here is invented. For a REAL migration, source the
 * fields from the real articles and don't synthesise dates/images.
 *
 * Run: node --env-file=.env.local scripts/prismic-migration/migrate-articles.mjs
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import * as prismic from "@prismicio/client";
import {
  ARTICLE_IMAGE_CONSTRAINT,
  ARTICLE_META_CONSTRAINT,
  compact,
  fetchArticleAssets,
  imageField,
  pickArticleImage,
  REPO,
  randomDate,
  TAG,
} from "./lib.mjs";

const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken) {
  console.error(
    "Missing PRISMIC_WRITE_TOKEN — run with: node --env-file=.env.local scripts/prismic-migration/migrate-articles.mjs",
  );
  process.exit(1);
}

const PARENT_PAGE_UID = "journalen";

const { articles } = JSON.parse(readFileSync(new URL("./articles.json", import.meta.url), "utf8"));
const client = prismic.createWriteClient(REPO, { writeToken });

const repository = await client.getRepository();
const lang = repository.languages[0].id;

// Parent page (Journalen) must already be published to link by ID.
const pages = await client.getAllByType("page", { pageSize: 100 });
const parentPage = pages.find((page) => page.uid === PARENT_PAGE_UID);
if (!parentPage) {
  console.error(`Parent page "${PARENT_PAGE_UID}" not found (is it published?) — aborting before any write.`);
  process.exit(1);
}
const parentRef = { link_type: "Document", id: parentPage.id };

// Skip already-published UIDs so the script is safe to re-run.
const publishedArticles = await client.getAllByType("article", { pageSize: 100 });
const publishedUids = new Set(publishedArticles.map((doc) => doc.uid));
console.log(`Parent: ${parentPage.uid} (${parentPage.id}). Published articles: ${publishedArticles.length}`);

const assets = await fetchArticleAssets(writeToken);
console.log(`Article assets: ${assets.map((a) => a.filename).join(", ")}`);

const migration = prismic.createMigration();

let newCount = 0;
for (const article of articles) {
  if (publishedUids.has(article.uid)) continue; // already published
  newCount += 1;
  const asset = pickArticleImage(article.uid, assets);
  migration.createDocument(
    {
      type: "article",
      uid: article.uid,
      lang,
      tags: [TAG],
      data: compact({
        page_title: article.title,
        article_title: article.title,
        article_description: article.description,
        article_image: imageField(asset, article.title, ARTICLE_IMAGE_CONSTRAINT),
        article_date: randomDate(article.uid),
        tag: article.tag,
        parent: parentRef,
        meta_title: `${article.title} – ChampagneHuset`,
        meta_description: article.description.slice(0, 150),
        meta_image: imageField(asset, article.title, ARTICLE_META_CONSTRAINT),
      }),
    },
    `Article: ${article.title} [${article.tag}]`,
  );
}

console.log(`To create: ${newCount} articles`);
if (newCount === 0) {
  console.log("Nothing to do.");
  process.exit(0);
}

await client.migrate(migration, {
  reporter: (event) => {
    if (event.type === "documents:creating") {
      console.log(`  creating ${event.data.current}/${event.data.total}: ${event.data.document?.title ?? ""}`);
    } else if (event.type === "documents:updating") {
      if (event.data.current % 10 === 1) console.log(`  updating ${event.data.current}/${event.data.total}`);
    } else if (event.type.endsWith(":created") || event.type.endsWith(":updated")) {
      console.log(event.type, JSON.stringify(event.data));
    }
  },
});

// Manifest (input for cleanup.mjs), merged across batches
const manifestUrl = new URL("./manifest.json", import.meta.url);
const previous = existsSync(manifestUrl) ? JSON.parse(readFileSync(manifestUrl, "utf8")).documents : [];
const created = migration._documents
  .filter((doc) => doc.document.id)
  .map((doc) => ({ id: doc.document.id, type: doc.document.type, uid: doc.document.uid }));
const documents = [...previous, ...created.filter((doc) => !previous.some((p) => p.id === doc.id))];

writeFileSync(
  manifestUrl,
  JSON.stringify(
    {
      createdAt: new Date().toISOString(),
      repository: REPO,
      tag: TAG,
      note: "Documents created by migrate scripts. Pre-existing producers, the Journalen page, and the media library assets are NOT listed — cleanup must never touch them.",
      documents,
    },
    null,
    2,
  ),
);
console.log(`\nDone. ${created.length} articles created (${documents.length} total in manifest).`);
console.log("Review + publish the Migration Release in the Prismic UI to make them queryable.");
