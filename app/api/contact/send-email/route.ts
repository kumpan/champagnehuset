import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fieldLabels, hasConsent, ...fields } = body;

    if (!hasConsent) {
      return NextResponse.json({ error: "Consent is required" }, { status: 400 });
    }

    // TODO: wire up the email provider for Champagnehuset (Resend recommended).
    // Inbox: info@champagnehuset.se

    console.log("Form submission:", { fields, fieldLabels });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to process form submission" }, { status: 500 });
  }
}
