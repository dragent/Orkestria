"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/lib/zod-resolver";
import { FlashBag } from "@/components/FlashBag";
import type { ProjectPipelineStage } from "@/lib/api";
import { useLanguage } from "@/contexts/language-context";
import { useClientsQuery, useProjectQuery, useUpdateProjectMutation } from "@/lib/hooks/queries";
import { formatPipeline, PIPELINE_STAGES } from "@/lib/pipeline-label";

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
      pipelineStage: "lead",
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
    } catch (err: unknown) {
      setServerError((err as { message?: string })?.message ?? tf.genericError);
    }
  }

  const loadError = isError ? ((error as { message?: string })?.message ?? tp.loadError) : null;
  const dateLocale = lang === "fr" ? "fr-FR" : "en-GB";

  if (!Number.isFinite(projectId)) return null;

  return (
    <div className="p-8 max-w-2xl space-y-6">
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
          <div>
            <h1 className="text-2xl font-bold text-brand-navy dark:text-white">{project.title}</h1>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">
              {td.pipeline}: {formatPipeline(project.pipelineStage, t.pipeline)} ·{" "}
              {new Date(project.createdAt).toLocaleDateString(dateLocale, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

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
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">{td.pipeline}</label>
              <select {...register("pipelineStage")} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm">
                {PIPELINE_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {formatPipeline(s, t.pipeline)}
                  </option>
                ))}
              </select>
            </div>
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
        </>
      )}
    </div>
  );
}
