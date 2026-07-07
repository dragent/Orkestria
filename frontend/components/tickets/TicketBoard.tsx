"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLanguage } from "@/contexts/language-context";
import type { ApiTicket, TicketStatus } from "@/lib/api";
import { TICKET_STATUSES } from "@/lib/api";
import { PriorityBadge, SourceBadge, TypeBadge } from "./TicketBadges";

type Props = {
  tickets: ApiTicket[];
  onStatusChange: (ticketId: number, newStatus: TicketStatus) => void | Promise<unknown>;
  basePath?: string;
};

export default function TicketBoard({ tickets, onStatusChange, basePath = "/admin/tickets" }: Props) {
  const { t } = useLanguage();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const [optimistic, setOptimistic] = useState<Record<number, TicketStatus>>({});

  const grouped = useMemo(() => {
    const map: Record<TicketStatus, ApiTicket[]> = {
      open: [],
      in_progress: [],
      in_review: [],
      done: [],
      closed: [],
    };
    for (const ticket of tickets) {
      const status = optimistic[ticket.id] ?? ticket.status;
      map[status].push({ ...ticket, status });
    }
    return map;
  }, [tickets, optimistic]);

  const statusLabels: Record<TicketStatus, string> = {
    open: t.tickets.statusOpen,
    in_progress: t.tickets.statusInProgress,
    in_review: t.tickets.statusInReview,
    done: t.tickets.statusDone,
    closed: t.tickets.statusClosed,
  };

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const ticketId = Number(active.id);
    const overData = over.data.current as { type?: "column"; status?: TicketStatus } | undefined;
    const targetStatus = overData?.status ?? (TICKET_STATUSES.includes(over.id as TicketStatus) ? (over.id as TicketStatus) : null);
    if (!targetStatus) return;

    const ticket = tickets.find((tk) => tk.id === ticketId);
    if (!ticket || ticket.status === targetStatus) return;

    setOptimistic((prev) => ({ ...prev, [ticketId]: targetStatus }));
    try {
      await onStatusChange(ticketId, targetStatus);
    } catch {
      setOptimistic((prev) => {
        const next = { ...prev };
        delete next[ticketId];
        return next;
      });
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {TICKET_STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            label={statusLabels[status]}
            tickets={grouped[status]}
            basePath={basePath}
          />
        ))}
      </div>
    </DndContext>
  );
}

function Column({
  status,
  label,
  tickets,
  basePath,
}: {
  status: TicketStatus;
  label: string;
  tickets: ApiTicket[];
  basePath: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { type: "column", status } });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] transition-colors ${
        isOver ? "ring-2 ring-brand-purple/40" : ""
      }`}
      data-testid={`ticket-column-${status}`}
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <span className="text-sm font-semibold text-[var(--foreground)]">{label}</span>
        <span className="rounded-full bg-[var(--surface-raised)] px-2 py-0.5 text-xs text-[var(--muted)]">
          {tickets.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 min-h-32">
        <SortableContext items={tickets.map((tk) => tk.id)} strategy={rectSortingStrategy}>
          {tickets.map((ticket) => (
            <Card key={ticket.id} ticket={ticket} basePath={basePath} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

function Card({ ticket, basePath }: { ticket: ApiTicket; basePath: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  const isUrgentNoResponse =
    (ticket.priority === "urgent" || ticket.priority === "high") &&
    ["open", "in_progress"].includes(ticket.status) &&
    ticket.firstResponseAt === null;

  const ageMinutes = isUrgentNoResponse
    ? Math.round((now - new Date(ticket.createdAt).getTime()) / 60000)
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab rounded-lg border bg-[var(--background)] p-3 shadow-sm hover:shadow-md active:cursor-grabbing ${
        isUrgentNoResponse
          ? "border-red-400 dark:border-red-700"
          : "border-[var(--border)]"
      }`}
    >
      <Link href={`${basePath}/${ticket.id}`} className="block">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium text-[var(--foreground)] line-clamp-2">{ticket.title}</span>
          {isUrgentNoResponse && (
            <span className="shrink-0 text-red-500" title="Urgent, no first response yet">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </span>
          )}
        </div>
        {ageMinutes !== null && ageMinutes > 60 && (
          <p className="mt-0.5 text-xs text-red-500">
            ⚠ {Math.floor(ageMinutes / 60)}h{String(ageMinutes % 60).padStart(2, "0")} sans réponse
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <TypeBadge type={ticket.type} />
          <PriorityBadge priority={ticket.priority} />
          <SourceBadge source={ticket.source} />
        </div>
        {ticket.assignee && (
          <p className="mt-2 text-xs text-[var(--muted)]">
            {ticket.assignee.firstName} {ticket.assignee.lastName}
          </p>
        )}
      </Link>
    </div>
  );
}
