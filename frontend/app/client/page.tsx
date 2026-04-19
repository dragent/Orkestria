"use client";

import { useLanguage } from "@/contexts/language-context";

export default function ClientHomePage() {
  const { t } = useLanguage();
  const s = t.spaces;

  return (
    <div className="p-8 max-w-2xl space-y-3">
      <h1 className="text-2xl font-bold text-brand-navy dark:text-white">{s.clientTitle}</h1>
      <p className="text-slate-600 dark:text-zinc-400">{s.clientBody}</p>
    </div>
  );
}
