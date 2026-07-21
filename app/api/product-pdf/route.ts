import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { getDocumentByUID, isProduct } from "@/lib/cms";
import { createClient } from "@/prismicio";
import { ProductPdfDocument } from "./document";

export const runtime = "nodejs";

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

  const buffer = await renderToBuffer(createElement(ProductPdfDocument, { product: doc }));
  const filename = `${doc.uid ?? "product"}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
