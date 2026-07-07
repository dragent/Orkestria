"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { useClientProjectsQuery } from "@/lib/hooks/queries";
import { formatPipeline } from "@/lib/pipeline-label";

export default function ClientHomePage() {
  const { t } = useLanguage();
  const cs = t.clientSpace;
  const { data: projects, isLoading, isError } = useClientProjectsQuery();

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{cs.projectsTitle}</h1>
        <p className="text-sm text-[var(--muted)] mt-1">{cs.projectsSubtitle}</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 rounded-full border-4 border-brand-purple border-t-transparent animate-spin" />
        </div>
      )}

      {isError && <p className="text-red-600 dark:text-red-400 text-sm">{cs.loadError}</p>}

      {!isLoading && !isError && projects && (
        <>
          {projects.length === 0 ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center">
              <p className="text-[var(--muted)]">{cs.noProjects}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/client/projects/${project.id}`}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 hover:bg-[var(--surface-raised)] transition-colors block"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--foreground)] truncate">{project.title}</p>
                      <p className="text-sm text-[var(--muted)] mt-1">{project.client.name}</p>
                    </div>
                    <span className="shrink-0 inline-flex items-center rounded-full bg-brand-purple/10 px-2 py-0.5 text-xs font-medium text-brand-purple">
                      {formatPipeline(project.pipelineStage, t.pipeline)}
                    </span>
                  </div>
                  {(project.startDate || project.endDate) && (
                    <p className="mt-3 text-xs text-[var(--muted)]">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : "?"}
                      {" → "}
                      {project.endDate ? new Date(project.endDate).toLocaleDateString() : "…"}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
