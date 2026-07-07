"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/lib/zod-resolver";
import { FlashBag } from "@/components/FlashBag";
import { ProjectStageStepper } from "@/components/projects/ProjectStageStepper";
import type { ProjectPipelineStage } from "@/lib/api";
import { useLanguage } from "@/contexts/language-context";
import {
  useClientsQuery,
  useMeQuery,
  useProjectQuery,
  useUpdateProjectMutation,
} from "@/lib/hooks/queries";
import { PIPELINE_STAGES, formatPipeline } from "@/lib/pipeline-label";
import { ProjectDocumentsSection } from "./ProjectDocumentsSection";
import { ProjectTasksSection } from "./ProjectTasksSection";
import { ProjectQuotesSection } from "./ProjectQuotesSection";
import { ProjectTicketsSection } from "./ProjectTicketsSection";
import { ProjectTimeEntrySection } from "./ProjectTimeEntrySection";

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

const schema = z.object({
  title: z.string().min(1),
  clientId: z.string().min(1),
  pipelineStage: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AdminProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const { t, lang } = useLanguage();
  const tp = t.projects;
  const td = t.projectDetail;
  const tf = t.adminForms;
  const [serverError, setServerError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);
  const [showStageOverride, setShowStageOverride] = useState(false);

  const { data: me } = useMeQuery();
  const userRoles: string[] = me?.roles ?? [];

  const { data: project, isLoading, isError, error } = useProjectQuery(
    Number.isFinite(projectId) ? projectId : undefined
  );
  const { data: clients = [] } = useClientsQuery();
  const updateMutation = useUpdateProjectMutation(projectId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      clientId: "",
      pipelineStage: "contact",
      startDate: "",
      endDate: "",
    },
  });

  useEffect(() => {
    if (!project) return;
    reset({
      title: project.title,
      clientId: String(project.client.id),
      pipelineStage: project.pipelineStage,
      startDate: toDateInput(project.startDate),
      endDate: toDateInput(project.endDate),
    });
  }, [project, reset]);

  async function onSubmit(data: FormData) {
    setServerError(null);
    setSaveOk(false);
    try {
      await updateMutation.mutateAsync({
        title: data.title.trim(),
        clientId: Number.parseInt(data.clientId, 10),
        pipelineStage: data.pipelineStage as ProjectPipelineStage,
        startDate: data.startDate ? `${data.startDate}T00:00:00Z` : null,
        endDate: data.endDate ? `${data.endDate}T00:00:00Z` : null,
      });
      setSaveOk(true);
      setShowStageOverride(false);
    } catch (err: unknown) {
      setServerError((err as { message?: string })?.message ?? tf.genericError);
    }
  }

  const loadError = isError ? ((error as { message?: string })?.message ?? tp.loadError) : null;
  const dateLocale = lang === "fr" ? "fr-FR" : "en-GB";
  const isAdmin = userRoles.includes("ROLE_ADMIN");

  if (!Number.isFinite(projectId)) return null;

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      <Link href="/admin/projects" className="text-sm text-slate-500 dark:text-zinc-400 hover:text-brand-navy">
        ← {tp.back}
      </Link>
      {loadError && <FlashBag variant="error" message={loadError} />}
      {serverError && <FlashBag variant="error" message={serverError} />}
      {saveOk && <FlashBag variant="success" message={tf.changesSaved} />}

      {isLoading || !project ? (
        <div className="h-40 rounded-xl bg-slate-100 dark:bg-zinc-800 animate-pulse" />
      ) : (
        <>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-brand-navy dark:text-white">{project.title}</h1>
              <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">
                {new Date(project.createdAt).toLocaleDateString(dateLocale, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <a
              href={`/api/pdf/projects/${project.id}/report`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Rapport PDF
            </a>
          </div>

          {/* Pipeline stepper — principal workflow control */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wide">
              {td.pipeline}
            </h2>
            <ProjectStageStepper project={project} userRoles={userRoles} />

            {/* Admin override: manually set any stage */}
            {isAdmin && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowStageOverride((v) => !v)}
                  className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] underline"
                >
                  {showStageOverride ? "▲ Masquer correction manuelle" : "▼ Corriger l'étape manuellement (admin)"}
                </button>
                {showStageOverride && (
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-3 flex items-end gap-3"
                  >
                    <input type="hidden" {...register("title")} value={project.title} />
                    <input type="hidden" {...register("clientId")} value={String(project.client.id)} />
                    <input type="hidden" {...register("startDate")} value={toDateInput(project.startDate)} />
                    <input type="hidden" {...register("endDate")} value={toDateInput(project.endDate)} />
                    <select
                      {...register("pipelineStage")}
                      className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)]"
                    >
                      {PIPELINE_STAGES.map((s) => (
                        <option key={s} value={s}>
                          {formatPipeline(s, t.pipeline)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-lg bg-slate-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                    >
                      {isSubmitting ? tf.saving : tf.save}
                    </button>
                  </form>
                )}
              </div>
            )}
          </section>

          {/* Core project info edit form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
            <h2 className="font-semibold text-brand-navy dark:text-white">{td.dates}</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">{tp.colTitle}</label>
              <input {...register("title")} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm" />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">{tp.colClient}</label>
              <select {...register("clientId")} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm">
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Hidden pipelineStage field — value driven by stepper or override */}
            <input type="hidden" {...register("pipelineStage")} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">{td.start}</label>
                <input type="date" {...register("startDate")} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">{td.end}</label>
                <input type="date" {...register("endDate")} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm" />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy disabled:opacity-60"
            >
              {isSubmitting ? tf.saving : tf.save}
            </button>
          </form>

          <ProjectTasksSection projectId={projectId} />
          <ProjectTimeEntrySection projectId={projectId} />
          <ProjectTicketsSection projectId={projectId} />
          <ProjectDocumentsSection projectId={projectId} />
          <ProjectQuotesSection projectId={projectId} />
        </>
      )}
    </div>
  );
}
