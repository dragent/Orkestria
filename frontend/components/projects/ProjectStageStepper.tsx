"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useAdvanceStageMutation, useStageChecklistQuery, useStageHistoryQuery } from "@/lib/hooks/queries";
import { PIPELINE_STAGES, TRANSITION_ROLES } from "@/lib/pipeline-label";
import type { ApiProject, ProjectPipelineStage } from "@/lib/api";

type Props = {
  project: ApiProject;
  /** Roles the current user holds (from JWT) */
  userRoles: string[];
};

export function ProjectStageStepper({ project, userRoles }: Props) {
  const { t, lang } = useLanguage();
  const tp = t.pipeline;
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const currentIdx = PIPELINE_STAGES.indexOf(project.pipelineStage);
  const nextStage: ProjectPipelineStage | null =
    currentIdx < PIPELINE_STAGES.length - 1 ? PIPELINE_STAGES[currentIdx + 1] : null;

  const isTerminal = project.pipelineStage === "paid";

  const allowedRoles = TRANSITION_ROLES[project.pipelineStage] ?? [];
  const canAdvance =
    !isTerminal && allowedRoles.some((r) => userRoles.includes(r));

  const advanceMutation = useAdvanceStageMutation(project.id);
  const { data: history = [] } = useStageHistoryQuery(project.id);
  const { data: checklist } = useStageChecklistQuery(project.id);

  const dateLocale = lang === "fr" ? "fr-FR" : "en-GB";

  async function handleAdvance() {
    setError(null);
    try {
      await advanceMutation.mutateAsync(note.trim() || undefined);
      setNote("");
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      setError(msg ?? tp.noPermission);
    }
  }

  return (
    <div className="space-y-6">
      {/* Timeline stepper */}
      <div className="overflow-x-auto pb-2">
        <ol className="flex min-w-max gap-0">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isPast    = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const isFuture  = idx > currentIdx;

            return (
              <li key={stage} className="flex items-center">
                {/* Step circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                      isCurrent
                        ? "border-brand-purple bg-brand-purple text-white"
                        : isPast
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-(--border) bg-(--background) text-(--muted)"
                    }`}
                  >
                    {isPast ? (
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`mt-1.5 w-20 text-center text-[10px] leading-tight ${
                      isCurrent
                        ? "font-semibold text-brand-purple"
                        : isPast
                        ? "text-green-600 dark:text-green-400"
                        : "text-(--muted)"
                    }`}
                  >
                    {tp[stage]}
                  </span>
                </div>

                {/* Connector line */}
                {idx < PIPELINE_STAGES.length - 1 && (
                  <div
                    className={`h-0.5 w-8 shrink-0 ${
                      isPast || isCurrent ? "bg-green-400" : "bg-(--border)"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Current stage summary + advance button */}
      <div className="rounded-xl border border-(--border) bg-(--surface) p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-(--muted)">
            {isTerminal ? tp.terminal : `Étape ${currentIdx + 1} / ${PIPELINE_STAGES.length}`}
          </p>
          <p className="mt-0.5 text-base font-semibold text-(--foreground)">
            {tp[project.pipelineStage]}
          </p>
          {project.stageChangedAt && (
            <p className="mt-0.5 text-xs text-(--muted)">
              {new Date(project.stageChangedAt).toLocaleDateString(dateLocale, {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>

        {!isTerminal && (
          <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
            {canAdvance ? (
              <>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={tp.notePlaceholder}
                  className="w-full sm:w-72 rounded-lg border border-(--border) bg-(--background) px-3 py-1.5 text-xs text-(--foreground) placeholder-(--muted) resize-none focus:outline-none focus:ring-2 focus:ring-brand-purple/40"
                />
                <button
                  onClick={handleAdvance}
                  disabled={advanceMutation.isPending}
                  className="self-end rounded-lg bg-brand-purple px-4 py-2 text-sm font-medium text-white hover:bg-brand-purple/90 disabled:opacity-50 transition-colors"
                >
                  {advanceMutation.isPending
                    ? "…"
                    : `${tp.advanceTo} : ${nextStage ? tp[nextStage] : ""}`}
                </button>
              </>
            ) : (
              <p className="text-xs text-(--muted) italic">{tp.noPermission}</p>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 px-4 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Stage checklist */}
      {checklist && checklist.items.length > 0 && (
        <div className="rounded-xl border border-(--border) bg-(--surface) overflow-hidden">
          <div className="px-5 py-3 border-b border-(--border) flex items-center justify-between">
            <h3 className="text-sm font-semibold text-(--foreground)">
              {lang === "fr" ? "Actions requises pour cette étape" : "Required actions for this stage"}
            </h3>
            <span className="text-xs text-(--muted)">
              {checklist.items.filter((i) => i.completed).length} / {checklist.items.length}
            </span>
          </div>
          <ul className="divide-y divide-(--border)">
            {checklist.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                <div
                  className={`shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    item.completed
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-(--border) bg-(--background)"
                  }`}
                >
                  {item.completed && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    item.completed ? "line-through text-(--muted)" : "text-(--foreground)"
                  }`}
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* History */}
      <div className="rounded-xl border border-(--border) bg-(--surface) overflow-hidden">
        <div className="px-5 py-3 border-b border-(--border)">
          <h3 className="text-sm font-semibold text-(--foreground)">{tp.historyTitle}</h3>
        </div>
        {history.length === 0 ? (
          <p className="px-5 py-4 text-sm text-(--muted)">{tp.historyEmpty}</p>
        ) : (
          <ul className="divide-y divide-(--border)">
            {history.map((entry) => (
              <li key={entry.id} className="px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 text-(--foreground)">
                  <span className="rounded px-1.5 py-0.5 bg-(--surface-raised) text-xs text-(--muted)">
                    {tp[entry.fromStage]}
                  </span>
                  <svg className="h-3 w-3 text-(--muted)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="rounded px-1.5 py-0.5 bg-brand-purple/10 text-xs font-medium text-brand-purple">
                    {tp[entry.toStage]}
                  </span>
                </span>
                <div className="flex flex-col items-end gap-0.5">
                  {entry.note && (
                    <span className="text-xs text-(--foreground) italic max-w-xs text-right">
                      "{entry.note}"
                    </span>
                  )}
                  <span className="text-xs text-(--muted)">
                    {entry.changedBy
                      ? `${entry.changedBy.firstName} ${entry.changedBy.lastName} · `
                      : ""}
                    {new Date(entry.changedAt).toLocaleDateString(dateLocale, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
