"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { useCompaniesQuery, useCreateEmployeeMutation, useUsersQuery } from "@/lib/hooks/queries";

export default function NewEmployeePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const e = t.employees;

  const { data: companies } = useCompaniesQuery();
  const { data: users } = useUsersQuery();
  const createMutation = useCreateEmployeeMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [companyId, setCompanyId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setError(null);

    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await createMutation.mutateAsync({
        firstName,
        lastName,
        role,
        skills,
        dailyRateCents: dailyRate !== "" ? Math.round(parseFloat(dailyRate) * 100) : null,
        companyId: companyId !== "" ? parseInt(companyId) : null,
        userId: userId !== "" ? parseInt(userId) : null,
      });
      router.push("/admin/employees");
    } catch (err: unknown) {
      const e2 = err as { message?: string };
      setError(e2.message ?? t.adminForms.genericError);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-brand-purple/50";

  return (
    <div className="p-6 sm:p-8 max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/employees" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
          ← {e.back}
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-[var(--foreground)]">{e.newTitle}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[var(--foreground)]">{e.firstName}</label>
            <input className={inputCls} value={firstName} onChange={(ev) => setFirstName(ev.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[var(--foreground)]">{e.lastName}</label>
            <input className={inputCls} value={lastName} onChange={(ev) => setLastName(ev.target.value)} required />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--foreground)]">{e.role}</label>
          <input className={inputCls} value={role} onChange={(ev) => setRole(ev.target.value)} required />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--foreground)]">{e.skills}</label>
          <input
            className={inputCls}
            placeholder={e.skillsPlaceholder}
            value={skillsInput}
            onChange={(ev) => setSkillsInput(ev.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--foreground)]">{e.dailyRate}</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputCls}
            value={dailyRate}
            onChange={(ev) => setDailyRate(ev.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--foreground)]">{t.adminForms.companyAssignment}</label>
          <select className={inputCls} value={companyId} onChange={(ev) => setCompanyId(ev.target.value)}>
            <option value="">{t.adminForms.noCompanyOption}</option>
            {companies?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--foreground)]">{e.linkedUser}</label>
          <select className={inputCls} value={userId} onChange={(ev) => setUserId(ev.target.value)}>
            <option value="">—</option>
            {users?.map((u) => (
              <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
            ))}
          </select>
        </div>

        {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full rounded-lg bg-brand-purple px-4 py-2 text-sm font-medium text-white hover:bg-brand-purple/90 disabled:opacity-60 transition-colors"
        >
          {createMutation.isPending ? e.saving : e.save}
        </button>
      </form>
    </div>
  );
}
