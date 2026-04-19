"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  companiesApi,
  meApi,
  usersApi,
  type Company,
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
    }) => usersApi.adminUpdate(userId, body),
    onSuccess: (data: User) => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      void queryClient.invalidateQueries({ queryKey: ["users", data.id] });
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
