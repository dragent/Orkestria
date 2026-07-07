"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/lib/zod-resolver";
import { FlashBag } from "@/components/FlashBag";
import { useLanguage } from "@/contexts/language-context";
import { useCompaniesQuery, useCreateClientMutation } from "@/lib/hooks/queries";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  companyId: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function NewClientPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const tc = t.clients;
  const tf = t.adminForms;
  const [serverError, setServerError] = useState<string | null>(null);
  const { data: companies = [] } = useCompaniesQuery();
  const createMutation = useCreateClientMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", companyId: "" },
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      const client = await createMutation.mutateAsync({
        name: data.name.trim(),
        email: data.email.trim(),
        companyId: Number.parseInt(data.companyId, 10),
      });
      router.push(`/admin/clients/${client.id}`);
    } catch (err: unknown) {
      setServerError((err as { message?: string })?.message ?? tf.genericError);
    }
  }

  return (
    <div className="p-8 max-w-lg space-y-6">
      <div>
        <Link href="/admin/clients" className="text-sm text-slate-500 dark:text-zinc-400 hover:text-brand-navy">
          ← {tc.back}
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-brand-navy dark:text-white">{tc.newTitle}</h1>
      </div>
      {serverError && <FlashBag variant="error" message={serverError} />}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">{tf.companyName}</label>
          <input {...register("name")} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm" />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">{t.register.emailLabel}</label>
          <input type="email" {...register("email")} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm" />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">{tf.companyAssignment}</label>
          <select {...register("companyId")} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm">
            <option value="">{tf.noCompanyOption}</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.companyId && <p className="mt-1 text-xs text-red-600">{errors.companyId.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand-purple py-2.5 text-sm font-semibold text-white hover:bg-brand-navy disabled:opacity-60"
        >
          {isSubmitting ? tf.saving : tc.add}
        </button>
      </form>
    </div>
  );
}
