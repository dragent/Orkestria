"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/lib/zod-resolver";
import { FlashBag } from "@/components/FlashBag";
import { useLanguage } from "@/contexts/language-context";
import { useCreateCompanyMutation } from "@/lib/hooks/queries";

const schema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "slug_format"),
});

type FormData = z.infer<typeof schema>;

export default function NewCompanyPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const tf = t.adminForms;
  const [serverError, setServerError] = useState<string | null>(null);
  const createMutation = useCreateCompanyMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "" },
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      const company = await createMutation.mutateAsync({
        name: data.name.trim(),
        slug: data.slug.trim(),
      });
      router.push(`/admin/companies/${company.id}`);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? tf.genericError;
      setServerError(msg);
    }
  }

  return (
    <div className="p-8 max-w-lg space-y-6">
      <div>
        <Link
          href="/admin/companies"
          className="text-sm text-slate-500 hover:text-brand-navy dark:text-zinc-400 dark:hover:text-white"
        >
          ← {t.companyDetail.backLabel}
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-brand-navy dark:text-white">{tf.newCompany}</h1>
      </div>

      {serverError && <FlashBag variant="error" message={serverError} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
            {tf.companyName}
          </label>
          <input
            id="name"
            {...register("name")}
            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
            {tf.companySlug}
          </label>
          <input
            id="slug"
            {...register("slug")}
            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 text-sm font-mono"
          />
          {errors.slug && (
            <p className="mt-1 text-xs text-red-600">
              {errors.slug.message === "slug_format" ? tf.companySlug : errors.slug.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand-purple py-2.5 text-sm font-semibold text-white hover:bg-brand-navy disabled:opacity-60"
        >
          {isSubmitting ? tf.saving : tf.addCompany}
        </button>
      </form>
    </div>
  );
}
