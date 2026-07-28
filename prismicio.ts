import { createClient as baseCreateClient, type ClientConfig, type Route } from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";
import { cache } from "react";
import sm from "./slicemachine.config.json";

export const repositoryName = sm.repositoryName;

function buildRoutes(masterLocale: string): Route[] {
  return [
    // Master locale: prefix-free URLs (no /sv-se)
    { type: "page", uid: "home", lang: masterLocale, path: "/" },
    {
      type: "page",
      lang: masterLocale,
      resolvers: { parent: "parent", grandparent: "parent.parent" },
      path: "/:grandparent?/:parent?/:uid",
    },
    {
      type: "article",
      lang: masterLocale,
      resolvers: { parent: "parent", grandparent: "parent.parent" },
      path: "/:grandparent?/:parent?/:uid",
    },
    {
      type: "product",
      lang: masterLocale,
      resolvers: { parent: "parent", grandparent: "parent.parent" },
      path: "/:grandparent?/:parent?/:uid",
    },
    {
      type: "producer",
      lang: masterLocale,
      resolvers: { parent: "parent", grandparent: "parent.parent" },
      path: "/:grandparent?/:parent?/:uid",
    },
    // All other locales: lang-prefixed URLs (/en-us, /fr-fr, /fi-fi)
    { type: "page", uid: "home", path: "/:lang" },
    {
      type: "page",
      resolvers: { parent: "parent", grandparent: "parent.parent" },
      path: "/:lang/:grandparent?/:parent?/:uid",
    },
    {
      type: "article",
      resolvers: { parent: "parent", grandparent: "parent.parent" },
      path: "/:lang/:grandparent?/:parent?/:uid",
    },
    {
      type: "product",
      resolvers: { parent: "parent", grandparent: "parent.parent" },
      path: "/:lang/:grandparent?/:parent?/:uid",
    },
    {
      type: "producer",
      resolvers: { parent: "parent", grandparent: "parent.parent" },
      path: "/:lang/:grandparent?/:parent?/:uid",
    },
  ];
}

/** Minimal client without locale routes. Used by lib/locales.ts to avoid a circular dependency. */
export function createBaseClient(config: ClientConfig = {}) {
  return baseCreateClient(repositoryName, {
    fetchOptions:
      process.env.NODE_ENV === "production"
        ? { next: { tags: ["prismic"] }, cache: "force-cache" }
        : { next: { revalidate: 5 } },
    ...config,
  });
}

// Request-scoped cache so master locale is fetched at most once per request
const fetchMasterLocale = cache(async () => {
  const client = createBaseClient();
  const repo = await client.getRepository();
  return repo.languages.find((l) => l.is_master)?.id ?? "sv-se";
});

export async function createClient(config: ClientConfig = {}, options?: { withAutoPreviews?: boolean }) {
  const masterLocale = await fetchMasterLocale();

  const client = baseCreateClient(repositoryName, {
    routes: buildRoutes(masterLocale),
    fetchOptions:
      process.env.NODE_ENV === "production"
        ? { next: { tags: ["prismic"] }, cache: "force-cache" }
        : { next: { revalidate: 5 } },
    ...config,
  });

  if (options?.withAutoPreviews !== false) {
    enableAutoPreviews({ client });
  }

  return client;
}
