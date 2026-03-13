import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LOCALES = ["tr", "en"] as const;
const DEFAULT_LOCALE = "tr";

function getLocaleFromPathname(pathname: string): string | null {
  const segment = pathname.split("/")[1];
  return (SUPPORTED_LOCALES as readonly string[]).includes(segment) ? segment : null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const localeInPath = getLocaleFromPathname(pathname);

  if (!localeInPath) {
    // Redirect root or unlocalized paths to the default locale
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/(tr|en)/:path*", "/((?!_next|api|favicon|.*\\..*).*)"],
};
