import type { StaticImageData } from "next/image";

import coteDeSezanneMap from "@/assets/maps/cote-de-sezanne.png";
import coteDesBarMap from "@/assets/maps/cote-des-bar.png";
import coteDesBlancsMap from "@/assets/maps/cote-des-blancs.png";
import montagneDeReimsMap from "@/assets/maps/montagne-de-reims.png";
import valleeDeLaMarneMap from "@/assets/maps/vallee-de-la-marne.png";

export type RegionFactList = {
  label: string;
  items: string[];
};

export type Region = {
  name: string;
  headline: string;
  facts: RegionFactList[];
  body: string[];
  map: StaticImageData;
};

/**
 * The five sub-regions of Champagne. The CMS only stores which one to show,
 * all copy and maps live here. Keys match the `region` Select in
 * `slices/Text/model.json` and the `producer_region` Select on the producer
 * custom type.
 */
export const regions = {
  "Côte des Blancs": {
    name: "Côte des Blancs",
    headline: "Chardonnays kungarike",
    facts: [
      { label: "Området", items: ["Söder om Épernay", "Kritjord i världsklass", "Sex Grand Cru-byar"] },
      { label: "Stilen", items: ["Blanc de Blancs", "Elegans och mineralitet", "Lång lagringspotential"] },
    ],
    body: [
      "För många är Côte des Blancs själva sinnebilden av Chardonnay.",
      "De kalkrika jordarna skapar viner med energi, elegans och en mineralitet som gjort området världsberömt. Här ligger byar som Le Mesnil-sur-Oger, Cramant, Avize och Chouilly – namn som får många champagneälskare att stanna upp.",
      "Området är känt för några av världens mest lagringsdugliga Blanc de Blancs.",
    ],
    map: coteDesBlancsMap,
  },
  "Montagne de Reims": {
    name: "Montagne de Reims",
    headline: "Pinot Noirs hemvist",
    facts: [
      { label: "Området", items: ["Mellan Reims och Épernay", "Skogklädd platå", "Tio Grand Cru-byar"] },
      { label: "Stilen", items: ["Pinot Noir i huvudrollen", "Kropp och struktur", "Kraft med finess"] },
    ],
    body: [
      "Mellan Reims och Épernay breder Montagne de Reims ut sig med skogsklädda höjder och några av regionens mest berömda byar.",
      "Här trivs framför allt Pinot Noir, som ofta bidrar med struktur, djup och lagringspotential. Byar som Verzy, Verzenay, Bouzy och Ambonnay hör till områdets mest välkända.",
      "Många av Champagnes mest kraftfulla och uttrycksfulla viner har sitt ursprung här.",
    ],
    map: montagneDeReimsMap,
  },
  "Vallée de la Marne": {
    name: "Vallée de la Marne",
    headline: "Där Meunier trivs som bäst",
    facts: [
      { label: "Området", items: ["Längs floden Marne", "Lera och märgel", "Champagnes största odlingsyta"] },
      { label: "Stilen", items: ["Meunier i centrum", "Frukt och generositet", "Njutbar redan ung"] },
    ],
    body: [
      "Längs floden Marne förändras landskapet. Jordarna blir djupare och klimatet något mildare.",
      "Här dominerar Pinot Meunier, en druva som länge spelat en viktig roll i Champagne men som först på senare år fått det erkännande den förtjänar.",
      "Vinerna bjuder ofta på generös frukt, charm och tillgänglighet redan i unga år.",
    ],
    map: valleeDeLaMarneMap,
  },
  "Côte des Bar": {
    name: "Côte des Bar",
    headline: "Champagne med egen personlighet",
    facts: [
      { label: "Området", items: ["I Aube, längst söderut", "Kimmeridgisk märgel", "Närmare Chablis än Reims"] },
      { label: "Stilen", items: ["Pinot Noir dominerar", "Solmogen frukt", "Generös och varm"] },
    ],
    body: [
      "Längst i söder förändras både landskapet och jordarna.",
      "Côte des Bar ligger närmare Chablis än Reims och skiljer sig tydligt från övriga Champagne. Här dominerar Pinot Noir och många producenter arbetar småskaligt med stark koppling till sina vingårdar.",
      "Resultatet är ofta viner med kraft, energi och en tydlig känsla av ursprung.",
    ],
    map: coteDesBarMap,
  },
  "Côte de Sézanne": {
    name: "Côte de Sézanne",
    headline: "Den mindre kända grannen",
    facts: [
      { label: "Området", items: ["Söder om Côte des Blancs", "Sydostvända sluttningar", "Ett av regionens minsta"] },
      { label: "Stilen", items: ["Chardonnay dominerar", "Mogen, fyllig frukt", "Mjuk och tillgänglig"] },
    ],
    body: [
      "Söder om Côte des Blancs fortsätter de kalkrika jordarna, men landskapet blir mjukare och mindre omtalat.",
      "Här produceras ofta Chardonnay med lite mer generositet och rundare frukt, samtidigt som den friska karaktären finns kvar.",
      "Ett område som fortfarande gömmer många spännande upptäckter.",
    ],
    map: coteDeSezanneMap,
  },
} as const satisfies Record<string, Region>;

export type RegionName = keyof typeof regions;

export function getRegion(name: string | null | undefined): Region | null {
  if (!name) return null;
  return regions[name as RegionName] ?? null;
}
