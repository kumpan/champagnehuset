import dynamic from "next/dynamic";

export const components = {
  callout: dynamic(() => import("./Callout")),
  employee: dynamic(() => import("./Employee")),
  faq: dynamic(() => import("./FAQ")),
  hero: dynamic(() => import("./Hero")),
  image_strip: dynamic(() => import("./ImageStrip")),
  link: dynamic(() => import("./Link")),
  process: dynamic(() => import("./Process")),
  stats: dynamic(() => import("./Stats")),
  text: dynamic(() => import("./Text")),
  value: dynamic(() => import("./Value")),
};
