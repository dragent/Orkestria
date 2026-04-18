"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useLanguage } from "@/contexts/language-context";
import { FlashBag } from "@/components/FlashBag";

export default function RegisterPage() {
  const [registered, setRegistered] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { t } = useLanguage();
  const tr = t.register;

  const registerSchema = z
    .object({
      firstName: z.string().min(1, tr.firstNameRequired).max(100),
      lastName: z.string().min(1, tr.lastNameRequired).max(100),
      email: z.string().email(tr.invalidEmail),
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

  type RegisterFormData = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit({ confirmPassword: _, ...data }: RegisterFormData) {
    setServerError(null);
    try {
      await authApi.register(data);
      setRegistered(true);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setServerError(apiError?.message ?? tr.registrationFailed);
    }
  }

  if (registered) {
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
          <h2 className="text-2xl font-bold text-brand-navy">{tr.checkEmailTitle}</h2>
          <p className="text-slate-500 text-sm">{tr.checkEmailSubtitle}</p>
          <p className="text-slate-600 text-sm max-w-sm">{tr.checkEmailBody}</p>
          <p className="text-slate-400 text-xs">{tr.checkEmailSpam}</p>
        </div>
        <p className="text-center text-sm text-slate-500">
          {tr.alreadyAccount}{" "}
          <Link href="/login" className="font-medium text-brand-purple hover:text-brand-navy transition">
            {tr.signIn}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Mobile logo */}
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
              {tr.firstNameLabel}
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              {...register("firstName")}
              className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple ${
                errors.firstName
                  ? "border-red-400 bg-red-50"
                  : "border-slate-300 bg-white hover:border-slate-400"
              }`}
              placeholder="Alice"
            />
            {errors.firstName && (
              <p className="text-xs text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
              {tr.lastNameLabel}
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              {...register("lastName")}
              className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple ${
                errors.lastName
                  ? "border-red-400 bg-red-50"
                  : "border-slate-300 bg-white hover:border-slate-400"
              }`}
              placeholder="Dupont"
            />
            {errors.lastName && (
              <p className="text-xs text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            {tr.emailLabel}
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
            placeholder={tr.emailPlaceholder}
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

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
            placeholder={tr.passwordPlaceholder}
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
        {tr.alreadyAccount}{" "}
        <Link
          href="/login"
          className="font-medium text-brand-purple hover:text-brand-navy transition"
        >
          {tr.signIn}
        </Link>
      </p>
    </div>
  );
}
