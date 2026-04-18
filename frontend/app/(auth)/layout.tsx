"use client";

import Grainient from "@/components/Grainient";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/language-context";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand identity */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12 bg-brand-navy relative overflow-hidden">
        {/* Grainient WebGL background */}
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

        {/* Vignette overlay for text readability */}
        <div
          className="absolute inset-0 z-1"
          style={{
            background:
              "radial-gradient(ellipse at 60% 40%, transparent 20%, rgba(30,27,75,0.55) 80%)",
          }}
        />

        <div className="relative z-10">
          <img
            src="/img/logo.png"
            alt="Orkestria"
            className="h-10 w-auto brightness-0 invert"
          />
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl font-bold text-white leading-tight">
            {t.home.heroTitle}{" "}
            <span className="bg-linear-to-r from-brand-purple-light to-brand-blue bg-clip-text text-transparent">
              {t.home.heroTitleHighlight}
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            {t.authSubtitle}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
          <span className="text-slate-500 text-sm">{t.authBadge}</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex justify-end px-8 pt-6">
          <LanguageToggle />
        </div>
        <div className="flex-1 flex items-center justify-center px-8 pb-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
