import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Logica di protezione (Redirect se NON c'è il token)
  // Escludiamo esplicitamente /login e /register per evitare loop infiniti
  if (!token && pathname !== "/login" && pathname !== "/register") {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  console.log("Middleware eseguito per: ", pathname, " con Token: ", token);

  // 2. Logica inversa (Redirect se il token C'È già)
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// 3. Il Matcher
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/account/:path*",
    "/login",
    "/register",
  ],
};
