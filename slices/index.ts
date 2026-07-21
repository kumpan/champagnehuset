import dynamic from "next/dynamic";

export const components = {
  article: dynamic(() => import("./Article")),
  callout: dynamic(() => import("./Callout")),
  contact: dynamic(() => import("./Contact")),
  faq: dynamic(() => import("./FAQ")),
  footer: dynamic(() => import("./Footer")),
  hero: dynamic(() => import("./Hero")),
  image: dynamic(() => import("./Image")),
  link: dynamic(() => import("./Link")),
  product: dynamic(() => import("./Product")),
  product_detail: dynamic(() => import("./ProductDetail")),
  text: dynamic(() => import("./Text")),
  value: dynamic(() => import("./Value")),
};
