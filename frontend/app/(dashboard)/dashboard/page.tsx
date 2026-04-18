"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usersApi, companiesApi, type User, type Company } from "@/lib/api";
import { useLanguage } from "@/contexts/language-context";
import { FlashBag } from "@/components/FlashBag";

type Stats = {
  totalUsers: number;
  activeUsers: number;
  totalCompanies: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const { t, lang } = useLanguage();
  const td = t.dashboard;

  useEffect(() => {
    async function load() {
      try {
        const [users, fetchedCompanies] = await Promise.all([
          usersApi.list(),
          companiesApi.list(),
        ]);

        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((u) => u.isActive).length,
          totalCompanies: fetchedCompanies.length,
        });

        const sorted = [...users].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentUsers(sorted.slice(0, 5));
        setCompanies(fetchedCompanies);
      } catch {
        setServerError(td.loadError);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [td.loadError]);

  const dateLocale = lang === "fr" ? "fr-FR" : "en-GB";

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy dark:text-white">{td.title}</h1>
        <p className="text-slate-500 dark:text-zinc-400 mt-1">{td.subtitle}</p>
      </div>

      {serverError && (
        <FlashBag variant="error" message={serverError} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          label={td.totalUsers}
          value={stats?.totalUsers}
          loading={loading}
          icon={
            <svg className="h-6 w-6 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
          href="/dashboard/users"
        />
        <StatCard
          label={td.activeUsers}
          value={stats?.activeUsers}
          loading={loading}
          icon={
            <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label={td.companies}
          value={stats?.totalCompanies}
          loading={loading}
          icon={
            <svg className="h-6 w-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          }
          href="/dashboard/companies"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent users */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-700">
            <h2 className="font-semibold text-brand-navy dark:text-white">{td.recentUsers}</h2>
            <Link
              href="/dashboard/users"
              className="text-sm text-brand-purple hover:text-brand-navy dark:hover:text-white font-medium transition-colors"
            >
              {td.viewAll}
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : recentUsers.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-400 dark:text-zinc-500 text-center">{td.noUsers}</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-zinc-700">
              {recentUsers.map((user) => (
                <li key={user.id}>
                  <Link
                    href={`/dashboard/users/${user.id}`}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-linear-to-br from-brand-purple to-brand-blue flex items-center justify-center text-white text-xs font-semibold shrink-0">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-zinc-100">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-zinc-500">
                      {new Date(user.createdAt).toLocaleDateString(dateLocale, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Companies */}
        <div className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-700">
            <h2 className="font-semibold text-brand-navy dark:text-white">{td.companies}</h2>
            <Link
              href="/dashboard/companies"
              className="text-sm text-brand-purple hover:text-brand-navy dark:hover:text-white font-medium transition-colors"
            >
              {td.viewAll}
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : companies.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-400 dark:text-zinc-500 text-center">{td.noCompanies}</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-zinc-700">
              {companies.map((company) => (
                <li key={company.id}>
                  <Link
                    href={`/dashboard/companies/${company.id}`}
                    className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg bg-brand-navy/10 dark:bg-white/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-brand-navy dark:text-white">
                        {company.name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-zinc-100">{company.name}</p>
                      <p className="text-xs text-slate-400 dark:text-zinc-500">{company.slug}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
  icon,
  href,
}: {
  label: string;
  value?: number;
  loading: boolean;
  icon: React.ReactNode;
  href?: string;
}) {
  const content = (
    <div className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-6 py-5 flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-zinc-400">{label}</p>
        {loading ? (
          <div className="mt-1 h-7 w-12 rounded bg-slate-100 dark:bg-zinc-700 animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-brand-navy dark:text-white">{value ?? "—"}</p>
        )}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block hover:opacity-80 transition-opacity">
      {content}
    </Link>
  ) : (
    content
  );
}
