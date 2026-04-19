import type { ProjectPipelineStage } from "@/lib/api";
import type { Translations } from "@/lib/i18n";

export function formatPipeline(stage: ProjectPipelineStage, p: Translations["pipeline"]): string {
  const labels: Record<ProjectPipelineStage, string> = {
    lead: p.lead,
    quote: p.quote,
    production: p.production,
    delivery: p.delivery,
    invoiced: p.invoiced,
  };
  return labels[stage];
}

export const PIPELINE_STAGES: ProjectPipelineStage[] = [
  "lead",
  "quote",
  "production",
  "delivery",
  "invoiced",
];
