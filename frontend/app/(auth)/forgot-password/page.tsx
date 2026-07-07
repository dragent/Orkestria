"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useLanguage } from "@/contexts/language-context";
import { FlashBag } from "@/components/FlashBag";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { t } = useLanguage();
  const tf = t.forgotPassword;

  const schema = z.object({
    email: z.string().email(tf.invalidEmail),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await authApi.forgotPassword(data);
      setSent(true);
    } catch {
      setServerError(tf.failed);
    }
  }

  if (sent) {
    return (
      <div className="space-y-8">
        <div className="lg:hidden flex justify-center">
          <img src="/img/logo.png" alt="Orkestria" className="h-8 w-auto" />
        </div>
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-purple/10">
            <svg className="w-8 h-8 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-brand-navy">{tf.successTitle}</h2>
          <p className="text-slate-500 text-sm max-w-sm">{tf.successBody}</p>
          <p className="text-slate-400 text-xs">{tf.successSpam}</p>
        </div>
        <p className="text-center text-sm text-slate-500">
          <Link href="/login" className="font-medium text-brand-purple hover:text-brand-navy transition">
            {tf.backToLogin}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="lg:hidden flex justify-center">
        <img src="/img/logo.png" alt="Orkestria" className="h-8 w-auto" />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-brand-navy">{tf.title}</h2>
        <p className="text-slate-500">{tf.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {serverError && (
          <FlashBag variant="error" message={serverError} />
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            {tf.emailLabel}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple ${
              errors.email
                ? "border-red-400 bg-red-50"
                : "border-slate-300 bg-white hover:border-slate-400"
            }`}
            placeholder={tf.emailPlaceholder}
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? tf.submitLoading : tf.submit}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        <Link href="/login" className="font-medium text-brand-purple hover:text-brand-navy transition">
          {tf.backToLogin}
        </Link>
      </p>
    </div>
  );
}
