"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import {
  useCreateTimeEntryMutation,
  useDeleteTimeEntryMutation,
  useEmployeesQuery,
  useTimeEntriesQuery,
} from "@/lib/hooks/queries";
import type { TimeEntryHourType } from "@/lib/api";

const HOUR_TYPES: TimeEntryHourType[] = ["regular", "night", "weekend", "travel", "on_call"];

export function ProjectTimeEntrySection({ projectId }: { projectId: number }) {
  const { t } = useLanguage();
  const tk = t.timeTracking;

  const { data: entries, isLoading } = useTimeEntriesQuery(projectId);
  const { data: employees } = useEmployeesQuery();
  const createMutation = useCreateTimeEntryMutation(projectId);
  const deleteMutation = useDeleteTimeEntryMutation(projectId);

  const [showForm, setShowForm] = useState(false);
  const [empId, setEmpId] = useState("");
  const [hours, setHours] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [desc, setDesc] = useState("");
  const [hourType, setHourType] = useState<TimeEntryHourType>("regular");
  const [error, setError] = useState<string | null>(null);

  const inputCls =
    "w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--foreground) placeholder-(--muted) focus:outline-none focus:ring-2 focus:ring-brand-purple/50";

  const hourTypeLabel = (ht: TimeEntryHourType) => {
    switch (ht) {
      case "regular": return tk.hourTypeRegular;
      case "night": return tk.hourTypeNight;
      case "weekend": return tk.hourTypeWeekend;
      case "travel": return tk.hourTypeTravel;
      case "on_call": return tk.hourTypeOnCall;
    }
  };

  const hourTypeBadge = (ht: TimeEntryHourType) => {
    switch (ht) {
      case "night": return "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300";
      case "weekend": return "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300";
      case "travel": return "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300";
      case "on_call": return "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300";
      default: return "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300";
    }
  };

  const totalHours = entries
    ? entries.reduce((sum, e) => sum + parseFloat(e.hours), 0).toFixed(1)
    : "0";

  async function handleCreate(ev: React.FormEvent) {
    ev.preventDefault();
    setError(null);
    if (!empId || !hours || !date) return;
    try {
      await createMutation.mutateAsync({
        employeeId: parseInt(empId),
        hours: parseFloat(hours),
        date,
        description: desc.trim() || undefined,
        hourType,
      });
      setEmpId("");
      setHours("");
      setDesc("");
      setHourType("regular");
      setDate(new Date().toISOString().slice(0, 10));
      setShowForm(false);
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? t.adminForms.genericError);
    }
  }

  async function handleDelete(entryId: number) {
    if (!confirm(tk.delete + " ?")) return;
    await deleteMutation.mutateAsync(entryId);
  }

  return (
    <div className="rounded-xl border border-(--border) bg-(--surface) overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-(--border)">
        <div>
          <h2 className="font-semibold text-(--foreground)">{tk.title}</h2>
          {entries && entries.length > 0 && (
            <p className="text-xs text-(--muted) mt-0.5">
              {tk.totalHours}: <span className="font-medium text-(--foreground)">{totalHours}h</span>
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="text-sm font-medium text-brand-purple hover:underline"
        >
          {showForm ? t.tickets.cancel : tk.add}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="px-6 py-4 border-b border-(--border) bg-(--surface-raised) space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select
              className={inputCls}
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              required
            >
              <option value="">{tk.employee}</option>
              {employees?.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
            <select
              className={inputCls}
              value={hourType}
              onChange={(e) => setHourType(e.target.value as TimeEntryHourType)}
            >
              {HOUR_TYPES.map((ht) => (
                <option key={ht} value={ht}>
                  {hourTypeLabel(ht)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              className={inputCls}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <input
              type="number"
              min="0.25"
              max="24"
              step="0.25"
              placeholder={tk.hours}
              className={inputCls}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
            />
          </div>
          <input
            className={inputCls}
            placeholder={tk.description}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-lg bg-brand-purple px-4 py-2 text-sm font-medium text-white hover:bg-brand-purple/90 disabled:opacity-60 transition-colors"
          >
            {createMutation.isPending ? tk.saving : tk.save}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="p-6 flex justify-center">
          <div className="h-6 w-6 rounded-full border-4 border-brand-purple border-t-transparent animate-spin" />
        </div>
      ) : !entries?.length ? (
        <p className="px-6 py-6 text-sm text-(--muted)">{tk.none}</p>
      ) : (
        <ul className="divide-y divide-(--border)">
          {entries.map((entry) => (
            <li key={entry.id} className="px-6 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-(--foreground)">
                  {entry.employee.firstName} {entry.employee.lastName}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-(--muted)">
                    {new Date(entry.date).toLocaleDateString()} · <strong>{entry.hours}h</strong>
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${hourTypeBadge(entry.hourType)}`}>
                    {hourTypeLabel(entry.hourType)}
                  </span>
                </div>
                {entry.description && (
                  <p className="text-xs text-(--muted) mt-0.5 truncate">{entry.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(entry.id)}
                className="text-red-400 hover:text-red-600 text-xs transition-colors shrink-0"
              >
                {tk.delete}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
