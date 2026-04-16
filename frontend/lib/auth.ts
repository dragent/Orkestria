const TOKEN_COOKIE = "orkestria_token";

export function setToken(token: string): void {
  const expires = new Date();
  expires.setDate(expires.getDate() + 1);
  document.cookie = `${TOKEN_COOKIE}=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
}

export function removeToken(): void {
  document.cookie = `${TOKEN_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
