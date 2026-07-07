"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";
import {
  useAcceptQuoteMutation,
  useInvoicesQuery,
  useProjectQuery,
  useQuotesQuery,
  useRejectQuoteMutation,
} from "@/lib/hooks/queries";
import { ProjectStageReadOnly } from "@/components/projects/ProjectStageReadOnly";
import { ClientSupportSection } from "./ClientSupportSection";

function centsToAmount(cents: number): string {
  return (cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ClientProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const { t } = useLanguage();
  const tq = t.quotes;
  const ti = t.invoices;
  const td = t.projectDetail;
  const cs = t.clientSpace;

  const { data: project, isLoading, isError } = useProjectQuery(
    Number.isFinite(projectId) ? projectId : undefined
  );
  const { data: quotes = [], isLoading: quotesLoading } = useQuotesQuery(
    Number.isFinite(projectId) ? projectId : undefined
  );
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoicesQuery(
    Number.isFinite(projectId) ? projectId : undefined
  );

  const acceptMutation = useAcceptQuoteMutation(projectId);
  const rejectMutation = useRejectQuoteMutation(projectId);

  if (!Number.isFinite(projectId)) return null;

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto space-y-8">
      <Link
        href="/client"
        className="inline-flex items-center gap-1.5 text-sm text-(--muted) hover:text-(--foreground) transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        {t.projects?.back ?? "Retour"}
      </Link>

      {isError && (
        <p className="text-red-600 dark:text-red-400 text-sm">{cs.loadError}</p>
      )}

      {isLoading || !project ? (
        <div className="space-y-3">
          <div className="h-8 w-2/3 rounded-lg bg-(--surface) animate-pulse" />
          <div className="h-4 w-1/2 rounded-lg bg-(--surface) animate-pulse" />
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-(--foreground)">{project.title}</h1>
          </div>
          {(project.startDate || project.endDate) && (
            <p className="text-sm text-(--muted)">
              {td.start}: {project.startDate ? new Date(project.startDate).toLocaleDateString() : "?"}
              {" · "}
              {td.end}: {project.endDate ? new Date(project.endDate).toLocaleDateString() : "…"}
            </p>
          )}
          <ProjectStageReadOnly
            currentStage={project.pipelineStage}
            stageChangedAt={project.stageChangedAt}
          />
        </div>
      )}

      {/* Quotes */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-(--foreground)">{cs.quotesTitle}</h2>
        {quotesLoading ? (
          <div className="h-16 rounded-xl bg-(--surface) animate-pulse" />
        ) : quotes.length === 0 ? (
          <div className="rounded-xl border border-(--border) bg-(--surface) px-6 py-8 text-center">
            <p className="text-sm text-(--muted)">{tq.none}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map((quote) => {
              const lineTotal = quote.lines.reduce(
                (sum, l) => sum + Number(l.quantity) * l.unitPriceCents,
                0
              );
              const statusLabel =
                quote.status === "draft" ? tq.statusDraft
                : quote.status === "sent" ? tq.statusSent
                : quote.status === "accepted" ? tq.statusAccepted
                : tq.statusRejected;

              const statusColor =
                quote.status === "accepted"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : quote.status === "rejected"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : quote.status === "sent"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-(--surface-raised) text-(--muted)";

              return (
                <div
                  key={quote.id}
                  className="rounded-xl border border-(--border) bg-(--surface) p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1">
                      <p className="text-xs text-(--muted)">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </p>
                      <p className="font-semibold text-(--foreground)">
                        {tq.grandTotal}: {centsToAmount(lineTotal)} €
                      </p>
                      {quote.notes && (
                        <p className="text-sm text-(--muted)">{quote.notes}</p>
                      )}
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>

                  {quote.lines.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-(--muted) text-xs border-b border-(--border)">
                            <th className="text-left pb-2 font-medium">{tq.label}</th>
                            <th className="text-right pb-2 font-medium">{tq.quantity}</th>
                            <th className="text-right pb-2 font-medium">{tq.unitPrice}</th>
                            <th className="text-right pb-2 font-medium">{tq.total}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-(--border)">
                          {quote.lines.map((line) => (
                            <tr key={line.id} className="text-(--foreground)">
                              <td className="py-2 pr-4">{line.label}</td>
                              <td className="py-2 text-right">{line.quantity}</td>
                              <td className="py-2 text-right">{centsToAmount(line.unitPriceCents)} €</td>
                              <td className="py-2 text-right">
                                {centsToAmount(Number(line.quantity) * line.unitPriceCents)} €
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {quote.status === "sent" && (
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => acceptMutation.mutate(quote.id)}
                        disabled={acceptMutation.isPending}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                      >
                        {tq.accept}
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectMutation.mutate(quote.id)}
                        disabled={rejectMutation.isPending}
                        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60 transition-colors"
                      >
                        {tq.reject}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Invoices */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-(--foreground)">{cs.invoicesTitle}</h2>
        {invoicesLoading ? (
          <div className="h-16 rounded-xl bg-(--surface) animate-pulse" />
        ) : invoices.length === 0 ? (
          <div className="rounded-xl border border-(--border) bg-(--surface) px-6 py-8 text-center">
            <p className="text-sm text-(--muted)">{ti.none}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => {
              const statusLabel =
                invoice.status === "paid" ? ti.statusPaid
                : invoice.status === "sent" ? ti.statusSent
                : ti.statusDraft;

              const statusColor =
                invoice.status === "paid"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : invoice.status === "sent"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-(--surface-raised) text-(--muted)";

              return (
                <div
                  key={invoice.id}
                  className="rounded-xl border border-(--border) bg-(--surface) p-5 flex items-center justify-between gap-3 flex-wrap"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-(--foreground)">
                      {ti.total}: {centsToAmount(invoice.totalCents)} €
                    </p>
                    <p className="text-xs text-(--muted)">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                      {invoice.paidAt && (
                        <> · {ti.paidAt}: {new Date(invoice.paidAt).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <ClientSupportSection projectId={projectId} />
    </div>
  );
}
