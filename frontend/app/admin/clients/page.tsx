"use client";

import Link from "next/link";
import { FlashBag } from "@/components/FlashBag";
import { useLanguage } from "@/contexts/language-context";
import { useClientsQuery } from "@/lib/hooks/queries";

export default function AdminClientsPage() {
  const { data: clients = [], isLoading, isError, error } = useClientsQuery();
  const { t } = useLanguage();
  const tc = t.clients;
  const serverError = isError ? ((error as { message?: string })?.message ?? tc.loadError) : null;

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy dark:text-white">{tc.title}</h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1">{tc.subtitle}</p>
        </div>
        <Link
          href="/admin/clients/new"
          className="inline-flex justify-center rounded-lg bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-navy"
        >
          {tc.add}
        </Link>
      </div>
      {serverError && <FlashBag variant="error" message={serverError} />}
      <div className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-zinc-700">
          <thead className="bg-slate-50 dark:bg-zinc-800/80">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                {tc.colName}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                {tc.colEmail}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                {tc.colCompany}
              </th>
              <th className="relative px-6 py-3.5">
                <span className="sr-only">{t.view}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-700">
            {isLoading
              ? [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(4)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 rounded bg-slate-100 dark:bg-zinc-800 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : clients.length === 0
                ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400 dark:text-zinc-500">
                        {tc.none}
                      </td>
                    </tr>
                  )
                : clients.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-zinc-100">{c.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-zinc-300">{c.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <Link href={`/admin/companies/${c.company.id}`} className="text-brand-purple hover:underline">
                          {c.company.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/clients/${c.id}`}
                          className="text-sm font-medium text-brand-purple hover:text-brand-navy dark:hover:text-white"
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
