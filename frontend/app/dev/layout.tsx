"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/language-context";
import { useTheme } from "@/contexts/theme-context";
import { getToken, removeToken } from "@/lib/auth";
import { useMeQuery } from "@/lib/hooks/queries";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function DevLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const notifyAuthChanged = useAuthStore((s) => s.notifyAuthChanged);
  const { data: me, isLoading, isError } = useMeQuery();
  const ready = !isLoading && !!me && !isError;
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    if (isError) {
      removeToken();
      notifyAuthChanged();
      queryClient.clear();
      router.replace("/login");
      return;
    }
  }, [router, isError, notifyAuthChanged, queryClient]);

  function handleLogout() {
    removeToken();
    notifyAuthChanged();
    queryClient.clear();
    router.push("/login");
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="h-8 w-8 rounded-full border-4 border-brand-purple border-t-transparent animate-spin" />
      </div>
    );
  }

  const navItems = [
    { href: "/dev", label: t.nav.dashboard },
    { href: "/dev/tickets", label: t.nav.tickets },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
        <Link href="/dev" className="flex items-center gap-2 shrink-0">
          <img src="/img/logo.png" alt="Orkestria" className="h-7 w-auto dark:invert" />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3 text-sm">
          {navItems.map((item) => {
            const isActive = item.href === "/dev" ? pathname === "/dev" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 ${
                  isActive
                    ? "bg-brand-purple/10 text-brand-purple"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageToggle variant="light" dropdownPosition="down" />
          <button
            type="button"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-md border border-[var(--border)] text-sm shrink-0"
            aria-label="Theme"
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm font-medium text-brand-purple hover:underline"
            aria-label={t.nav.signOut}
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <span className="hidden sm:inline">{t.nav.signOut}</span>
          </button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
