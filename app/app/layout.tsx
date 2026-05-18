"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/app", emoji: "📊", label: "Overview", exact: true },
  { href: "/app/players", emoji: "👥", label: "Players" },
  { href: "/app/schedule", emoji: "📅", label: "Schedule" },
  { href: "/app/courts", emoji: "🎾", label: "Courts" },
  { href: "/app/billing", emoji: "💳", label: "Billing" },
  { href: "/app/coaches", emoji: "🧑‍🏫", label: "Coaches" },
  { href: "/app/settings", emoji: "⚙️", label: "Settings" },
];

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

  const SideNav = () => (
    <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {NAV.map(item => {
        const active = isActive(item);
        return (
          <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10,
            background: active ? "rgba(37,99,235,.12)" : "transparent",
            border: active ? "1px solid rgba(37,99,235,.2)" : "1px solid transparent",
            color: active ? "#60a5fa" : "var(--c-text-muted)", fontWeight: active ? 700 : 500,
            fontSize: 13, textDecoration: "none", transition: "all .15s",
          }}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "var(--c-text)"; }}
            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "var(--c-text-muted)"; }}>
            <span style={{ fontSize: 15 }}>{item.emoji}</span>
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
          .main-content { padding: 12px !important; padding-bottom: 72px !important; }
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
          .main-content-wrap { padding-bottom: 0 !important; }
        }
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <header style={{ borderBottom: "1px solid var(--c-border)", background: "var(--c-header-bg)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 40, flexShrink: 0 }}>
        <div style={{ padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="mobile-menu-btn" onClick={() => setMenuOpen(o => !o)}
              style={{ display: "none", width: 36, height: 36, background: "var(--c-inner)", border: "1px solid var(--c-border)", borderRadius: 9, alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}>
              {menuOpen ? "✕" : "☰"}
            </button>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#4f46e5,#2563eb)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 14, boxShadow: "0 2px 8px rgba(79,70,229,.4)", flexShrink: 0 }}>
                {academyName?.[0]?.toUpperCase() || "A"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                <span style={{ fontWeight: 800, color: "var(--c-text)", fontSize: 15 }}>{academyName || "AcademyOS"}</span>
                <span className="mobile-hide" style={{ fontSize: 11, color: "var(--c-text-muted)", fontWeight: 500 }}>AcademyOS</span>
              </div>
            </Link>
            <div className="mobile-hide" style={{ width: 1, height: 16, background: "var(--c-border)" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="mobile-hide" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#059669" }} />
              <span style={{ fontSize: 12, color: "var(--c-text-muted)" }}>Live</span>
            </div>
            <button onClick={toggleTheme} title={theme === "dark" ? "Switch to light" : "Switch to dark"}
              style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-inner)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, transition: "all .2s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--c-border-hover)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--c-border)")}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button onClick={signOut} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-inner)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, transition: "all .2s" }}
              title="Sign out"
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--c-border-hover)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--c-border)")}>
              🚪
            </button>
            <div className="mobile-hide" style={{ width: 32, height: 32, background: "var(--c-avatar-bg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--c-avatar-text)" }}>
              {userName?.[0]?.toUpperCase() || "U"}
            </div>
            <button onClick={signOut} className="mobile-hide" style={{ fontSize: 12, color: "var(--c-text-muted)", background: "none", border: "none", cursor: "pointer", transition: "color .2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--c-text)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--c-text-muted)")}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-nav-overlay" style={{ display: "none", position: "fixed", inset: 0, zIndex: 50 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)" }} onClick={() => setMenuOpen(false)} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 260, background: "var(--c-sidebar)", padding: "20px 12px", overflowY: "auto", boxShadow: "4px 0 24px rgba(0,0,0,.3)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8, padding: "0 8px" }}>Menu</p>
            <SideNav />
            <div style={{ height: 1, background: "var(--c-divider)", margin: "16px 0" }} />
            <Link href="/subscribe" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, background: "rgba(37,99,235,.06)", border: "1px solid rgba(37,99,235,.15)", color: "#60a5fa", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>
              <span>⚡</span> Upgrade Plan
            </Link>
          </div>
        </div>
      )}

      <div className="main-content-wrap" style={{ display: "flex", flex: 1, paddingBottom: 0 }}>
        <aside className="desktop-sidebar" style={{ width: 220, borderRight: "1px solid var(--c-divider)", background: "var(--c-sidebar)", padding: "20px 12px", flexShrink: 0, position: "sticky", top: 56, height: "calc(100vh - 56px)", overflowY: "auto" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8, padding: "0 8px" }}>Menu</p>
          <SideNav />
          <div style={{ height: 1, background: "var(--c-divider)", margin: "16px 0" }} />
          <Link href="/subscribe" style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, background: "rgba(37,99,235,.06)", border: "1px solid rgba(37,99,235,.15)", color: "#60a5fa", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>
            <span>⚡</span> Upgrade Plan
          </Link>
        </aside>

        <main className="main-content" style={{ flex: 1, padding: "32px", minWidth: 0, paddingBottom: 80 }}>
          {subscriptionStatus === "trial" ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
              <div style={{ maxWidth: 480, textAlign: "center", background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 24, padding: 48, boxShadow: "var(--c-shadow)" }}>
                <div style={{ fontSize: 48, marginBottom: 20 }}>🔒</div>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: "var(--c-text)", letterSpacing: "-1px", marginBottom: 12 }}>Subscription Required</h2>
                <p style={{ fontSize: 15, color: "var(--c-text-muted)", lineHeight: 1.7, marginBottom: 32 }}>To access your academy dashboard you need an active subscription.</p>
                <a href="/#pricing" style={{ display: "inline-block", background: "linear-gradient(135deg,#4f46e5,#2563eb)", color: "#fff", fontWeight: 800, fontSize: 15, padding: "14px 32px", borderRadius: 13, textDecoration: "none", boxShadow: "0 8px 28px rgba(79,70,229,.4)" }}>
                  View plans →
                </a>
              </div>
            </div>
          ) : children}
        </main>
      </div>

      <nav className="mobile-bottom-nav" style={{ display: "none", position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--c-header-bg)", backdropFilter: "blur(20px)", borderTop: "1px solid var(--c-border)", zIndex: 40, overflowX: "auto", padding: "0 4px 0" }}>
        <div style={{ display: "flex", alignItems: "center", minWidth: "max-content", width: "100%", justifyContent: "space-around" }}>
          {NAV.map(item => {
            const active = isActive(item);
            return (
              <Link key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 10px", textDecoration: "none", minWidth: 52, borderTop: active ? "2px solid #60a5fa" : "2px solid transparent", transition: "all .15s" }}>
                <span style={{ fontSize: 18 }}>{item.emoji}</span>
                <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? "#60a5fa" : "var(--c-text-muted)", whiteSpace: "nowrap" }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
