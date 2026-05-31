"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import {
  useCreateQuoteMutation,
  useDeleteTaskMutation,
  useQuotesQuery,
  useUpdateQuoteMutation,
} from "@/lib/hooks/queries";
import { invoicesApi } from "@/lib/api";
import type { QuoteLineInput, QuoteStatusType } from "@/lib/api";

const STATUS_COLORS: Record<QuoteStatusType, string> = {
  draft: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300",
  sent: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  accepted: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300",
  rejected: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
};

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export function ProjectQuotesSection({ projectId }: { projectId: number }) {
  const { t } = useLanguage();
  const q = t.quotes;
  const { data: quotes, isLoading } = useQuotesQuery(projectId);
  const createMutation = useCreateQuoteMutation(projectId);
  const updateMutation = useUpdateQuoteMutation(projectId);

  const [showForm, setShowForm] = useState(false);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<QuoteLineInput[]>([{ label: "", quantity: 1, unitPriceCents: 0 }]);
  const [error, setError] = useState<string | null>(null);

  function addLine() {
    setLines((prev) => [...prev, { label: "", quantity: 1, unitPriceCents: 0 }]);
  }

  function removeLine(i: number) {
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateLine(i: number, field: keyof QuoteLineInput, value: string | number) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  }

  async function handleCreate(ev: React.FormEvent) {
    ev.preventDefault();
    setError(null);
    try {
      await createMutation.mutateAsync({ notes: notes || undefined, lines });
      setNotes("");
      setLines([{ label: "", quantity: 1, unitPriceCents: 0 }]);
      setShowForm(false);
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? t.adminForms.genericError);
    }
  }

  async function handleStatusChange(quoteId: number, status: QuoteStatusType) {
    await updateMutation.mutateAsync({ quoteId, body: { status } });
  }

  const statusLabel = (s: QuoteStatusType) => {
    if (s === "draft") return q.statusDraft;
    if (s === "sent") return q.statusSent;
    if (s === "accepted") return q.statusAccepted;
    return q.statusRejected;
  };

  const lineTotal = lines.reduce((acc, l) => acc + l.quantity * l.unitPriceCents, 0);

  const inputCls =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-brand-purple/50";

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <h2 className="font-semibold text-[var(--foreground)]">{q.title}</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="text-sm font-medium text-brand-purple hover:underline"
        >
          {showForm ? "Annuler" : q.add}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-raised)] space-y-4">
          <textarea
            className={inputCls}
            rows={2}
            placeholder={q.notes}
            value={notes}
            onChange={(ev) => setNotes(ev.target.value)}
          />

          <div className="space-y-2">
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px_100px_36px] gap-2 items-center">
                <input
                  className={inputCls}
                  placeholder={q.label}
                  value={line.label}
                  onChange={(ev) => updateLine(i, "label", ev.target.value)}
                  required
                />
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className={inputCls}
                  placeholder={q.quantity}
                  value={line.quantity}
                  onChange={(ev) => updateLine(i, "quantity", parseFloat(ev.target.value) || 0)}
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputCls}
                  placeholder={q.unitPrice}
                  value={(line.unitPriceCents / 100).toFixed(2)}
                  onChange={(ev) => updateLine(i, "unitPriceCents", Math.round(parseFloat(ev.target.value || "0") * 100))}
                />
                <button type="button" onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600 text-sm">
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button type="button" onClick={addLine} className="text-sm text-brand-purple hover:underline">
              + {q.addLine}
            </button>
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {q.grandTotal}: {fmtCents(lineTotal)}
            </p>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-lg bg-brand-purple px-4 py-2 text-sm font-medium text-white hover:bg-brand-purple/90 disabled:opacity-60 transition-colors"
          >
            {createMutation.isPending ? q.saving : q.save}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="p-6 flex justify-center">
          <div className="h-6 w-6 rounded-full border-4 border-brand-purple border-t-transparent animate-spin" />
        </div>
      ) : !quotes?.length ? (
        <p className="px-6 py-6 text-sm text-[var(--muted)]">{q.none}</p>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {quotes.map((quote) => {
            const total = quote.lines.reduce(
              (acc, l) => acc + parseFloat(l.quantity) * l.unitPriceCents,
              0
            );
            return (
              <li key={quote.id} className="px-6 py-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-[var(--foreground)]">Devis #{quote.id}</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[quote.status]}`}>
                      {statusLabel(quote.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[var(--foreground)]">{fmtCents(total)}</span>
                    {quote.status === "draft" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(quote.id, "sent")}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {q.send}
                      </button>
                    )}
                    <a
                      href={invoicesApi.getQuotePdfUrl(quote.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brand-purple hover:underline"
                    >
                      {q.viewPdf}
                    </a>
                  </div>
                </div>

                {quote.lines.length > 0 && (
                  <div className="text-xs text-[var(--muted)] space-y-0.5">
                    {quote.lines.map((l) => (
                      <div key={l.id} className="flex justify-between">
                        <span>{l.label} × {l.quantity}</span>
                        <span>{fmtCents(parseFloat(l.quantity) * l.unitPriceCents)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {quote.invoice && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-[var(--muted)]">
                      Facture #{quote.invoice.id} —{" "}
                      {quote.invoice.status === "paid"
                        ? `${t.invoices.statusPaid}${quote.invoice.paidAt ? ` (${new Date(quote.invoice.paidAt).toLocaleDateString()})` : ""}`
                        : quote.invoice.status === "sent"
                        ? t.invoices.statusSent
                        : t.invoices.statusDraft}
                    </span>
                    <a
                      href={invoicesApi.getPdfUrl(quote.invoice.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brand-purple hover:underline"
                    >
                      {t.invoices.viewPdf}
                    </a>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
