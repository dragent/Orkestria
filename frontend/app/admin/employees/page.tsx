"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { useDeleteEmployeeMutation, useEmployeesQuery } from "@/lib/hooks/queries";

export default function EmployeesPage() {
  const { t } = useLanguage();
  const e = t.employees;
  const { data: employees, isLoading, isError } = useEmployeesQuery();
  const deleteMutation = useDeleteEmployeeMutation();

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{e.title}</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{e.subtitle}</p>
        </div>
        <Link
          href="/admin/employees/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-purple px-4 py-2 text-sm font-medium text-white hover:bg-brand-purple/90 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {e.add}
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 rounded-full border-4 border-brand-purple border-t-transparent animate-spin" />
        </div>
      )}

      {isError && (
        <p className="text-red-600 dark:text-red-400 text-sm">{e.loadError}</p>
      )}

      {!isLoading && !isError && employees && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="px-4 py-3 font-medium text-[var(--muted)]">{e.colName}</th>
                <th className="px-4 py-3 font-medium text-[var(--muted)]">{e.colRole}</th>
                <th className="px-4 py-3 font-medium text-[var(--muted)] hidden md:table-cell">{e.colCompany}</th>
                <th className="px-4 py-3 font-medium text-[var(--muted)] hidden lg:table-cell">{e.colSkills}</th>
                <th className="px-4 py-3 font-medium text-[var(--muted)] text-right hidden sm:table-cell">{e.colRate}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[var(--muted)]">{e.none}</td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-raised)] transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">{emp.role}</td>
                    <td className="px-4 py-3 text-[var(--muted)] hidden md:table-cell">{emp.company?.name ?? "—"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {emp.skills.slice(0, 3).map((s) => (
                          <span key={s} className="inline-flex items-center rounded-full bg-brand-purple/10 px-2 py-0.5 text-xs font-medium text-brand-purple">
                            {s}
                          </span>
                        ))}
                        {emp.skills.length > 3 && (
                          <span className="text-xs text-[var(--muted)]">+{emp.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--muted)] hidden sm:table-cell">
                      {emp.dailyRateCents != null ? `${(emp.dailyRateCents / 100).toFixed(0)} €` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/employees/${emp.id}`}
                        className="text-brand-purple hover:underline text-sm font-medium"
                      >
                        {t.view}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
