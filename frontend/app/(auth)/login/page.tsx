"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { setToken } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

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
          setServerError(apiError?.message ?? "Identifiants invalides. Veuillez réessayer.");
    }
  }

  return (
    <div className="space-y-8">
      {/* Mobile logo */}
      <div className="lg:hidden flex justify-center">
        <img src="/img/logo.png" alt="Orkestria" className="h-8 w-auto" />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-brand-navy">Bon retour</h2>
        <p className="text-slate-500">Connectez-vous à votre espace Orkestria</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Adresse e-mail
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
            placeholder="you@company.com"
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Mot de passe
            </label>
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
          {isSubmitting ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Pas encore de compte ?{" "}
        <Link
          href="/register"
          className="font-medium text-brand-purple hover:text-brand-navy transition"
        >
          En créer un
        </Link>
      </p>
    </div>
  );
}
