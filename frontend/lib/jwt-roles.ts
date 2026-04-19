import { decodeJwt } from "jose";

export function getRolesFromJwt(token: string): string[] {
  try {
    const payload = decodeJwt(token);
    const roles = payload.roles;
    if (Array.isArray(roles)) {
      return roles.filter((r): r is string => typeof r === "string");
    }
    return [];
  } catch {
    return [];
  }
}

export function postLoginPath(roles: string[]): string {
  if (roles.includes("ROLE_ADMIN")) return "/admin";
  if (roles.includes("ROLE_CLIENT")) return "/client";
  if (roles.includes("ROLE_SUBCONTRACTOR")) return "/subcontractor";
  return "/";
}
