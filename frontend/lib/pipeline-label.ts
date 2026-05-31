import type { ProjectPipelineStage } from "@/lib/api";
import type { Translations } from "@/lib/i18n";

export function formatPipeline(stage: ProjectPipelineStage, p: Translations["pipeline"]): string {
  return p[stage];
}

export const PIPELINE_STAGES: ProjectPipelineStage[] = [
  "contact",
  "meeting",
  "engineer_assigned",
  "quote_plan",
  "quote_signed",
  "invoice_sent",
  "deposit_received",
  "design_started",
  "design_completed",
  "client_signed",
  "components_ordered",
  "construction",
  "subcontractors",
  "site_visit",
  "paid",
];

/** Roles required to advance FROM a given stage (mirrors backend TRANSITION_ROLES) */
export const TRANSITION_ROLES: Record<ProjectPipelineStage, string[]> = {
  contact:            ["ROLE_ADMIN"],
  meeting:            ["ROLE_ADMIN"],
  engineer_assigned:  ["ROLE_ADMIN", "ROLE_ENGINEER"],
  quote_plan:         ["ROLE_ADMIN", "ROLE_ENGINEER"],
  quote_signed:       ["ROLE_ADMIN"],
  invoice_sent:       ["ROLE_ADMIN", "ROLE_RH"],
  deposit_received:   ["ROLE_ADMIN", "ROLE_ENGINEER"],
  design_started:     ["ROLE_ADMIN", "ROLE_ENGINEER"],
  design_completed:   ["ROLE_ADMIN"],
  client_signed:      ["ROLE_ADMIN", "ROLE_ENGINEER"],
  components_ordered: ["ROLE_ADMIN", "ROLE_ENGINEER"],
  construction:       ["ROLE_ADMIN"],
  subcontractors:     ["ROLE_ADMIN", "ROLE_ENGINEER"],
  site_visit:         ["ROLE_ADMIN", "ROLE_RH"],
  paid:               [],
};
