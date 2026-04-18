"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import type { Language } from "@/lib/i18n";

function FlagFR({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" className={className}>
      <rect width="30" height="20" fill="#ED2939" />
      <rect width="20" height="20" fill="#fff" />
      <rect width="10" height="20" fill="#002395" />
    </svg>
  );
}

function FlagGB({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className={className}>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

const LANGUAGES: { code: Language; Flag: typeof FlagFR; label: string }[] = [
  { code: "fr", Flag: FlagFR, label: "Français" },
  { code: "en", Flag: FlagGB, label: "English" },
];

type Props = {
  variant?: "light" | "dark";
  dropdownPosition?: "down" | "up";
};

export default function LanguageToggle({ variant = "light", dropdownPosition = "down" }: Props) {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
  const isDark = variant === "dark";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={current.label}
        className={`flex items-center gap-1.5 rounded-lg transition ${
          isDark
            ? "px-3 py-2.5 text-slate-400 hover:bg-white/5 hover:text-white"
            : "border border-slate-200 bg-white px-2.5 py-1.5 hover:border-slate-400"
        }`}
      >
        <current.Flag className="h-4 w-6 rounded-[2px] object-cover shadow-sm" />
        <svg
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""} ${
            isDark ? "text-slate-500" : "text-slate-400"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className={`absolute left-0 z-50 w-36 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg ${
            dropdownPosition === "up" ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          {LANGUAGES.map(({ code, Flag, label }) => (
            <li key={code} role="option" aria-selected={lang === code}>
              <button
                onClick={() => {
                  setLang(code);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition hover:bg-slate-50 ${
                  lang === code ? "font-semibold text-brand-navy" : "text-slate-600"
                }`}
              >
                <Flag className="h-4 w-6 shrink-0 rounded-[2px] shadow-sm" />
                <span>{label}</span>
                {lang === code && (
                  <svg
                    className="ml-auto h-3.5 w-3.5 text-brand-purple"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
