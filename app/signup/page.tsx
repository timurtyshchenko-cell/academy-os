"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n/context";

export default function Signup() {
  const router = useRouter();
  const { t } = useLang();
  const l = t.signup;
  const li = t.login;
  const [form, setForm] = useState({ name: "", email: "", password: "", academy: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const inp = (k: string): React.CSSProperties => ({
    width: "100%",
    background: "#0e1e26",
    border: `1px solid ${focused === k ? "rgba(31,107,69,.45)" : "rgba(255,255,255,.08)"}`,
    borderRadius: 12,
    padding: "13px 16px",
    fontSize: 14,
    color: "#F5F7FA",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color .2s",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.academy) { setError(l.errAllRequired); return; }
    if (form.password.length < 6) { setError(l.errPasswordLength); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Signup failed"); setLoading(false); return; }
    router.push("/app");
  };

  const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#97A6B2", marginBottom: 7 };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#081418" }}>
      <style>{`
        @media (max-width: 768px) {
          .auth-right { display: none !important; }
          .auth-left { flex: 1 1 100% !important; padding: 48px 24px !important; }
        }
      `}</style>
      {/* LEFT — form */}
      <div className="auth-left" style={{ flex: "0 0 50%", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 48px", minHeight: "100vh" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 48 }}>
            <div style={{ width: 36, height: 36, background: "#1F6B45", borderRadius: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#FFD447" strokeWidth="2"/>
                <path d="M2 12 Q7 7 12 12 Q17 17 22 12" stroke="#FFD447" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#F5F7FA", letterSpacing: "-.3px" }}>AcademyOS</span>
          </Link>

          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#F5F7FA", letterSpacing: "-.6px", marginBottom: 6 }}>{l.title}</h1>
          <p style={{ fontSize: 14, color: "#607080", marginBottom: 28, lineHeight: 1.5 }}>{l.subtitle}</p>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
              <div>
                <label style={lbl}>{l.yourName}</label>
                <input required value={form.name} onChange={e => set("name", e.target.value)} placeholder="John Smith" style={inp("name")} onFocus={() => setFocused("name")} onBlur={() => setFocused("")} />
              </div>
              <div>
                <label style={lbl}>{l.academyName}</label>
                <input required value={form.academy} onChange={e => set("academy", e.target.value)} placeholder="Miami Tennis" style={inp("academy")} onFocus={() => setFocused("academy")} onBlur={() => setFocused("")} />
              </div>
            </div>
            <div>
              <label style={lbl}>{l.email}</label>
              <input required type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="coach@academy.com" style={inp("email")} onFocus={() => setFocused("email")} onBlur={() => setFocused("")} />
            </div>
            <div>
              <label style={lbl}>{l.password}</label>
              <input required type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder={l.passwordPlaceholder} style={inp("password")} onFocus={() => setFocused("password")} onBlur={() => setFocused("")} />
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "#f87171" }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{ width: "100%", background: "#FFD447", color: "#081418", fontWeight: 800, fontSize: 15, padding: "14px", borderRadius: 50, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1, transition: "all .2s", marginTop: 6, letterSpacing: "-.2px" }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#f5ca3a"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#FFD447"; }}
            >
              {loading ? l.creating : l.createBtn}
            </button>

            <p style={{ fontSize: 13, color: "#607080", textAlign: "center", marginTop: 6 }}>
              {l.haveAccount}{" "}
              <Link href="/login" style={{ color: "#FFD447", textDecoration: "none", fontWeight: 700 }}>{l.signIn}</Link>
            </p>
          </form>
        </div>
      </div>

      {/* RIGHT — marketing panel */}
      <div className="auth-right" style={{ flex: "0 0 50%", background: "#0b1a20", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(31,107,69,.12) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

        <div style={{ position: "relative", textAlign: "center", maxWidth: 360 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 50, padding: "6px 16px", marginBottom: 32 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#18B3A4", display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#97A6B2", fontWeight: 500 }}>{li.platformBadge}</span>
          </div>

          <h2 style={{ fontSize: 36, fontWeight: 900, color: "#F5F7FA", letterSpacing: "-1.5px", lineHeight: 1.15, marginBottom: 20 }}>
            {li.heroLine1}<br />
            <span style={{ color: "#FFD447" }}>{li.heroLine2}</span>
          </h2>

          <p style={{ fontSize: 15, color: "#607080", lineHeight: 1.7 }}>{li.heroDesc}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 36, textAlign: "left" }}>
            {[
              { icon: "🎾", text: li.feature1 },
              { icon: "💳", text: li.feature2 },
              { icon: "📅", text: li.feature3 },
              { icon: "📊", text: l.feature4 },
            ].map(f => (
              <div key={f.icon} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 12, padding: "12px 16px" }}>
                <span style={{ fontSize: 18 }}>{f.icon}</span>
                <span style={{ fontSize: 13, color: "#97A6B2", fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
