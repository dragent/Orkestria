"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { useLanguage } from "@/contexts/language-context";
import { FlashBag } from "@/components/FlashBag";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
  const justVerified = searchParams.get("verified") === "1";
  const verifyError = searchParams.get("verify_error") === "1";
  const passwordReset = searchParams.get("password_reset") === "1";
  const [serverError, setServerError] = useState<string | null>(null);
  const { t } = useLanguage();
  const tl = t.login;

  const loginSchema = z.object({
    email: z.string().email(tl.invalidEmail),
    password: z.string().min(1, tl.passwordRequired),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);
    try {
      const { token } = await authApi.login(data);
      setToken(token);
      router.push("/dashboard");
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      const raw = apiError?.message;
      if (raw === "email_not_verified") {
        setServerError(tl.emailNotVerified);
      } else {
        setServerError(raw ?? tl.invalidCredentials);
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Mobile logo */}
      <div className="lg:hidden flex justify-center">
        <img src="/img/logo.png" alt="Orkestria" className="h-8 w-auto" />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-brand-navy">{tl.title}</h2>
        <p className="text-slate-500">{tl.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {justRegistered && (
          <FlashBag variant="success" message={tl.successMessage} />
        )}

        {justVerified && (
          <FlashBag variant="success" message={tl.verifiedMessage} />
        )}

        {verifyError && (
          <FlashBag variant="error" message={tl.verifyErrorMessage} />
        )}

        {passwordReset && (
          <FlashBag variant="success" message={tl.passwordResetMessage} />
        )}

        {serverError && (
          <FlashBag variant="error" message={serverError} />
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            {tl.emailLabel}
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
            placeholder={tl.emailPlaceholder}
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              {tl.passwordLabel}
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-brand-purple hover:text-brand-navy transition"
            >
              {tl.forgotPassword}
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? tl.submitLoading : tl.submit}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        {tl.noAccount}{" "}
        <Link
          href="/register"
          className="font-medium text-brand-purple hover:text-brand-navy transition"
        >
          {tl.createOne}
        </Link>
      </p>
    </div>
  );
}
