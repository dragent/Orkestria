"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";
import {
  useSubcontractorProjectQuery,
  useTasksQuery,
  useUpdateTaskMutation,
} from "@/lib/hooks/queries";
import { ProjectStageReadOnly } from "@/components/projects/ProjectStageReadOnly";

export default function SubcontractorProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const { t } = useLanguage();
  const tt = t.tasks;
  const s = t.subcontractor;

  const { data: project, isLoading, isError } = useSubcontractorProjectQuery(
    Number.isFinite(projectId) ? projectId : undefined
  );
  const { data: tasks = [], isLoading: tasksLoading } = useTasksQuery(
    Number.isFinite(projectId) ? projectId : undefined
  );
  const updateTask = useUpdateTaskMutation(projectId);

  if (!Number.isFinite(projectId)) return null;

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto space-y-8">
      <Link
        href="/subcontractor"
        className="inline-flex items-center gap-1.5 text-sm text-(--muted) hover:text-(--foreground) transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        {t.projects?.back ?? "Retour"}
      </Link>

      {isError && (
        <p className="text-red-600 dark:text-red-400 text-sm">{s.loadError}</p>
      )}

      {isLoading || !project ? (
        <div className="space-y-3">
          <div className="h-8 w-2/3 rounded-lg bg-(--surface) animate-pulse" />
          <div className="h-4 w-1/2 rounded-lg bg-(--surface) animate-pulse" />
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-(--foreground)">{project.title}</h1>
          </div>
          {(project.startDate || project.endDate) && (
            <p className="text-sm text-(--muted)">
              {t.projectDetail.start}: {project.startDate ? new Date(project.startDate).toLocaleDateString() : "?"}
              {" · "}
              {t.projectDetail.end}: {project.endDate ? new Date(project.endDate).toLocaleDateString() : "…"}
            </p>
          )}
          <ProjectStageReadOnly
            currentStage={project.pipelineStage}
            stageChangedAt={project.stageChangedAt}
          />
        </div>
      )}

      {/* Tasks */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-(--foreground)">{s.myTasks}</h2>
        {tasksLoading ? (
          <div className="h-16 rounded-xl bg-(--surface) animate-pulse" />
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-(--border) bg-(--surface) px-6 py-8 text-center">
            <p className="text-sm text-(--muted)">{tt.none}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => {
              const isDone = task.status === "done";
              const statusLabel =
                task.status === "done" ? tt.statusDone
                : task.status === "in_progress" ? tt.statusInProgress
                : tt.statusOpen;

              const statusColor = isDone
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : task.status === "in_progress"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-(--surface-raised) text-(--muted)";

              return (
                <div
                  key={task.id}
                  className={`rounded-xl border bg-(--surface) p-4 flex items-start gap-4 border-(--border) transition-opacity ${
                    isDone ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className={`font-medium text-(--foreground) ${isDone ? "line-through" : ""}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-(--muted) truncate">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
                        {statusLabel}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-(--muted)">
                          {tt.dueDate}: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {!isDone && (
                    <button
                      type="button"
                      onClick={() =>
                        updateTask.mutate({ taskId: task.id, body: { status: "done" } })
                      }
                      disabled={updateTask.isPending}
                      className="shrink-0 rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:border-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-60 transition-colors"
                    >
                      {s.markDone}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
