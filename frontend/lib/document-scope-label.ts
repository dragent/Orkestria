import type { DocumentScope } from "@/lib/api";
import type { Translations } from "@/lib/i18n";

export function formatDocumentScope(scope: DocumentScope, d: Translations["documents"]): string {
  const labels: Record<DocumentScope, string> = {
    rh: d.scopeRh,
    tech: d.scopeTech,
    finance: d.scopeFinance,
    design: d.scopeDesign,
    legal: d.scopeLegal,
  };
  return labels[scope];
}
