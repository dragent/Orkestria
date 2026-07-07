/**
 * Next.js instrumentation entry point.
 *
 * To enable Sentry monitoring:
 *   1. npm install @sentry/nextjs
 *   2. Set NEXT_PUBLIC_SENTRY_DSN in .env.local
 *   3. Replace the body of `register()` with the init calls from @sentry/wizard
 */

export async function register() {
  // No-op until @sentry/nextjs is installed and NEXT_PUBLIC_SENTRY_DSN is set.
}
