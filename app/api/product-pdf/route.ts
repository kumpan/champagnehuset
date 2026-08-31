import type { Client, Content, RichTextField } from "@prismicio/client";
import { isFilled } from "@prismicio/client";
import { renderToBuffer } from "@react-pdf/renderer";
import { getDocumentByUID, isProduct } from "@/lib/cms";
import { createClient } from "@/prismicio";
import { ProductPdfDocument } from "./document";

export const runtime = "nodejs";

/**
 * Fetch the linked producer's village and bio for the sheet's "Om producenten"
 * section. The product's producer relationship only carries the name, so the
 * full producer document is fetched by id. Fails soft to an empty object.
 */
async function fetchProducer(
  client: Client,
  producer: Content.ProductDocument["data"]["product_producer"],
): Promise<{ village?: string | null; bio?: RichTextField | null }> {
  if (!isFilled.contentRelationship(producer) || !producer.id) return {};
  try {
    const doc = await client.getByID<Content.ProducerDocument>(producer.id);
    // The About field opens with the producer name as a heading, the sheet prints its own
    const bio = doc.data.producer_about.filter((node) => !node.type.startsWith("heading")) as RichTextField;
    return { village: doc.data.producer_village, bio };
  } catch {
    return {};
  }
}

/**
 * Footer contact lines (phone, address…) for the PDF footer, read from the
 * footer singleton so they stay in sync with the site. Returns [] on any
 * failure so a missing footer never blocks the download.
 */
async function fetchContacts(client: Client, lang?: string): Promise<string[]> {
  try {
    const footer = await client.getSingle<Content.FooterDocument>("footer", lang ? { lang } : undefined);
    const links = footer.data.call_to_action_link;
    const list = Array.isArray(links) ? links : [links];
    return list.flatMap((link) => (isFilled.link(link) && link.text ? [link.text] : []));
  } catch {
    return [];
  }
}

/**
 * Fetch the bottle image server-side and return it as a JPEG data URI, with
 * transparency flattened to white so it sits cleanly on the PDF's white image
 * panel. Returning null (never throwing) keeps a bad image from failing the
 * whole render — the document just shows a placeholder instead.
 */
async function fetchImageDataUri(url: string): Promise<string | null> {
  try {
    const src = new URL(url);
    src.searchParams.delete("auto");
    src.searchParams.set("fm", "jpg");
    src.searchParams.set("q", "90");
    src.searchParams.set("w", "620");
    src.searchParams.set("bg", "ffffff");

    const res = await fetch(src.toString());
    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  const lang = searchParams.get("lang") ?? undefined;

  if (!uid) {
    return new Response("Missing uid", { status: 400 });
  }

  const client = await createClient();
  const doc = await getDocumentByUID(uid, client, lang);

  if (!doc || !isProduct(doc)) {
    return new Response("Product not found", { status: 404 });
  }

  const [imageSrc, contacts, producer] = await Promise.all([
    isFilled.image(doc.data.product_image) ? fetchImageDataUri(doc.data.product_image.url) : null,
    fetchContacts(client, lang),
    fetchProducer(client, doc.data.product_producer),
  ]);

  const buffer = await renderToBuffer(
    ProductPdfDocument({
      product: doc,
      imageSrc,
      contacts,
      producerVillage: producer.village,
      producerBio: producer.bio,
    }),
  );
  const filename = `${doc.uid ?? "product"}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
