"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useLanguage } from "@/contexts/language-context";
import { useProjectsQuery, useUpdateProjectMutation } from "@/lib/hooks/queries";
import { PIPELINE_STAGES, formatPipeline } from "@/lib/pipeline-label";
import type { ApiProject, ProjectPipelineStage } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api";

// ─── Draggable Card ──────────────────────────────────────────────────────────

function ProjectCard({ project, isDragging }: { project: ApiProject; isDragging?: boolean }) {
  const { t } = useLanguage();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: project.id,
    data: { project },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`rounded-lg border bg-(--background) p-3 space-y-1.5 cursor-grab active:cursor-grabbing select-none transition-shadow ${
        isDragging
          ? "opacity-40"
          : "border-(--border) hover:border-brand-purple/40 hover:shadow-sm"
      }`}
    >
      <Link
        href={`/admin/projects/${project.id}`}
        onClick={(e) => e.stopPropagation()}
        className="block text-sm font-medium text-(--foreground) hover:text-brand-purple line-clamp-2"
      >
        {project.title}
      </Link>
      {project.client && (
        <p className="text-xs text-(--muted) truncate">{project.client.name}</p>
      )}
      {project.stageChangedAt && (
        <p className="text-xs text-(--muted)">
          {new Date(project.stageChangedAt).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
          })}
        </p>
      )}
    </div>
  );
}

// ─── Droppable Column ─────────────────────────────────────────────────────────

function KanbanColumn({
  stage,
  projects,
  activeId,
  dragOverStage,
}: {
  stage: ProjectPipelineStage;
  projects: ApiProject[];
  activeId: number | null;
  dragOverStage: ProjectPipelineStage | null;
}) {
  const { t } = useLanguage();
  const tp = t.pipeline;
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      className={`flex flex-col gap-2 min-w-[200px] max-w-[220px] shrink-0 rounded-xl border p-3 transition-colors ${
        isOver
          ? "border-brand-purple/60 bg-brand-purple/5"
          : "border-(--border) bg-(--surface)"
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-(--border)">
        <span className="text-xs font-semibold text-(--foreground) leading-tight">
          {formatPipeline(stage, tp)}
        </span>
        <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-(--surface-raised) text-xs font-medium text-(--muted)">
          {projects.length}
        </span>
      </div>

      {/* Cards */}
      <div ref={setNodeRef} className="flex flex-col gap-2 min-h-[60px]">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} isDragging={p.id === activeId} />
        ))}
        {projects.length === 0 && (
          <div className="flex items-center justify-center h-10 rounded-lg border-2 border-dashed border-(--border) text-xs text-(--muted)">
            —
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Kanban page ──────────────────────────────────────────────────────────────

export default function ProjectsKanbanPage() {
  const { t } = useLanguage();
  const tp = t.pipeline;
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useProjectsQuery();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [dragOverStage, setDragOverStage] = useState<ProjectPipelineStage | null>(null);

  // Optimistic local override while dragging
  const [localStages, setLocalStages] = useState<Record<number, ProjectPipelineStage>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const grouped = useMemo<Record<ProjectPipelineStage, ApiProject[]>>(() => {
    const map = {} as Record<ProjectPipelineStage, ApiProject[]>;
    for (const stage of PIPELINE_STAGES) map[stage] = [];
    for (const p of projects) {
      const stage = localStages[p.id] ?? p.pipelineStage;
      map[stage].push(p);
    }
    return map;
  }, [projects, localStages]);

  const activeProject = activeId !== null
    ? projects.find((p) => p.id === activeId) ?? null
    : null;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as number);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setDragOverStage(over ? (over.id as ProjectPipelineStage) : null);
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    setDragOverStage(null);

    if (!over) return;

    const projectId = active.id as number;
    const newStage = over.id as ProjectPipelineStage;
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const currentStage = localStages[projectId] ?? project.pipelineStage;
    if (currentStage === newStage) return;

    // Optimistic update
    setLocalStages((prev) => ({ ...prev, [projectId]: newStage }));

    try {
      await projectsApi.update(projectId, { pipelineStage: newStage });
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch {
      // Rollback
      setLocalStages((prev) => {
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
    }
  }

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-(--foreground)">
            {t.nav.kanban ?? "Kanban projets"}
          </h1>
          <p className="text-sm text-(--muted) mt-0.5">
            {t.kanban?.subtitle ?? "Glissez les projets pour changer d'étape"}
          </p>
        </div>
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1.5 rounded-lg border border-(--border) bg-(--background) px-4 py-2 text-sm font-medium text-(--foreground) hover:bg-(--surface) transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          {t.projects?.listView ?? "Vue liste"}
        </Link>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="min-w-[200px] h-48 rounded-xl bg-(--surface) animate-pulse shrink-0" />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 overflow-x-auto pb-4">
            {PIPELINE_STAGES.map((stage) => (
              <KanbanColumn
                key={stage}
                stage={stage}
                projects={grouped[stage]}
                activeId={activeId}
                dragOverStage={dragOverStage}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeProject ? (
              <div className="rotate-2 opacity-95">
                <ProjectCard project={activeProject} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
