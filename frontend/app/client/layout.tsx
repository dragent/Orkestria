"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/language-context";
import { useTheme } from "@/contexts/theme-context";
import { getToken, removeToken } from "@/lib/auth";
import { useMeQuery } from "@/lib/hooks/queries";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const notifyAuthChanged = useAuthStore((s) => s.notifyAuthChanged);
  const [ready, setReady] = useState(false);
  const { data: me, isLoading, isError } = useMeQuery();
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
    if (!isLoading && me) {
      setReady(true);
    }
  }, [router, isError, isLoading, me, notifyAuthChanged, queryClient]);

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

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/client" className="flex items-center gap-2">
          <img src="/img/logo.png" alt="Orkestria" className="h-7 w-auto dark:invert" />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle variant="light" dropdownPosition="down" />
          <button
            type="button"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-md border border-[var(--border)] text-sm"
            aria-label="Theme"
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-medium text-brand-purple hover:underline"
          >
            {t.nav.signOut}
          </button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
