"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { useTicketsQuery } from "@/lib/hooks/queries";
import { PriorityBadge, StatusBadge, TypeBadge } from "@/components/tickets/TicketBadges";

export function ProjectTicketsSection({ projectId }: { projectId: number }) {
  const { t } = useLanguage();
  const tk = t.tickets;
  const { data: tickets, isLoading, isError } = useTicketsQuery({ projectId });

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <h2 className="font-semibold text-[var(--foreground)]">{tk.title}</h2>
        <Link href={`/admin/tickets?projectId=${projectId}`} className="text-sm text-brand-purple hover:underline">
          {tk.boardView}
        </Link>
      </div>
      {isLoading ? (
        <p className="px-6 py-4 text-sm text-[var(--muted)]">…</p>
      ) : isError ? (
        <p className="px-6 py-4 text-sm text-red-600">{tk.loadError}</p>
      ) : !tickets || tickets.length === 0 ? (
        <p className="px-6 py-4 text-sm text-[var(--muted)]">{tk.none}</p>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {tickets.map((tkt) => (
            <li key={tkt.id} className="px-6 py-3 flex items-center justify-between gap-4">
              <Link href={`/admin/tickets/${tkt.id}`} className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">#{tkt.id} · {tkt.title}</p>
                <p className="text-xs text-[var(--muted)] truncate">
                  {tkt.assignee ? `${tkt.assignee.firstName} ${tkt.assignee.lastName}` : tk.noAssignee}
                </p>
              </Link>
              <div className="flex items-center gap-1.5 flex-wrap">
                <TypeBadge type={tkt.type} />
                <PriorityBadge priority={tkt.priority} />
                <StatusBadge status={tkt.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
