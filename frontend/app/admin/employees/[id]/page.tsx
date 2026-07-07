"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import {
  useApproveLeave,
  useCompaniesQuery,
  useCreateLeaveMutation,
  useDeleteEmployeeMutation,
  useDeleteLeaveMutation,
  useEmployeeQuery,
  useLeavesQuery,
  useRejectLeave,
  useUpdateEmployeeMutation,
  useUsersQuery,
} from "@/lib/hooks/queries";
import type { LeaveType } from "@/lib/api";
import { LEAVE_TYPES } from "@/lib/api";

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const employeeId = parseInt(id);
  const router = useRouter();
  const { t } = useLanguage();
  const e = t.employees;

  const { data: employee, isLoading, isError } = useEmployeeQuery(employeeId);
  const { data: companies } = useCompaniesQuery();
  const { data: users } = useUsersQuery();
  const updateMutation = useUpdateEmployeeMutation(employeeId);
  const deleteMutation = useDeleteEmployeeMutation();

  // Leave management for this employee
  const { data: employeeLeaves = [] } = useLeavesQuery({ employeeId });
  const createLeaveMut  = useCreateLeaveMutation();
  const approveLeaveMut = useApproveLeave();
  const rejectLeaveMut  = useRejectLeave();
  const deleteLeaveMut  = useDeleteLeaveMutation();

  const [leaveType, setLeaveType]     = useState<LeaveType>("paid_vacation");
  const [leaveStarts, setLeaveStarts] = useState("");
  const [leaveEnds, setLeaveEnds]     = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveErr, setLeaveErr]       = useState<string | null>(null);

  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [skillsInput, setSkillsInput] = useState<string | null>(null);
  const [dailyRate, setDailyRate] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputCls =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-brand-purple/50";

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!employee) return;
    setError(null);
    setSuccess(false);

    const skillsRaw = skillsInput ?? `${employee.skills.join(", ")}`;
    const skills = skillsRaw.split(",").map((s) => s.trim()).filter(Boolean);

    const rateStr = dailyRate ?? (employee.dailyRateCents != null ? String(employee.dailyRateCents / 100) : "");
    const cIdStr = companyId ?? String(employee.company?.id ?? "");
    const uIdStr = userId ?? String(employee.user?.id ?? "");

    try {
      await updateMutation.mutateAsync({
        firstName: firstName ?? employee.firstName,
        lastName: lastName ?? employee.lastName,
        role: role ?? employee.role,
        skills,
        dailyRateCents: rateStr !== "" ? Math.round(parseFloat(rateStr) * 100) : null,
        companyId: cIdStr !== "" ? parseInt(cIdStr) : null,
        userId: uIdStr !== "" ? parseInt(uIdStr) : null,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const e2 = err as { message?: string };
      setError(e2.message ?? t.adminForms.genericError);
    }
  }

  async function handleDelete() {
    if (!confirm("Supprimer cet employé ?")) return;
    await deleteMutation.mutateAsync(employeeId);
    router.push("/admin/employees");
  }

  async function handleAddLeave(ev: React.FormEvent) {
    ev.preventDefault();
    setLeaveErr(null);
    if (!leaveStarts || !leaveEnds) return;
    try {
      await createLeaveMut.mutateAsync({
        employeeId,
        type: leaveType,
        startsAt: leaveStarts,
        endsAt: leaveEnds,
        reason: leaveReason.trim() || null,
      });
      setLeaveStarts("");
      setLeaveEnds("");
      setLeaveReason("");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Error";
      setLeaveErr(msg);
    }
  }

  function leaveTypeLabel(type: LeaveType): string {
    const { leaves: tl } = t;
    const map: Record<LeaveType, string> = {
      paid_vacation: tl.typePaidVacation,
      rtt: tl.typeRtt,
      sick: tl.typeSick,
      training: tl.typeTraining,
      other: tl.typeOther,
    };
    return map[type] ?? type;
  }

  const STATUS_BADGE: Record<string, string> = {
    pending:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    approved:  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    rejected:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    cancelled: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 rounded-full border-4 border-brand-purple border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !employee) {
    return <p className="p-8 text-red-600 dark:text-red-400">{e.loadError}</p>;
  }

  return (
    <div className="p-6 sm:p-8 max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin/employees" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm">
          ← {e.back}
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
        >
          {t.tasks?.delete ?? "Supprimer"}
        </button>
      </div>

      <h1 className="text-2xl font-bold text-[var(--foreground)]">
        {employee.firstName} {employee.lastName}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[var(--foreground)]">{e.firstName}</label>
            <input
              className={inputCls}
              value={firstName ?? employee.firstName}
              onChange={(ev) => setFirstName(ev.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[var(--foreground)]">{e.lastName}</label>
            <input
              className={inputCls}
              value={lastName ?? employee.lastName}
              onChange={(ev) => setLastName(ev.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--foreground)]">{e.role}</label>
          <input
            className={inputCls}
            value={role ?? employee.role}
            onChange={(ev) => setRole(ev.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--foreground)]">{e.skills}</label>
          <input
            className={inputCls}
            placeholder={e.skillsPlaceholder}
            value={skillsInput ?? employee.skills.join(", ")}
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
            value={dailyRate ?? (employee.dailyRateCents != null ? (employee.dailyRateCents / 100).toFixed(2) : "")}
            onChange={(ev) => setDailyRate(ev.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--foreground)]">{t.adminForms.companyAssignment}</label>
          <select
            className={inputCls}
            value={companyId ?? String(employee.company?.id ?? "")}
            onChange={(ev) => setCompanyId(ev.target.value)}
          >
            <option value="">{t.adminForms.noCompanyOption}</option>
            {companies?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--foreground)]">{e.linkedUser}</label>
          <select
            className={inputCls}
            value={userId ?? String(employee.user?.id ?? "")}
            onChange={(ev) => setUserId(ev.target.value)}
          >
            <option value="">—</option>
            {users?.map((u) => (
              <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
            ))}
          </select>
        </div>

        {success && <p className="text-green-600 dark:text-green-400 text-sm">{t.adminForms.changesSaved}</p>}
        {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full rounded-lg bg-brand-purple px-4 py-2 text-sm font-medium text-white hover:bg-brand-purple/90 disabled:opacity-60 transition-colors"
        >
          {updateMutation.isPending ? e.saving : e.save}
        </button>
      </form>

      {/* ── Absences section ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{t.leaves.title}</h2>

        {leaveErr && <p className="text-sm text-red-600 dark:text-red-400">{leaveErr}</p>}

        {employeeLeaves.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{t.leaves.noLeaves}</p>
        ) : (
          <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden">
            {employeeLeaves.map((lv) => (
              <li key={lv.id} className="flex items-center justify-between gap-3 p-3 bg-[var(--surface-raised)] text-sm">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[lv.status] ?? ""}`}>
                      {t.leaves[`status${lv.status.charAt(0).toUpperCase()}${lv.status.slice(1)}` as keyof typeof t.leaves] as string}
                    </span>
                    <span className="text-[var(--muted)] text-xs">{leaveTypeLabel(lv.type)}</span>
                  </div>
                  <p className="text-[var(--muted)] text-xs">
                    {new Date(lv.startsAt).toLocaleDateString()} → {new Date(lv.endsAt).toLocaleDateString()}
                    {" "}· {lv.workingDays} {t.leaves.workingDays}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {lv.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => void approveLeaveMut.mutateAsync(lv.id)}
                        className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                      >
                        {t.leaves.approve}
                      </button>
                      <button
                        type="button"
                        onClick={() => void rejectLeaveMut.mutateAsync(lv.id)}
                        className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                      >
                        {t.leaves.reject}
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => void deleteLeaveMut.mutateAsync(lv.id)}
                    className="rounded border border-red-300 dark:border-red-800 px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    {t.leaves.delete}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={(ev) => void handleAddLeave(ev)} className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="text-sm font-medium text-[var(--foreground)]">{t.leaves.addLeave}</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs col-span-2">
              <span className="text-[var(--muted)]">{t.leaves.typeLabel}</span>
              <select
                value={leaveType}
                onChange={(ev) => setLeaveType(ev.target.value as LeaveType)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm text-[var(--foreground)]"
              >
                {LEAVE_TYPES.map((tp) => (
                  <option key={tp} value={tp}>{leaveTypeLabel(tp)}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs">
              <span className="text-[var(--muted)]">{t.leaves.startsLabel} *</span>
              <input
                required
                type="date"
                value={leaveStarts}
                onChange={(ev) => setLeaveStarts(ev.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm text-[var(--foreground)]"
              />
            </label>
            <label className="block text-xs">
              <span className="text-[var(--muted)]">{t.leaves.endsLabel} *</span>
              <input
                required
                type="date"
                value={leaveEnds}
                min={leaveStarts || undefined}
                onChange={(ev) => setLeaveEnds(ev.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm text-[var(--foreground)]"
              />
            </label>
            <label className="block text-xs col-span-2">
              <span className="text-[var(--muted)]">{t.leaves.reasonLabel}</span>
              <input
                value={leaveReason}
                onChange={(ev) => setLeaveReason(ev.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm text-[var(--foreground)]"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={createLeaveMut.isPending}
            className="rounded-lg bg-brand-navy dark:bg-zinc-700 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {createLeaveMut.isPending ? t.leaves.saving : t.leaves.save}
          </button>
        </form>
      </section>
    </div>
  );
}
