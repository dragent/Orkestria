import { getToken } from "@/lib/auth";

// Empty string = same-origin requests proxied via Next.js rewrites (next.config.ts).
// Set NEXT_PUBLIC_API_URL only if you want to bypass the proxy (e.g. e2e tests hitting the backend directly).
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type ApiError = {
  message: string;
  errors?: Record<string, string>;
};

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw data as ApiError;
  }

  return data as T;
}

async function apiFetchAuth<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  return apiFetch<T>(path, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
}

async function apiFetchAuthNoContent(path: string, options?: RequestInit): Promise<void> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    let err: ApiError = { message: "Request failed." };
    if (text) {
      try {
        err = JSON.parse(text) as ApiError;
      } catch {
        err = { message: text };
      }
    }
    throw err;
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type LoginResponse = {
  token: string;
};

export type RegisterResponse = {
  message: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
};

export type MessageResponse = {
  message: string;
};

export const authApi = {
  login: (payload: LoginPayload) =>
    apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  register: (payload: RegisterPayload) =>
    apiFetch<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiFetch<MessageResponse>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiFetch<MessageResponse>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ─── Roles BTP ────────────────────────────────────────────────────────────────

export type RoleLang = "fr" | "en";

export const ROLE_LABELS: Record<RoleLang, Record<string, string>> = {
  fr: {
    ROLE_ADMIN: "Patron",
    ROLE_RH: "RH",
    ROLE_ENGINEER: "Ingénieur",
    ROLE_DEVELOPER: "Développeur",
    ROLE_WORKFORCE: "Main d'œuvre",
    ROLE_SUBCONTRACTOR_PATRON: "Patron",
    ROLE_SUBCONTRACTOR_RH: "RH",
    ROLE_SUBCONTRACTOR_WORKFORCE: "Main d'œuvre",
    ROLE_SUBCONTRACTOR: "Sous-traitant",
    ROLE_CLIENT: "Client",
    ROLE_USER: "Utilisateur",
  },
  en: {
    ROLE_ADMIN: "Owner",
    ROLE_RH: "HR",
    ROLE_ENGINEER: "Engineer",
    ROLE_DEVELOPER: "Developer",
    ROLE_WORKFORCE: "Workforce",
    ROLE_SUBCONTRACTOR_PATRON: "Owner",
    ROLE_SUBCONTRACTOR_RH: "HR",
    ROLE_SUBCONTRACTOR_WORKFORCE: "Workforce",
    ROLE_SUBCONTRACTOR: "Subcontractor",
    ROLE_CLIENT: "Client",
    ROLE_USER: "User",
  },
};

export const ROLE_GROUPS: Record<RoleLang, Array<{ label: string; roles: Array<{ value: string; label: string }> }>> = {
  fr: [
    {
      label: "Orkestria (Interne)",
      roles: [
        { value: "ROLE_ADMIN", label: "Patron" },
        { value: "ROLE_RH", label: "RH" },
        { value: "ROLE_ENGINEER", label: "Ingénieur" },
        { value: "ROLE_DEVELOPER", label: "Développeur" },
        { value: "ROLE_WORKFORCE", label: "Main d'œuvre" },
      ],
    },
    {
      label: "Sous-traitant",
      roles: [
        { value: "ROLE_SUBCONTRACTOR_PATRON", label: "Patron" },
        { value: "ROLE_SUBCONTRACTOR_RH", label: "RH" },
        { value: "ROLE_SUBCONTRACTOR_WORKFORCE", label: "Main d'œuvre" },
      ],
    },
    {
      label: "Client",
      roles: [{ value: "ROLE_CLIENT", label: "Client" }],
    },
  ],
  en: [
    {
      label: "Orkestria (Internal)",
      roles: [
        { value: "ROLE_ADMIN", label: "Owner" },
        { value: "ROLE_RH", label: "HR" },
        { value: "ROLE_ENGINEER", label: "Engineer" },
        { value: "ROLE_DEVELOPER", label: "Developer" },
        { value: "ROLE_WORKFORCE", label: "Workforce" },
      ],
    },
    {
      label: "Subcontractor",
      roles: [
        { value: "ROLE_SUBCONTRACTOR_PATRON", label: "Owner" },
        { value: "ROLE_SUBCONTRACTOR_RH", label: "HR" },
        { value: "ROLE_SUBCONTRACTOR_WORKFORCE", label: "Workforce" },
      ],
    },
    {
      label: "Client",
      roles: [{ value: "ROLE_CLIENT", label: "Client" }],
    },
  ],
};

const ROLE_PRIORITY = [
  "ROLE_ADMIN",
  "ROLE_RH",
  "ROLE_ENGINEER",
  "ROLE_DEVELOPER",
  "ROLE_WORKFORCE",
  "ROLE_SUBCONTRACTOR_PATRON",
  "ROLE_SUBCONTRACTOR_RH",
  "ROLE_SUBCONTRACTOR_WORKFORCE",
  "ROLE_SUBCONTRACTOR",
  "ROLE_CLIENT",
];

export function getPrimaryRole(roles: string[]): string {
  return ROLE_PRIORITY.find((r) => roles.includes(r)) ?? "ROLE_USER";
}

export function getRoleLabel(role: string, lang: RoleLang): string {
  return ROLE_LABELS[lang][role] ?? role;
}

export function getRoleBadgeClass(role: string): string {
  if (role === "ROLE_ADMIN") return "bg-brand-purple/10 text-brand-purple ring-brand-purple/20";
  if (role === "ROLE_RH") return "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-700/40";
  if (role === "ROLE_ENGINEER") return "bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:ring-teal-700/40";
  if (role === "ROLE_DEVELOPER") return "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:ring-indigo-700/40";
  if (role === "ROLE_WORKFORCE") return "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-600";
  if (role.startsWith("ROLE_SUBCONTRACTOR")) return "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:ring-orange-700/40";
  if (role === "ROLE_CLIENT") return "bg-green-50 text-green-700 ring-green-200 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-700/40";
  return "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-600";
}

// ─── Users ────────────────────────────────────────────────────────────────────

export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  company: { id: number; name: string } | null;
  createdAt: string;
  isActive: boolean;
  documentScopes: string[];
};

export type AdminCreateUserPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles?: string[];
  companyId?: number | null;
};

export type AdminUpdateUserPayload = {
  roles?: string[];
  isActive?: boolean;
  companyId?: number | null;
  documentScopes?: string[];
};

export const usersApi = {
  list: () => apiFetchAuth<User[]>("/api/users"),
  get: (id: number) => apiFetchAuth<User>(`/api/users/${id}`),
  adminCreate: (body: AdminCreateUserPayload) =>
    apiFetchAuth<User>("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  adminUpdate: (id: number, body: AdminUpdateUserPayload) =>
    apiFetchAuth<User>(`/api/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

export const meApi = {
  get: () => apiFetchAuth<User>("/api/me"),
};

// ─── Companies ────────────────────────────────────────────────────────────────

export type Company = {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
};

export const companiesApi = {
  list: () => apiFetchAuth<Company[]>("/api/companies"),
  get: (id: number) => apiFetchAuth<Company>(`/api/companies/${id}`),
  create: (body: { name: string; slug: string }) =>
    apiFetchAuth<Company>("/api/companies", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: number, body: { name?: string; slug?: string }) =>
    apiFetchAuth<Company>(`/api/companies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

// ─── Clients & projects (phase 2) ────────────────────────────────────────────

export type ProjectPipelineStage =
  | "contact"
  | "meeting"
  | "engineer_assigned"
  | "quote_plan"
  | "quote_signed"
  | "invoice_sent"
  | "deposit_received"
  | "design_started"
  | "design_completed"
  | "client_signed"
  | "components_ordered"
  | "construction"
  | "subcontractors"
  | "site_visit"
  | "paid";

export type ApiClient = {
  id: number;
  name: string;
  email: string;
  company: { id: number; name: string; slug: string };
  createdAt: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  notes?: string | null;
  tags?: string[];
};

export type ApiProject = {
  id: number;
  title: string;
  pipelineStage: ProjectPipelineStage;
  stageChangedAt: string | null;
  client: ApiClient;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
};

export type ApiStageHistory = {
  id: number;
  fromStage: ProjectPipelineStage;
  toStage: ProjectPipelineStage;
  changedBy: { id: number; email: string; firstName: string; lastName: string } | null;
  note: string | null;
  changedAt: string;
};

export const clientsApi = {
  list: () => apiFetchAuth<ApiClient[]>("/api/clients"),
  get: (id: number) => apiFetchAuth<ApiClient>(`/api/clients/${id}`),
  create: (body: { name: string; email: string; companyId: number }) =>
    apiFetchAuth<ApiClient>("/api/clients", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: number, body: { name?: string; email?: string; companyId?: number }) =>
    apiFetchAuth<ApiClient>(`/api/clients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: (id: number) => apiFetchAuthNoContent(`/api/clients/${id}`, { method: "DELETE" }),
};

export type ProjectListParams = {
  q?: string;
  pipeline?: ProjectPipelineStage;
  clientId?: number;
};

export const projectsApi = {
  list: (params?: ProjectListParams) => {
    const sp = new URLSearchParams();
    if (params?.q) sp.set("q", params.q);
    if (params?.pipeline) sp.set("pipeline", params.pipeline);
    if (params?.clientId != null) sp.set("clientId", String(params.clientId));
    const q = sp.toString();
    return apiFetchAuth<ApiProject[]>(`/api/projects${q ? `?${q}` : ""}`);
  },
  get: (id: number) => apiFetchAuth<ApiProject>(`/api/projects/${id}`),
  create: (body: {
    title: string;
    clientId: number;
    pipelineStage?: ProjectPipelineStage;
    startDate?: string | null;
    endDate?: string | null;
  }) =>
    apiFetchAuth<ApiProject>("/api/projects", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (
    id: number,
    body: {
      title?: string;
      clientId?: number;
      pipelineStage?: ProjectPipelineStage;
      startDate?: string | null;
      endDate?: string | null;
    }
  ) =>
    apiFetchAuth<ApiProject>(`/api/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: (id: number) => apiFetchAuthNoContent(`/api/projects/${id}`, { method: "DELETE" }),
  advanceStage: (id: number, note?: string) =>
    apiFetchAuth<{ stage: ProjectPipelineStage; stageChangedAt: string; isTerminal: boolean }>(
      `/api/projects/${id}/stage/advance`,
      { method: "POST", body: JSON.stringify({ note: note ?? null }) }
    ),
  stageHistory: (id: number) => apiFetchAuth<ApiStageHistory[]>(`/api/projects/${id}/stage/history`),
  stageChecklist: (id: number) =>
    apiFetchAuth<{ stage: string; items: Array<{ id: string; label: string; completed: boolean }> }>(
      `/api/projects/${id}/stage/checklist`
    ),
};

// ─── Role Scope Policies ──────────────────────────────────────────────────────

export type RoleScopePolicyEntry = {
  role: string;
  documentScopes: string[];
  allowedScopes: string[];
};

export const roleScopePoliciesApi = {
  list: () => apiFetchAuth<RoleScopePolicyEntry[]>("/api/admin/role-scope-policies"),
  batchUpdate: (body: Array<{ role: string; documentScopes: string[] }>) =>
    apiFetchAuth<RoleScopePolicyEntry[]>("/api/admin/role-scope-policies", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

// ─── Documents (phase 3) ─────────────────────────────────────────────────────

export type DocumentScope = "rh" | "tech" | "finance" | "design" | "legal";

export type ApiDocument = {
  id: number;
  name: string;
  type: string;
  scope: DocumentScope;
  createdAt: string;
  classificationStatus: "pending" | "done" | "error" | null;
  classificationLabel: string | null;
};

export const DOCUMENT_SCOPES: DocumentScope[] = ["rh", "tech", "finance", "design", "legal"];

export const documentsApi = {
  listByProject: (projectId: number, scope?: DocumentScope) => {
    const q = scope ? `?scope=${encodeURIComponent(scope)}` : "";
    return apiFetchAuth<ApiDocument[]>(`/api/projects/${projectId}/documents${q}`);
  },
  upload: async (projectId: number, formData: FormData): Promise<ApiDocument> => {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/projects/${projectId}/documents`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    const data = (await response.json()) as unknown;
    if (!response.ok) {
      throw data as ApiError;
    }
    return data as ApiDocument;
  },
  updateClassification: (documentId: number, body: { classificationLabel?: string; classificationStatus?: string }) =>
    apiFetchAuth<ApiDocument>(`/api/documents/${documentId}/classification`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  downloadBlob: async (documentId: number): Promise<Blob> => {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/documents/${documentId}/download`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      try {
        const err = await response.json();
        throw err as ApiError;
      } catch {
        throw { message: "Download failed." } as ApiError;
      }
    }
    return response.blob();
  },
};

// ─── Employees (phase 4) ──────────────────────────────────────────────────────

export type ApiEmployee = {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  skills: string[];
  dailyRateCents: number | null;
  user: { id: number; email: string; firstName: string; lastName: string } | null;
  company: { id: number; name: string } | null;
  createdAt: string;
};

export type CreateEmployeePayload = {
  firstName: string;
  lastName: string;
  role: string;
  skills?: string[];
  dailyRateCents?: number | null;
  companyId?: number | null;
  userId?: number | null;
};

export type UpdateEmployeePayload = Partial<CreateEmployeePayload>;

export const employeesApi = {
  list: (params?: { q?: string; companyId?: number }) => {
    const sp = new URLSearchParams();
    if (params?.q) sp.set("q", params.q);
    if (params?.companyId != null) sp.set("companyId", String(params.companyId));
    const q = sp.toString();
    return apiFetchAuth<ApiEmployee[]>(`/api/employees${q ? `?${q}` : ""}`);
  },
  get: (id: number) => apiFetchAuth<ApiEmployee>(`/api/employees/${id}`),
  create: (body: CreateEmployeePayload) =>
    apiFetchAuth<ApiEmployee>("/api/employees", { method: "POST", body: JSON.stringify(body) }),
  update: (id: number, body: UpdateEmployeePayload) =>
    apiFetchAuth<ApiEmployee>(`/api/employees/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (id: number) => apiFetchAuthNoContent(`/api/employees/${id}`, { method: "DELETE" }),
};

export const projectEmployeesApi = {
  list: (projectId: number) => apiFetchAuth<ApiEmployee[]>(`/api/projects/${projectId}/employees`),
  assign: (projectId: number, employeeId: number) =>
    apiFetchAuth<{ message: string }>(`/api/projects/${projectId}/employees`, {
      method: "POST",
      body: JSON.stringify({ employeeId }),
    }),
  remove: (projectId: number, employeeId: number) =>
    apiFetchAuthNoContent(`/api/projects/${projectId}/employees/${employeeId}`, { method: "DELETE" }),
};

// ─── Tasks (phase 4) ─────────────────────────────────────────────────────────

export type TaskStatus = "open" | "in_progress" | "done";

export type ApiTask = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  assignee: ApiEmployee | null;
  createdAt: string;
};

export const tasksApi = {
  list: (projectId: number) => apiFetchAuth<ApiTask[]>(`/api/projects/${projectId}/tasks`),
  create: (
    projectId: number,
    body: { title: string; description?: string; status?: TaskStatus; dueDate?: string | null; assigneeId?: number | null }
  ) =>
    apiFetchAuth<ApiTask>(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (
    projectId: number,
    taskId: number,
    body: { title?: string; description?: string; status?: TaskStatus; dueDate?: string | null; assigneeId?: number | null }
  ) =>
    apiFetchAuth<ApiTask>(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: (projectId: number, taskId: number) =>
    apiFetchAuthNoContent(`/api/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" }),
};

// ─── Time entries (phase 4) ───────────────────────────────────────────────────

export type TimeEntryHourType = "regular" | "night" | "weekend" | "travel" | "on_call";

export type ApiTimeEntry = {
  id: number;
  employee: ApiEmployee;
  hours: string;
  date: string;
  hourType: TimeEntryHourType;
  description: string | null;
  createdAt: string;
};

export const timeEntriesApi = {
  list: (projectId: number) => apiFetchAuth<ApiTimeEntry[]>(`/api/projects/${projectId}/time-entries`),
  create: (
    projectId: number,
    body: {
      employeeId: number;
      hours: number;
      date: string;
      description?: string;
      hourType?: TimeEntryHourType;
    }
  ) =>
    apiFetchAuth<ApiTimeEntry>(`/api/projects/${projectId}/time-entries`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  delete: (projectId: number, entryId: number) =>
    apiFetchAuthNoContent(`/api/projects/${projectId}/time-entries/${entryId}`, { method: "DELETE" }),
};

// ─── BTP / RH vision (executive KPIs, payroll export, compliance deadlines) ─

export type BtpExecutiveKpis = {
  acceptedQuotesTotalCents: number;
  actualLaborCostCents: number;
  marginCents: number;
  timeEntriesTotalHoursLast30Days: string;
  projectsByPipelineStage: Record<string, number>;
  complianceDeadlinesDueNext30Days: number;
  pendingLeavesCount: number;
};

export type ComplianceDeadlineCategory = "certification" | "insurance" | "medical" | "other";

export type ApiComplianceDeadline = {
  id: number;
  title: string;
  category: ComplianceDeadlineCategory;
  expiresAt: string;
  notes: string | null;
  createdAt: string;
  company: { id: number; name: string };
  employee: Pick<ApiEmployee, "id" | "firstName" | "lastName"> | null;
  project: { id: number; title: string } | null;
};

export const adminBtpApi = {
  kpis: () => apiFetchAuth<BtpExecutiveKpis>("/api/admin/dashboard/btp-kpis"),
  complianceList: (params?: { companyId?: number; upcomingDays?: number }) => {
    const q = new URLSearchParams();
    if (params?.companyId != null) q.set("companyId", String(params.companyId));
    if (params?.upcomingDays != null) q.set("upcomingDays", String(params.upcomingDays));
    const suffix = q.toString() ? `?${q}` : "";
    return apiFetchAuth<ApiComplianceDeadline[]>(`/api/admin/compliance-deadlines${suffix}`);
  },
  complianceCreate: (body: {
    companyId: number;
    title: string;
    category: ComplianceDeadlineCategory;
    expiresAt: string;
    notes?: string | null;
    employeeId?: number | null;
    projectId?: number | null;
  }) =>
    apiFetchAuth<ApiComplianceDeadline>("/api/admin/compliance-deadlines", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  complianceUpdate: (
    id: number,
    body: {
      title?: string;
      category?: ComplianceDeadlineCategory;
      expiresAt?: string;
      notes?: string | null;
    }
  ) =>
    apiFetchAuth<ApiComplianceDeadline>(`/api/admin/compliance-deadlines/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  complianceDelete: (id: number) =>
    apiFetchAuthNoContent(`/api/admin/compliance-deadlines/${id}`, { method: "DELETE" }),
};

export async function downloadPayrollTimeEntriesCsv(params: {
  from: string;
  to: string;
  companyId?: number;
}): Promise<void> {
  const token = getToken();
  const q = new URLSearchParams({ from: params.from, to: params.to });
  if (params.companyId != null) q.set("companyId", String(params.companyId));
  const response = await fetch(`${API_URL}/api/admin/payroll/time-entries.csv?${q}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    const text = await response.text();
    let err: ApiError = { message: "Export failed." };
    if (text) {
      try {
        err = JSON.parse(text) as ApiError;
      } catch {
        err = { message: text };
      }
    }
    throw err;
  }
  const blob = await response.blob();
  const dispo = response.headers.get("Content-Disposition");
  const match = dispo?.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? "payroll-export.csv";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Subcontractor space (phase 4) ───────────────────────────────────────────

export const subcontractorApi = {
  projects: () => apiFetchAuth<ApiProject[]>("/api/subcontractor/projects"),
  project: (id: number) => apiFetchAuth<ApiProject>(`/api/subcontractor/projects/${id}`),
};

// ─── Quotes (phase 5) ────────────────────────────────────────────────────────

export type QuoteStatusType = "draft" | "sent" | "accepted" | "rejected";

export type ApiQuoteLine = {
  id: number;
  label: string;
  quantity: string;
  unitPriceCents: number;
};

export type ApiInvoice = {
  id: number;
  status: "draft" | "sent" | "paid";
  totalCents: number;
  paidAt: string | null;
  createdAt: string;
};

export type ApiQuote = {
  id: number;
  status: QuoteStatusType;
  notes: string | null;
  lines: ApiQuoteLine[];
  createdAt: string;
  updatedAt: string;
  invoice: ApiInvoice | null;
};

export type QuoteLineInput = {
  label: string;
  quantity: number;
  unitPriceCents: number;
};

export const quotesApi = {
  list: (projectId: number) => apiFetchAuth<ApiQuote[]>(`/api/projects/${projectId}/quotes`),
  get: (projectId: number, quoteId: number) =>
    apiFetchAuth<ApiQuote>(`/api/projects/${projectId}/quotes/${quoteId}`),
  create: (projectId: number, body: { notes?: string; lines: QuoteLineInput[] }) =>
    apiFetchAuth<ApiQuote>(`/api/projects/${projectId}/quotes`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (
    projectId: number,
    quoteId: number,
    body: { status?: QuoteStatusType; notes?: string; lines?: QuoteLineInput[] }
  ) =>
    apiFetchAuth<ApiQuote>(`/api/projects/${projectId}/quotes/${quoteId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  accept: (projectId: number, quoteId: number) =>
    apiFetchAuth<ApiQuote>(`/api/projects/${projectId}/quotes/${quoteId}/accept`, { method: "POST" }),
  reject: (projectId: number, quoteId: number) =>
    apiFetchAuth<ApiQuote>(`/api/projects/${projectId}/quotes/${quoteId}/reject`, { method: "POST" }),
  delete: (projectId: number, quoteId: number) =>
    apiFetchAuthNoContent(`/api/projects/${projectId}/quotes/${quoteId}`, { method: "DELETE" }),
};

// ─── Invoices (phase 5) ──────────────────────────────────────────────────────

export const invoicesApi = {
  list: (projectId: number) => apiFetchAuth<ApiInvoice[]>(`/api/projects/${projectId}/invoices`),
  updateStatus: (projectId: number, invoiceId: number, status: "draft" | "sent" | "paid") =>
    apiFetchAuth<ApiInvoice>(`/api/projects/${projectId}/invoices/${invoiceId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  getPdfUrl: (invoiceId: number) => `${API_URL}/api/pdf/invoices/${invoiceId}`,
  getQuotePdfUrl: (quoteId: number) => `${API_URL}/api/pdf/quotes/${quoteId}`,
};

// ─── Client space (phase 5) ──────────────────────────────────────────────────

export const clientApi = {
  projects: () => apiFetchAuth<ApiProject[]>("/api/projects"),
};

// ─── Tickets (phase 7) ───────────────────────────────────────────────────────

export type TicketStatus = "open" | "in_progress" | "in_review" | "done" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketType = "bug" | "feature" | "task" | "support" | "incident";
export type TicketSource = "internal" | "client";

export const TICKET_STATUSES: TicketStatus[] = [
  "open",
  "in_progress",
  "in_review",
  "done",
  "closed",
];
export const TICKET_PRIORITIES: TicketPriority[] = ["low", "normal", "high", "urgent"];
export const TICKET_TYPES: TicketType[] = ["bug", "feature", "task", "support", "incident"];
export const TICKET_SOURCES: TicketSource[] = ["internal", "client"];

export type ApiTicket = {
  id: number;
  title: string;
  description: string;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  source: TicketSource;
  project: { id: number; title: string } | null;
  reporter: { id: number; email: string; firstName: string; lastName: string } | null;
  assignee: ApiEmployee | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  firstResponseMinutes: number | null;
  resolutionMinutes: number | null;
};

export type ApiTicketComment = {
  id: number;
  body: string;
  createdAt: string;
  author: { id: number; email: string; firstName: string; lastName: string } | null;
};

export type TicketListFilters = {
  status?: TicketStatus;
  priority?: TicketPriority;
  type?: TicketType;
  source?: TicketSource;
  projectId?: number;
  assigneeId?: number;
  q?: string;
};

export type CreateTicketPayload = {
  title: string;
  description: string;
  type?: TicketType;
  priority?: TicketPriority;
  status?: TicketStatus;
  projectId?: number | null;
  assigneeId?: number | null;
};

export type UpdateTicketPayload = Partial<CreateTicketPayload>;

function buildTicketQuery(filters?: TicketListFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const ticketsApi = {
  list: (filters?: TicketListFilters) =>
    apiFetchAuth<ApiTicket[]>(`/api/tickets${buildTicketQuery(filters)}`),
  get: (id: number) => apiFetchAuth<ApiTicket>(`/api/tickets/${id}`),
  create: (body: CreateTicketPayload) =>
    apiFetchAuth<ApiTicket>("/api/tickets", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: number, body: UpdateTicketPayload) =>
    apiFetchAuth<ApiTicket>(`/api/tickets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: (id: number) => apiFetchAuthNoContent(`/api/tickets/${id}`, { method: "DELETE" }),
  listComments: (id: number) =>
    apiFetchAuth<ApiTicketComment[]>(`/api/tickets/${id}/comments`),
  addComment: (id: number, body: string) =>
    apiFetchAuth<ApiTicketComment>(`/api/tickets/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    }),
};

export const clientTicketsApi = {
  list: (projectId: number) =>
    apiFetchAuth<ApiTicket[]>(`/api/client/projects/${projectId}/tickets`),
  create: (
    projectId: number,
    body: { title: string; description: string; type?: TicketType; priority?: TicketPriority }
  ) =>
    apiFetchAuth<ApiTicket>(`/api/client/projects/${projectId}/tickets`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ─── Leaves / Absences (phase 9) ─────────────────────────────────────────────

export type LeaveType = "paid_vacation" | "rtt" | "sick" | "training" | "other";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export const LEAVE_TYPES: LeaveType[] = ["paid_vacation", "rtt", "sick", "training", "other"];
export const LEAVE_STATUSES: LeaveStatus[] = ["pending", "approved", "rejected", "cancelled"];

export type ApiLeave = {
  id: number;
  employee: { id: number; firstName: string; lastName: string; role: string } | null;
  type: LeaveType;
  status: LeaveStatus;
  startsAt: string;
  endsAt: string;
  workingDays: number;
  reason: string | null;
  approvedBy: { id: number; email: string; firstName: string; lastName: string } | null;
  approvedAt: string | null;
  createdAt: string;
};

export type LeaveListFilters = {
  employeeId?: number;
  companyId?: number;
  status?: LeaveStatus;
  type?: LeaveType;
};

export type CreateLeavePayload = {
  employeeId: number;
  type: LeaveType;
  startsAt: string;
  endsAt: string;
  reason?: string | null;
};

export type UpdateLeavePayload = Partial<Omit<CreateLeavePayload, "employeeId"> & { status?: LeaveStatus }>;

function buildLeaveQuery(filters?: LeaveListFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const leavesApi = {
  list: (filters?: LeaveListFilters) =>
    apiFetchAuth<ApiLeave[]>(`/api/admin/leaves${buildLeaveQuery(filters)}`),
  get: (id: number) => apiFetchAuth<ApiLeave>(`/api/admin/leaves/${id}`),
  create: (body: CreateLeavePayload) =>
    apiFetchAuth<ApiLeave>("/api/admin/leaves", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: number, body: UpdateLeavePayload) =>
    apiFetchAuth<ApiLeave>(`/api/admin/leaves/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  approve: (id: number) =>
    apiFetchAuth<ApiLeave>(`/api/admin/leaves/${id}/approve`, { method: "PATCH" }),
  reject: (id: number) =>
    apiFetchAuth<ApiLeave>(`/api/admin/leaves/${id}/reject`, { method: "PATCH" }),
  delete: (id: number) => apiFetchAuthNoContent(`/api/admin/leaves/${id}`, { method: "DELETE" }),
};

