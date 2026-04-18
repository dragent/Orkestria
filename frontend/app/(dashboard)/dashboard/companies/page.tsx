"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { companiesApi, usersApi, type Company, type User } from "@/lib/api";
import { useLanguage } from "@/contexts/language-context";
import { FlashBag } from "@/components/FlashBag";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [usersByCompany, setUsersByCompany] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const { t, lang } = useLanguage();
  const tc = t.companies;

  useEffect(() => {
    async function load() {
      try {
        const [fetchedCompanies, users] = await Promise.all([
          companiesApi.list(),
          usersApi.list(),
        ]);

        setCompanies(fetchedCompanies);

        const counts: Record<number, number> = {};
        users.forEach((user: User) => {
          if (user.company) {
            counts[user.company.id] = (counts[user.company.id] ?? 0) + 1;
          }
        });
        setUsersByCompany(counts);
      } catch (err: unknown) {
        const apiError = err as { message?: string };
        setServerError(apiError?.message ?? tc.loadError);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [tc.loadError]);

  const dateLocale = lang === "fr" ? "fr-FR" : "en-GB";

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">{tc.title}</h1>
        <p className="text-slate-500 mt-1">{tc.subtitle}</p>
      </div>

      {serverError && (
        <FlashBag variant="error" message={serverError} />
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {tc.colCompany}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {tc.colSlug}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {tc.colMembers}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {tc.colCreated}
              </th>
              <th className="relative px-6 py-3.5">
                <span className="sr-only">{t.view}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading
              ? [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 rounded bg-slate-100 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : companies.length === 0
              ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                      {tc.noCompanies}
                    </td>
                  </tr>
                )
              : companies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-brand-navy/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-brand-navy">
                            {company.name[0]}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800">{company.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {company.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {usersByCompany[company.id] ?? 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(company.createdAt).toLocaleDateString(dateLocale, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/companies/${company.id}`}
                        className="text-sm font-medium text-brand-purple hover:text-brand-navy transition-colors"
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
