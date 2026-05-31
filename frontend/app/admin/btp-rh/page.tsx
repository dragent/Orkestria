"use client";

import { useMemo, useState } from "react";
import { FlashBag } from "@/components/FlashBag";
import { useLanguage } from "@/contexts/language-context";
import {
  useBtpKpisQuery,
  useCompaniesQuery,
  useComplianceDeadlinesQuery,
  useCreateComplianceDeadlineMutation,
  useDeleteComplianceDeadlineMutation,
  useUpdateComplianceDeadlineMutation,
} from "@/lib/hooks/queries";
import { downloadPayrollTimeEntriesCsv, type ApiComplianceDeadline, type ComplianceDeadlineCategory, type ProjectPipelineStage } from "@/lib/api";

const PIPELINE_ORDER: ProjectPipelineStage[] = [
  "contact",
  "meeting",
  "engineer_assigned",
  "quote_plan",
  "quote_signed",
  "invoice_sent",
  "deposit_received",
  "design_started",
  "design_completed",
  "client_signed",
  "components_ordered",
  "construction",
  "subcontractors",
  "site_visit",
  "paid",
];

const CATEGORY_VALUES: ComplianceDeadlineCategory[] = ["certification", "insurance", "medical", "other"];

function startOfMonth(d: Date): string {
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  return x.toISOString().slice(0, 10);
}

function endOfMonth(d: Date): string {
  const x = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return x.toISOString().slice(0, 10);
}

export default function AdminBtpRhPage() {
  const { t, lang } = useLanguage();
  const tb = t.btpRh;
  const tp = t.pipeline;

  const [payrollFrom, setPayrollFrom] = useState(() => startOfMonth(new Date()));
  const [payrollTo, setPayrollTo] = useState(() => endOfMonth(new Date()));
  const [payrollCompanyId, setPayrollCompanyId] = useState<string>("");
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [deadlineCompanyId, setDeadlineCompanyId] = useState<string>("");
  const [upcomingOnly, setUpcomingOnly] = useState(true);

  const complianceFilters = useMemo(
    () => ({
      companyId: deadlineCompanyId === "" ? undefined : Number(deadlineCompanyId),
      upcomingDays: upcomingOnly ? 90 : undefined,
    }),
    [deadlineCompanyId, upcomingOnly]
  );

  const { data: kpis, isLoading: kpisLoading, isError: kpisError } = useBtpKpisQuery();
  const { data: companies = [] } = useCompaniesQuery();
  const { data: deadlines = [], isLoading: deadlinesLoading } = useComplianceDeadlinesQuery(complianceFilters);

  const createMut = useCreateComplianceDeadlineMutation();
  const deleteMut = useDeleteComplianceDeadlineMutation();
  const updateMut = useUpdateComplianceDeadlineMutation();

  const [editingDeadline, setEditingDeadline] = useState<ApiComplianceDeadline | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<ComplianceDeadlineCategory>("certification");
  const [editExpires, setEditExpires] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editErr, setEditErr] = useState<string | null>(null);

  function startEdit(d: ApiComplianceDeadline) {
    setEditingDeadline(d);
    setEditTitle(d.title);
    setEditCategory(d.category);
    setEditExpires(d.expiresAt.slice(0, 10));
    setEditNotes(d.notes ?? "");
    setEditErr(null);
  }

  function cancelEdit() {
    setEditingDeadline(null);
    setEditErr(null);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingDeadline) return;
    setEditErr(null);
    try {
      await updateMut.mutateAsync({
        id: editingDeadline.id,
        body: {
          title: editTitle.trim(),
          category: editCategory,
          expiresAt: editExpires,
          notes: editNotes.trim() || null,
        },
      });
      setEditingDeadline(null);
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Error";
      setEditErr(msg);
    }
  }

  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<ComplianceDeadlineCategory>("certification");
  const [formExpires, setFormExpires] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formCompanyId, setFormCompanyId] = useState<string>("");
  const [optionalEmployeeId, setOptionalEmployeeId] = useState("");
  const [optionalProjectId, setOptionalProjectId] = useState("");

  const [formErr, setFormErr] = useState<string | null>(null);

  const dateLocale = lang === "fr" ? "fr-FR" : "en-GB";
  const moneyFmt = useMemo(
    () =>
      new Intl.NumberFormat(dateLocale, {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }),
    [dateLocale]
  );

  function categoryLabel(c: ComplianceDeadlineCategory): string {
    switch (c) {
      case "certification":
        return tb.categoryCertification;
      case "insurance":
        return tb.categoryInsurance;
      case "medical":
        return tb.categoryMedical;
      default:
        return tb.categoryOther;
    }
  }

  async function handleExportCsv() {
    setExportError(null);
    setExportLoading(true);
    try {
      await downloadPayrollTimeEntriesCsv({
        from: payrollFrom,
        to: payrollTo,
        companyId: payrollCompanyId === "" ? undefined : Number(payrollCompanyId),
      });
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Error";
      setExportError(msg);
    } finally {
      setExportLoading(false);
    }
  }

  async function handleAddDeadline(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(null);
    if (formCompanyId === "" || formTitle.trim() === "" || formExpires === "") {
      setFormErr("Required fields missing.");
      return;
    }
    try {
      await createMut.mutateAsync({
        companyId: Number(formCompanyId),
        title: formTitle.trim(),
        category: formCategory,
        expiresAt: formExpires,
        notes: formNotes.trim() || null,
        employeeId: optionalEmployeeId.trim() ? Number(optionalEmployeeId) : null,
        projectId: optionalProjectId.trim() ? Number(optionalProjectId) : null,
      });
      setFormTitle("");
      setFormNotes("");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Error";
      setFormErr(msg);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm(tb.confirmDelete)) return;
    try {
      await deleteMut.mutateAsync(id);
    } catch {
      /* FlashBag could show */
    }
  }

  const loadError = kpisError ? tb.loadError : null;

  return (
    <div className="p-8 space-y-10 max-w-5xl text-[var(--foreground)]">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy dark:text-white">{tb.title}</h1>
        <p className="text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">{tb.subtitle}</p>
      </div>

      {loadError && <FlashBag variant="error" message={loadError} />}
      {exportError && <FlashBag variant="error" message={exportError} />}
      {formErr && <FlashBag variant="error" message={formErr} />}

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
        <h2 className="font-semibold text-brand-navy dark:text-white">{tb.kpisTitle}</h2>
        {kpisLoading || !kpis ? (
          <div className="h-24 rounded-lg bg-[var(--surface-raised)] animate-pulse" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-4">
              <p className="text-sm text-[var(--muted)]">{tb.acceptedQuotes}</p>
              <p className="text-xl font-bold mt-1">{moneyFmt.format(kpis.acceptedQuotesTotalCents / 100)}</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-4">
              <p className="text-sm text-[var(--muted)]">{tb.hoursLast30Days}</p>
              <p className="text-xl font-bold mt-1">{kpis.timeEntriesTotalHoursLast30Days}</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-4">
              <p className="text-sm text-[var(--muted)]">{tb.actualLaborCost}</p>
              <p className="text-xl font-bold mt-1">{moneyFmt.format(kpis.actualLaborCostCents / 100)}</p>
            </div>
            <div className={`rounded-lg border p-4 ${kpis.marginCents >= 0 ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20" : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20"}`}>
              <p className="text-sm text-[var(--muted)]">{tb.margin}</p>
              <p className={`text-xl font-bold mt-1 ${kpis.marginCents >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                {moneyFmt.format(kpis.marginCents / 100)}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-4">
              <p className="text-sm text-[var(--muted)]">{tb.complianceDue30Days}</p>
              <p className="text-xl font-bold mt-1">{kpis.complianceDeadlinesDueNext30Days}</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-4">
              <p className="text-sm text-[var(--muted)]">{tb.pendingLeaves}</p>
              <p className={`text-xl font-bold mt-1 ${kpis.pendingLeavesCount > 0 ? "text-yellow-600 dark:text-yellow-400" : ""}`}>
                {kpis.pendingLeavesCount}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-4 sm:col-span-2">
              <p className="text-sm text-[var(--muted)] mb-2">{tb.projectsByStage}</p>
              <ul className="flex flex-wrap gap-2 text-sm">
                {PIPELINE_ORDER.map((key) => (
                  <li
                    key={key}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-[var(--foreground)]"
                  >
                    <span className="text-[var(--muted)]">{tp[key]}:</span>{" "}
                    <span className="font-medium">{kpis.projectsByPipelineStage[key] ?? 0}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
        <h2 className="font-semibold text-brand-navy dark:text-white">{tb.payrollTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm">
            <span className="text-[var(--muted)]">{tb.from}</span>
            <input
              type="date"
              value={payrollFrom}
              onChange={(e) => setPayrollFrom(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted)]">{tb.to}</span>
            <input
              type="date"
              value={payrollTo}
              onChange={(e) => setPayrollTo(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-[var(--muted)]">{tb.companyFilter}</span>
            <select
              value={payrollCompanyId}
              onChange={(e) => setPayrollCompanyId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
            >
              <option value="">{tb.allCompanies}</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          onClick={() => void handleExportCsv()}
          disabled={exportLoading}
          className="rounded-lg bg-brand-purple px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {exportLoading ? tb.downloading : tb.downloadCsv}
        </button>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-brand-navy dark:text-white">{tb.deadlinesTitle}</h2>
          <div className="flex flex-wrap gap-3 items-center text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <select
                value={deadlineCompanyId}
                onChange={(e) => setDeadlineCompanyId(e.target.value)}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-[var(--foreground)]"
              >
                <option value="">{tb.allCompanies}</option>
                {companies.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-[var(--muted)]">
              <input type="checkbox" checked={upcomingOnly} onChange={(e) => setUpcomingOnly(e.target.checked)} />
              {tb.filterUpcoming}
            </label>
          </div>
        </div>

        {deadlinesLoading ? (
          <div className="h-32 rounded-lg bg-[var(--surface-raised)] animate-pulse" />
        ) : deadlines.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{tb.noDeadlines}</p>
        ) : (
          <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] overflow-hidden">
            {deadlines.map((d) => (
              <li key={d.id} className="bg-[var(--surface-raised)]">
                {editingDeadline?.id === d.id ? (
                  <form onSubmit={(e) => void handleUpdate(e)} className="p-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block text-sm sm:col-span-2">
                        <span className="text-[var(--muted)]">{tb.titleLabel}</span>
                        <input
                          required
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="text-[var(--muted)]">{tb.categoryLabel}</span>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value as ComplianceDeadlineCategory)}
                          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                        >
                          {CATEGORY_VALUES.map((c) => (
                            <option key={c} value={c}>{categoryLabel(c)}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-sm">
                        <span className="text-[var(--muted)]">{tb.expiresLabel}</span>
                        <input
                          required
                          type="date"
                          value={editExpires}
                          onChange={(e) => setEditExpires(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                        />
                      </label>
                      <label className="block text-sm sm:col-span-2">
                        <span className="text-[var(--muted)]">{tb.notesLabel}</span>
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          rows={2}
                          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                        />
                      </label>
                    </div>
                    {editErr && <p className="text-xs text-red-500">{editErr}</p>}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={updateMut.isPending}
                        className="rounded-lg bg-brand-navy dark:bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                      >
                        {updateMut.isPending ? tb.updating : tb.updateDeadline}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface)]"
                      >
                        {tb.cancelEdit}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{d.title}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {categoryLabel(d.category)} · {d.company.name} ·{" "}
                        {new Date(d.expiresAt).toLocaleDateString(dateLocale)}
                      </p>
                      {d.notes && <p className="text-sm text-[var(--muted)] mt-1">{d.notes}</p>}
                    </div>
                    <div className="flex gap-3 self-start sm:self-center">
                      <button
                        type="button"
                        onClick={() => startEdit(d)}
                        className="text-sm text-brand-purple hover:underline"
                      >
                        {tb.editDeadline}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(d.id)}
                        className="text-sm text-red-600 dark:text-red-400 hover:underline"
                      >
                        {tb.delete}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={(e) => void handleAddDeadline(e)} className="space-y-4 border-t border-[var(--border)] pt-6">
          <h3 className="text-sm font-medium">{tb.addDeadline}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-[var(--muted)]">{tb.companyLabel} *</span>
              <select
                required
                value={formCompanyId}
                onChange={(e) => setFormCompanyId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
              >
                <option value="">—</option>
                {companies.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-[var(--muted)]">{tb.categoryLabel}</span>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as ComplianceDeadlineCategory)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
              >
                {CATEGORY_VALUES.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabel(c)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-[var(--muted)]">{tb.titleLabel} *</span>
              <input
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--muted)]">{tb.expiresLabel} *</span>
              <input
                required
                type="date"
                value={formExpires}
                onChange={(e) => setFormExpires(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-[var(--muted)]">{tb.notesLabel}</span>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--muted)]">{tb.optionalEmployeeId}</span>
              <input
                value={optionalEmployeeId}
                onChange={(e) => setOptionalEmployeeId(e.target.value)}
                inputMode="numeric"
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--muted)]">{tb.optionalProjectId}</span>
              <input
                value={optionalProjectId}
                onChange={(e) => setOptionalProjectId(e.target.value)}
                inputMode="numeric"
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={createMut.isPending}
            className="rounded-lg bg-brand-navy dark:bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {createMut.isPending ? tb.saving : tb.save}
          </button>
        </form>
      </section>
    </div>
  );
}
