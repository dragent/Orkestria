"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  clientsApi,
  companiesApi,
  documentsApi,
  meApi,
  projectsApi,
  usersApi,
  type ApiClient,
  type ApiDocument,
  type ApiProject,
  type Company,
  type DocumentScope,
  type ProjectListParams,
  type ProjectPipelineStage,
  type User,
} from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useMeQuery() {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["me", sessionRevision] as const,
    queryFn: () => meApi.get(),
  });
}

export function useUsersQuery() {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["users", sessionRevision] as const,
    queryFn: () => usersApi.list(),
  });
}

export function useUserQuery(id: number | undefined) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["users", id, sessionRevision] as const,
    queryFn: () => usersApi.get(id!),
    enabled: id != null && Number.isFinite(id),
  });
}

export function useCompaniesQuery() {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["companies", sessionRevision] as const,
    queryFn: () => companiesApi.list(),
  });
}

export function useCompanyQuery(id: number | undefined) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["companies", id, sessionRevision] as const,
    queryFn: () => companiesApi.get(id!),
    enabled: id != null && Number.isFinite(id),
  });
}

export function useCreateCompanyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; slug: string }) => companiesApi.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

export function useUpdateCompanyMutation(companyId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name?: string; slug?: string }) =>
      companiesApi.update(companyId, body),
    onSuccess: (data: Company) => {
      void queryClient.invalidateQueries({ queryKey: ["companies"] });
      void queryClient.invalidateQueries({ queryKey: ["companies", data.id] });
    },
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      roles?: string[];
      companyId?: number | null;
    }) => usersApi.adminCreate(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useAdminUpdateUserMutation(userId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      roles?: string[];
      isActive?: boolean;
      companyId?: number | null;
      documentScopes?: string[];
    }) => usersApi.adminUpdate(userId, body),
    onSuccess: (data: User) => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      void queryClient.invalidateQueries({ queryKey: ["users", data.id] });
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useClientsQuery() {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["clients", sessionRevision] as const,
    queryFn: () => clientsApi.list(),
  });
}

export function useClientQuery(id: number | undefined) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["clients", id, sessionRevision] as const,
    queryFn: () => clientsApi.get(id!),
    enabled: id != null && Number.isFinite(id),
  });
}

export function useCreateClientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; email: string; companyId: number }) => clientsApi.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useUpdateClientMutation(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name?: string; email?: string; companyId?: number }) =>
      clientsApi.update(clientId, body),
    onSuccess: (data: ApiClient) => {
      void queryClient.invalidateQueries({ queryKey: ["clients"] });
      void queryClient.invalidateQueries({ queryKey: ["clients", data.id] });
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useProjectsQuery(params?: ProjectListParams) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["projects", params ?? {}, sessionRevision] as const,
    queryFn: () => projectsApi.list(params),
  });
}

export function useProjectQuery(id: number | undefined) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["projects", id, sessionRevision] as const,
    queryFn: () => projectsApi.get(id!),
    enabled: id != null && Number.isFinite(id),
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      title: string;
      clientId: number;
      pipelineStage?: ProjectPipelineStage;
      startDate?: string | null;
      endDate?: string | null;
    }) => projectsApi.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProjectMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      title?: string;
      clientId?: number;
      pipelineStage?: ProjectPipelineStage;
      startDate?: string | null;
      endDate?: string | null;
    }) => projectsApi.update(projectId, body),
    onSuccess: (data: ApiProject) => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      void queryClient.invalidateQueries({ queryKey: ["projects", data.id] });
    },
  });
}

export function useProjectDocumentsQuery(projectId: number | undefined, scope?: DocumentScope) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["projects", projectId, "documents", scope ?? "all", sessionRevision] as const,
    queryFn: () => documentsApi.listByProject(projectId!, scope),
    enabled: projectId != null && Number.isFinite(projectId),
  });
}

export function useUploadDocumentMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => documentsApi.upload(projectId, formData),
    onSuccess: (doc: ApiDocument) => {
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "documents"] });
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    },
  });
}
