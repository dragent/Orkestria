/**
 * Decode JWT payload only (no signature verification). Used for redirects and
 * route hints; the API remains the source of truth for authorization.
 * Pure Web APIs so it works in Edge proxy without extra bundles.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=".repeat(4 - pad);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getRolesFromJwt(token: string): string[] {
  try {
    const payload = decodeJwtPayload(token);
    if (!payload) return [];
    const roles = payload.roles;
    if (Array.isArray(roles)) {
      return roles.filter((r): r is string => typeof r === "string");
    }
    return [];
  } catch {
    return [];
  }
}

export const ORKESTRIA_ROLES = ["ROLE_ADMIN", "ROLE_RH", "ROLE_ENGINEER", "ROLE_DEVELOPER", "ROLE_WORKFORCE"];

export function postLoginPath(roles: string[]): string {
  if (roles.includes("ROLE_ADMIN")) return "/admin";
  if (roles.includes("ROLE_DEVELOPER")) return "/dev";
  // Pure ROLE_RH users go to their dedicated BTP/RH dashboard (not the full admin)
  if (roles.includes("ROLE_RH")) return "/admin/btp-rh";
  if (roles.some((r) => ORKESTRIA_ROLES.includes(r))) return "/admin";
  if (roles.some((r) => r.startsWith("ROLE_SUBCONTRACTOR"))) return "/subcontractor";
  if (roles.includes("ROLE_CLIENT")) return "/client";
  return "/";
}
