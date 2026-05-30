"use client";
import { useState } from "react";
import { LangProvider } from "@/lib/i18n/context";
import { useLang } from "@/lib/i18n/context";
import { Lang, LANG_FLAGS, LANG_NAMES } from "@/lib/i18n/translations";

function LangSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: -1 }} />
          <div style={{
            position: "absolute", bottom: "calc(100% + 8px)", right: 0,
            background: "#1a2b22", border: "1px solid #1F6B45",
            borderRadius: 14, overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,.5)", minWidth: 160,
          }}>
            {(["en", "es", "ru"] as Lang[]).map(l => (
              <button key={l} onClick={() => { setLang(l); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "12px 16px",
                  background: l === lang ? "rgba(31,107,69,.3)" : "transparent",
                  border: "none", cursor: "pointer", fontSize: 14,
                  fontWeight: l === lang ? 700 : 500,
                  color: l === lang ? "#4ade80" : "#cbd5e1",
                  transition: "background .12s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={e => { if (l !== lang) (e.currentTarget.style.background = "rgba(255,255,255,.07)"); }}
                onMouseLeave={e => { if (l !== lang) (e.currentTarget.style.background = "transparent"); }}>
                <span style={{ fontSize: 20 }}>{LANG_FLAGS[l]}</span>
                <span>{LANG_NAMES[l]}</span>
                {l === lang && <span style={{ marginLeft: "auto", color: "#4ade80", fontSize: 13 }}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
      <button onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 18px", borderRadius: 100,
          background: "#1F6B45", color: "#fff",
          border: "none", cursor: "pointer",
          fontSize: 14, fontWeight: 700,
          boxShadow: "0 4px 20px rgba(31,107,69,.5)",
          fontFamily: "inherit",
          transition: "transform .15s, box-shadow .15s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(31,107,69,.6)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(31,107,69,.5)"; }}>
        <span style={{ fontSize: 20 }}>{LANG_FLAGS[lang]}</span>
        <span>{lang.toUpperCase()}</span>
      </button>
    </div>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      {children}
      <LangSwitcher />
    </LangProvider>
  );
}
