"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import {
  useAddTicketCommentMutation,
  useDeleteTicketMutation,
  useEmployeesQuery,
  useTicketCommentsQuery,
  useTicketQuery,
  useUpdateTicketMutation,
} from "@/lib/hooks/queries";
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TICKET_TYPES,
  type TicketPriority,
  type TicketStatus,
  type TicketType,
} from "@/lib/api";
import { PriorityBadge, SourceBadge, StatusBadge, TypeBadge } from "./TicketBadges";

type Props = {
  ticketId: number;
  canEdit?: boolean;
  canDelete?: boolean;
  onDeleted?: () => void;
};

export default function TicketDetail({ ticketId, canEdit = true, canDelete = false, onDeleted }: Props) {
  const { t } = useLanguage();
  const tk = t.tickets;
  const { data: ticket, isLoading, isError } = useTicketQuery(ticketId);
  const { data: employees } = useEmployeesQuery();
  const { data: comments } = useTicketCommentsQuery(ticketId);
  const updateMutation = useUpdateTicketMutation();
  const deleteMutation = useDeleteTicketMutation();
  const addCommentMutation = useAddTicketCommentMutation(ticketId);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-[var(--muted)]">…</p>;
  }
  if (isError || !ticket) {
    return <p className="text-sm text-red-600">{tk.loadError}</p>;
  }

  const inputCls =
    "rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-brand-purple/50";

  async function patch(body: Record<string, unknown>) {
    setError(null);
    try {
      await updateMutation.mutateAsync({ id: ticketId, body });
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "Error");
    }
  }

  async function handleDelete() {
    if (!confirm(tk.confirmDelete)) return;
    await deleteMutation.mutateAsync(ticketId);
    onDeleted?.();
  }

  async function submitComment(ev: React.FormEvent) {
    ev.preventDefault();
    if (!newComment.trim()) return;
    await addCommentMutation.mutateAsync(newComment.trim());
    setNewComment("");
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">{ticket.title}</h1>
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/20"
            >
              {tk.delete}
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <TypeBadge type={ticket.type} />
          <SourceBadge source={ticket.source} />
        </div>
        <p className="text-xs text-[var(--muted)]">
          #{ticket.id} · {tk.reporter}: {ticket.reporter ? `${ticket.reporter.firstName} ${ticket.reporter.lastName}` : "—"}
          {ticket.project && <> · {tk.project}: {ticket.project.title}</>}
        </p>
      </header>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">{tk.description}</h2>
        <p className="text-sm whitespace-pre-wrap text-[var(--foreground)]">{ticket.description}</p>
      </section>

      {/* SLA section */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">{tk.slaTitle}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] p-3 text-center">
            <p className="text-xs text-[var(--muted)]">{tk.slaCreated}</p>
            <p className="text-sm font-medium mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</p>
          </div>
          <div className={`rounded-lg border p-3 text-center ${ticket.firstResponseAt ? "bg-[var(--surface-raised)] border-[var(--border)]" : "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"}`}>
            <p className="text-xs text-[var(--muted)]">{tk.slaFirstResponse}</p>
            {ticket.firstResponseAt ? (
              <>
                <p className="text-sm font-medium mt-1">{new Date(ticket.firstResponseAt).toLocaleDateString()}</p>
                <p className="text-xs text-[var(--muted)]">{ticket.firstResponseMinutes} {tk.slaMinutes}</p>
              </>
            ) : (
              <p className="text-sm font-medium mt-1 text-yellow-600 dark:text-yellow-400">{tk.slaPending}</p>
            )}
          </div>
          <div className={`rounded-lg border p-3 text-center ${ticket.resolvedAt ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" : "bg-[var(--surface-raised)] border-[var(--border)]"}`}>
            <p className="text-xs text-[var(--muted)]">{tk.slaResolved}</p>
            {ticket.resolvedAt ? (
              <>
                <p className="text-sm font-medium mt-1 text-green-700 dark:text-green-400">{new Date(ticket.resolvedAt).toLocaleDateString()}</p>
                <p className="text-xs text-[var(--muted)]">{ticket.resolutionMinutes} {tk.slaMinutes}</p>
              </>
            ) : (
              <p className="text-sm font-medium mt-1 text-[var(--muted)]">—</p>
            )}
          </div>
          <div className="rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] p-3 text-center">
            <p className="text-xs text-[var(--muted)]">{tk.slaStatus}</p>
            <p className="text-sm font-medium mt-1">{ticket.status}</p>
          </div>
        </div>
      </section>

      {canEdit && (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">{tk.filters}</h2>
          <div className="flex flex-wrap gap-2">
            <select
              className={inputCls}
              value={ticket.status}
              onChange={(ev) => patch({ status: ev.target.value as TicketStatus })}
            >
              {TICKET_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              className={inputCls}
              value={ticket.priority}
              onChange={(ev) => patch({ priority: ev.target.value as TicketPriority })}
            >
              {TICKET_PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              className={inputCls}
              value={ticket.type}
              onChange={(ev) => patch({ type: ev.target.value as TicketType })}
            >
              {TICKET_TYPES.map((ty) => (
                <option key={ty} value={ty}>{ty}</option>
              ))}
            </select>
            <select
              className={inputCls}
              value={ticket.assignee?.id ?? ""}
              onChange={(ev) => patch({ assigneeId: ev.target.value ? Number(ev.target.value) : null })}
            >
              <option value="">{tk.noAssignee}</option>
              {(employees ?? []).map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </section>
      )}

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">{tk.comments}</h2>
        <ul className="space-y-2">
          {(comments ?? []).map((c) => (
            <li key={c.id} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span>{c.author ? `${c.author.firstName} ${c.author.lastName}` : "—"}</span>
                <span>{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-sm whitespace-pre-wrap text-[var(--foreground)]">{c.body}</p>
            </li>
          ))}
          {(!comments || comments.length === 0) && (
            <li className="text-sm text-[var(--muted)]">—</li>
          )}
        </ul>
        <form onSubmit={submitComment} className="space-y-2">
          <textarea
            className={`${inputCls} w-full`}
            rows={3}
            placeholder={tk.commentPlaceholder}
            value={newComment}
            onChange={(ev) => setNewComment(ev.target.value)}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={addCommentMutation.isPending || !newComment.trim()}
              className="rounded-lg bg-brand-purple px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {addCommentMutation.isPending ? tk.sending : tk.sendComment}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
