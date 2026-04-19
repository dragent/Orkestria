"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/lib/zod-resolver";
import { FlashBag } from "@/components/FlashBag";
import { useLanguage } from "@/contexts/language-context";
import { useClientQuery, useCompaniesQuery, useUpdateClientMutation } from "@/lib/hooks/queries";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  companyId: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function AdminClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const clientId = Number(id);
  const { t } = useLanguage();
  const tc = t.clients;
  const tf = t.adminForms;
  const [serverError, setServerError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  const { data: client, isLoading, isError, error } = useClientQuery(
    Number.isFinite(clientId) ? clientId : undefined
  );
  const { data: companies = [] } = useCompaniesQuery();
  const updateMutation = useUpdateClientMutation(clientId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", companyId: "" },
  });

  useEffect(() => {
    if (!client) return;
    reset({
      name: client.name,
      email: client.email,
      companyId: String(client.company.id),
    });
  }, [client, reset]);

  async function onSubmit(data: FormData) {
    setServerError(null);
    setSaveOk(false);
    try {
      await updateMutation.mutateAsync({
        name: data.name.trim(),
        email: data.email.trim(),
        companyId: Number.parseInt(data.companyId, 10),
      });
      setSaveOk(true);
    } catch (err: unknown) {
      setServerError((err as { message?: string })?.message ?? tf.genericError);
    }
  }

  const loadError = isError ? ((error as { message?: string })?.message ?? tc.loadError) : null;

  if (!Number.isFinite(clientId)) return null;

  return (
    <div className="p-8 max-w-lg space-y-6">
      <Link href="/admin/clients" className="text-sm text-slate-500 dark:text-zinc-400 hover:text-brand-navy">
        ← {tc.back}
      </Link>
      {loadError && <FlashBag variant="error" message={loadError} />}
      {serverError && <FlashBag variant="error" message={serverError} />}
      {saveOk && <FlashBag variant="success" message={tf.changesSaved} />}

      {isLoading || !client ? (
        <div className="h-32 rounded-xl bg-slate-100 dark:bg-zinc-800 animate-pulse" />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
          <h1 className="text-xl font-bold text-brand-navy dark:text-white">{client.name}</h1>
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
            {isSubmitting ? tf.saving : tf.save}
          </button>
        </form>
      )}
    </div>
  );
}
