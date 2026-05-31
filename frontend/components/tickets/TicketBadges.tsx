"use client";

import { useLanguage } from "@/contexts/language-context";
import type { TicketPriority, TicketStatus, TicketType } from "@/lib/api";

const STATUS_CLS: Record<TicketStatus, string> = {
  open: "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300",
  in_progress: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  in_review: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  done: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300",
  closed: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
};

const PRIORITY_CLS: Record<TicketPriority, string> = {
  low: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400",
  normal: "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300",
  high: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300",
  urgent: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
};

const TYPE_CLS: Record<TicketType, string> = {
  bug: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
  feature: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
  task: "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300",
  support: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
  incident: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300",
};

const baseBadge =
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";

export function StatusBadge({ status }: { status: TicketStatus }) {
  const { t } = useLanguage();
  const labels: Record<TicketStatus, string> = {
    open: t.tickets.statusOpen,
    in_progress: t.tickets.statusInProgress,
    in_review: t.tickets.statusInReview,
    done: t.tickets.statusDone,
    closed: t.tickets.statusClosed,
  };
  return <span className={`${baseBadge} ${STATUS_CLS[status]}`}>{labels[status]}</span>;
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const { t } = useLanguage();
  const labels: Record<TicketPriority, string> = {
    low: t.tickets.priorityLow,
    normal: t.tickets.priorityNormal,
    high: t.tickets.priorityHigh,
    urgent: t.tickets.priorityUrgent,
  };
  return <span className={`${baseBadge} ${PRIORITY_CLS[priority]}`}>{labels[priority]}</span>;
}

export function TypeBadge({ type }: { type: TicketType }) {
  const { t } = useLanguage();
  const labels: Record<TicketType, string> = {
    bug: t.tickets.typeBug,
    feature: t.tickets.typeFeature,
    task: t.tickets.typeTask,
    support: t.tickets.typeSupport,
    incident: t.tickets.typeIncident,
  };
  return <span className={`${baseBadge} ${TYPE_CLS[type]}`}>{labels[type]}</span>;
}

export function SourceBadge({ source }: { source: "internal" | "client" }) {
  const { t } = useLanguage();
  const label = source === "internal" ? t.tickets.sourceInternal : t.tickets.sourceClient;
  const cls =
    source === "internal"
      ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
      : "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300";
  return <span className={`${baseBadge} ${cls}`}>{label}</span>;
}
