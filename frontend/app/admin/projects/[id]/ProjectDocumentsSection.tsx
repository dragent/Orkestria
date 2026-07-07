"use client";

import { useState } from "react";
import { FlashBag } from "@/components/FlashBag";
import {
  DOCUMENT_SCOPES,
  type DocumentScope,
  documentsApi,
} from "@/lib/api";
import { formatDocumentScope } from "@/lib/document-scope-label";
import { useProjectDocumentsQuery, useUploadDocumentMutation } from "@/lib/hooks/queries";
import { useLanguage } from "@/contexts/language-context";

type Props = {
  projectId: number;
};

export function ProjectDocumentsSection({ projectId }: Props) {
  const { t, lang } = useLanguage();
  const td = t.documents;
  const [scopeFilter, setScopeFilter] = useState<"" | DocumentScope>("");
  const filter = scopeFilter === "" ? undefined : scopeFilter;
  const { data: docs = [], isLoading, isError, error } = useProjectDocumentsQuery(projectId, filter);
  const uploadMutation = useUploadDocumentMutation(projectId);
  const [file, setFile] = useState<File | null>(null);
  const [uploadScope, setUploadScope] = useState<DocumentScope>("rh");
  const [serverError, setServerError] = useState<string | null>(null);
  const dateLocale = lang === "fr" ? "fr-FR" : "en-GB";

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!file) {
      setServerError(td.file);
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("scope", uploadScope);
    try {
      await uploadMutation.mutateAsync(fd);
      setFile(null);
    } catch (err: unknown) {
      setServerError((err as { message?: string })?.message ?? td.loadError);
    }
  }

  async function handleDownload(docId: number, name: string) {
    setServerError(null);
    try {
      const blob = await documentsApi.downloadBlob(docId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setServerError((err as { message?: string })?.message ?? td.loadError);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 space-y-4">
      <h2 className="font-semibold text-brand-navy dark:text-white">{td.title}</h2>
      {serverError && <FlashBag variant="error" message={serverError} />}

      <form onSubmit={handleUpload} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end border-b border-slate-100 dark:border-zinc-700 pb-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">{td.file}</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-slate-600 dark:text-zinc-300"
          />
        </div>
        <div className="sm:w-40">
          <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">{td.scope}</label>
          <select
            value={uploadScope}
            onChange={(e) => setUploadScope(e.target.value as DocumentScope)}
            className="w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
          >
            {DOCUMENT_SCOPES.map((s) => (
              <option key={s} value={s}>
                {formatDocumentScope(s, td)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={uploadMutation.isPending}
          className="rounded-lg bg-brand-purple px-4 py-2 text-sm font-semibold text-white hover:bg-brand-navy disabled:opacity-60"
        >
          {uploadMutation.isPending ? "…" : td.upload}
        </button>
      </form>

      <div className="sm:w-48">
        <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">{td.filterScope}</label>
        <select
          value={scopeFilter}
          onChange={(e) => setScopeFilter(e.target.value as "" | DocumentScope)}
          className="w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
        >
          <option value="">{td.allScopes}</option>
          {DOCUMENT_SCOPES.map((s) => (
            <option key={s} value={s}>
              {formatDocumentScope(s, td)}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="h-24 rounded-lg bg-slate-100 dark:bg-zinc-800 animate-pulse" />
      ) : isError ? (
        <p className="text-sm text-red-600">{td.loadError}</p>
      ) : docs.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-zinc-500">{td.none}</p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-zinc-700">
          {docs.map((d) => (
            <li key={d.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-zinc-100">{d.name}</p>
                <p className="text-xs text-slate-400 dark:text-zinc-500">
                  {formatDocumentScope(d.scope, td)} ·{" "}
                  {new Date(d.createdAt).toLocaleDateString(dateLocale, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleDownload(d.id, d.name)}
                className="text-sm font-medium text-brand-purple hover:underline self-start sm:self-auto"
              >
                {td.download}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
