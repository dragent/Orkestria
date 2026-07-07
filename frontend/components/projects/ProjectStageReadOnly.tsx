"use client";

import { PIPELINE_STAGES, formatPipeline } from "@/lib/pipeline-label";
import { useLanguage } from "@/contexts/language-context";
import type { ProjectPipelineStage } from "@/lib/api";

interface Props {
  currentStage: ProjectPipelineStage;
  stageChangedAt?: string | null;
}

export function ProjectStageReadOnly({ currentStage, stageChangedAt }: Props) {
  const { t, lang } = useLanguage();
  const tp = t.pipeline;
  const currentIdx = PIPELINE_STAGES.indexOf(currentStage);
  const pct = Math.round(((currentIdx + 1) / PIPELINE_STAGES.length) * 100);
  const dateLocale = lang === "fr" ? "fr-FR" : "en-US";

  return (
    <div className="space-y-3">
      {/* Progress bar + label */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-(--foreground)">
            {formatPipeline(currentStage, tp)}
          </span>
          <span className="text-xs text-(--muted)">
            {currentIdx + 1} / {PIPELINE_STAGES.length}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-(--surface-raised)">
          <div
            className="h-full rounded-full bg-brand-purple transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {stageChangedAt && (
          <p className="text-xs text-(--muted)">
            {new Date(stageChangedAt).toLocaleDateString(dateLocale, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {/* Mini stepper — compact dots */}
      <div className="flex flex-wrap gap-1">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isPast    = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <div
              key={stage}
              title={formatPipeline(stage, tp)}
              className={`h-2 rounded-full transition-all ${
                isCurrent
                  ? "w-6 bg-brand-purple"
                  : isPast
                  ? "w-2 bg-brand-purple/60"
                  : "w-2 bg-(--border)"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
