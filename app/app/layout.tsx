"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/app", icon: "○", label: "Overview", exact: true },
  { href: "/app/players", icon: "○", label: "Players" },
  { href: "/app/schedule", icon: "○", label: "Schedule" },
  { href: "/app/courts", icon: "○", label: "Courts" },
  { href: "/app/billing", icon: "○", label: "Billing" },
  { href: "/app/coaches", icon: "○", label: "Coaches" },
  { href: "/app/settings", icon: "○", label: "Settings" },
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

function NavIcon({ path, size = 16 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {path.split("M").filter(Boolean).map((d, i) => <path key={i} d={"M" + d} />)}
    </svg>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [academyName, setAcademyName] = useState("");
  const [userName, setUserName] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);

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
            display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 10,
            background: active ? "var(--c-accent-soft)" : "transparent",
            border: `1px solid ${active ? "var(--c-accent-border)" : "transparent"}`,
            color: active ? "#819595" : "var(--c-text-3)",
            fontWeight: active ? 600 : 450, fontSize: 13.5,
            textDecoration: "none", transition: "all .15s", letterSpacing: "-.1px",
            boxShadow: active ? "inset 3px 0 0 #819595" : "none",
          }}
            onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.04)"; (e.currentTarget as HTMLElement).style.color = "var(--c-text-2)"; } }}
            onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--c-text-3)"; } }}>
            <span style={{ opacity: active ? 1 : 0.6, flexShrink: 0, display: "flex" }}>
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
          .mobile-text-sm { font-size: 12px !important; }
          h1 { font-size: 20px !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
          .mobile-nav-overlay { display: none !important; }
          .mobile-bottom-nav { display: none !important; }
        }
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slidedown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--c-border)", background: "var(--c-header-bg)", backdropFilter: "blur(24px)", position: "sticky", top: 0, zIndex: 40, flexShrink: 0 }}>
        <div style={{ padding: "0 20px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="mobile-menu-btn" onClick={() => setMenuOpen(o => !o)}
              style={{ display: "none", width: 34, height: 34, background: "var(--c-inner)", border: "1px solid var(--c-border)", borderRadius: 9, alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: "var(--c-text-3)", transition: "all .15s" }}>
              {menuOpen ? "✕" : "☰"}
            </button>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
              <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#363946,#696773)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 13, boxShadow: "0 2px 10px rgba(79,70,229,.45)", flexShrink: 0 }}>
                {academyName?.[0]?.toUpperCase() || "A"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
                <span style={{ fontWeight: 700, color: "var(--c-text)", fontSize: 14, letterSpacing: "-.2px" }}>{academyName || "AcademyOS"}</span>
                <span className="mobile-hide" style={{ fontSize: 10.5, color: "var(--c-text-muted)", fontWeight: 500 }}>AcademyOS</span>
              </div>
            </Link>
            <div className="mobile-hide" style={{ width: 1, height: 14, background: "var(--c-border)", marginLeft: 2 }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div className="mobile-hide" style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 100, background: "rgba(5,150,105,.08)", border: "1px solid rgba(5,150,105,.18)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669" }} />
              <span style={{ fontSize: 11.5, color: "#059669", fontWeight: 600 }}>Live</span>
            </div>
            <button onClick={toggleTheme} title={theme === "dark" ? "Light mode" : "Dark mode"}
              style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-inner)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, transition: "all .15s", color: "var(--c-text-3)" }}
              onMouseEnter={e => { (e.currentTarget.style.borderColor = "var(--c-border-hover)"); (e.currentTarget.style.color = "var(--c-text)"); }}
              onMouseLeave={e => { (e.currentTarget.style.borderColor = "var(--c-border)"); (e.currentTarget.style.color = "var(--c-text-3)"); }}>
              {theme === "dark" ? "☀" : "☾"}
            </button>
            <div className="mobile-hide" style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 12px 4px 6px", borderRadius: 100, border: "1px solid var(--c-border)", background: "var(--c-inner)", cursor: "pointer" }} onClick={signOut}
              title="Sign out">
              <div style={{ width: 22, height: 22, background: "linear-gradient(135deg,#819595,#819595)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>
                {userName?.[0]?.toUpperCase() || "U"}
              </div>
              <span style={{ fontSize: 12, color: "var(--c-text-3)", fontWeight: 500 }}>{userName || "Account"}</span>
            </div>
            <button onClick={signOut} className="mobile-menu-btn" style={{ display: "none", width: 32, height: 32, borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-inner)", cursor: "pointer", alignItems: "center", justifyContent: "center", fontSize: 13, color: "var(--c-text-3)" }}
              title="Sign out">
              ↪
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-in menu */}
      {menuOpen && (
        <div className="mobile-nav-overlay" style={{ display: "none", position: "fixed", inset: 0, zIndex: 50, animation: "slidedown .18s ease" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)" }} onClick={() => setMenuOpen(false)} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 264, background: "var(--c-sidebar)", padding: "20px 14px", overflowY: "auto", boxShadow: "4px 0 32px rgba(0,0,0,.4)", borderRight: "1px solid var(--c-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 0 20px" }}>
              <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#363946,#696773)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 12, boxShadow: "0 2px 8px rgba(129,149,149,.3)" }}>
                {academyName?.[0]?.toUpperCase() || "A"}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)", letterSpacing: "-.2px" }}>{academyName || "AcademyOS"}</p>
                <p style={{ fontSize: 11, color: "var(--c-text-muted)" }}>Tennis Academy</p>
              </div>
            </div>
            <SideNav onNav={() => setMenuOpen(false)} />
            <div style={{ height: 1, background: "var(--c-divider)", margin: "16px 0" }} />
            <Link href="/subscribe" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 10, background: "rgba(129,149,149,.08)", border: "1px solid rgba(129,149,149,.2)", color: "#819595", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
              <span style={{ fontSize: 14 }}>⚡</span> Upgrade Plan
            </Link>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flex: 1 }}>
        {/* Desktop sidebar */}
        <aside className="desktop-sidebar" style={{ width: 232, borderRight: "1px solid var(--c-divider)", background: "var(--c-sidebar)", padding: "18px 14px 24px", flexShrink: 0, position: "sticky", top: 58, height: "calc(100vh - 58px)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <SideNav />
          <div style={{ flex: 1 }} />
          <div style={{ height: 1, background: "var(--c-divider)", marginBottom: 14 }} />
          <Link href="/subscribe" style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 14px", borderRadius: 10, background: "rgba(129,149,149,.07)", border: "1px solid rgba(129,149,149,.18)", color: "#819595", fontWeight: 600, fontSize: 12.5, textDecoration: "none", transition: "all .15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(129,149,149,.1)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(129,149,149,.28)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(129,149,149,.07)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(129,149,149,.18)"; }}>
            <span style={{ fontSize: 13 }}>⚡</span> Upgrade Plan
          </Link>
        </aside>

        <main className="main-content" style={{ flex: 1, padding: "32px 36px", minWidth: 0, paddingBottom: 80, animation: "fadein .25s ease" }}>
          {subscriptionStatus === "trial" ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
              <div style={{ maxWidth: 480, textAlign: "center", background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 24, padding: 52, boxShadow: "var(--c-shadow-lg)" }}>
                <div style={{ width: 72, height: 72, background: "rgba(79,70,229,.1)", border: "1px solid rgba(79,70,229,.2)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 24px" }}>🔒</div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--c-text)", letterSpacing: "-1px", marginBottom: 12 }}>Subscription Required</h2>
                <p style={{ fontSize: 14, color: "var(--c-text-muted)", lineHeight: 1.75, marginBottom: 36 }}>To access your academy dashboard you need an active subscription.</p>
                <a href="/#pricing" style={{ display: "inline-block", background: "linear-gradient(135deg,#363946,#696773)", color: "#fff", fontWeight: 700, fontSize: 14, padding: "13px 32px", borderRadius: 12, textDecoration: "none", boxShadow: "0 6px 24px rgba(129,149,149,.3)" }}>
                  View plans →
                </a>
              </div>
            </div>
          ) : children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav" style={{ display: "none", position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--c-header-bg)", backdropFilter: "blur(24px)", borderTop: "1px solid var(--c-border)", zIndex: 40, overflowX: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", minWidth: "max-content", width: "100%", justifyContent: "space-around", padding: "0 4px" }}>
          {NAV.map(item => {
            const active = isActive(item);
            return (
              <Link key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 10px", textDecoration: "none", minWidth: 52, color: active ? "#819595" : "var(--c-text-muted)", transition: "all .15s", position: "relative" }}>
                {active && <span style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 22, height: 2, background: "#819595", borderRadius: 99 }} />}
                <NavIcon path={NAV_ICONS[item.href] || ""} size={18} />
                <span style={{ fontSize: 9.5, fontWeight: active ? 700 : 500, whiteSpace: "nowrap" }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
