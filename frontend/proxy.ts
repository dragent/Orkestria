import { NextRequest, NextResponse } from "next/server";
import { getRolesFromJwt, ORKESTRIA_ROLES, postLoginPath } from "@/lib/jwt-roles";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

/** Auth forms: do not send users to "/" when JWT is missing space roles (ROLE_USER only, stale cookie, etc.) */
const AUTH_FORM_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

export function proxy(request: NextRequest) {
  const pathname =
    request.nextUrl.pathname.replace(/\/$/, "") || "/";

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
    pathname.startsWith("/subcontractor") ||
    pathname.startsWith("/dev");

  if (needsRoleGuard) {
    if (!token) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    const roles = getRolesFromJwt(token);
    if (pathname.startsWith("/admin")) {
      const isAdmin = roles.includes("ROLE_ADMIN");
      // ROLE_RH users can access the BTP/RH dashboard without full admin
      const isRhOnBtpPage = roles.includes("ROLE_RH") && pathname.startsWith("/admin/btp-rh");
      if (!isAdmin && !isRhOnBtpPage) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    if (pathname.startsWith("/dev") && !roles.includes("ROLE_DEVELOPER") && !roles.includes("ROLE_ADMIN")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const hasClientAccess =
      roles.includes("ROLE_CLIENT") || roles.some((r) => ORKESTRIA_ROLES.includes(r));
    if (pathname.startsWith("/client") && !hasClientAccess) {
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
    const roles = getRolesFromJwt(token);
    const dest = postLoginPath(roles);
    if (AUTH_FORM_PATHS.has(pathname) && dest === "/") {
      return NextResponse.next();
    }
    // Avoid redirect loop: e.g. ROLE_USER maps to "/", or user already on target public page
    if (dest !== pathname) {
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)"],
};
