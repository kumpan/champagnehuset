/**
 * Fills the `slices` zone of existing article documents so their detail pages
 * have content. Each article gets:
 *   1. a HeroStack built from the article's OWN fields (title + description),
 *   2. one of 3 authored text/longform bodies, chosen deterministically per uid.
 *
 * Bottle/article fields are left untouched — only the (currently empty) slices
 * zone is written. Hero image uses a temp-0X placeholder (the article's real
 * image lives in the article_image field, used on cards). Updates run inside a
 * Migration Release (draft) — nothing goes live until you publish it.
 *
 * Run (test one): node --env-file=.env.local scripts/prismic-migration/migrate-article-bodies.mjs --limit 1
 * Run (all):      node --env-file=.env.local scripts/prismic-migration/migrate-article-bodies.mjs
 */
import * as prismic from "@prismicio/client";
import { compact, imageField, REPO, TAG } from "./lib.mjs";

const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken) {
  console.error("Missing PRISMIC_WRITE_TOKEN — run with: node --env-file=.env.local scripts/prismic-migration/migrate-article-bodies.mjs");
  process.exit(1);
}

const hash = (seed) => [...seed].reduce((s, ch) => s + ch.charCodeAt(0), 0);
const h = (text, type = "heading3") => ({ type, text, spans: [] });
const p = (text) => ({ type: "paragraph", text, spans: [] });
const rt = (...blocks) => blocks;

async function fetchTempAssets() {
  const res = await fetch("https://asset-api.prismic.io/assets?limit=100&keyword=temp", {
    headers: { Authorization: `Bearer ${writeToken}`, repository: REPO },
  });
  if (!res.ok) throw new Error(`Asset API ${res.status}: ${await res.text()}`);
  return (await res.json()).items
    .filter((a) => /^temp-\d+\.(png|jpe?g|webp)$/i.test(a.filename))
    .sort((a, b) => a.filename.localeCompare(b.filename));
}

// --- 3 authored longform bodies -----------------------------------------
const BODIES = [
  // 0 · Så läser du en champagneetikett
  rt(
    p("Champagneetiketten är full av ledtrådar – när man väl vet vad man ska titta efter berättar den både vem som gjort vinet, i vilken stil och varifrån druvorna kommer. Här är de viktigaste delarna."),
    h("Vem har gjort vinet?"),
    p("Nere vid kanten står ofta två små bokstäver. RM (récoltant-manipulant) betyder att odlaren gjort vinet på sina egna druvor – det vi menar med odlarchampagne. NM (négociant-manipulant) är ett hus som även köper in druvor, och CM står för ett kooperativ. Bokstäverna säger inget om kvalitet, men mycket om vem som står bakom flaskan."),
    h("Stil och sötma"),
    p("Orden Brut, Extra Brut och Brut Nature beskriver hur mycket socker som tillsatts efter degorgeringen. Brut Nature är i princip helt torr, Extra Brut mycket torr och Brut den vanligaste torra stilen. Ju mindre dosage, desto tydligare träder vinets egen frukt och syra fram."),
    h("Druvor och ursprung"),
    p("Blanc de Blancs betyder att vinet är gjort enbart på Chardonnay, Blanc de Noirs enbart på blå druvor. Står det en årgång är allt från ett enda år – annars är det en blandning av flera. Byns namn, och ibland Grand Cru eller Premier Cru, avslöjar var i Champagne druvorna vuxit."),
    p("Nästa gång du håller en flaska i handen: läs etiketten som en liten karta. Den leder dig ofta rätt."),
  ),
  // 1 · Odlarchampagne – en kort introduktion
  rt(
    p("De senaste årtiondena har allt fler champagneälskare vänt blicken från de stora, välkända husen till de mindre odlarna. Men vad är egentligen odlarchampagne, och varför pratar vi så gärna om den?"),
    h("Från vingård till flaska"),
    p("Odlarchampagne görs av vinbonden själv, på druvor från de egna vingårdarna. Samma person som beskär rankorna på vintern står bakom besluten i källaren. Det gör att vinet speglar en enskild plats och en enskild familjs sätt att arbeta, snarare än en stor husstil byggd på inköpta druvor."),
    h("Därför smakar de olika"),
    p("Eftersom odlaren ofta arbetar med små parceller och låter årgången ta plats blir vinerna mer personliga. Ett svalt år ger stram och nervig champagne, ett soligt ger mognare frukt. Den variationen ser många av oss som en tillgång, inte ett problem att jämna ut."),
    h("Att hitta rätt"),
    p("Börja med en stil du redan gillar – en frisk Blanc de Blancs eller en fylligare Blanc de Noirs – och utgå därifrån. Fråga gärna oss; ofta räcker det med några ledtrådar om vad du tycker om för att hitta en odlare som passar din smak."),
  ),
  // 2 · Champagne och mat – några enkla principer
  rt(
    p("Champagne är ett av de mest tacksamma vinerna vid bordet. Syran och bubblorna gör den förvånansvärt mångsidig – här är några principer som gör det enkelt att lyckas."),
    h("Låt syran göra jobbet"),
    p("Champagnens friska syra och mousse fungerar som en servett för gommen: de skär genom fett och salt och gör att maten känns lättare. Därför trivs den lika bra med friterat och krämiga såser som med skaldjur."),
    h("Matcha vikt med vikt"),
    p("En lätt, citrusfrisk Blanc de Blancs passar ostron, sushi och fisk. En fylligare Blanc de Noirs eller en mogen årgång håller emot fågel, svamp och lagrade ostar. Tänk på vinets tyngd som du tänker på maträttens – de bör mötas på samma nivå."),
    h("Några klassiker att lita på"),
    p("Champagne och skaldjur är en självklarhet, men prova också med parmesan, pommes frites eller en riktigt bra ostbricka. Torr champagne till dessert är däremot knepigt – där gör en aning mer dosage susen."),
    p("Det viktigaste rådet är ändå det enklaste: servera champagnen lagom sval och våga experimentera. Ofta blir det bättre än man tror."),
  ),
];

// --- run -----------------------------------------------------------------
const limitFlag = process.argv.indexOf("--limit");
const limit = limitFlag !== -1 ? Number(process.argv[limitFlag + 1]) : Infinity;

const client = prismic.createWriteClient(REPO, { writeToken });
const repository = await client.getRepository();
const lang = repository.languages[0].id;
const tempAssets = await fetchTempAssets();
const HERO = { width: 1920, height: 1080 };

const articles = (await client.getAllByType("article", { lang })).slice(0, limit);
console.log(`Articles to update: ${articles.length}`);

const migration = prismic.createMigration();
const counts = [0, 0, 0];
for (const article of articles) {
  const bodyIndex = hash(article.uid) % BODIES.length;
  counts[bodyIndex] += 1;
  const heroImage = tempAssets[hash(`${article.uid}hero`) % tempAssets.length];
  const slices = [
    {
      slice_type: "hero", variation: "stack",
      primary: {
        section_theme: "Bud",
        overline: article.data.tag ? [{ overline_icon: "none", overline_text: article.data.tag }] : [],
        title: rt(h(article.data.article_title ?? "Artikel", "heading2")),
        description: article.data.article_description ? rt(p(article.data.article_description)) : [],
        buttons: [],
        media: [{ filter: "Bottom Left", image: imageField(heroImage, article.data.article_title, HERO) }],
      }, items: [],
    },
    {
      slice_type: "text", variation: "longform",
      primary: { remove_top_padding: false, rich_text: BODIES[bodyIndex] }, items: [],
    },
  ];
  const data = compact({ ...article.data, slices });
  migration.updateDocument({ ...article, tags: [...new Set([...(article.tags ?? []), TAG])], data }, `Article: ${article.uid}`);
}

console.log(`Body distribution: [0]=${counts[0]} [1]=${counts[1]} [2]=${counts[2]}`);
await client.migrate(migration, {
  reporter: (event) => {
    if (event.type === "documents:updating" && event.data.current % 5 === 1) {
      console.log(`  updating ${event.data.current}/${event.data.total}`);
    }
  },
});

console.log(`\nDone. ${articles.length} article(s) updated. Review + publish the Migration Release in the Prismic UI.`);
