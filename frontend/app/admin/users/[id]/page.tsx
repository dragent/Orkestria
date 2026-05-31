"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/lib/zod-resolver";
import { FlashBag } from "@/components/FlashBag";
import StatusBadge from "@/components/StatusBadge";
import { useLanguage } from "@/contexts/language-context";
import { useAdminUpdateUserMutation, useCompaniesQuery, useUserQuery } from "@/lib/hooks/queries";
import { ROLE_GROUPS, getPrimaryRole, getRoleLabel, getRoleBadgeClass } from "@/lib/api";

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3.5 border-b border-slate-100 dark:border-zinc-700 last:border-0">
      <dt className="w-40 shrink-0 text-sm font-medium text-slate-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-sm text-slate-800 dark:text-zinc-100">{children}</dd>
    </div>
  );
}

const adminSchema = z.object({
  role: z.string(),
  isActive: z.boolean(),
  companyId: z.string(),
});

type AdminForm = z.infer<typeof adminSchema>;

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const { t, lang } = useLanguage();
  const tud = t.userDetail;
  const tf = t.adminForms;
  const [serverError, setServerError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);
  const roleGroups = ROLE_GROUPS[lang];

  const { data: user, isLoading, isError, error } = useUserQuery(Number.isFinite(userId) ? userId : undefined);
  const { data: companies = [] } = useCompaniesQuery();
  const updateMutation = useAdminUpdateUserMutation(userId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<AdminForm>({
    resolver: zodResolver(adminSchema),
    defaultValues: { role: "", isActive: true, companyId: "" },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      role: getPrimaryRole(user.roles),
      isActive: user.isActive,
      companyId: user.company ? String(user.company.id) : "",
    });
  }, [user, reset]);

  async function onSaveAdmin(data: AdminForm) {
    setServerError(null);
    setSaveOk(false);
    const roles: string[] = data.role ? [data.role] : [];
    const companyId = data.companyId === "" ? null : Number.parseInt(data.companyId, 10);

    try {
      await updateMutation.mutateAsync({
        roles,
        isActive: data.isActive,
        companyId: companyId !== null && Number.isFinite(companyId) ? companyId : null,
      });
      setSaveOk(true);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? tf.genericError;
      setServerError(msg);
    }
  }

  const dateLocale = lang === "fr" ? "fr-FR" : "en-GB";
  const loadError = isError ? ((error as { message?: string })?.message ?? tud.loadError) : null;

  if (!Number.isFinite(userId)) return null;

  const primaryRole = user ? getPrimaryRole(user.roles) : "ROLE_USER";

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <Link
        href="/admin/users"
        className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400 hover:text-brand-navy dark:hover:text-white transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        {tud.backLabel}
      </Link>

      {loadError && <FlashBag variant="error" message={loadError} />}
      {serverError && <FlashBag variant="error" message={serverError} />}
      {saveOk && <FlashBag variant="success" message={tf.changesSaved} />}

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : user ? (
        <>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-brand-purple to-brand-blue flex items-center justify-center text-white text-xl font-bold shrink-0">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-navy dark:text-white">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-slate-500 dark:text-zinc-400">{user.email}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-6">
            <dl>
              <DetailRow label={tud.id}>#{user.id}</DetailRow>
              <DetailRow label={tud.email}>{user.email}</DetailRow>
              <DetailRow label={tud.firstName}>{user.firstName}</DetailRow>
              <DetailRow label={tud.lastName}>{user.lastName}</DetailRow>
              <DetailRow label={tud.role}>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${getRoleBadgeClass(primaryRole)}`}>
                  {getRoleLabel(primaryRole, lang)}
                </span>
              </DetailRow>
              <DetailRow label={tud.company}>
                {user.company ? (
                  <Link
                    href={`/admin/companies/${user.company.id}`}
                    className="text-brand-purple hover:text-brand-navy dark:hover:text-white font-medium transition-colors"
                  >
                    {user.company.name}
                  </Link>
                ) : (
                  <span className="text-slate-400 dark:text-zinc-500">{t.noCompany}</span>
                )}
              </DetailRow>
              <DetailRow label={tud.status}>
                <StatusBadge active={user.isActive} activeLabel={t.active} inactiveLabel={t.inactive} />
              </DetailRow>
              <DetailRow label={tud.joined}>
                {new Date(user.createdAt).toLocaleDateString(dateLocale, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </DetailRow>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 space-y-4">
            <h2 className="font-semibold text-brand-navy dark:text-white">{tf.adminSettings}</h2>
            <form onSubmit={handleSubmit(onSaveAdmin)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">{tf.rolesLabel}</label>
                <select
                  {...register("role")}
                  className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
                >
                  <option value="">{tf.selectRolePlaceholder}</option>
                  {roleGroups.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.roles.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-300">
                <input type="checkbox" {...register("isActive")} />
                {t.active}
              </label>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">{tf.companyAssignment}</label>
                <select
                  {...register("companyId")}
                  className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
                >
                  <option value="">{tf.noCompanyOption}</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy disabled:opacity-60"
              >
                {isSubmitting ? tf.saving : tf.saveUser}
              </button>
            </form>
          </div>
        </>
      ) : null}
    </div>
  );
}
