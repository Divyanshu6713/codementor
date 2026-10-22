import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "cmk_session";

/**
 * Optimistic gate only: sends signed-out visitors to /start (one-click guest start, or sign in).
 * Admin and parent areas go to /login. Real authorization (including roles) happens in every page
 * and route handler.
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.get(SESSION_COOKIE)?.value) {
    const target = request.nextUrl.pathname.startsWith("/app") ? "/start" : "/login";
    const url = new URL(target, request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/parent/:path*", "/admin/:path*", "/onboarding"],
};
