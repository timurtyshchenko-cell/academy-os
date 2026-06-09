"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { Lang, translations } from "./translations";

type T = typeof translations["en"];

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: T;
}

const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => {},
  t: translations["en"],
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lang") as Lang | null;
      if (saved && saved in translations) return saved;
    }
    return "en";
  });

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("lang", l);
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] as unknown as T }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
