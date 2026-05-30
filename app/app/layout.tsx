"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n/context";
import { Lang, LANG_FLAGS, LANG_LABELS, LANG_NAMES } from "@/lib/i18n/translations";

const NAV_KEYS = [
  { href: "/app", key: "overview" as const, exact: true },
  { href: "/app/players", key: "players" as const },
  { href: "/app/schedule", key: "schedule" as const },
  { href: "/app/courts", key: "courts" as const },
  { href: "/app/billing", key: "billing" as const },
  { href: "/app/coaches", key: "coaches" as const },
  { href: "/app/settings", key: "settings" as const },
];

const NAV_ICONS: Record<string, string> = {
  "/app": "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  "/app/players": "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  "/app/schedule": "M8 7V3M16 7V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  "/app/courts": "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z",
  "/app/billing": "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  "/app/coaches": "M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
  "/app/settings": "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
};

function NavIcon({ path, size = 15 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      {path.split("M").filter(Boolean).map((d, i) => <path key={i} d={"M" + d} />)}
    </svg>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, t } = useLang();
  const [langOpen, setLangOpen] = useState(false);
  const [academyName, setAcademyName] = useState("");
  const [userName, setUserName] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);

  const NAV = NAV_KEYS.map(item => ({ ...item, label: t.nav[item.key] }));

  useEffect(() => {
    const saved = (localStorage.getItem("dashboard-theme") || "dark") as "dark" | "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  useEffect(() => {
    fetch("/api/me").then(r => {
      if (r.status === 401) { router.push("/login"); return r; }
      return r.json();
    }).then(d => {
      if (d?.academyName) { setAcademyName(d.academyName); setUserName(d.name); setSubscriptionStatus(d.subscriptionStatus); }
    });
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("dashboard-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  const isActive = (item: typeof NAV[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const SideNav = ({ onNav }: { onNav?: () => void }) => (
    <nav style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {NAV.map(item => {
        const active = isActive(item);
        return (
          <Link key={item.href} href={item.href} onClick={onNav} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12,
            background: active ? "rgba(31,107,69,.15)" : "transparent",
            border: `1px solid ${active ? "rgba(31,107,69,.25)" : "transparent"}`,
            color: active ? "#4ade80" : "#97A6B2",
            fontWeight: active ? 600 : 450, fontSize: 13.5,
            textDecoration: "none", transition: "background .15s, color .15s",
            boxShadow: active ? "inset 3px 0 0 #1F6B45" : "none",
          }}
            onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.04)"; (e.currentTarget as HTMLElement).style.color = "#F5F7FA"; } }}
            onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#97A6B2"; } }}>
            <span style={{ opacity: active ? 1 : 0.55, flexShrink: 0, display: "flex" }}>
              <NavIcon path={NAV_ICONS[item.href] || ""} size={15} />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)", display: "flex", flexDirection: "column" }}>
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .main-content { padding: 14px !important; padding-bottom: 76px !important; }
          .mobile-nav-overlay { display: flex !important; }
          .mobile-bottom-nav { display: flex !important; }
          .mobile-scroll { overflow-x: auto !important; -webkit-overflow-scrolling: touch; }
          .mobile-stack { flex-direction: column !important; }
          .mobile-full { width: 100% !important; max-width: 100% !important; }
          .mobile-hide { display: none !important; }
          .mobile-grid-1 { grid-template-columns: 1fr !important; }
          .mobile-grid-2 { grid-template-columns: 1fr 1fr !important; }
          .mobile-wrap { flex-wrap: wrap !important; }
          h1 { font-size: 20px !important; }
          .profile-hero-row { flex-direction: column !important; align-items: flex-start !important; }
          .profile-hero-row > div:last-child { width: 100%; justify-content: flex-start !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
          .mobile-nav-overlay { display: none !important; }
          .mobile-bottom-nav { display: none !important; }
        }
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slidedown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--c-border)", background: "var(--c-header-bg)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 40, flexShrink: 0 }}>
        <div style={{ padding: "0 20px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="mobile-menu-btn" onClick={() => setMenuOpen(o => !o)}
              style={{ display: "none", width: 34, height: 34, background: "var(--c-inner)", border: "1px solid var(--c-border)", borderRadius: 10, alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: "var(--c-text-3)", transition: "all .15s" }}>
              {menuOpen ? "✕" : "☰"}
            </button>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
              <div style={{ width: 30, height: 30, background: "#1F6B45", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#FFD447", fontSize: 14, flexShrink: 0 }}>
                {academyName?.[0]?.toUpperCase() || "A"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
                <span style={{ fontWeight: 700, color: "var(--c-text)", fontSize: 14, letterSpacing: "-.2px" }}>{academyName || "AcademyOS"}</span>
                <span className="mobile-hide" style={{ fontSize: 10.5, color: "var(--c-text-muted)" }}>{t.layout.tennisAcademy}</span>
              </div>
            </Link>
            <div className="mobile-hide" style={{ width: 1, height: 14, background: "var(--c-border)", marginLeft: 2 }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div className="mobile-hide" style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 100, background: "rgba(31,107,69,.12)", border: "1px solid rgba(31,107,69,.2)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", animation: "pulse-slow 2.5s ease infinite" }} />
              <span style={{ fontSize: 11.5, color: "#4ade80", fontWeight: 600 }}>{t.layout.live}</span>
            </div>
            <button onClick={toggleTheme} title={theme === "dark" ? t.layout.lightMode : t.layout.darkMode}
              style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid var(--c-border)", background: "var(--c-inner)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, transition: "all .15s", color: "var(--c-text-3)" }}
              onMouseEnter={e => { (e.currentTarget.style.borderColor = "var(--c-border-hover)"); (e.currentTarget.style.color = "var(--c-text)"); }}
              onMouseLeave={e => { (e.currentTarget.style.borderColor = "var(--c-border)"); (e.currentTarget.style.color = "var(--c-text-3)"); }}>
              {theme === "dark" ? "☀" : "☾"}
            </button>
            <div style={{ position: "relative" }}>
              <button onClick={() => setLangOpen(o => !o)}
                style={{ height: 32, padding: "0 12px", borderRadius: 9, border: "1px solid var(--c-border)", background: "var(--c-inner)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "var(--c-text)", transition: "all .15s", whiteSpace: "nowrap" }}
                onMouseEnter={e => { (e.currentTarget.style.borderColor = "#1F6B45"); (e.currentTarget.style.background = "rgba(31,107,69,.1)"); }}
                onMouseLeave={e => { (e.currentTarget.style.borderColor = "var(--c-border)"); (e.currentTarget.style.background = "var(--c-inner)"); }}>
                <span style={{ fontSize: 15 }}>{LANG_FLAGS[lang]}</span>
                <span>{LANG_LABELS[lang]}</span>
                <span style={{ fontSize: 9, opacity: .5 }}>▾</span>
              </button>
              {langOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 12, overflow: "hidden", boxShadow: "var(--c-shadow-lg)", zIndex: 100, minWidth: 140 }}>
                  {(["en", "es", "ru"] as Lang[]).map(l => (
                    <button key={l} onClick={() => { setLang(l); setLangOpen(false); }}
                      style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "10px 14px", background: l === lang ? "rgba(31,107,69,.12)" : "transparent", border: "none", cursor: "pointer", fontSize: 13, fontWeight: l === lang ? 700 : 500, color: l === lang ? "#4ade80" : "var(--c-text-3)", transition: "background .12s" }}
                      onMouseEnter={e => { if (l !== lang) (e.currentTarget.style.background = "rgba(255,255,255,.05)"); }}
                      onMouseLeave={e => { if (l !== lang) (e.currentTarget.style.background = "transparent"); }}>
                      <span style={{ fontSize: 16 }}>{LANG_FLAGS[l]}</span>
                      <span>{LANG_NAMES[l]}</span>
                      {l === lang && <span style={{ marginLeft: "auto", fontSize: 11 }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mobile-hide" style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 12px 4px 6px", borderRadius: 100, border: "1px solid var(--c-border)", background: "var(--c-inner)", cursor: "pointer", transition: "border-color .15s" }}
              onClick={signOut} title="Sign out"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border-hover)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border)"; }}>
              <div style={{ width: 22, height: 22, background: "#1F6B45", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#FFD447" }}>
                {userName?.[0]?.toUpperCase() || "U"}
              </div>
              <span style={{ fontSize: 12, color: "var(--c-text-3)" }}>{userName || "Account"}</span>
            </div>
            <button onClick={signOut} className="mobile-menu-btn" style={{ display: "none", width: 32, height: 32, borderRadius: 9, border: "1px solid var(--c-border)", background: "var(--c-inner)", cursor: "pointer", alignItems: "center", justifyContent: "center", fontSize: 13, color: "var(--c-text-3)" }}>
              ↪
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-in menu */}
      {menuOpen && (
        <div className="mobile-nav-overlay" style={{ display: "none", position: "fixed", inset: 0, zIndex: 50, animation: "slidedown .18s ease" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)" }} onClick={() => setMenuOpen(false)} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 264, background: "var(--c-sidebar)", padding: "20px 14px", overflowY: "auto", boxShadow: "4px 0 24px rgba(0,0,0,.4)", borderRight: "1px solid var(--c-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 0 20px" }}>
              <div style={{ width: 28, height: 28, background: "#1F6B45", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#FFD447", fontSize: 12 }}>
                {academyName?.[0]?.toUpperCase() || "A"}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)" }}>{academyName || "AcademyOS"}</p>
                <p style={{ fontSize: 11, color: "var(--c-text-muted)" }}>{t.layout.tennisAcademy}</p>
              </div>
            </div>
            <SideNav onNav={() => setMenuOpen(false)} />
            <div style={{ height: 1, background: "var(--c-divider)", margin: "16px 0" }} />
            <Link href="/subscribe" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 12, background: "rgba(255,212,71,.1)", border: "1px solid rgba(255,212,71,.2)", color: "#FFD447", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
              <span>⚡</span> {t.layout.upgradePlan}
            </Link>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flex: 1 }}>
        {/* Desktop sidebar */}
        <aside className="desktop-sidebar" style={{ width: 228, borderRight: "1px solid var(--c-border)", background: "var(--c-sidebar)", padding: "18px 12px 24px", flexShrink: 0, position: "sticky", top: 58, height: "calc(100vh - 58px)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <SideNav />
          <div style={{ flex: 1 }} />
          <div style={{ height: 1, background: "var(--c-divider)", marginBottom: 12 }} />
          <Link href="/subscribe" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 12, background: "rgba(255,212,71,.08)", border: "1px solid rgba(255,212,71,.16)", color: "#FFD447", fontWeight: 600, fontSize: 12.5, textDecoration: "none", transition: "all .15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,212,71,.14)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,212,71,.08)"; }}>
            <span style={{ fontSize: 13 }}>⚡</span> {t.layout.upgradePlan}
          </Link>
        </aside>

        <main className="main-content" style={{ flex: 1, padding: "28px 32px", minWidth: 0, paddingBottom: 80, animation: "fadein .25s ease" }}>
          {subscriptionStatus === "trial" ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
              <div style={{ maxWidth: 480, textAlign: "center", background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 18, padding: 52, boxShadow: "var(--c-shadow-lg)" }}>
                <div style={{ width: 72, height: 72, background: "rgba(31,107,69,.12)", border: "1px solid rgba(31,107,69,.2)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 24px" }}>🔒</div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--c-text)", letterSpacing: "-.5px", marginBottom: 12 }}>{t.layout.subscriptionRequired}</h2>
                <p style={{ fontSize: 14, color: "var(--c-text-3)", lineHeight: 1.75, marginBottom: 36 }}>{t.layout.subscriptionDesc}</p>
                <a href="/#pricing" style={{ display: "inline-block", background: "#FFD447", color: "#081418", fontWeight: 800, fontSize: 14, padding: "13px 32px", borderRadius: 12, textDecoration: "none" }}>
                  {t.layout.viewPlans}
                </a>
              </div>
            </div>
          ) : children}
        </main>
      </div>

      {/* Mobile bottom nav — 5 primary tabs */}
      <nav className="mobile-bottom-nav" style={{ display: "none", position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--c-header-bg)", backdropFilter: "blur(20px)", borderTop: "1px solid var(--c-border)", zIndex: 40 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "6px 0 8px" }}>
          {[
            { href: "/app", label: t.nav.home, exact: true },
            { href: "/app/players", label: t.nav.players, exact: false },
            { href: "/app/schedule", label: t.nav.schedule, exact: false },
            { href: "/app/billing", label: t.nav.billing, exact: false },
          ].map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 12px", textDecoration: "none", flex: 1, color: active ? "#4ade80" : "var(--c-text-muted)", transition: "color .15s", position: "relative" }}>
                {active && <span style={{ position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)", width: 24, height: 3, background: "#1F6B45", borderRadius: 99 }} />}
                <NavIcon path={NAV_ICONS[item.href] || ""} size={20} />
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{item.label}</span>
              </Link>
            );
          })}
          {/* More button */}
          <button onClick={() => setMenuOpen(o => !o)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 12px", flex: 1, background: "none", border: "none", color: menuOpen ? "#4ade80" : "var(--c-text-muted)", cursor: "pointer" }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round">
              <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 500 }}>{t.nav.more}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
