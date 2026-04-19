"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/lib/zod-resolver";
import { FlashBag } from "@/components/FlashBag";
import type { ProjectPipelineStage } from "@/lib/api";
import { useLanguage } from "@/contexts/language-context";
import { useClientsQuery, useCreateProjectMutation } from "@/lib/hooks/queries";
import { formatPipeline, PIPELINE_STAGES } from "@/lib/pipeline-label";

const schema = z.object({
  title: z.string().min(1),
  clientId: z.string().min(1),
  pipelineStage: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewProjectPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const tp = t.projects;
  const tf = t.adminForms;
  const [serverError, setServerError] = useState<string | null>(null);
  const { data: clients = [] } = useClientsQuery();
  const createMutation = useCreateProjectMutation();

  const {
    register,
    handleSubmit,
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

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      const project = await createMutation.mutateAsync({
        title: data.title.trim(),
        clientId: Number.parseInt(data.clientId, 10),
        pipelineStage: data.pipelineStage as ProjectPipelineStage,
        startDate: data.startDate ? data.startDate : null,
        endDate: data.endDate ? data.endDate : null,
      });
      router.push(`/admin/projects/${project.id}`);
    } catch (err: unknown) {
      setServerError((err as { message?: string })?.message ?? tf.genericError);
    }
  }

  return (
    <div className="p-8 max-w-lg space-y-6">
      <div>
        <Link href="/admin/projects" className="text-sm text-slate-500 dark:text-zinc-400 hover:text-brand-navy">
          ← {tp.back}
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-brand-navy dark:text-white">{tp.newTitle}</h1>
      </div>
      {serverError && <FlashBag variant="error" message={serverError} />}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">{tp.colTitle}</label>
          <input {...register("title")} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm" />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">{tp.colClient}</label>
          <select {...register("clientId")} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm">
            <option value="">—</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.company.name})
              </option>
            ))}
          </select>
          {errors.clientId && <p className="mt-1 text-xs text-red-600">{errors.clientId.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">{t.projectDetail.pipeline}</label>
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
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">{t.projectDetail.start}</label>
            <input type="date" {...register("startDate")} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">{t.projectDetail.end}</label>
            <input type="date" {...register("endDate")} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm" />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand-purple py-2.5 text-sm font-semibold text-white hover:bg-brand-navy disabled:opacity-60"
        >
          {isSubmitting ? tf.saving : tp.add}
        </button>
      </form>
    </div>
  );
}
