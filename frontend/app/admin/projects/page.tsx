"use client";

import { useState } from "react";
import Link from "next/link";
import { FlashBag } from "@/components/FlashBag";
import type { ProjectListParams, ProjectPipelineStage } from "@/lib/api";
import { useLanguage } from "@/contexts/language-context";
import { useProjectsQuery } from "@/lib/hooks/queries";
import { formatPipeline, PIPELINE_STAGES } from "@/lib/pipeline-label";

export default function AdminProjectsPage() {
  const { t, lang } = useLanguage();
  const tp = t.projects;
  const [q, setQ] = useState("");
  const [pipeline, setPipeline] = useState<"" | ProjectPipelineStage>("");

  const params: ProjectListParams | undefined =
    q.trim() || pipeline
      ? {
          ...(q.trim() ? { q: q.trim() } : {}),
          ...(pipeline ? { pipeline } : {}),
        }
      : undefined;

  const { data: projects = [], isLoading, isError, error } = useProjectsQuery(params);
  const serverError = isError ? ((error as { message?: string })?.message ?? tp.loadError) : null;
  const dateLocale = lang === "fr" ? "fr-FR" : "en-GB";

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy dark:text-white">{tp.title}</h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1">{tp.subtitle}</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex justify-center rounded-lg bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-navy"
        >
          {tp.add}
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">{tp.filterSearch}</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:w-48">
          <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">{tp.filterPipeline}</label>
          <select
            value={pipeline}
            onChange={(e) => setPipeline(e.target.value as "" | ProjectPipelineStage)}
            className="w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
          >
            <option value="">{tp.allPipelines}</option>
            {PIPELINE_STAGES.map((s) => (
              <option key={s} value={s}>
                {formatPipeline(s, t.pipeline)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {serverError && <FlashBag variant="error" message={serverError} />}

      <div className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-zinc-700">
          <thead className="bg-slate-50 dark:bg-zinc-800/80">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                {tp.colTitle}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                {tp.colClient}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                {tp.colPipeline}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                {tp.colCreated}
              </th>
              <th className="relative px-6 py-3.5">
                <span className="sr-only">{t.view}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-700">
            {isLoading
              ? [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 rounded bg-slate-100 dark:bg-zinc-800 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : projects.length === 0
                ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 dark:text-zinc-500">
                        {tp.none}
                      </td>
                    </tr>
                  )
                : projects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-zinc-100">{p.title}</td>
                      <td className="px-6 py-4 text-sm">
                        <Link href={`/admin/clients/${p.client.id}`} className="text-brand-purple hover:underline">
                          {p.client.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-zinc-300">
                        {formatPipeline(p.pipelineStage, t.pipeline)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 dark:text-zinc-500">
                        {new Date(p.createdAt).toLocaleDateString(dateLocale, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/projects/${p.id}`}
                          className="text-sm font-medium text-brand-purple hover:text-brand-navy dark:hover:text-white"
                        >
                          {t.view}
                        </Link>
                      </td>
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
