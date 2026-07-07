"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminBtpApi,
  clientsApi,
  clientTicketsApi,
  clientProjectsApi,
  companiesApi,
  documentsApi,
  employeesApi,
  invoicesApi,
  leavesApi,
  meApi,
  projectEmployeesApi,
  projectsApi,
  quotesApi,
  roleScopePoliciesApi,
  subcontractorApi,
  tasksApi,
  ticketsApi,
  timeEntriesApi,
  usersApi,
  type ApiClient,
  type ApiDocument,
  type ApiEmployee,
  type ApiProject,
  type ApiQuote,
  type ApiStageHistory,
  type Company,
  type ComplianceDeadlineCategory,
  type CreateEmployeePayload,
  type CreateLeavePayload,
  type CreateTicketPayload,
  type DocumentScope,
  type LeaveListFilters,
  type LeaveStatus,
  type ProjectListParams,
  type ProjectPipelineStage,
  type QuoteLineInput,
  type QuoteStatusType,
  type RoleScopePolicyEntry,
  type TaskStatus,
  type TicketListFilters,
  type TicketPriority,
  type TicketType,
  type TimeEntryHourType,
  type UpdateEmployeePayload,
  type UpdateLeavePayload,
  type UpdateTicketPayload,
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

export function useClientProjectsQuery() {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["clientProjects", sessionRevision] as const,
    queryFn: () => clientProjectsApi.list(),
  });
}

export function useClientProjectQuery(id: number | undefined) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["clientProjects", id, sessionRevision] as const,
    queryFn: () => clientProjectsApi.get(id!),
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

export function useAdvanceStageMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (note?: string) => projectsApi.advanceStage(projectId, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "stage-history"] });
    },
  });
}

export function useStageHistoryQuery(projectId: number | undefined) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["projects", projectId, "stage-history", sessionRevision] as const,
    queryFn: (): Promise<ApiStageHistory[]> => projectsApi.stageHistory(projectId!),
    enabled: projectId != null && Number.isFinite(projectId),
  });
}

export function useStageChecklistQuery(projectId: number | undefined) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["projects", projectId, "stage-checklist", sessionRevision] as const,
    queryFn: () => projectsApi.stageChecklist(projectId!),
    enabled: projectId != null && Number.isFinite(projectId),
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

export function useRoleScopePoliciesQuery() {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["role-scope-policies", sessionRevision] as const,
    queryFn: () => roleScopePoliciesApi.list(),
  });
}

export function useSaveRoleScopePoliciesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Array<{ role: string; documentScopes: string[] }>) =>
      roleScopePoliciesApi.batchUpdate(body),
    onSuccess: (data: RoleScopePolicyEntry[]) => {
      void queryClient.setQueryData(["role-scope-policies"], data);
    },
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

export function useUpdateDocumentClassificationMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, body }: { documentId: number; body: { classificationLabel?: string; classificationStatus?: string } }) =>
      documentsApi.updateClassification(documentId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "documents"] });
    },
  });
}

// ─── Employees ────────────────────────────────────────────────────────────────

export function useEmployeesQuery(params?: { q?: string; companyId?: number }) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["employees", params ?? {}, sessionRevision] as const,
    queryFn: () => employeesApi.list(params),
  });
}

export function useEmployeeQuery(id: number | undefined) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["employees", id, sessionRevision] as const,
    queryFn: () => employeesApi.get(id!),
    enabled: id != null && Number.isFinite(id),
  });
}

export function useCreateEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateEmployeePayload) => employeesApi.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateEmployeeMutation(employeeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateEmployeePayload) => employeesApi.update(employeeId, body),
    onSuccess: (data: ApiEmployee) => {
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
      void queryClient.invalidateQueries({ queryKey: ["employees", data.id] });
    },
  });
}

export function useDeleteEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

// ─── Project employees ────────────────────────────────────────────────────────

export function useProjectEmployeesQuery(projectId: number | undefined) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["projects", projectId, "employees", sessionRevision] as const,
    queryFn: () => projectEmployeesApi.list(projectId!),
    enabled: projectId != null && Number.isFinite(projectId),
  });
}

export function useAssignEmployeeMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: number) => projectEmployeesApi.assign(projectId, employeeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "employees"] });
    },
  });
}

export function useRemoveProjectEmployeeMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: number) => projectEmployeesApi.remove(projectId, employeeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "employees"] });
    },
  });
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export function useTasksQuery(projectId: number | undefined) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["projects", projectId, "tasks", sessionRevision] as const,
    queryFn: () => tasksApi.list(projectId!),
    enabled: projectId != null && Number.isFinite(projectId),
  });
}

export function useCreateTaskMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; description?: string; status?: TaskStatus; dueDate?: string | null; assigneeId?: number | null }) =>
      tasksApi.create(projectId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] });
    },
  });
}

export function useUpdateTaskMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, body }: { taskId: number; body: { title?: string; description?: string; status?: TaskStatus; dueDate?: string | null; assigneeId?: number | null } }) =>
      tasksApi.update(projectId, taskId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] });
    },
  });
}

export function useDeleteTaskMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => tasksApi.delete(projectId, taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] });
    },
  });
}

// ─── Time entries ─────────────────────────────────────────────────────────────

export function useTimeEntriesQuery(projectId: number | undefined) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["projects", projectId, "time-entries", sessionRevision] as const,
    queryFn: () => timeEntriesApi.list(projectId!),
    enabled: projectId != null && Number.isFinite(projectId),
  });
}

export function useCreateTimeEntryMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { employeeId: number; hours: number; date: string; description?: string; hourType?: TimeEntryHourType }) =>
      timeEntriesApi.create(projectId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "time-entries"] });
    },
  });
}

export function useDeleteTimeEntryMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryId: number) => timeEntriesApi.delete(projectId, entryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "time-entries"] });
    },
  });
}

// ─── Subcontractor projects ───────────────────────────────────────────────────

export function useSubcontractorProjectsQuery() {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["subcontractor-projects", sessionRevision] as const,
    queryFn: () => subcontractorApi.projects(),
  });
}

export function useSubcontractorProjectQuery(id: number | undefined) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["subcontractor-projects", id, sessionRevision] as const,
    queryFn: () => subcontractorApi.project(id!),
    enabled: id != null && Number.isFinite(id),
  });
}

// ─── Quotes ───────────────────────────────────────────────────────────────────

export function useQuotesQuery(projectId: number | undefined) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["projects", projectId, "quotes", sessionRevision] as const,
    queryFn: () => quotesApi.list(projectId!),
    enabled: projectId != null && Number.isFinite(projectId),
  });
}

export function useCreateQuoteMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { notes?: string; lines: QuoteLineInput[] }) => quotesApi.create(projectId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "quotes"] });
    },
  });
}

export function useUpdateQuoteMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quoteId, body }: { quoteId: number; body: { status?: QuoteStatusType; notes?: string; lines?: QuoteLineInput[] } }) =>
      quotesApi.update(projectId, quoteId, body),
    onSuccess: (data: ApiQuote) => {
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "quotes"] });
    },
  });
}

export function useAcceptQuoteMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quoteId: number) => quotesApi.accept(projectId, quoteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "quotes"] });
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "invoices"] });
    },
  });
}

export function useRejectQuoteMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quoteId: number) => quotesApi.reject(projectId, quoteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "quotes"] });
    },
  });
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export function useInvoicesQuery(projectId: number | undefined) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["projects", projectId, "invoices", sessionRevision] as const,
    queryFn: () => invoicesApi.list(projectId!),
    enabled: projectId != null && Number.isFinite(projectId),
  });
}

export function useUpdateInvoiceStatusMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, status }: { invoiceId: number; status: "draft" | "sent" | "paid" }) =>
      invoicesApi.updateStatus(projectId, invoiceId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "quotes"] });
    },
  });
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

export function useTicketsQuery(filters?: TicketListFilters) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  const stableKey = JSON.stringify(filters ?? {});
  return useQuery({
    queryKey: ["tickets", stableKey, sessionRevision] as const,
    queryFn: () => ticketsApi.list(filters),
  });
}

export function useTicketQuery(id: number | undefined) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["tickets", id, sessionRevision] as const,
    queryFn: () => ticketsApi.get(id!),
    enabled: id != null && Number.isFinite(id),
  });
}

export function useCreateTicketMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTicketPayload) => ticketsApi.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useUpdateTicketMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateTicketPayload }) =>
      ticketsApi.update(id, body),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["tickets"] });
      void queryClient.invalidateQueries({ queryKey: ["tickets", variables.id] });
    },
  });
}

export function useDeleteTicketMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ticketsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useTicketCommentsQuery(ticketId: number | undefined) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["tickets", ticketId, "comments", sessionRevision] as const,
    queryFn: () => ticketsApi.listComments(ticketId!),
    enabled: ticketId != null && Number.isFinite(ticketId),
  });
}

export function useAddTicketCommentMutation(ticketId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => ticketsApi.addComment(ticketId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tickets", ticketId, "comments"] });
      void queryClient.invalidateQueries({ queryKey: ["tickets", ticketId] });
    },
  });
}

// ─── Client tickets (support requests) ────────────────────────────────────────

export function useClientProjectTicketsQuery(projectId: number | undefined) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["client-tickets", projectId, sessionRevision] as const,
    queryFn: () => clientTicketsApi.list(projectId!),
    enabled: projectId != null && Number.isFinite(projectId),
  });
}

export function useCreateClientTicketMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; description: string; type?: TicketType; priority?: TicketPriority }) =>
      clientTicketsApi.create(projectId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["client-tickets", projectId] });
    },
  });
}

// ─── BTP / RH (executive KPIs, compliance) ──────────────────────────────────

export function useBtpKpisQuery() {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["admin-btp-kpis", sessionRevision] as const,
    queryFn: () => adminBtpApi.kpis(),
  });
}

export function useComplianceDeadlinesQuery(filters?: { companyId?: number; upcomingDays?: number }) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: ["compliance-deadlines", filters?.companyId ?? "all", filters?.upcomingDays ?? "all", sessionRevision] as const,
    queryFn: () => adminBtpApi.complianceList(filters),
  });
}

export function useCreateComplianceDeadlineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof adminBtpApi.complianceCreate>[0]) => adminBtpApi.complianceCreate(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["compliance-deadlines"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-btp-kpis"] });
    },
  });
}

export function useDeleteComplianceDeadlineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminBtpApi.complianceDelete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["compliance-deadlines"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-btp-kpis"] });
    },
  });
}

export function useUpdateComplianceDeadlineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: { title?: string; category?: ComplianceDeadlineCategory; expiresAt?: string; notes?: string | null } }) =>
      adminBtpApi.complianceUpdate(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["compliance-deadlines"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-btp-kpis"] });
    },
  });
}

// ─── Leaves / Absences (phase 9) ─────────────────────────────────────────────

export function useLeavesQuery(filters?: LeaveListFilters) {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  return useQuery({
    queryKey: [
      "leaves",
      filters?.employeeId ?? "all",
      filters?.companyId ?? "all",
      filters?.status ?? "all",
      filters?.type ?? "all",
      sessionRevision,
    ] as const,
    queryFn: () => leavesApi.list(filters),
  });
}

export function useCreateLeaveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateLeavePayload) => leavesApi.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}

export function useUpdateLeaveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateLeavePayload }) => leavesApi.update(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}

export function useApproveLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leavesApi.approve(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leavesApi.reject(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}

export function useDeleteLeaveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leavesApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}
