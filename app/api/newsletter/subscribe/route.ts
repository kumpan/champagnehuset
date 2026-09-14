import { createHash } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";

// ============================================================================
// Mailchimp newsletter subscribe
// ----------------------------------------------------------------------------
// Upserts the email into a Mailchimp audience via the Marketing API. New members
// are subscribed directly without a confirmation email. Existing members are left
// untouched, so we never force a re-subscribe on someone who unsubscribed.
//
// Required env (see .env.example):
//   MAILCHIMP_API_KEY      e.g. "abc123def456...-us21"
//   MAILCHIMP_AUDIENCE_ID  the audience / list id
//   MAILCHIMP_SERVER_PREFIX (optional) e.g. "us21" — derived from the key if absent
// ============================================================================

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function serverPrefix(apiKey: string): string | null {
  if (process.env.MAILCHIMP_SERVER_PREFIX) return process.env.MAILCHIMP_SERVER_PREFIX;
  const fromKey = apiKey.split("-")[1];
  return fromKey || null;
}

export async function POST(req: NextRequest) {
  try {
    const { email, website, source, page } = await req.json();

    // Honeypot: silently accept bots without hitting Mailchimp.
    if (typeof website === "string" && website.trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const apiKey = process.env.MAILCHIMP_API_KEY;
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
    const dc = apiKey ? serverPrefix(apiKey) : null;

    if (!apiKey || !audienceId || !dc) {
      console.error("Mailchimp env not configured (MAILCHIMP_API_KEY / MAILCHIMP_AUDIENCE_ID).");
      return NextResponse.json({ error: "Newsletter is not configured yet." }, { status: 500 });
    }

    const normalized = email.trim().toLowerCase();
    const subscriberHash = createHash("md5").update(normalized).digest("hex");
    const authHeader = `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`;
    const memberUrl = `https://${dc}.api.mailchimp.com/3.0/lists/${audienceId}/members/${subscriberHash}`;

    // Tags come from an allowlist or a path shape so a client can't invent arbitrary ones
    const SOURCE_TAGS: Record<string, string> = {
      slice: "Slice",
      modal: "Modal",
    };
    const tags: string[] = [];
    if (typeof source === "string" && SOURCE_TAGS[source]) tags.push(SOURCE_TAGS[source]);
    // Mailchimp caps tag names at 100 characters
    if (typeof page === "string" && /^\/\S{0,89}$/.test(page)) tags.push(`Page: ${page}`);

    const res = await fetch(memberUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: authHeader },
      body: JSON.stringify({
        email_address: normalized,
        status_if_new: "subscribed",
      }),
    });

    if (res.ok) {
      // Best-effort additive tag write (its own endpoint, so it never disturbs a
      // returning subscriber's existing tags). A tag failure must not fail signup.
      if (tags.length) {
        await fetch(`${memberUrl}/tags`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: authHeader },
          body: JSON.stringify({ tags: tags.map((name) => ({ name, status: "active" })) }),
        }).catch(() => {});
      }
      return NextResponse.json({ ok: true });
    }

    // Surface Mailchimp's reason server-side; keep the client message generic.
    const data = (await res.json().catch(() => ({}))) as { title?: string; detail?: string };
    console.error("Mailchimp subscribe failed:", res.status, data.title, data.detail);

    // "Member In Compliance State" / forbidden re-subscribe → they must opt back in themselves.
    if (data.title === "Member In Compliance State") {
      return NextResponse.json(
        { error: "This address was unsubscribed. Please re-subscribe from your inbox." },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Could not subscribe right now. Please try again." }, { status: 502 });
  } catch {
    return NextResponse.json({ error: "Failed to process subscription" }, { status: 500 });
  }
}
