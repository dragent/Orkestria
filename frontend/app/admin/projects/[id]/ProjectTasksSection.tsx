"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useEmployeesQuery,
  useTasksQuery,
  useUpdateTaskMutation,
} from "@/lib/hooks/queries";
import type { TaskStatus } from "@/lib/api";

const STATUS_COLORS: Record<TaskStatus, string> = {
  open: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300",
  in_progress: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  done: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300",
};

export function ProjectTasksSection({ projectId }: { projectId: number }) {
  const { t } = useLanguage();
  const tk = t.tasks;
  const { data: tasks, isLoading } = useTasksQuery(projectId);
  const { data: employees } = useEmployeesQuery();
  const createMutation = useCreateTaskMutation(projectId);
  const updateMutation = useUpdateTaskMutation(projectId);
  const deleteMutation = useDeleteTaskMutation(projectId);

  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDue, setNewDue] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [error, setError] = useState<string | null>(null);

  const inputCls =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-brand-purple/50";

  async function handleCreate(ev: React.FormEvent) {
    ev.preventDefault();
    setError(null);
    try {
      await createMutation.mutateAsync({
        title: newTitle,
        description: newDesc || undefined,
        dueDate: newDue ? `${newDue}T00:00:00Z` : null,
        assigneeId: newAssignee ? parseInt(newAssignee) : null,
      });
      setNewTitle("");
      setNewDesc("");
      setNewDue("");
      setNewAssignee("");
      setShowForm(false);
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? t.adminForms.genericError);
    }
  }

  async function handleStatusChange(taskId: number, status: TaskStatus) {
    await updateMutation.mutateAsync({ taskId, body: { status } });
  }

  async function handleDelete(taskId: number) {
    if (!confirm(tk.delete + " ?")) return;
    await deleteMutation.mutateAsync(taskId);
  }

  const statusLabel = (s: TaskStatus) =>
    s === "open" ? tk.statusOpen : s === "in_progress" ? tk.statusInProgress : tk.statusDone;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <h2 className="font-semibold text-[var(--foreground)]">{tk.title}</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="text-sm font-medium text-brand-purple hover:underline"
        >
          {showForm ? "Annuler" : tk.add}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-raised)] space-y-3">
          <input
            className={inputCls}
            placeholder={tk.titleLabel}
            value={newTitle}
            onChange={(ev) => setNewTitle(ev.target.value)}
            required
          />
          <textarea
            className={inputCls}
            rows={2}
            placeholder={tk.description}
            value={newDesc}
            onChange={(ev) => setNewDesc(ev.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              className={inputCls}
              value={newDue}
              onChange={(ev) => setNewDue(ev.target.value)}
            />
            <select className={inputCls} value={newAssignee} onChange={(ev) => setNewAssignee(ev.target.value)}>
              <option value="">{tk.noAssignee}</option>
              {employees?.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>
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
      ) : !tasks?.length ? (
        <p className="px-6 py-6 text-sm text-[var(--muted)]">{tk.none}</p>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {tasks.map((task) => (
            <li key={task.id} className="px-6 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${task.status === "done" ? "line-through text-[var(--muted)]" : "text-[var(--foreground)]"}`}>
                  {task.title}
                </p>
                {task.assignee && (
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {task.assignee.firstName} {task.assignee.lastName}
                  </p>
                )}
                {task.dueDate && (
                  <p className="text-xs text-[var(--muted)]">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <select
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs"
                value={task.status}
                onChange={(ev) => handleStatusChange(task.id, ev.target.value as TaskStatus)}
              >
                <option value="open">{tk.statusOpen}</option>
                <option value="in_progress">{tk.statusInProgress}</option>
                <option value="done">{tk.statusDone}</option>
              </select>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[task.status]}`}>
                {statusLabel(task.status)}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(task.id)}
                className="text-red-400 hover:text-red-600 text-xs transition-colors"
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
