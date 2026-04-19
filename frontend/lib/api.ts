import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

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

export type ProjectPipelineStage = "lead" | "quote" | "production" | "delivery" | "invoiced";

export type ApiClient = {
  id: number;
  name: string;
  email: string;
  company: { id: number; name: string; slug: string };
  createdAt: string;
};

export type ApiProject = {
  id: number;
  title: string;
  pipelineStage: ProjectPipelineStage;
  client: ApiClient;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
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
};

// ─── Documents (phase 3) ─────────────────────────────────────────────────────

export type DocumentScope = "rh" | "tech" | "finance" | "design" | "legal";

export type ApiDocument = {
  id: number;
  name: string;
  type: string;
  scope: DocumentScope;
  createdAt: string;
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
