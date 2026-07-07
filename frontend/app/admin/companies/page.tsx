"use client";

import Link from "next/link";
import { FlashBag } from "@/components/FlashBag";
import { useLanguage } from "@/contexts/language-context";
import { useCompaniesQuery, useUsersQuery } from "@/lib/hooks/queries";
import type { User } from "@/lib/api";

export default function AdminCompaniesPage() {
  const { data: companies = [], isLoading: loadingCompanies, isError: companiesError, error: companiesErr } =
    useCompaniesQuery();
  const { data: users = [] } = useUsersQuery();
  const { t, lang } = useLanguage();
  const tc = t.companies;

  const usersByCompany: Record<number, number> = {};
  users.forEach((user: User) => {
    if (user.company) {
      usersByCompany[user.company.id] = (usersByCompany[user.company.id] ?? 0) + 1;
    }
  });

  const serverError = companiesError
    ? ((companiesErr as { message?: string })?.message ?? tc.loadError)
    : null;
  const dateLocale = lang === "fr" ? "fr-FR" : "en-GB";

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy dark:text-white">{tc.title}</h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1">{tc.subtitle}</p>
        </div>
        <Link
          href="/admin/companies/new"
          className="inline-flex justify-center rounded-lg bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-navy"
        >
          {t.adminForms.addCompany}
        </Link>
      </div>

      {serverError && <FlashBag variant="error" message={serverError} />}

      <div className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-zinc-700">
          <thead className="bg-slate-50 dark:bg-zinc-800/80">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                {tc.colCompany}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                {tc.colSlug}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                {tc.colMembers}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                {tc.colCreated}
              </th>
              <th className="relative px-6 py-3.5">
                <span className="sr-only">{t.view}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-700">
            {loadingCompanies
              ? [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 rounded bg-slate-100 dark:bg-zinc-800 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : companies.length === 0
                ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 dark:text-zinc-500">
                        {tc.noCompanies}
                      </td>
                    </tr>
                  )
                : companies.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-brand-navy/10 dark:bg-white/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-brand-navy dark:text-white">{company.name[0]}</span>
                          </div>
                          <p className="text-sm font-medium text-slate-800 dark:text-zinc-100">{company.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-2 py-1 rounded">
                          {company.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-zinc-300">
                        {usersByCompany[company.id] ?? 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 dark:text-zinc-500">
                        {new Date(company.createdAt).toLocaleDateString(dateLocale, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/companies/${company.id}`}
                          className="text-sm font-medium text-brand-purple hover:text-brand-navy dark:hover:text-white transition-colors"
                        >
                          {t.view}
                        </Link>
                      </td>
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
