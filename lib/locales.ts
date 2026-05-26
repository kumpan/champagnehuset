import { createBaseClient } from "@/prismicio";

export async function getLocales() {
  const client = createBaseClient();
  const repo = await client.getRepository();
  return repo.languages;
}

export async function getMasterLocale(): Promise<string> {
  const locales = await getLocales();
  return locales.find((l) => l.is_master)?.id ?? "sv-se";
}
