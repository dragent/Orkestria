"use client";

import { useState } from "react";
import Link from "next/link";
import Grainient from "@/components/Grainient";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/language-context";

export default function HomePage() {
  const { t } = useLanguage();
  const h = t.home;
  const [menuOpen, setMenuOpen] = useState(false);

  const FEATURES = [
    {
      key: "orchestration",
      ...h.features.orchestration,
      icon: (
        <svg className="h-6 w-6 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      key: "team",
      ...h.features.team,
      icon: (
        <svg className="h-6 w-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      key: "multiTenant",
      ...h.features.multiTenant,
      icon: (
        <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      ),
    },
    {
      key: "secure",
      ...h.features.secure,
      icon: (
        <svg className="h-6 w-6 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
  ];

  const STATS = [
    { value: "100%", label: h.dataOwnership },
    { value: "∞", label: h.projectsSupported },
    { value: "24/7", label: h.available },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <img src="/img/logo.png" alt="Orkestria" className="h-8 w-auto" />

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-3">
            <LanguageToggle />
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-brand-navy"
            >
              {t.signIn}
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-brand-purple px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-navy"
            >
              {h.startFree}
            </Link>
          </nav>

          {/* Mobile: language toggle + hamburger */}
          <div className="flex items-center gap-2 sm:hidden">
            <LanguageToggle />
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="sm:hidden border-t border-slate-100 bg-white px-6 py-4 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-brand-navy"
            >
              {t.signIn}
            </Link>
            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white text-center transition hover:bg-brand-navy"
            >
              {h.startFree}
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-brand-navy px-6 py-24 text-center sm:py-32">
          <Grainient
            color1="#5b21b6"
            color2="#2d2a6e"
            color3="#0c0a1e"
            timeSpeed={0.15}
            warpStrength={0.75}
            warpFrequency={4.0}
            warpSpeed={1.2}
            warpAmplitude={75.0}
            blendAngle={-25.0}
            blendSoftness={0.18}
            rotationAmount={380.0}
            noiseScale={2.2}
            grainAmount={0.065}
            grainScale={2.2}
            grainAnimated
            contrast={1.15}
            gamma={0.65}
            saturation={0.88}
            zoom={0.88}
            colorBalance={0.22}
          />

          <div className="relative z-10 mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-blue animate-pulse" />
              {h.badge}
            </div>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              {h.heroTitle}{" "}
              <span className="bg-linear-to-r from-brand-purple-light to-brand-blue bg-clip-text text-transparent">
                {h.heroTitleHighlight}
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-lg text-slate-400 leading-relaxed">
              {h.heroSubtitle}
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className="w-full rounded-xl bg-brand-purple px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-purple/90 sm:w-auto"
              >
                {h.startFree}
              </Link>
              <Link
                href="/login"
                className="w-full rounded-xl border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
              >
                {h.signInAccount}
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-slate-100 bg-slate-50 px-6 py-10">
          <div className="mx-auto grid max-w-3xl grid-cols-3 gap-6 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-brand-navy">{value}</p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center space-y-3">
              <h2 className="text-3xl font-bold text-brand-navy">{h.featuresTitle}</h2>
              <p className="text-slate-500 max-w-xl mx-auto">{h.featuresSubtitle}</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ key, title, description, icon }) => (
                <div
                  key={key}
                  className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="h-11 w-11 rounded-xl bg-slate-50 flex items-center justify-center">
                    {icon}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-brand-navy">{title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA banner */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl rounded-2xl bg-brand-navy px-10 py-12 text-center space-y-6 relative overflow-hidden">
            <Grainient
              color1="#5b21b6"
              color2="#2d2a6e"
              color3="#0c0a1e"
              timeSpeed={0.12}
              warpStrength={0.7}
              warpFrequency={3.5}
              warpSpeed={1.0}
              warpAmplitude={80.0}
              blendAngle={20.0}
              blendSoftness={0.2}
              rotationAmount={340.0}
              noiseScale={2.0}
              grainAmount={0.06}
              grainScale={2.0}
              grainAnimated
              contrast={1.1}
              gamma={0.65}
              saturation={0.85}
              zoom={0.9}
              colorBalance={0.25}
            />
            <div className="relative z-10 space-y-4">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">{h.ctaTitle}</h2>
              <p className="text-slate-400">{h.ctaSubtitle}</p>
              <Link
                href="/register"
                className="inline-block rounded-xl bg-brand-purple px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-purple/90"
              >
                {h.ctaButton}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-slate-400 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src="/img/logo.png" alt="Orkestria" className="h-5 w-auto opacity-50" />
            <span>© {new Date().getFullYear()} Orkestria</span>
          </div>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-brand-navy transition-colors">{t.signIn}</Link>
            <Link href="/register" className="hover:text-brand-navy transition-colors">{t.registerLink}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
