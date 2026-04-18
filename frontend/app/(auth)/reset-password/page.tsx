"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import { useLanguage } from "@/contexts/language-context";
import { FlashBag } from "@/components/FlashBag";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [serverError, setServerError] = useState<string | null>(null);
  const { t } = useLanguage();
  const tr = t.resetPassword;

  const schema = z
    .object({
      password: z
        .string()
        .min(8, tr.passwordMin)
        .regex(/[A-Z]/, tr.passwordUppercase)
        .regex(/[0-9]/, tr.passwordNumber),
      confirmPassword: z.string().min(1, tr.confirmPasswordRequired),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: tr.passwordsMismatch,
      path: ["confirmPassword"],
    });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (!token) {
    return (
      <div className="space-y-8">
        <div className="lg:hidden flex justify-center">
          <img src="/img/logo.png" alt="Orkestria" className="h-8 w-auto" />
        </div>
        <div className="space-y-4 text-center py-4">
          <FlashBag variant="error" message={tr.invalidToken} />
          <Link href="/forgot-password" className="block text-sm font-medium text-brand-purple hover:text-brand-navy transition">
            {t.forgotPassword.submit}
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await authApi.resetPassword({ token, password: data.password });
      router.push("/login?password_reset=1");
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      const raw = apiError?.message ?? "";
      if (raw.toLowerCase().includes("invalid") || raw.toLowerCase().includes("expired")) {
        setServerError(tr.invalidToken);
      } else {
        setServerError(tr.failed);
      }
    }
  }

  return (
    <div className="space-y-8">
      <div className="lg:hidden flex justify-center">
        <img src="/img/logo.png" alt="Orkestria" className="h-8 w-auto" />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-brand-navy">{tr.title}</h2>
        <p className="text-slate-500">{tr.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {serverError && (
          <FlashBag variant="error" message={serverError} />
        )}

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            {tr.passwordLabel}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
            className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple ${
              errors.password
                ? "border-red-400 bg-red-50"
                : "border-slate-300 bg-white hover:border-slate-400"
            }`}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
            {tr.confirmPasswordLabel}
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple ${
              errors.confirmPassword
                ? "border-red-400 bg-red-50"
                : "border-slate-300 bg-white hover:border-slate-400"
            }`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? tr.submitLoading : tr.submit}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        <Link href="/login" className="font-medium text-brand-purple hover:text-brand-navy transition">
          {tr.backToLogin}
        </Link>
      </p>
    </div>
  );
}
