import type { NextConfig } from "next";

/**
 * BACKEND_URL is a server-only variable (no NEXT_PUBLIC_ prefix):
 *   - local dev: http://localhost:8080  (default)
 *   - Docker:    http://nginx           (set via docker-compose BACKEND_URL)
 *
 * All /api/** and /auth/** requests from the browser are proxied through
 * the Next.js server, so no CORS headers are ever needed.
 */
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/auth/:path*",
        destination: `${BACKEND_URL}/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
