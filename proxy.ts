import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getLocales, getMasterLocale } from "@/lib/locales";
import { getRedirects } from "@/lib/redirects";

// Extension allowlist instead of a blanket dot check: Prismic UIDs may contain
// dots (e.g. /champagner/cl.-de-la-chapelle-brut-instinct) and must still reach
// the locale rewrite below, while real static/metadata files short-circuit.
const STATIC_FILE_RE =
  /\.(?:js|mjs|css|map|json|xml|txt|ico|png|jpg|jpeg|gif|svg|webp|avif|woff|woff2|ttf|otf|eot|webmanifest|pdf|mp4|webm|mp3)$/i;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Request headers, not response headers: `headers()` in a server component
  // reads what came *in*, so anything set on the response is invisible there.
  // Built above the early-return guard so /slice-simulator can still read the
  // path. x-locale is added lower down, once the locale list is known.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/slice-simulator") ||
    pathname.startsWith("/.well-known/") ||
    STATIC_FILE_RE.test(pathname)
  ) {
    return NextResponse.next({ request: { headers: requestHeaders } });
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

  const matched = locales.find((l) => l.id !== master && (pathname.startsWith(`/${l.id}/`) || pathname === `/${l.id}`));

  if (matched) {
    requestHeaders.set("x-locale", matched.id);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("x-locale", matched.id); // debugging / CDN vary
    return response;
  }

  // No locale prefix, so rewrite internally to master locale, URL stays clean.
  // Clone rather than construct, so the search params survive the rewrite —
  // the article listing reads ?page=N server-side.
  requestHeaders.set("x-locale", master);
  const rewritten = request.nextUrl.clone();
  rewritten.pathname = `/${master}${pathname}`;
  const response = NextResponse.rewrite(rewritten, { request: { headers: requestHeaders } });
  response.headers.set("x-locale", master);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg).*)"],
};
