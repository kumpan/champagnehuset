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
    headline: "Pinot noirs hjärtland",
    facts: [
      { label: "Området", items: ["Mellan Reims och Épernay", "Skogklädd platå", "Tio Grand Cru-byar"] },
      { label: "Stilen", items: ["Pinot Noir i huvudrollen", "Kropp och struktur", "Kraft med finess"] },
    ],
    body: [
      "Montagne de Reims är champagnens ryggrad – en skogklädd platå mellan Reims och Épernay.",
      "Sluttningarna vetter åt alla väderstreck, vilket ger druvorna vitt skilda förutsättningar. På norra sidan ligger Verzenay och Mailly, på den södra Ambonnay och Bouzy – byar som gett Pinot Noir en av sina allra finaste adresser.",
      "Vinerna har kropp, struktur och en mörkare fruktighet som ger stommen i många av regionens stora cuvéer.",
    ],
    map: montagneDeReimsMap,
  },
  "Vallée de la Marne": {
    name: "Vallée de la Marne",
    headline: "Meuniers vidsträckta dal",
    facts: [
      { label: "Området", items: ["Längs floden Marne", "Lera och märgel", "Champagnes största odlingsyta"] },
      { label: "Stilen", items: ["Meunier i centrum", "Frukt och generositet", "Njutbar redan ung"] },
    ],
    body: [
      "Vallée de la Marne följer floden västerut från Épernay och är regionens mest vidsträckta område.",
      "Här dominerar Meunier, en druva som trivs i de tyngre ler- och märgeljordarna och som mognar tidigt nog att klara dalens vårfroster. Längst i öster ligger Grand Cru-byn Aÿ, sedan århundraden känd för sin Pinot Noir.",
      "Vinerna är fruktiga, runda och ofta njutbara redan unga – men de bästa har både djup och lagringsförmåga.",
    ],
    map: valleeDeLaMarneMap,
  },
  "Côte des Bar": {
    name: "Côte des Bar",
    headline: "Söderns självsäkra pinot",
    facts: [
      { label: "Området", items: ["I Aube, längst söderut", "Kimmeridgisk märgel", "Närmare Chablis än Reims"] },
      { label: "Stilen", items: ["Pinot Noir dominerar", "Solmogen frukt", "Generös och varm"] },
    ],
    body: [
      "Côte des Bar ligger drygt tio mil söder om Épernay – faktiskt närmare Chablis än Reims.",
      "Jorden är kimmeridgisk märgel, samma som i Chablis, och de branta sluttningarna fångar mycket sol. Pinot Noir står för den absoluta merparten av odlingarna.",
      "Länge sågs området som en råvaruleverantör åt de stora husen. Idag är det ett av de mest spännande i hela Champagne, tack vare en generation odlare som buteljerar sitt eget.",
    ],
    map: coteDesBarMap,
  },
  "Côte de Sézanne": {
    name: "Côte de Sézanne",
    headline: "Den soliga sydsluttningen",
    facts: [
      { label: "Området", items: ["Söder om Côte des Blancs", "Sydostvända sluttningar", "Ett av regionens minsta"] },
      { label: "Stilen", items: ["Chardonnay dominerar", "Mogen, fyllig frukt", "Mjuk och tillgänglig"] },
    ],
    body: [
      "Côte de Sézanne fortsätter söderut där Côte des Blancs tar slut.",
      "Sluttningarna vetter mot sydost och området är varmare och soligare än grannen i norr. Chardonnay dominerar även här, men i en mognare och mer fruktdriven tappning.",
      "Utan Grand Cru- eller Premier Cru-byar har området länge levt i skymundan – vilket också gjort det till en av regionens bästa jaktmarker för den som söker kvalitet till rimligt pris.",
    ],
    map: coteDeSezanneMap,
  },
} as const satisfies Record<string, Region>;

export type RegionName = keyof typeof regions;

export function getRegion(name: string | null | undefined): Region | null {
  if (!name) return null;
  return regions[name as RegionName] ?? null;
}
