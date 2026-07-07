"use client";

import { useMemo, useState } from "react";
import { FlashBag } from "@/components/FlashBag";
import { useLanguage } from "@/contexts/language-context";
import {
  useApproveLeave,
  useCompaniesQuery,
  useCreateLeaveMutation,
  useDeleteLeaveMutation,
  useEmployeesQuery,
  useLeavesQuery,
  useRejectLeave,
} from "@/lib/hooks/queries";
import type { ApiLeave, LeaveStatus, LeaveType } from "@/lib/api";
import { LEAVE_TYPES, LEAVE_STATUSES } from "@/lib/api";

const STATUS_COLORS: Record<LeaveStatus, string> = {
  pending:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  approved:  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  cancelled: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const CALENDAR_COLORS: Record<LeaveStatus, string> = {
  pending:   "bg-yellow-200 dark:bg-yellow-800/60 text-yellow-900 dark:text-yellow-100",
  approved:  "bg-green-200 dark:bg-green-800/60 text-green-900 dark:text-green-100",
  rejected:  "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-200 opacity-50",
  cancelled: "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 opacity-40",
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function AdminLeavesPage() {
  const { t, lang } = useLanguage();
  const tl = t.leaves;
  const dateLocale = lang === "fr" ? "fr-FR" : "en-GB";

  // --- Filters ---
  const [filterStatus, setFilterStatus]     = useState<LeaveStatus | "">("");
  const [filterType, setFilterType]         = useState<LeaveType | "">("");
  const [filterCompanyId, setFilterCompanyId] = useState<string>("");
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>("");

  // --- Calendar state ---
  const today = new Date();
  const [calYear, setCalYear]   = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [activeTab, setActiveTab] = useState<"list" | "calendar">("list");

  const filters = useMemo(
    () => ({
      status:     filterStatus     !== "" ? filterStatus     : undefined,
      type:       filterType       !== "" ? filterType       : undefined,
      companyId:  filterCompanyId  !== "" ? Number(filterCompanyId)  : undefined,
      employeeId: filterEmployeeId !== "" ? Number(filterEmployeeId) : undefined,
    }),
    [filterStatus, filterType, filterCompanyId, filterEmployeeId]
  );

  const { data: leaves = [], isLoading, isError } = useLeavesQuery(filters);
  const { data: employees = [] } = useEmployeesQuery();
  const { data: companies = [] }  = useCompaniesQuery();

  const createMut  = useCreateLeaveMutation();
  const approveMut = useApproveLeave();
  const rejectMut  = useRejectLeave();
  const deleteMut  = useDeleteLeaveMutation();

  // Form state
  const [formEmployeeId, setFormEmployeeId] = useState("");
  const [formType, setFormType]             = useState<LeaveType>("paid_vacation");
  const [formStarts, setFormStarts]         = useState("");
  const [formEnds, setFormEnds]             = useState("");
  const [formReason, setFormReason]         = useState("");
  const [formErr, setFormErr]               = useState<string | null>(null);

  function typeLabel(type: LeaveType): string {
    const map: Record<LeaveType, string> = {
      paid_vacation: tl.typePaidVacation,
      rtt:           tl.typeRtt,
      sick:          tl.typeSick,
      training:      tl.typeTraining,
      other:         tl.typeOther,
    };
    return map[type] ?? type;
  }

  function statusLabel(status: LeaveStatus): string {
    const map: Record<LeaveStatus, string> = {
      pending:   tl.statusPending,
      approved:  tl.statusApproved,
      rejected:  tl.statusRejected,
      cancelled: tl.statusCancelled,
    };
    return map[status] ?? status;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(null);
    if (!formEmployeeId || !formStarts || !formEnds) {
      setFormErr("Required fields missing.");
      return;
    }
    if (formStarts > formEnds) {
      setFormErr(lang === "fr" ? "La date de début doit être avant la date de fin." : "Start date must be before end date.");
      return;
    }
    try {
      await createMut.mutateAsync({
        employeeId: Number(formEmployeeId),
        type: formType,
        startsAt: formStarts,
        endsAt: formEnds,
        reason: formReason.trim() || null,
      });
      setFormStarts("");
      setFormEnds("");
      setFormReason("");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Error";
      setFormErr(msg);
    }
  }

  async function handleApprove(leave: ApiLeave) {
    if (!window.confirm(tl.confirmApprove)) return;
    try { await approveMut.mutateAsync(leave.id); } catch { /* ignore */ }
  }

  async function handleReject(leave: ApiLeave) {
    if (!window.confirm(tl.confirmReject)) return;
    try { await rejectMut.mutateAsync(leave.id); } catch { /* ignore */ }
  }

  async function handleDelete(id: number) {
    if (!window.confirm(tl.confirmDelete)) return;
    try { await deleteMut.mutateAsync(id); } catch { /* ignore */ }
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(dateLocale);
  }

  // Calendar helpers — use all leaves (no filter) for the calendar view
  const calFilters = useMemo(() => ({ companyId: filterCompanyId !== "" ? Number(filterCompanyId) : undefined }), [filterCompanyId]);
  const { data: allLeaves = [] } = useLeavesQuery(calFilters);

  const daysInMonth   = getDaysInMonth(calYear, calMonth);
  const firstDayOfWeek = (new Date(calYear, calMonth, 1).getDay() + 6) % 7; // Mon=0
  const monthName = new Date(calYear, calMonth, 1).toLocaleString(dateLocale, { month: "long", year: "numeric" });

  function leavesOnDay(day: number): ApiLeave[] {
    const d = isoDate(calYear, calMonth, day);
    return allLeaves.filter(
      (l) => l.status !== "rejected" && l.status !== "cancelled" && l.startsAt <= d && l.endsAt >= d
    );
  }

  function calcWorkingDays(start: string, end: string): number {
    let count = 0;
    const cur = new Date(start);
    const e   = new Date(end);
    while (cur <= e) {
      const dow = cur.getDay();
      if (dow !== 0 && dow !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }

  // Pending count badge
  const pendingCount = leaves.filter((l) => l.status === "pending").length;

  return (
    <div className="p-8 space-y-8 max-w-5xl text-[var(--foreground)]">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-brand-navy dark:text-white">{tl.title}</h1>
          {pendingCount > 0 && (
            <span className="rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-bold text-white">
              {pendingCount}
            </span>
          )}
        </div>
        <p className="text-slate-500 dark:text-zinc-400 max-w-2xl">{tl.subtitle}</p>
      </div>

      {isError && <FlashBag variant="error" message={tl.loadError} />}
      {formErr  && <FlashBag variant="error" message={formErr} />}

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filterCompanyId}
          onChange={(e) => setFilterCompanyId(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
        >
          <option value="">{tl.allCompanies}</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filterEmployeeId}
          onChange={(e) => setFilterEmployeeId(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
        >
          <option value="">{tl.allEmployees}</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as LeaveStatus | "")}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
        >
          <option value="">{tl.allStatuses}</option>
          {LEAVE_STATUSES.map((s) => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as LeaveType | "")}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
        >
          <option value="">{tl.allTypes}</option>
          {LEAVE_TYPES.map((tp) => (
            <option key={tp} value={tp}>{typeLabel(tp)}</option>
          ))}
        </select>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 w-fit">
        {(["list", "calendar"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-brand-navy text-white dark:bg-zinc-700"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab === "list" ? tl.viewList : tl.viewCalendar}
          </button>
        ))}
      </div>

      {/* LIST VIEW */}
      {activeTab === "list" && (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          {isLoading ? (
            <div className="h-40 animate-pulse bg-[var(--surface-raised)]" />
          ) : leaves.length === 0 ? (
            <p className="p-6 text-sm text-[var(--muted)]">{tl.noLeaves}</p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {leaves.map((leave) => {
                const emp = leave.employee;
                const empName = emp ? `${emp.firstName} ${emp.lastName}` : "—";

                return (
                  <li key={leave.id} className="p-4 bg-[var(--surface-raised)] flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-[var(--foreground)]">{empName}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[leave.status]}`}>
                          {statusLabel(leave.status)}
                        </span>
                        <span className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-0.5 text-xs text-[var(--muted)]">
                          {typeLabel(leave.type)}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--muted)]">
                        {formatDate(leave.startsAt)} → {formatDate(leave.endsAt)}
                        {" "}·{" "}{leave.workingDays} {tl.workingDays}
                      </p>
                      {leave.reason && (
                        <p className="text-sm text-[var(--foreground)] italic">{leave.reason}</p>
                      )}
                      {leave.approvedBy && leave.approvedAt && (
                        <p className="text-xs text-[var(--muted)]">
                          {tl.approvedBy} {leave.approvedBy.firstName} {leave.approvedBy.lastName}{" "}
                          {tl.approvedAt} {formatDate(leave.approvedAt)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0 self-start sm:self-center">
                      {leave.status === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => void handleApprove(leave)}
                            disabled={approveMut.isPending}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            {tl.approve}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleReject(leave)}
                            disabled={rejectMut.isPending}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {tl.reject}
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleDelete(leave.id)}
                        disabled={deleteMut.isPending}
                        className="rounded-lg border border-red-300 dark:border-red-800 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
                      >
                        {tl.delete}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* CALENDAR VIEW */}
      {activeTab === "calendar" && (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
                else setCalMonth((m) => m - 1);
              }}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-raised)]"
            >
              ←
            </button>
            <span className="font-semibold capitalize text-[var(--foreground)]">{monthName}</span>
            <button
              type="button"
              onClick={() => {
                if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
                else setCalMonth((m) => m + 1);
              }}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-raised)]"
            >
              →
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px text-center text-xs font-medium text-[var(--muted)]">
            {(lang === "fr"
              ? ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
              : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            ).map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-[var(--border)] rounded-lg overflow-hidden">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-[var(--surface)] min-h-[72px]" />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dayLeaves = leavesOnDay(day);
              const isToday =
                calYear === today.getFullYear() &&
                calMonth === today.getMonth() &&
                day === today.getDate();

              return (
                <div
                  key={day}
                  className="bg-[var(--surface)] min-h-[72px] p-1 space-y-1"
                >
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                      isToday
                        ? "bg-brand-purple text-white"
                        : "text-[var(--foreground)]"
                    }`}
                  >
                    {day}
                  </span>
                  {dayLeaves.map((l) => (
                    <div
                      key={l.id}
                      className={`truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight ${CALENDAR_COLORS[l.status]}`}
                      title={`${l.employee?.firstName ?? ""} ${l.employee?.lastName ?? ""} — ${typeLabel(l.type)}`}
                    >
                      {l.employee?.firstName ?? "?"} {l.employee?.lastName?.charAt(0) ?? ""}.
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 pt-2 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-yellow-200 dark:bg-yellow-800/60" />
              {tl.statusPending}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-green-200 dark:bg-green-800/60" />
              {tl.statusApproved}
            </span>
          </div>
        </section>
      )}

      {/* Create form */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
        <h2 className="font-semibold text-brand-navy dark:text-white">{tl.addLeave}</h2>
        <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="text-[var(--muted)]">{tl.employeeLabel} *</span>
              <select
                required
                value={formEmployeeId}
                onChange={(e) => setFormEmployeeId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
              >
                <option value="">—</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.role})
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="text-[var(--muted)]">{tl.typeLabel}</span>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as LeaveType)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
              >
                {LEAVE_TYPES.map((tp) => (
                  <option key={tp} value={tp}>{typeLabel(tp)}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm" />

            <label className="block text-sm">
              <span className="text-[var(--muted)]">{tl.startsLabel} *</span>
              <input
                required
                type="date"
                value={formStarts}
                onChange={(e) => setFormStarts(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
              />
            </label>

            <label className="block text-sm">
              <span className="text-[var(--muted)]">{tl.endsLabel} *</span>
              <input
                required
                type="date"
                value={formEnds}
                min={formStarts || undefined}
                onChange={(e) => setFormEnds(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
              />
            </label>

            <label className="block text-sm sm:col-span-2">
              <span className="text-[var(--muted)]">{tl.reasonLabel}</span>
              <textarea
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
              />
            </label>
          </div>

          {formStarts && formEnds && formStarts <= formEnds && (
            <p className="text-sm text-[var(--muted)]">
              {calcWorkingDays(formStarts, formEnds)} {tl.workingDays}
            </p>
          )}

          <button
            type="submit"
            disabled={createMut.isPending}
            className="rounded-lg bg-brand-navy dark:bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {createMut.isPending ? tl.saving : tl.save}
          </button>
        </form>
      </section>
    </div>
  );
}
