/**
 * Figma-to-Prismic page migration for the content pages (Om oss, Special Club,
 * Kontakt). One slice per Figma section, content transcribed verbatim from the
 * "• Desktop" artboards. Images use temp-0X media library assets; document-
 * reference slices (ContactPeople -> employees) are left auto-populating.
 *
 * Updates existing published pages in place, inside a Migration Release (draft)
 * — nothing goes live until you review + publish it in the Prismic UI. Existing
 * pages are never queued for deletion in manifest.json.
 *
 * Run one page:  node --env-file=.env.local scripts/prismic-migration/migrate-figma-pages.mjs --uid om-oss
 * Run all:       node --env-file=.env.local scripts/prismic-migration/migrate-figma-pages.mjs --all
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import * as prismic from "@prismicio/client";
import { compact, imageField, REPO, TAG } from "./lib.mjs";

const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken) {
  console.error("Missing PRISMIC_WRITE_TOKEN — run with: node --env-file=.env.local scripts/prismic-migration/migrate-figma-pages.mjs --uid <uid>");
  process.exit(1);
}

// --- helpers -------------------------------------------------------------
function hash(seed) {
  return [...seed].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}
const h = (text, type = "heading2") => ({ type, text, spans: [] });
const p = (text) => ({ type: "paragraph", text, spans: [] });
const rt = (...blocks) => blocks; // rich text = array of blocks
const link = (url, text) =>
  compact({ link_type: "Web", url, text, target: url.startsWith("http") ? "_blank" : undefined });
const overline = (text, icon = "none") => (text ? [{ overline_icon: icon, overline_text: text }] : []);

async function fetchTempAssets() {
  const res = await fetch("https://asset-api.prismic.io/assets?limit=100&keyword=temp", {
    headers: { Authorization: `Bearer ${writeToken}`, repository: REPO },
  });
  if (!res.ok) throw new Error(`Asset API ${res.status}: ${await res.text()}`);
  const assets = (await res.json()).items
    .filter((a) => /^temp-\d+\.(png|jpe?g|webp)$/i.test(a.filename))
    .sort((a, b) => a.filename.localeCompare(b.filename));
  if (assets.length === 0) throw new Error("No temp-0X assets found in the media library");
  return assets;
}

const client = prismic.createWriteClient(REPO, { writeToken });
const repository = await client.getRepository();
const lang = repository.languages[0].id;
const tempAssets = await fetchTempAssets();
const img = (seed, constraint, alt) => imageField(tempAssets[hash(seed) % tempAssets.length], alt, constraint);
const WIDE = { width: 1920, height: 1080 };
const SQUARE = { width: 1440, height: 1440 };
const GRID = { width: 1440, height: 1080 };

// --- page definitions ----------------------------------------------------
const PAGES = {
  "om-oss": {
    page_title: "Om oss",
    meta_title: "Om oss – ChampagneHuset",
    meta_description: "Vi tror på odlarchampagne. Sedan starten har vårt mål varit att lyfta fram människorna, platserna och berättelserna bakom några av Champagnes mest spännande odlare.",
    slices: [
      // 1 · HeroBackdrop
      {
        slice_type: "hero", variation: "backdrop",
        primary: {
          section_theme: "Dust", alignment: false,
          title: rt(h("Vi tror på odlarchampagne", "heading1")),
          description: rt(p("Sedan starten har vårt mål varit enkelt – att lyfta fram människorna, platserna och berättelserna bakom några av Champagnes mest spännande odlare.")),
          buttons: [], media: [{ image: img("omoss-hero", WIDE, "Vingård i Champagne") }],
        }, items: [],
      },
      // 2 · TextSplit
      {
        slice_type: "text", variation: "split",
        primary: {
          remove_top_padding: false, section_theme: "Bud",
          overline: overline("Om oss"),
          title: rt(h("ChampagneHuset grundades 2002 ur en enkel övertygelse")),
          description: [],
          first_text_block: rt(p("ChampagneHuset grundades 2002 ur en enkel övertygelse: att några av de mest intressanta champagnerna inte kommer från de största husen, utan från människorna som lever sina liv bland vingårdarna. Sedan starten har vi rest genom Champagne för att lära känna odlarna bakom flaskorna – människor som känner varje parcell och låter platsen forma vinernas karaktär.")),
          second_text_block: rt(p("Idag representerar vi 16 familjeägda odlare som delar samma syn på hantverk, kvalitet och ursprung. De arbetar på olika sätt och i olika delar av regionen, men förenas av en ambition: att skapa viner som speglar platsen de kommer ifrån. För oss handlar champagne om mer än vad som finns i glaset – om människorna, kunskapen som gått i arv och stunderna då ett glas för människor samman.")),
        }, items: [],
      },
      // 3 · TextMedia
      {
        slice_type: "text", variation: "media",
        primary: {
          remove_top_padding: false, section_theme: "Bud", text_side: false,
          first_text_block: rt(h("Odlare med egna uttryck och tydlig karaktär", "heading3"), p("Vi väljer producenter med omsorg – odlare med tydliga personligheter, egna uttryck och en stark vilja att låta hantverket stå i centrum. Små vinhus som arbetar nära naturen och låter årgångens variationer och traktens förutsättningar ta plats. Det är just i det samspelet som de mest uttrycksfulla champagnerna uppstår.")),
          first_image: [{ filter: "Bottom Left", image: img("omoss-media1", WIDE, "Odlare") }],
          second_text_block: rt(h("Ett sortiment som speglar Champagne i all sin mångfald", "heading3"), p("Resultatet är ett sortiment som speglar hela regionen – från de kritrika sluttningarna i Côte des Blancs till de böljande landskapen i Côte des Bar. Från eleganta Blanc de Blancs till kraftfulla årgångschampagner med lång lagringspotential. ChampagneHuset är vår samlade kärlek till Champagne, och en inbjudan att upptäcka människorna, platserna och berättelserna bakom varje flaska.")),
          second_image: [{ filter: "Bottom Left", image: img("omoss-media2", WIDE, "Vingård") }],
        }, items: [],
      },
      // 4 · TextExtended
      {
        slice_type: "text", variation: "extended",
        primary: {
          remove_top_padding: false, section_theme: "Bud",
          overline: overline("Vår filosofi"),
          title: rt(h("Bakom varje flaska vi väljer finns en familj, en by och en årgång som satt sitt avtryck")),
          description: [],
          rich_text: rt(
            h("Platsen i glaset", "heading3"),
            p("En champagne bär alltid spår av var den vuxit. Kritjorden under vingårdarna, byns läge, parcellens lutning mot solen – varje detalj går att känna igen i det färdiga vinet. Våra odlare känner sina marker in i minsta vrå och arbetar för att låta dem komma till tals, inte tona ner dem. Det är därför en champagne härifrån aldrig smakar riktigt som en annan."),
            h("Vi låter årgången tala", "heading3"),
            p("Där de stora husen strävar efter samma smak år efter år gör våra odlare tvärtom – de låter varje årgång berätta sin egen historia. Ett svalt år, en solig sommar, en tidig skörd: allt sätter sin prägel på vinet. Det är i dessa skillnader, snarare än i jakten på det exakta, som de mest levande champagnerna föds."),
          ),
        }, items: [],
      },
      // 5 · CalloutSplit (image left)
      {
        slice_type: "callout", variation: "split",
        primary: {
          remove_top_padding: false, section_theme: "Bud", alignment: false, image_side: false,
          overline: overline("Om oss"),
          title: rt(h("Specialist på Special Club")),
          description: rt(p("Flera av de odlare vi arbetar med är medlemmar i Club Trésors de Champagne – mer känt som Special Club. Här samlas några av Champagnes mest ambitiösa odlare kring en gemensam idé: att skapa årgångschampagner som representerar det allra bästa deras vingårdar kan ge. Resultatet är personliga champagner med tydligt ursprung, stark karaktär och en kompromisslös syn på kvalitet.")),
          buttons: [{ link: link("/special-club", "Läs mer om Special Club"), variant: "default", icon_left: "none", icon_right: "arrowUpRight" }],
          media: [{ filter: "Bottom Left", image: img("omoss-split1", SQUARE, "Special Club") }],
        }, items: [],
      },
      // 6 · CalloutSplit (image right, Brand)
      {
        slice_type: "callout", variation: "split",
        primary: {
          remove_top_padding: false, section_theme: "Brand", alignment: false, image_side: true,
          overline: overline("Människorna bakom flaskorna"),
          title: rt(h("En del av The Wine & Spirits Collective")),
          description: rt(p("ChampagneHuset grundades 2002 av Peter och Inger Wirnäs och har sedan dess hjälpt svenska champagneälskare att upptäcka regionens mest spännande odlare. Sedan 2019 drivs verksamheten vidare av The Wine & Spirits Collective, med Ida Timén som ansvarig produktchef. Tillsammans med våra odlare bygger vi vidare på det som alltid varit kärnan – människorna, platserna och passionen bakom varje flaska.")),
          buttons: [],
          media: [{ filter: "Bottom Left", image: img("omoss-split2", SQUARE, "The Wine & Spirits Collective") }],
        }, items: [],
      },
      // 7 · CalloutContact
      {
        slice_type: "callout", variation: "contact",
        primary: {
          remove_top_padding: false, section_theme: "Bud", image_side: true,
          overline: [],
          title: rt(h("Ida Timén")),
          description: rt(
            p("Brand manager på ChampagneHuset och ansvarar för varumärke, kommunikation och innehåll."),
            p("Med en passion för odlarchampagne arbetar hon för att lyfta fram de små husens hantverk och berättelser, från vingårdarna till glaset hemma hos dig."),
          ),
          buttons: [],
          media: [{ filter: "Bottom Left", image: img("omoss-contact", SQUARE, "Ida Timén") }],
          contact_items: [
            { icon: "phoneCall", label: "Ring mig", value: "+46 (0) 70 724 34 74", link: "tel:+46707243474" },
            { icon: "mail", label: "Skicka ett mejl", value: "ida.timen@twscollective.se", link: "mailto:ida.timen@twscollective.se" },
          ],
        }, items: [],
      },
      // 8 · ContactPeople (auto-populating employees)
      {
        slice_type: "contact", variation: "people",
        primary: {
          remove_top_padding: false, section_theme: "Bud",
          overline: [], title: [], description: [], button: [], featured_employees: [],
        }, items: [],
      },
    ],
  },

  "special-club": {
    page_title: "Special Club",
    meta_title: "Special Club – ChampagneHuset",
    meta_description: "Special Club är berättelsen om några av Champagnes mest ambitiösa odlare och deras gemensamma vilja att visa vad småskaligt hantverk kan åstadkomma.",
    slices: [
      // 1 · HeroStack
      {
        slice_type: "hero", variation: "stack",
        primary: {
          section_theme: "Bud", overline: [],
          title: rt(h("När de små bestämde sig för att utmana de stora", "heading2")),
          description: rt(p("Special Club är berättelsen om några av Champagnes mest ambitiösa odlare – och deras gemensamma vilja att visa vad småskaligt hantverk kan åstadkomma. Upptäck viner där kompromisslös kvalitet och kärleken till den egna vingården alltid talar högst.")),
          buttons: [], media: [{ filter: "Bottom Left", image: img("sc-hero", WIDE, "Special Club") }],
        }, items: [],
      },
      // 2 · TextSplit
      {
        slice_type: "text", variation: "split",
        primary: {
          remove_top_padding: false, section_theme: "Bud",
          overline: overline("Special Club"),
          title: rt(h("När de små bestämde sig för att utmana de stora")),
          description: [],
          first_text_block: rt(p("På 1970-talet dominerades Champagne av de stora husen. Deras namn syntes överallt och deras marknadsföringsbudgetar var större än vad de flesta odlare kunde drömma om. Samtidigt fanns det en grupp vinodlare som var övertygade om att stor champagne kunde komma från en helt annan plats. År 1971 gick ett tiotal odlare samman för att skapa något unikt. Deras idé var enkel: att låta kvaliteten tala för sig själv.")),
          second_text_block: rt(p("Resultatet blev Special Club. För att få bära namnet räckte det inte att göra bra champagne – vinet skulle representera det allra bästa producenten kunde skapa. År 1999 tog föreningen nästa steg och bytte namn till Club Trésors de Champagne (Champagnes skatter). Namnet speglar än idag ambitionen: att visa att stor champagne inte handlar om storlek, utan om hantverk, tålamod och en kompromisslös syn på kvalitet.")),
        }, items: [],
      },
      // 3 · ImageGrid -> image/showcase (3 images)
      {
        slice_type: "image", variation: "showcase",
        primary: {
          remove_top_padding: false, section_theme: "Bud",
          media: [
            { filter: "Bottom Left", image: img("sc-grid1", GRID, "Special Club") },
            { filter: "Bottom Left", image: img("sc-grid2", GRID, "Vingård") },
            { filter: "Bottom Left", image: img("sc-grid3", GRID, "Källare") },
          ],
        }, items: [],
      },
      // 4 · ValueText
      {
        slice_type: "value", variation: "text",
        primary: {
          remove_top_padding: false, section_theme: "Bud", alignment: false,
          overline: overline("Kriterierna"),
          title: rt(h("Vad kännetecknar en Special Club?")),
          description: rt(p("Endast de viner som klarar de hårda kraven får bära den karakteristiska flaskan. Här är de sex grundreglerna varje odlare måste följa:")),
          buttons: [],
          statement: [
            { title: "1. Föreningsmedlem", description: "Champagnen måste vara producerad av en aktiv medlem i föreningen Club Trésors de Champagne." },
            { title: "2. Egna vingårdar", description: "Ett absolut krav på ursprung: Druvorna måste komma uteslutande från producentens egna vingårdar." },
            { title: "3. Alltid årgång", description: "Champagnen är alltid årgångsbetecknad för att spegla just det årets specifika och unika växtförhållanden." },
            { title: "4. Lång lagring", description: "Vinet måste genomgå en lång tids lagring i källaren innan det är redo för lansering." },
            { title: "5. Dubbel granskning", description: "Varje vin godkänns av en oberoende panel vid två tillfällen: före den andra jäsningen, och igen efter flera års lagring." },
            { title: "6. Det absolut bästa", description: "En Special Club-flaska är inte vilken champagne som helst. Den måste representera producentens absolut främsta vin." },
          ],
        }, items: [],
      },
      // 5 · TextExtended
      {
        slice_type: "text", variation: "extended",
        primary: {
          remove_top_padding: false, section_theme: "Bud",
          overline: [],
          title: rt(h("Vi tror på odlarchampagne och att låta varje vingård tala sitt eget, unika språk.")),
          description: [],
          rich_text: rt(
            h("En gemensam symbol, inte en gemensam stil", "heading3"),
            p("Det som förenar odlarna är inte hur vinet smakar – tvärtom. De kommer från olika delar av Champagne, arbetar med olika druvsorter och har sina egna idéer. Från de kritrika sluttningarna i Côte des Blancs till kalk- och lerjordarna i Côte des Bar. Det som förenar dem är ambitionen att skapa det absolut bästa som deras egna vingårdar kan ge uttryck för."),
            h("Tillgängliga skatter för nyfikna", "heading3"),
            p("Under många år har vi byggt nära relationer med producenter inom Club Trésors de Champagne, och idag representerar vi majoriteten av föreningens medlemmar i Sverige. Från eleganta Blanc de Blancs till kraftfulla årgångschampagner som fått utvecklas i lugn och ro i källaren. Vi arbetar dagligen för att göra dessa skatter tillgängliga för svenska champagneälskare."),
          ),
        }, items: [],
      },
      // 6 · CalloutSplit (image left)
      {
        slice_type: "callout", variation: "split",
        primary: {
          remove_top_padding: false, section_theme: "Bud", alignment: false, image_side: false,
          overline: overline("Om oss"),
          title: rt(h("Lär känna oss på Champagnehuset")),
          description: rt(p("Vi reser ständigt till Champagne för att bygga nära relationer med odlarna och hitta de där unika flaskorna som de stora husen sällan visar. För oss handlar varje glas om ett genuint hantverk, en specifik plats och människorna som viger sina liv åt att förfina det.")),
          buttons: [{ link: link("/om-oss", "Läs mer om oss"), variant: "default", icon_left: "none", icon_right: "arrowUpRight" }],
          media: [{ filter: "Bottom Left", image: img("sc-split1", SQUARE, "Champagnehuset") }],
        }, items: [],
      },
      // 7 · CalloutSplit (image right, Brand)
      {
        slice_type: "callout", variation: "split",
        primary: {
          remove_top_padding: false, section_theme: "Brand", alignment: false, image_side: true,
          overline: overline("Människorna bakom flaskorna"),
          title: rt(h("Specialist på Special Club")),
          description: rt(
            p("Idag representerar vi majoriteten av medlemmarna i Club Trésors de Champagne i Sverige och arbetar dagligen för att göra deras champagner tillgängliga för svenska champagneälskare."),
            p("Genom dessa engagerade odlare får vi möjlighet att utforska hela Champagne. Från de kritrika sluttningarna i Côte des Blancs till de kalk- och lerjordar som präglar Côte des Bar. Deras främsta årgångschampagner skapas för att spegla platsen, året och människorna bakom vinet."),
          ),
          buttons: [{ link: link("/odlare", "Läs mer om producenterna"), variant: "default", icon_left: "none", icon_right: "arrowUpRight" }],
          media: [{ filter: "Bottom Left", image: img("sc-split2", SQUARE, "Producenter") }],
        }, items: [],
      },
      // 8 · CalloutDetails (details variation has no image field — Figma's left image omitted)
      {
        slice_type: "callout", variation: "details",
        primary: {
          remove_top_padding: false, section_theme: "Bud",
          overline: [],
          title: rt(h("Champagnehusets vinklubb")),
          description: rt(p("För människor som vill upptäcka mer.")),
          buttons: [{ link: link("/kontakt", "Anmäl"), icon_left: "badgeCheck", icon_right: "none" }],
          details: [
            { detail_icon: "check", rich_text: rt(p("Nyheter")) },
            { detail_icon: "check", rich_text: rt(p("Rekommendationer")) },
            { detail_icon: "check", rich_text: rt(p("Inbjudningar")) },
            { detail_icon: "check", rich_text: rt(p("Förhandslanseringar")) },
          ],
        }, items: [],
      },
    ],
  },

  "kontakt": {
    page_title: "Kontakt",
    meta_title: "Kontakta oss – ChampagneHuset",
    meta_description: "Kontakta ChampagneHuset – ring, mejla eller skicka ett meddelande så hör vi av oss.",
    slices: [
      // 1 · HeroStack
      {
        slice_type: "hero", variation: "stack",
        primary: {
          section_theme: "Bud", overline: [],
          title: rt(h("Kontakta oss", "heading2")),
          description: [], buttons: [], media: [],
        }, items: [],
      },
      // 2 · CalloutContact
      {
        slice_type: "callout", variation: "contact",
        primary: {
          remove_top_padding: false, section_theme: "Bud", image_side: true,
          overline: [],
          title: rt(h("Ida Timén")),
          description: rt(
            p("Brand manager på ChampagneHuset och ansvarar för varumärke, kommunikation och innehåll."),
            p("Med en passion för odlarchampagne arbetar hon för att lyfta fram de små husens hantverk och berättelser, från vingårdarna till glaset hemma hos dig."),
          ),
          buttons: [],
          media: [{ filter: "Bottom Left", image: img("k-contact", SQUARE, "Ida Timén") }],
          contact_items: [
            { icon: "phoneCall", label: "Ring mig", value: "+46 (0) 70 724 34 74", link: "tel:+46707243474" },
            { icon: "mail", label: "Skicka ett mejl", value: "ida.timen@twscollective.se", link: "mailto:ida.timen@twscollective.se" },
          ],
        }, items: [],
      },
      // 3 · ContactForm (NOTE: Figma intro + value statements are generic placeholder copy)
      {
        slice_type: "contact", variation: "form",
        primary: {
          remove_top_padding: false, section_theme: "Bud", form_side: false,
          overline: [],
          title: rt(h("Ta nästa steg mot en smartare verksamhet")),
          description: rt(p("Hör av er idag för en förutsättningslös dialog om hur vi kan stärka era kundrelationer och effektivisera era processer.")),
          value_statements: [
            { icon: "shieldCheck", text: "Relationer i fokus för ökat användarnöje och affärsnytta" },
            { icon: "badgeCheck", text: "Smart effektivisering med Microsoft Copilot och AI" },
            { icon: "handshake", text: "Ett tryggt och nära partnerskap som tar helhetsansvar" },
          ],
          submit_button_text: "Skicka meddelande",
          success_message: rt(p("Tack för ditt meddelande! Vi återkommer så snart vi kan.")),
          consent_items: [{ consent_text: rt(p("Jag godkänner policyn och övriga villkor.")), consent_required: true }],
        },
        items: [
          { field_type: "name", field_label: "Förnamn", field_placeholder: "Anna", field_required: true, new_row: true },
          { field_type: "name", field_label: "Efternamn", field_placeholder: "Andersson", field_required: true, new_row: false },
          { field_type: "email", field_label: "E-postadress", field_placeholder: "anna@foretag.se", field_required: true, new_row: true },
          { field_type: "text", field_label: "Organisation", field_placeholder: "Exempel AB", field_required: false, new_row: false },
          { field_type: "textarea", field_label: "Meddelande", field_placeholder: "Hej! Jag vill veta mer om era tjänster...", field_required: true, new_row: true },
        ],
      },
      // 4 · ContactPeople (auto-populating employees)
      {
        slice_type: "contact", variation: "people",
        primary: {
          remove_top_padding: false, section_theme: "Bud",
          overline: [], title: [], description: [], button: [], featured_employees: [],
        }, items: [],
      },
      // 5 · ContactRegister (newsletter)
      {
        slice_type: "contact", variation: "register",
        primary: {
          remove_top_padding: false, section_theme: "Bud", image_side: true,
          image: img("k-register", SQUARE, "Nyhetsbrev"),
          overline: overline("Nyhetsbrev"),
          title: rt(h("Bubblor, berättelser och det senaste från Champagne")),
          description: rt(p("Prenumerera på vårt nyhetsbrev och få nyheter från våra odlarhus, exklusiva släpp, provningstips och inbjudningar till våra evenemang – direkt i din inkorg")),
          email_label: "E-postadress", email_placeholder: "anna@foretag.se",
          button_label: "Prenumerera nu",
          success_message: rt(p("Tack för din prenumeration!")),
        }, items: [],
      },
      // 6 · FAQSplit (NOTE: Figma questions/answers are placeholder gibberish)
      {
        slice_type: "faq", variation: "split",
        primary: {
          remove_top_padding: false, section_theme: "Bud",
          overline: overline("Vanliga frågor"),
          title: rt(h("Undrar du något?")),
          description: rt(p("Champagne kan väcka många frågor – från druvor och årgångar till leveranser och provningar. Här har vi samlat svaren på de vanligaste.")),
          faqlist: [
            { question: "Godis wireframe köttbullar-driven design väntan boll påtår?", answer: rt(p("Mysig öl pinne väntan julöl snabb björn rebase, frågvis. Skumöl hund köttbulle, designsystem lagård lazy-loadad ljus stånka lättöl lagom tomte, deploya. Skog kanel ljus tomte sommar vatten lagom stout. Knäckebröd skägg jäst mysig härlig, moln fatöl roadmap förstås, tomte.")) },
            { question: "Vatten fika wireframe härlig deploya burköl vante mellanöl krita kanel?", answer: [] },
            { question: "Malt lagård grönska fin boll mellanöl?", answer: [] },
            { question: "Cache komponent ljus jäst bira vimpel, lagård förälskelse?", answer: [] },
            { question: "Krita penna snöig vante penna hydrering rebase älg synergi?", answer: [] },
          ],
        }, items: [],
      },
    ],
  },

  "faq": {
    page_title: "Vanliga frågor",
    meta_title: "Vanliga frågor – ChampagneHuset",
    meta_description: "Svar på de vanligaste frågorna om champagne och odlarchampagne – från druvor, dosage och årgångar till beställning, servering och förvaring.",
    slices: [
      // 1 · HeroStack
      {
        slice_type: "hero", variation: "stack",
        primary: {
          section_theme: "Bud", overline: [],
          title: rt(h("Här hittar du svaret", "heading2")),
          description: [], buttons: [], media: [],
        }, items: [],
      },
      // 2 · FAQList — Om champagne
      {
        slice_type: "faq", variation: "list",
        primary: {
          remove_top_padding: false, section_theme: "Bud", alignment: false,
          overline: overline("Champagne & odlarchampagne"),
          title: rt(h("Om champagnen")),
          description: rt(p("Det som är bra att veta om druvorna, stilarna och begreppen bakom flaskorna vi arbetar med.")),
          faqlist: [
            { question: "Vad är odlarchampagne?", answer: rt(p("Odlarchampagne (récoltant-manipulant) är champagne som odlaren gör på druvor från sina egna vingårdar, hela vägen från skörd till buteljering. Till skillnad från de stora husen, som köper in druvor från många leverantörer, speglar odlarchampagne en enskild familjs marker och stil – ofta med tydligare ursprung och mer personlig karaktär.")) },
            { question: "Vad betyder Blanc de Blancs och Blanc de Noirs?", answer: rt(p("Blanc de Blancs görs enbart på gröna druvor, i praktiken nästan alltid Chardonnay, och är ofta elegant, citrusfrisk och mineralisk. Blanc de Noirs görs enbart på blå druvor (Pinot Noir och/eller Pinot Meunier) och blir vanligtvis fylligare och mer fruktdriven.")) },
            { question: "Vad är Special Club?", answer: rt(p("Special Club (Club Trésors de Champagne) är en sammanslutning av kvalitetsinriktade odlare. En Special Club-champagne är alltid ett årgångsvin som måste godkännas av en oberoende panel i två steg och representera producentens allra bästa vin. Den känns igen på sin egen, karakteristiska flaskform.")) },
            { question: "Vad innebär dosage och Brut Nature?", answer: rt(p("Dosage är den lilla mängd socker som tillsätts efter degorgeringen och avgör hur torr champagnen upplevs. Brut Nature (0–3 g/l) är i princip helt utan tillsatt socker, Extra Brut är mycket torr och Brut (upp till 12 g/l) är den vanligaste, torra stilen.")) },
            { question: "Vad är skillnaden mellan Grand Cru och Premier Cru?", answer: rt(p("Det är en klassificering av byarna i Champagne. Druvor från de sjutton Grand Cru-byarna anses ha högst potential, följt av Premier Cru. Beteckningen säger något om ursprunget – men inte allt om kvaliteten. Odlarens arbete i vingård och källare är minst lika avgörande.")) },
            { question: "Vad betyder årgång (millésime)?", answer: rt(p("En årgångschampagne är gjord på druvor från ett enda år och buteljeras bara när skörden anses tillräckligt bra. Den speglar just det årets karaktär, medan en icke-årgångschampagne (NV) blandar flera år för en jämn och igenkännbar husstil.")) },
          ],
        }, items: [],
      },
      // 3 · FAQList — Beställning & leverans
      {
        slice_type: "faq", variation: "list",
        primary: {
          remove_top_padding: true, section_theme: "Bud", alignment: false,
          overline: overline("Beställning & leverans"),
          title: rt(h("Att handla hos oss")),
          description: rt(p("Så hittar du våra viner, och vad som gäller för beställning och leverans.")),
          faqlist: [
            { question: "Hur beställer jag champagne?", answer: rt(p("Våra viner säljs via Systembolaget – i butik, som beställningsvara eller i webbshoppen. På varje produktsida hittar du artikelnummer och en länk vidare. Vissa viner finns även som privatimport för restaurang och företag.")) },
            { question: "Vad är skillnaden mellan ordinarie sortiment och beställningssortiment?", answer: rt(p("Ordinarie sortiment står i butikshyllan, medan beställningssortimentet tas hem på beställning och levereras till din valda butik, oftast inom några dagar. Många av våra mer exklusiva odlarchampagner finns i beställningssortimentet.")) },
            { question: "Kan företag och restauranger köpa direkt?", answer: rt(p("Ja. För restaurang, hotell och företag erbjuder vi privatimport av flera viner som inte finns på Systembolaget. Hör av dig till oss så hjälper vi dig vidare med urval och beställning.")) },
            { question: "Hur lång är leveranstiden?", answer: rt(p("Vid beställning via Systembolaget är leveranstiden vanligtvis 2–7 arbetsdagar till vald butik. Under högsäsong som jul och nyår kan det ta något längre tid.")) },
            { question: "Hjälper ni till med större beställningar och gåvor?", answer: rt(p("Gärna. För bröllop, event och företagsgåvor ger vi råd kring urval och volym. Kontakta oss så återkommer vi med förslag anpassade efter tillfället.")) },
          ],
        }, items: [],
      },
      // 4 · FAQList — Servering & förvaring
      {
        slice_type: "faq", variation: "list",
        primary: {
          remove_top_padding: true, section_theme: "Bud", alignment: false,
          overline: overline("Servering & förvaring"),
          title: rt(h("Njut av champagnen")),
          description: rt(p("Praktiska råd för att få ut mesta möjliga av varje flaska.")),
          faqlist: [
            { question: "Vilken temperatur ska champagne serveras i?", answer: rt(p("Servera champagne svalt, runt 8–10 °C. Mogna årgångschampagner och fylligare Blanc de Noirs mår bra av någon grad varmare, kring 10–12 °C, vilket lyfter fram aromerna. Undvik iskallt – då stänger sig doften.")) },
            { question: "Vilket glas är bäst?", answer: rt(p("Ett tulpanformat vitvinsglas är att föredra framför den smala flöjten. Den större kupan ger doften plats att utvecklas samtidigt som formen bevarar bubblorna. Den breda coupe-skålen är vacker men släpper ut mousse och arom för snabbt.")) },
            { question: "Hur länge kan jag spara champagne?", answer: rt(p("Icke-årgångschampagne dricks med fördel inom några år från köp. Årgångsviner och Special Club kan ofta utvecklas fint i tio år eller mer vid rätt förvaring. Våra viner är redan lagrade och redo att avnjutas vid lansering.")) },
            { question: "Hur förvarar jag champagne hemma?", answer: rt(p("Förvara flaskorna liggande, mörkt och svalt (10–14 °C) med jämn temperatur, borta från ljus och vibrationer. Ett kylskåp fungerar för kortare tid, men för längre lagring är en sval källare eller vinkyl bäst.")) },
            { question: "Hur öppnar jag flaskan säkert?", answer: rt(p("Håll ett fast grepp om korken, luta flaskan lätt och vrid på flaskan – inte korken. Låt korken glida ut med ett diskret väsande snarare än en smäll, så bevarar du moussen och undviker spill.")) },
            { question: "Anordnar ni provningar?", answer: rt(p("Ja, vi håller regelbundet provningar och event – från nybörjarvänliga introduktioner till fördjupande vertikalprovningar. Håll utkik i Journalen och i vårt nyhetsbrev för kommande tillfällen.")) },
          ],
        }, items: [],
      },
    ],
  },
};

// --- run -----------------------------------------------------------------
const uidFlag = process.argv.indexOf("--uid");
const runAll = process.argv.includes("--all");
const uids = runAll ? Object.keys(PAGES) : uidFlag !== -1 ? [process.argv[uidFlag + 1]] : [];
if (uids.length === 0) {
  console.error("Pass --uid <uid> or --all. Available:", Object.keys(PAGES).join(", "));
  process.exit(1);
}

const migration = prismic.createMigration();
const createdUids = [];
for (const uid of uids) {
  const def = PAGES[uid];
  if (!def) { console.error(`No definition for "${uid}"`); continue; }
  const existing = await client.getByUID("page", uid, { lang }).catch(() => null);

  const data = compact({
    ...(existing?.data ?? {}),
    page_title: def.page_title ?? existing?.data.page_title,
    parent: def.parent ?? existing?.data.parent,
    slices: def.slices,
    meta_title: def.meta_title ?? existing?.data.meta_title,
    meta_description: def.meta_description ?? existing?.data.meta_description,
  });

  if (existing) {
    migration.updateDocument({ ...existing, tags: [...new Set([...(existing.tags ?? []), TAG])], data }, `Page: ${uid}`);
    console.log(`Updating "${uid}" (${existing.id}) with ${def.slices.length} slices`);
  } else {
    migration.createDocument({ type: "page", uid, lang, tags: [TAG], data }, `Page: ${uid}`);
    createdUids.push(uid);
    console.log(`Creating new page "${uid}" with ${def.slices.length} slices`);
  }
}

await client.migrate(migration, {
  reporter: (event) => {
    if (event.type === "documents:creating") console.log(`  creating: ${event.data.document?.title ?? ""}`);
    else if (event.type === "documents:updating") console.log(`  updating: ${event.data.document?.title ?? ""}`);
  },
});

// Record only freshly-created pages in manifest (never queue existing pages for deletion)
const created = migration._documents.filter((d) => d.document.id && createdUids.includes(d.document.uid));
if (created.length > 0) {
  const manifestUrl = new URL("./manifest.json", import.meta.url);
  const prev = existsSync(manifestUrl) ? JSON.parse(readFileSync(manifestUrl, "utf8")) : { documents: [] };
  const rows = created.map((d) => ({ id: d.document.id, type: d.document.type, uid: d.document.uid }));
  prev.documents = [...prev.documents, ...rows.filter((r) => !prev.documents.some((p) => p.id === r.id))];
  writeFileSync(manifestUrl, JSON.stringify(prev, null, 2));
  console.log(`Recorded ${rows.length} new page(s) in manifest.json`);
}

console.log(`\nDone. Review + publish the Migration Release in the Prismic UI.`);
