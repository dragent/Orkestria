"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/lib/zod-resolver";
import { FlashBag } from "@/components/FlashBag";
import { useLanguage } from "@/contexts/language-context";
import { useCompaniesQuery, useCreateUserMutation } from "@/lib/hooks/queries";
import { ROLE_GROUPS } from "@/lib/api";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.string().min(1),
  companyId: z.string(),
});

type FormData = z.infer<typeof schema>;

export default function NewUserPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const tf = t.adminForms;
  const [serverError, setServerError] = useState<string | null>(null);
  const { data: companies = [] } = useCompaniesQuery();
  const createMutation = useCreateUserMutation();
  const roleGroups = ROLE_GROUPS[lang];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "",
      companyId: "",
    },
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    const companyId =
      data.companyId === "" ? null : Number.parseInt(data.companyId, 10);

    try {
      const user = await createMutation.mutateAsync({
        email: data.email.trim(),
        password: data.password,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        roles: data.role ? [data.role] : undefined,
        companyId: companyId !== null && Number.isFinite(companyId) ? companyId : null,
      });
      router.push(`/admin/users/${user.id}`);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? tf.genericError;
      setServerError(msg);
    }
  }

  return (
    <div className="p-8 max-w-lg space-y-6">
      <div>
        <Link href="/admin/users" className="text-sm text-slate-500 hover:text-brand-navy dark:text-zinc-400 dark:hover:text-white">
          ← {t.userDetail.backLabel}
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-brand-navy dark:text-white">{tf.newUser}</h1>
      </div>

      {serverError && <FlashBag variant="error" message={serverError} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">{t.register.firstNameLabel}</label>
            <input
              {...register("firstName")}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
            />
            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">{t.register.lastNameLabel}</label>
            <input
              {...register("lastName")}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
            />
            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">{t.register.emailLabel}</label>
          <input
            type="email"
            {...register("email")}
            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">{tf.password}</label>
          <input
            type="password"
            {...register("password")}
            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

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
          {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
        </div>

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
          className="w-full rounded-lg bg-brand-purple py-2.5 text-sm font-semibold text-white hover:bg-brand-navy disabled:opacity-60"
        >
          {isSubmitting ? tf.saving : tf.createUser}
        </button>
      </form>
    </div>
  );
}
