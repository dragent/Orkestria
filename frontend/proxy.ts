import { decodeJwt } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { postLoginPath } from "@/lib/jwt-roles";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

function parseRoles(token: string): string[] {
  try {
    const payload = decodeJwt(token);
    const raw = payload.roles;
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw.filter((r): r is string => typeof r === "string");
  } catch {
    return [];
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/img/") ||
    pathname === "/favicon.ico" ||
    /\.(ico|png|jpg|jpeg|svg|webp|gif|woff2?)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const target = pathname.replace(/^\/dashboard/, "/admin") || "/admin";
    return NextResponse.redirect(new URL(target, request.url));
  }

  const isPublic = PUBLIC_PATHS.has(pathname);
  const token = request.cookies.get("orkestria_token")?.value;

  const needsRoleGuard =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/client") ||
    pathname.startsWith("/subcontractor");

  if (needsRoleGuard) {
    if (!token) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    const roles = parseRoles(token);
    if (pathname.startsWith("/admin") && !roles.includes("ROLE_ADMIN")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (pathname.startsWith("/client") && !roles.includes("ROLE_CLIENT")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (pathname.startsWith("/subcontractor") && !roles.includes("ROLE_SUBCONTRACTOR")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isPublic) {
    const roles = parseRoles(token);
    return NextResponse.redirect(new URL(postLoginPath(roles), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)"],
};
