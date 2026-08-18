import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = process.env.PRISMIC_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));

  if (body.secret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("prismic", { expire: 0 });
  revalidateTag("redirects", { expire: 0 });

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
