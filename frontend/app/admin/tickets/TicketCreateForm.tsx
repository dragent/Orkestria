"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useCreateTicketMutation } from "@/lib/hooks/queries";
import {
  TICKET_PRIORITIES,
  TICKET_TYPES,
  type ApiEmployee,
  type ApiProject,
  type TicketPriority,
  type TicketType,
} from "@/lib/api";

type Props = {
  onClose: () => void;
  projects: ApiProject[];
  employees: ApiEmployee[];
};

export default function TicketCreateForm({ onClose, projects, employees }: Props) {
  const { t } = useLanguage();
  const tk = t.tickets;
  const createMutation = useCreateTicketMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TicketType>("task");
  const [priority, setPriority] = useState<TicketPriority>("normal");
  const [projectId, setProjectId] = useState<string>("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const inputCls =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-brand-purple/50";

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setError(null);
    try {
      await createMutation.mutateAsync({
        title,
        description,
        type,
        priority,
        projectId: projectId ? Number(projectId) : null,
        assigneeId: assigneeId ? Number(assigneeId) : null,
      });
      onClose();
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "Error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
      <h2 className="text-sm font-semibold text-[var(--foreground)]">{tk.add}</h2>
      <input
        className={inputCls}
        placeholder={tk.titleLabel}
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
        required
      />
      <textarea
        className={inputCls}
        rows={4}
        placeholder={tk.description}
        value={description}
        onChange={(ev) => setDescription(ev.target.value)}
        required
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <select className={inputCls} value={type} onChange={(ev) => setType(ev.target.value as TicketType)}>
          {TICKET_TYPES.map((ty) => (
            <option key={ty} value={ty}>{ty}</option>
          ))}
        </select>
        <select className={inputCls} value={priority} onChange={(ev) => setPriority(ev.target.value as TicketPriority)}>
          {TICKET_PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select className={inputCls} value={projectId} onChange={(ev) => setProjectId(ev.target.value)}>
          <option value="">{tk.noProject}</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <select className={inputCls} value={assigneeId} onChange={(ev) => setAssigneeId(ev.target.value)}>
          <option value="">{tk.noAssignee}</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm">
          {tk.cancel}
        </button>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-lg bg-brand-purple px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {createMutation.isPending ? tk.saving : tk.save}
        </button>
      </div>
    </form>
  );
}
