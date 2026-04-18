"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usersApi, type User } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import { useLanguage } from "@/contexts/language-context";
import { FlashBag } from "@/components/FlashBag";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const { t, lang } = useLanguage();
  const tu = t.users;

  useEffect(() => {
    usersApi
      .list()
      .then(setUsers)
      .catch((err: { message?: string }) => {
        setServerError(err?.message ?? tu.loadError);
      })
      .finally(() => setLoading(false));
  }, [tu.loadError]);

  const dateLocale = lang === "fr" ? "fr-FR" : "en-GB";

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">{tu.title}</h1>
        <p className="text-slate-500 mt-1">{tu.subtitle}</p>
      </div>

      {serverError && (
        <FlashBag variant="error" message={serverError} />
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {tu.colUser}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {tu.colRole}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {tu.colCompany}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {tu.colStatus}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {tu.colJoined}
              </th>
              <th className="relative px-6 py-3.5">
                <span className="sr-only">{t.view}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 rounded bg-slate-100 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : users.length === 0
              ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                      {tu.noUsers}
                    </td>
                  </tr>
                )
              : users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-linear-to-br from-brand-purple to-brand-blue flex items-center justify-center text-white text-xs font-semibold shrink-0">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.roles.includes("ROLE_ADMIN") ? (
                        <span className="inline-flex items-center rounded-full bg-brand-purple/10 px-2.5 py-0.5 text-xs font-medium text-brand-purple ring-1 ring-brand-purple/20">
                          {t.admin}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                          {t.user}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {user.company ? (
                        <Link
                          href={`/dashboard/companies/${user.company.id}`}
                          className="hover:text-brand-purple transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {user.company.name}
                        </Link>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        active={user.isActive}
                        activeLabel={t.active}
                        inactiveLabel={t.inactive}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString(dateLocale, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/users/${user.id}`}
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
