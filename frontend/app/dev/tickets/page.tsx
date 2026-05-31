"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import TicketBoard from "@/components/tickets/TicketBoard";
import TicketCreateForm from "@/app/admin/tickets/TicketCreateForm";
import {
  useTicketsQuery,
  useUpdateTicketMutation,
  useMeQuery,
  useProjectsQuery,
  useEmployeesQuery,
} from "@/lib/hooks/queries";
import {
  TICKET_PRIORITIES,
  TICKET_TYPES,
  type TicketPriority,
  type TicketStatus,
  type TicketType,
} from "@/lib/api";

export default function DevTicketsPage() {
  const { t } = useLanguage();
  const tk = t.tickets;

  const { data: me } = useMeQuery();
  const { data: tickets = [], isLoading, isError } = useTicketsQuery();
  const { data: projects = [] } = useProjectsQuery();
  const { data: employees = [] } = useEmployeesQuery();
  const updateMutation = useUpdateTicketMutation();

  const [showCreate, setShowCreate]   = useState(false);
  const [onlyMine, setOnlyMine]       = useState(false);
  const [filterPriority, setFilterPriority] = useState<TicketPriority | "">("");
  const [filterType, setFilterType]   = useState<TicketType | "">("");
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "">("");
  const [search, setSearch]           = useState("");

  const myId = me?.id;

  const filtered = useMemo(() => {
    return tickets.filter((tkt) => {
      if (onlyMine && tkt.assignee?.user?.id !== myId) return false;
      if (filterPriority && tkt.priority !== filterPriority) return false;
      if (filterType && tkt.type !== filterType) return false;
      if (filterStatus && tkt.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !tkt.title.toLowerCase().includes(q) &&
          !String(tkt.id).includes(q)
        )
          return false;
      }
      return true;
    });
  }, [tickets, onlyMine, myId, filterPriority, filterType, filterStatus, search]);

  async function handleStatusChange(ticketId: number, status: TicketStatus) {
    await updateMutation.mutateAsync({ id: ticketId, body: { status } });
  }

  const inputCls =
    "rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-brand-purple/50";

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 max-w-[1600px] mx-auto space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">{tk.title}</h1>
          <p className="text-sm text-[var(--muted)]">{tk.devSpace.subtitle}</p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="rounded-lg bg-brand-purple px-4 py-2 text-sm font-medium text-white hover:bg-brand-purple/90 transition-colors"
        >
          {showCreate ? tk.cancel : tk.add}
        </button>
      </header>

      {showCreate && (
        <TicketCreateForm
          onClose={() => setShowCreate(false)}
          projects={projects}
          employees={employees}
        />
      )}

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Toggle mes tickets */}
        <button
          onClick={() => setOnlyMine((v) => !v)}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            onlyMine
              ? "border-brand-purple bg-brand-purple text-white"
              : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-brand-purple/60"
          }`}
        >
          {tk.devSpace.myAssigned}
        </button>

        {/* Search */}
        <input
          type="search"
          placeholder={tk.searchPlaceholder ?? "Rechercher…"}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputCls} w-40 sm:w-56`}
        />

        {/* Priority */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as TicketPriority | "")}
          className={inputCls}
        >
          <option value="">{tk.allPriorities ?? "Toutes priorités"}</option>
          {TICKET_PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Type */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as TicketType | "")}
          className={inputCls}
        >
          <option value="">{tk.allTypes ?? "Tous types"}</option>
          {TICKET_TYPES.map((ty) => (
            <option key={ty} value={ty}>{ty}</option>
          ))}
        </select>

        {(onlyMine || filterPriority || filterType || filterStatus || search) && (
          <button
            onClick={() => {
              setOnlyMine(false);
              setFilterPriority("");
              setFilterType("");
              setFilterStatus("");
              setSearch("");
            }}
            className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] underline"
          >
            {tk.clearFilters ?? "Effacer"}
          </button>
        )}

        <span className="ml-auto text-xs text-[var(--muted)]">
          {filtered.length} / {tickets.length}
        </span>
      </div>

      {isLoading ? (
        <p className="text-sm text-[var(--muted)]">…</p>
      ) : isError ? (
        <p className="text-sm text-red-600">{tk.loadError}</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{tk.none}</p>
      ) : (
        <TicketBoard
          tickets={filtered}
          onStatusChange={handleStatusChange}
          basePath="/dev/tickets"
        />
      )}
    </div>
  );
}
