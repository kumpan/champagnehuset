import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getLocales, getMasterLocale } from "@/lib/locales";
import { getRedirects } from "@/lib/redirects";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/slice-simulator") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const redirects = await getRedirects();
  const match = redirects[pathname];
  if (match) {
    return NextResponse.redirect(new URL(match.destination, request.url), match.statusCode);
  }

  const [locales, master] = await Promise.all([getLocales(), getMasterLocale()]);

  // Redirect explicit master locale prefix to clean URL, e.g. /sv-se/about to /about.
  // Cloning keeps the query string (?page=2 and friends) — building a fresh URL
  // from the pathname alone would silently drop it.
  if (pathname.startsWith(`/${master}/`) || pathname === `/${master}`) {
    const clean = request.nextUrl.clone();
    clean.pathname = pathname.slice(master.length + 1) || "/";
    return NextResponse.redirect(clean, 301);
  }

  const hasNonMasterLocale = locales
    .filter((l) => l.id !== master)
    .some((l) => pathname.startsWith(`/${l.id}/`) || pathname === `/${l.id}`);

  if (hasNonMasterLocale) {
    const matched = locales.find((l) => pathname.startsWith(`/${l.id}/`) || pathname === `/${l.id}`);
    const response = NextResponse.next();
    response.headers.set("x-locale", matched?.id ?? master);
    return response;
  }

  // No locale prefix, so rewrite internally to master locale, URL stays clean.
  // Clone rather than construct, so the search params survive the rewrite —
  // the article listing reads ?page=N server-side.
  const rewritten = request.nextUrl.clone();
  rewritten.pathname = `/${master}${pathname}`;
  const response = NextResponse.rewrite(rewritten);
  response.headers.set("x-locale", master);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg).*)"],
};
