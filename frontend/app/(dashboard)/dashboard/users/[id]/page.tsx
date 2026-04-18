"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usersApi, type User } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import { useLanguage } from "@/contexts/language-context";
import { FlashBag } from "@/components/FlashBag";

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3.5 border-b border-slate-100 last:border-0">
      <dt className="w-40 shrink-0 text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-800">{children}</dd>
    </div>
  );
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const { t, lang } = useLanguage();
  const tud = t.userDetail;

  useEffect(() => {
    if (!id) return;

    usersApi
      .get(Number(id))
      .then(setUser)
      .catch((err: { message?: string }) => {
        setServerError(err?.message ?? tud.loadError);
      })
      .finally(() => setLoading(false));
  }, [id, tud.loadError]);

  const dateLocale = lang === "fr" ? "fr-FR" : "en-GB";

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/users"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-navy transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {tud.backLabel}
        </Link>
      </div>

      {serverError && (
        <FlashBag variant="error" message={serverError} />
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 rounded-lg bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : user ? (
        <>
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-brand-purple to-brand-blue flex items-center justify-center text-white text-xl font-bold shrink-0">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-navy">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-slate-500">{user.email}</p>
            </div>
          </div>

          {/* Details card */}
          <div className="rounded-xl border border-slate-200 bg-white px-6">
            <dl>
              <DetailRow label={tud.id}>#{user.id}</DetailRow>
              <DetailRow label={tud.email}>{user.email}</DetailRow>
              <DetailRow label={tud.firstName}>{user.firstName}</DetailRow>
              <DetailRow label={tud.lastName}>{user.lastName}</DetailRow>
              <DetailRow label={tud.role}>
                {user.roles.includes("ROLE_ADMIN") ? (
                  <span className="inline-flex items-center rounded-full bg-brand-purple/10 px-2.5 py-0.5 text-xs font-medium text-brand-purple ring-1 ring-brand-purple/20">
                    {t.admin}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                    {t.user}
                  </span>
                )}
              </DetailRow>
              <DetailRow label={tud.company}>
                {user.company ? (
                  <Link
                    href={`/dashboard/companies/${user.company.id}`}
                    className="text-brand-purple hover:text-brand-navy font-medium transition-colors"
                  >
                    {user.company.name}
                  </Link>
                ) : (
                  <span className="text-slate-400">{t.noCompany}</span>
                )}
              </DetailRow>
              <DetailRow label={tud.status}>
                <StatusBadge
                  active={user.isActive}
                  activeLabel={t.active}
                  inactiveLabel={t.inactive}
                />
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
        </>
      ) : null}
    </div>
  );
}
