import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === "/reset_password") {
    const hasUid = searchParams.has("uid");
    const hasToken = searchParams.has("token");

    if (!hasUid || !hasToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (
    !token &&
    pathname !== "/login" &&
    pathname !== "/register" &&
    pathname !== "/forgot_password" &&
    pathname !== "/reset_password"
  ) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  if (
    token &&
    (pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/forgot_password" ||
      pathname === "/reset_password")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/account/:path*",
    "/login",
    "/register",
    "/forgot_password",
    "/reset_password",
  ],
};
