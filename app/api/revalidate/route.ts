import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  if (body.secret !== process.env.PRISMIC_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("prismic", "max");
  revalidateTag("redirects", "max");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
