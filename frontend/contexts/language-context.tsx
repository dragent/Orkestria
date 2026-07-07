"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations, type Language, type Translations } from "@/lib/i18n";

type LanguageContextValue = {
  lang: Language;
  t: Translations;
  setLang: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  lang: "fr",
  t: translations.fr,
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("fr");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Language | null;
    if (stored === "en" || stored === "fr") {
      setLangState(stored);
    }
  }, []);

  function setLang(next: Language) {
    setLangState(next);
    localStorage.setItem("lang", next);
  }

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
