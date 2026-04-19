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
