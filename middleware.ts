import { NextRequest, NextResponse } from "next/server";

/**
 * Edge middleware — fast auth gate applied before any route handler.
 *
 * Rejects unauthenticated requests at the Vercel edge without reaching
 * the serverless function. Full JWT verification (via Firebase Admin SDK)
 * still happens inside each API route handler; this is an additional layer.
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Routes that require no authentication token.
  const PUBLIC_PATHS = ["/", "/_next", "/favicon.ico", "/api/auth/session"];
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (isPublic) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("__session")?.value;
  const authHeader = request.headers.get("Authorization");
  const bearerToken =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  // Reject if no token source is present.
  // The token itself is verified inside each API route via Firebase Admin SDK.
  if (!sessionCookie && !bearerToken) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
