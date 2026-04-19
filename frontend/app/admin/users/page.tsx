"use client";

import Link from "next/link";
import { FlashBag } from "@/components/FlashBag";
import StatusBadge from "@/components/StatusBadge";
import { useLanguage } from "@/contexts/language-context";
import { useUsersQuery } from "@/lib/hooks/queries";

export default function AdminUsersPage() {
  const { data: users = [], isLoading: loading, isError, error } = useUsersQuery();
  const { t, lang } = useLanguage();
  const tu = t.users;

  const serverError = isError ? ((error as { message?: string })?.message ?? tu.loadError) : null;
  const dateLocale = lang === "fr" ? "fr-FR" : "en-GB";

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy dark:text-white">{tu.title}</h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1">{tu.subtitle}</p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex justify-center rounded-lg bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-navy"
        >
          {t.adminForms.addUser}
        </Link>
      </div>

      {serverError && <FlashBag variant="error" message={serverError} />}

      <div className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-zinc-700">
          <thead className="bg-slate-50 dark:bg-zinc-800/80">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                {tu.colUser}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                {tu.colRole}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                {tu.colCompany}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                {tu.colStatus}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                {tu.colJoined}
              </th>
              <th className="relative px-6 py-3.5">
                <span className="sr-only">{t.view}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-700">
            {loading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 rounded bg-slate-100 dark:bg-zinc-800 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : users.length === 0
                ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400 dark:text-zinc-500">
                        {tu.noUsers}
                      </td>
                    </tr>
                  )
                : users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-linear-to-br from-brand-purple to-brand-blue flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-zinc-100">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-zinc-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.roles.includes("ROLE_ADMIN") ? (
                          <span className="inline-flex items-center rounded-full bg-brand-purple/10 px-2.5 py-0.5 text-xs font-medium text-brand-purple ring-1 ring-brand-purple/20">
                            {t.admin}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-zinc-300 ring-1 ring-slate-200 dark:ring-zinc-600">
                            {t.user}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-zinc-300">
                        {user.company ? (
                          <Link
                            href={`/admin/companies/${user.company.id}`}
                            className="hover:text-brand-purple transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {user.company.name}
                          </Link>
                        ) : (
                          <span className="text-slate-400 dark:text-zinc-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          active={user.isActive}
                          activeLabel={t.active}
                          inactiveLabel={t.inactive}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 dark:text-zinc-500">
                        {new Date(user.createdAt).toLocaleDateString(dateLocale, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/users/${user.id}`}
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
