import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Estrai il token dai cookie
  const token = request.cookies.get("access_token")?.value;

  // 2. Ottieni il percorso che l'utente sta cercando di visitare
  const { pathname } = request.nextUrl;

  // 3. Logica di protezione
  // Se l'utente non ha il token e cerca di accedere a una pagina protetta (es. /dashboard)
  if (!token && pathname.startsWith("/dashboard")) {
    // Reindirizza al login aggiungendo la pagina di provenienza come parametro (opzionale)
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  console.log("Middleware eseguito per:", pathname, "Token:", token);

  // 4. Logica inversa (opzionale)
  // Se l'utente HA già il token e prova ad andare al /login, rimandalo in dashboard
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// 5. Il Matcher: definisce su quali rotte deve girare il middleware
export const config = {
  matcher: [
    "/dashboard/:path*", // Protegge /dashboard e tutte le sue sottocartelle
    "/profile/:path*", // Protegge /profile e tutte le sue sottocartelle
    "/login", // Protegge la pagina di login (per evitare che utenti loggati ci accedano)
    "/register", // Protegge la pagina di registrazione (per evitare che utenti loggati ci accedano)
    "/account/:path*", // Protegge /account e tutte le sue sottocartelle
  ],
};
