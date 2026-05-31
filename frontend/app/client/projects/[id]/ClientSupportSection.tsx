"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import {
  useClientProjectTicketsQuery,
  useCreateClientTicketMutation,
} from "@/lib/hooks/queries";
import { PriorityBadge, StatusBadge, TypeBadge } from "@/components/tickets/TicketBadges";
import type { TicketPriority } from "@/lib/api";

export function ClientSupportSection({ projectId }: { projectId: number }) {
  const { t } = useLanguage();
  const tk = t.tickets;
  const cs = tk.clientSection;
  const { data: tickets, isLoading } = useClientProjectTicketsQuery(projectId);
  const createMutation = useCreateClientTicketMutation(projectId);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"support" | "bug">("support");
  const [priority, setPriority] = useState<TicketPriority>("normal");
  const [error, setError] = useState<string | null>(null);

  const inputCls =
    "w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--foreground) placeholder-(--muted) focus:outline-none focus:ring-2 focus:ring-brand-purple/50";

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setError(null);
    try {
      await createMutation.mutateAsync({ title, description, type, priority });
      setTitle("");
      setDescription("");
      setType("support");
      setPriority("normal");
      setShowForm(false);
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "Error");
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-(--foreground)">{cs.title}</h2>
          <p className="text-sm text-(--muted)">{cs.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-brand-purple px-3 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {showForm ? tk.cancel : cs.open}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-(--border) bg-(--surface) p-4 space-y-3"
        >
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
          <div className="grid grid-cols-2 gap-3">
            <select
              className={inputCls}
              value={type}
              onChange={(ev) => setType(ev.target.value as "support" | "bug")}
            >
              <option value="support">{tk.typeSupport}</option>
              <option value="bug">{tk.typeBug}</option>
            </select>
            <select
              className={inputCls}
              value={priority}
              onChange={(ev) => setPriority(ev.target.value as TicketPriority)}
            >
              <option value="low">{tk.priorityLow}</option>
              <option value="normal">{tk.priorityNormal}</option>
              <option value="high">{tk.priorityHigh}</option>
              <option value="urgent">{tk.priorityUrgent}</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-lg bg-brand-purple px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {createMutation.isPending ? tk.saving : tk.save}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="h-16 rounded-xl bg-(--surface) animate-pulse" />
      ) : !tickets || tickets.length === 0 ? (
        <div className="rounded-xl border border-(--border) bg-(--surface) px-6 py-8 text-center">
          <p className="text-sm text-(--muted)">{cs.noTickets}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tickets.map((tkt) => (
            <li
              key={tkt.id}
              className="rounded-xl border border-(--border) bg-(--surface) p-4 flex items-center justify-between gap-3 flex-wrap"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-(--foreground) truncate">
                  #{tkt.id} · {tkt.title}
                </p>
                <p className="text-xs text-(--muted)">
                  {new Date(tkt.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <TypeBadge type={tkt.type} />
                <PriorityBadge priority={tkt.priority} />
                <StatusBadge status={tkt.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
