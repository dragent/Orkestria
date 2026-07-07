"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FlashBag } from "@/components/FlashBag";
import StatusBadge from "@/components/StatusBadge";
import { useLanguage } from "@/contexts/language-context";
import { useCompanyQuery, useUsersQuery } from "@/lib/hooks/queries";
import type { User } from "@/lib/api";

export default function AdminCompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const companyId = Number(id);
  const { data: company, isLoading, isError, error } = useCompanyQuery(
    Number.isFinite(companyId) ? companyId : undefined
  );
  const { data: allUsers = [] } = useUsersQuery();
  const { t, lang } = useLanguage();
  const tcd = t.companyDetail;

  const members = company ? allUsers.filter((u: User) => u.company?.id === company.id) : [];
  const serverError = isError ? ((error as { message?: string })?.message ?? tcd.loadError) : null;
  const dateLocale = lang === "fr" ? "fr-FR" : "en-GB";

  if (!Number.isFinite(companyId)) {
    return null;
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/companies"
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400 hover:text-brand-navy dark:hover:text-white transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {tcd.backLabel}
        </Link>
        {company && (
          <Link
            href={`/admin/companies/${company.id}/edit`}
            className="inline-flex justify-center rounded-lg border border-slate-300 dark:border-zinc-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800"
          >
            {t.adminForms.edit}
          </Link>
        )}
      </div>

      {serverError && <FlashBag variant="error" message={serverError} />}

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-16 rounded-xl bg-slate-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-40 rounded-xl bg-slate-100 dark:bg-zinc-800 animate-pulse" />
        </div>
      ) : company ? (
        <>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-brand-navy/10 dark:bg-white/10 flex items-center justify-center text-brand-navy dark:text-white text-2xl font-bold shrink-0">
              {company.name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-navy dark:text-white">{company.name}</h1>
              <code className="text-sm text-slate-400 dark:text-zinc-500">{company.slug}</code>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wide">{tcd.companyId}</p>
              <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-zinc-100">#{company.id}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wide">{tcd.slug}</p>
              <code className="mt-1 block text-sm text-slate-800 dark:text-zinc-100">{company.slug}</code>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wide">{tcd.created}</p>
              <p className="mt-1 text-sm text-slate-800 dark:text-zinc-100">
                {new Date(company.createdAt).toLocaleDateString(dateLocale, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wide">{tcd.members}</p>
              <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-zinc-100">{members.length}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wide">{tcd.activeMembers}</p>
              <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-zinc-100">
                {members.filter((m) => m.isActive).length}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-700">
              <h2 className="font-semibold text-brand-navy dark:text-white">{tcd.membersTitle}</h2>
            </div>

            {members.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-slate-400 dark:text-zinc-500">{tcd.noMembers}</p>
            ) : (
              <table className="min-w-full divide-y divide-slate-100 dark:divide-zinc-700">
                <thead className="bg-slate-50 dark:bg-zinc-800/80">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                      {tcd.colUser}
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                      {tcd.colRole}
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                      {tcd.colStatus}
                    </th>
                    <th className="relative px-6 py-3.5">
                      <span className="sr-only">{t.view}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-700">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-linear-to-br from-brand-purple to-brand-blue flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {member.firstName[0]}
                            {member.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-zinc-100">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-zinc-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {member.roles.includes("ROLE_ADMIN") ? (
                          <span className="inline-flex items-center rounded-full bg-brand-purple/10 px-2.5 py-0.5 text-xs font-medium text-brand-purple ring-1 ring-brand-purple/20">
                            {t.admin}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-zinc-300 ring-1 ring-slate-200 dark:ring-zinc-600">
                            {t.user}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          active={member.isActive}
                          activeLabel={t.active}
                          inactiveLabel={t.inactive}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/users/${member.id}`}
                          className="text-sm font-medium text-brand-purple hover:text-brand-navy dark:hover:text-white transition-colors"
                        >
                          {t.view}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
