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

  // Redirect explicit master locale prefix to clean URL — /sv-se/about → /about
  if (pathname.startsWith(`/${master}/`) || pathname === `/${master}`) {
    const clean = pathname.slice(master.length + 1) || "/";
    return NextResponse.redirect(new URL(clean, request.url), 301);
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

  // No locale prefix — rewrite internally to master locale, URL stays clean
  const response = NextResponse.rewrite(new URL(`/${master}${pathname}`, request.url));
  response.headers.set("x-locale", master);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg).*)"],
};
