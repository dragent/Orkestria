"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import TicketBoard from "@/components/tickets/TicketBoard";
import { PriorityBadge, SourceBadge, StatusBadge, TypeBadge } from "@/components/tickets/TicketBadges";
import {
  useEmployeesQuery,
  useProjectsQuery,
  useTicketsQuery,
  useUpdateTicketMutation,
} from "@/lib/hooks/queries";
import {
  TICKET_PRIORITIES,
  TICKET_SOURCES,
  TICKET_STATUSES,
  TICKET_TYPES,
  type TicketListFilters,
  type TicketPriority,
  type TicketSource,
  type TicketStatus,
  type TicketType,
} from "@/lib/api";
import TicketCreateForm from "./TicketCreateForm";

type ViewMode = "board" | "list";

export default function AdminTicketsPage() {
  const { t } = useLanguage();
  const [view, setView] = useState<ViewMode>("board");
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState<TicketListFilters>({});

  const { data: tickets, isLoading, isError } = useTicketsQuery(filters);
  const { data: projects } = useProjectsQuery();
  const { data: employees } = useEmployeesQuery();
  const updateMutation = useUpdateTicketMutation();

  const inputCls =
    "rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-brand-purple/50";

  function patchFilter<K extends keyof TicketListFilters>(key: K, value: TicketListFilters[K] | undefined) {
    setFilters((prev) => {
      const next = { ...prev };
      if (value === undefined || value === "" || value === null) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  }

  async function handleStatusChange(ticketId: number, status: TicketStatus) {
    await updateMutation.mutateAsync({ id: ticketId, body: { status } });
  }

  const sortedTickets = useMemo(() => {
    return [...(tickets ?? [])];
  }, [tickets]);

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 max-w-[1600px] mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">{t.tickets.title}</h1>
          <p className="text-sm text-[var(--muted)]">{t.tickets.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-sm">
            <button
              type="button"
              onClick={() => setView("board")}
              className={`px-3 py-1.5 ${view === "board" ? "bg-brand-purple text-white" : "text-[var(--muted)]"}`}
            >
              {t.tickets.boardView}
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`px-3 py-1.5 ${view === "list" ? "bg-brand-purple text-white" : "text-[var(--muted)]"}`}
            >
              {t.tickets.listView}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-brand-purple px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            {t.tickets.add}
          </button>
        </div>
      </header>

      <section className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
        <input
          type="text"
          className={inputCls + " w-56"}
          placeholder={t.tickets.search}
          value={filters.q ?? ""}
          onChange={(ev) => patchFilter("q", ev.target.value)}
        />
        <select
          className={inputCls}
          value={filters.status ?? ""}
          onChange={(ev) => patchFilter("status", (ev.target.value || undefined) as TicketStatus | undefined)}
        >
          <option value="">{t.tickets.status} — {t.tickets.all}</option>
          {TICKET_STATUSES.map((s) => (
            <option key={s} value={s}>{statusLabel(s, t.tickets)}</option>
          ))}
        </select>
        <select
          className={inputCls}
          value={filters.priority ?? ""}
          onChange={(ev) => patchFilter("priority", (ev.target.value || undefined) as TicketPriority | undefined)}
        >
          <option value="">{t.tickets.priority} — {t.tickets.all}</option>
          {TICKET_PRIORITIES.map((p) => (
            <option key={p} value={p}>{priorityLabel(p, t.tickets)}</option>
          ))}
        </select>
        <select
          className={inputCls}
          value={filters.type ?? ""}
          onChange={(ev) => patchFilter("type", (ev.target.value || undefined) as TicketType | undefined)}
        >
          <option value="">{t.tickets.type} — {t.tickets.all}</option>
          {TICKET_TYPES.map((ty) => (
            <option key={ty} value={ty}>{typeLabel(ty, t.tickets)}</option>
          ))}
        </select>
        <select
          className={inputCls}
          value={filters.source ?? ""}
          onChange={(ev) => patchFilter("source", (ev.target.value || undefined) as TicketSource | undefined)}
        >
          <option value="">{t.tickets.source} — {t.tickets.all}</option>
          {TICKET_SOURCES.map((src) => (
            <option key={src} value={src}>{sourceLabel(src, t.tickets)}</option>
          ))}
        </select>
        <select
          className={inputCls}
          value={filters.projectId ?? ""}
          onChange={(ev) => patchFilter("projectId", ev.target.value ? Number(ev.target.value) : undefined)}
        >
          <option value="">{t.tickets.project} — {t.tickets.all}</option>
          {(projects ?? []).map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <select
          className={inputCls}
          value={filters.assigneeId ?? ""}
          onChange={(ev) => patchFilter("assigneeId", ev.target.value ? Number(ev.target.value) : undefined)}
        >
          <option value="">{t.tickets.assignee} — {t.tickets.all}</option>
          {(employees ?? []).map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
          ))}
        </select>
        {Object.keys(filters).length > 0 && (
          <button
            type="button"
            onClick={() => setFilters({})}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            {t.tickets.cancel}
          </button>
        )}
      </section>

      {showCreate && (
        <TicketCreateForm
          onClose={() => setShowCreate(false)}
          projects={projects ?? []}
          employees={employees ?? []}
        />
      )}

      {isLoading ? (
        <p className="text-sm text-[var(--muted)]">…</p>
      ) : isError ? (
        <p className="text-sm text-red-600">{t.tickets.loadError}</p>
      ) : sortedTickets.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{t.tickets.none}</p>
      ) : view === "board" ? (
        <TicketBoard tickets={sortedTickets} onStatusChange={handleStatusChange} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--surface-raised)] text-[var(--muted)] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">{t.tickets.titleLabel}</th>
                <th className="px-4 py-2 text-left">{t.tickets.status}</th>
                <th className="px-4 py-2 text-left">{t.tickets.priority}</th>
                <th className="px-4 py-2 text-left">{t.tickets.type}</th>
                <th className="px-4 py-2 text-left">{t.tickets.source}</th>
                <th className="px-4 py-2 text-left">{t.tickets.project}</th>
                <th className="px-4 py-2 text-left">{t.tickets.assignee}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {sortedTickets.map((tk) => (
                <tr key={tk.id} className="hover:bg-[var(--surface-raised)]">
                  <td className="px-4 py-2 text-[var(--muted)]">#{tk.id}</td>
                  <td className="px-4 py-2">
                    <Link href={`/admin/tickets/${tk.id}`} className="text-brand-purple hover:underline">
                      {tk.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2"><StatusBadge status={tk.status} /></td>
                  <td className="px-4 py-2"><PriorityBadge priority={tk.priority} /></td>
                  <td className="px-4 py-2"><TypeBadge type={tk.type} /></td>
                  <td className="px-4 py-2"><SourceBadge source={tk.source} /></td>
                  <td className="px-4 py-2 text-[var(--muted)]">{tk.project?.title ?? "—"}</td>
                  <td className="px-4 py-2 text-[var(--muted)]">
                    {tk.assignee ? `${tk.assignee.firstName} ${tk.assignee.lastName}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function statusLabel(s: TicketStatus, tk: ReturnType<typeof useLanguage>["t"]["tickets"]) {
  return {
    open: tk.statusOpen,
    in_progress: tk.statusInProgress,
    in_review: tk.statusInReview,
    done: tk.statusDone,
    closed: tk.statusClosed,
  }[s];
}
function priorityLabel(p: TicketPriority, tk: ReturnType<typeof useLanguage>["t"]["tickets"]) {
  return { low: tk.priorityLow, normal: tk.priorityNormal, high: tk.priorityHigh, urgent: tk.priorityUrgent }[p];
}
function typeLabel(ty: TicketType, tk: ReturnType<typeof useLanguage>["t"]["tickets"]) {
  return {
    bug: tk.typeBug,
    feature: tk.typeFeature,
    task: tk.typeTask,
    support: tk.typeSupport,
    incident: tk.typeIncident,
  }[ty];
}
function sourceLabel(src: TicketSource, tk: ReturnType<typeof useLanguage>["t"]["tickets"]) {
  return src === "internal" ? tk.sourceInternal : tk.sourceClient;
}
