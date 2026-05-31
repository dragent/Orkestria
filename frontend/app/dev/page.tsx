"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useMeQuery, useTicketsQuery } from "@/lib/hooks/queries";
import { PriorityBadge, StatusBadge, TypeBadge } from "@/components/tickets/TicketBadges";

export default function DevDashboardPage() {
  const { t, lang } = useLanguage();
  const tk = t.tickets;
  const { data: me } = useMeQuery();

  // Single call — filter client-side; avoids waterfall
  const { data: allTickets = [] } = useTicketsQuery();

  const myId = me?.id;

  const myTickets = useMemo(
    () => allTickets.filter((tkt) => tkt.assignee?.user?.id === myId),
    [allTickets, myId]
  );

  const openAll      = allTickets.filter((t) => t.status === "open").length;
  const inProgress   = allTickets.filter((t) => t.status === "in_progress").length;
  const myActive     = myTickets.filter((t) => !["done", "closed"].includes(t.status));

  // Urgents sans réponse : urgent ou high, open/in_progress, pas de firstResponseAt
  const urgentUnanswered = useMemo(
    () =>
      allTickets.filter(
        (tkt) =>
          (tkt.priority === "urgent" || tkt.priority === "high") &&
          ["open", "in_progress"].includes(tkt.status) &&
          tkt.firstResponseAt === null
      ),
    [allTickets]
  );

  const dateLocale = lang === "fr" ? "fr-FR" : "en-GB";

  function minutesLabel(minutes: number | null): string {
    if (minutes === null) return "—";
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    return `${h}h${String(minutes % 60).padStart(2, "0")}`;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">{tk.devSpace.title}</h1>
        <p className="text-sm text-[var(--muted)]">{tk.devSpace.subtitle}</p>
      </header>

      {/* KPI tiles */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Tile label={tk.statusOpen}        value={openAll}            />
        <Tile label={tk.statusInProgress}  value={inProgress}         />
        <Tile label={tk.devSpace.myAssigned} value={myActive.length}  accent />
        <Tile
          label={tk.devSpace.urgentUnanswered}
          value={urgentUnanswered.length}
          danger={urgentUnanswered.length > 0}
        />
      </section>

      {/* Urgent / high sans réponse */}
      {urgentUnanswered.length > 0 && (
        <section className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-200 dark:border-red-800 flex items-center gap-2">
            <svg className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <h2 className="font-semibold text-red-700 dark:text-red-400">{tk.devSpace.urgentUnanswered}</h2>
            <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
              {urgentUnanswered.length}
            </span>
          </div>
          <ul className="divide-y divide-red-100 dark:divide-red-900/40">
            {urgentUnanswered.map((tkt) => {
              const ageMinutes = Math.round(
                (Date.now() - new Date(tkt.createdAt).getTime()) / 60000
              );
              return (
                <li key={tkt.id} className="px-6 py-3 flex items-center justify-between gap-4">
                  <Link href={`/dev/tickets/${tkt.id}`} className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">
                      #{tkt.id} · {tkt.title}
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {tk.devSpace.waitingSince} {minutesLabel(ageMinutes)}
                      {tkt.project && <> · {tkt.project.title}</>}
                    </p>
                  </Link>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <PriorityBadge priority={tkt.priority} />
                    <StatusBadge status={tkt.status} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Mes tickets actifs */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-semibold text-[var(--foreground)]">{tk.devSpace.myAssigned}</h2>
          <Link href="/dev/tickets" className="text-sm text-brand-purple hover:underline">
            {tk.boardView}
          </Link>
        </div>
        {myActive.length === 0 ? (
          <p className="px-6 py-4 text-sm text-[var(--muted)]">{tk.devSpace.noAssigned}</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {myActive.map((tkt) => {
              const ageMinutes = tkt.firstResponseAt === null
                ? Math.round((Date.now() - new Date(tkt.createdAt).getTime()) / 60000)
                : null;
              const showSlaWarning =
                ageMinutes !== null &&
                ageMinutes > 60 &&
                (tkt.priority === "urgent" || tkt.priority === "high");

              return (
                <li key={tkt.id} className="px-6 py-3 flex items-center justify-between gap-4">
                  <Link href={`/dev/tickets/${tkt.id}`} className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">
                      #{tkt.id} · {tkt.title}
                    </p>
                    {showSlaWarning && (
                      <p className="text-xs text-red-500 mt-0.5">
                        ⚠ {tk.devSpace.noResponseFor} {minutesLabel(ageMinutes)}
                      </p>
                    )}
                  </Link>
                  <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                    <TypeBadge type={tkt.type} />
                    <PriorityBadge priority={tkt.priority} />
                    <StatusBadge status={tkt.status} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Résolutions récentes */}
      {(() => {
        const recentlyResolved = allTickets
          .filter((tkt) => tkt.resolvedAt !== null && tkt.assignee?.user?.id === myId)
          .sort((a, b) => new Date(b.resolvedAt!).getTime() - new Date(a.resolvedAt!).getTime())
          .slice(0, 5);
        if (recentlyResolved.length === 0) return null;
        return (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)]">
              <h2 className="font-semibold text-[var(--foreground)]">{tk.devSpace.recentlyResolved}</h2>
            </div>
            <ul className="divide-y divide-[var(--border)]">
              {recentlyResolved.map((tkt) => (
                <li key={tkt.id} className="px-6 py-3 flex items-center justify-between gap-4">
                  <Link href={`/dev/tickets/${tkt.id}`} className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">
                      #{tkt.id} · {tkt.title}
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {new Date(tkt.resolvedAt!).toLocaleDateString(dateLocale)}
                      {tkt.resolutionMinutes !== null && (
                        <> · {tk.devSpace.resolvedIn} {minutesLabel(tkt.resolutionMinutes)}</>
                      )}
                    </p>
                  </Link>
                  <TypeBadge type={tkt.type} />
                </li>
              ))}
            </ul>
          </section>
        );
      })()}
    </div>
  );
}

function Tile({
  label,
  value,
  accent = false,
  danger = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        danger
          ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20"
          : accent
          ? "border-[var(--border)] bg-brand-purple/10"
          : "border-[var(--border)] bg-[var(--surface)]"
      }`}
    >
      <p className="text-xs uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold ${
          danger && value > 0 ? "text-red-600 dark:text-red-400" : "text-[var(--foreground)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
