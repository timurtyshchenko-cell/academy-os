"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", academy: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const inp = (k: string): React.CSSProperties => ({
    width: "100%",
    background: "#0e1e26",
    border: `1px solid ${focused === k ? "rgba(31,107,69,.5)" : "rgba(255,255,255,.08)"}`,
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
    if (!form.name || !form.email || !form.password || !form.academy) { setError("All fields are required."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Signup failed"); setLoading(false); return; }
    router.push("/app");
  };

  const lbl: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 700, color: "#607080", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 };

  return (
    <div style={{ minHeight: "100vh", background: "#081418", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
      {/* Subtle bg decoration */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(31,107,69,.06) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(24,179,164,.04) 0%, transparent 70%)" }} />
      </div>

      <div style={{ width: "100%", maxWidth: 480, position: "relative" }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 44 }}>
          <div style={{ width: 34, height: 34, background: "#1F6B45", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#FFD447", fontSize: 15, letterSpacing: "-0.5px" }}>A</div>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#F5F7FA", letterSpacing: "-.3px" }}>AcademyOS</span>
        </Link>

        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#F5F7FA", letterSpacing: "-1px", marginBottom: 6 }}>Create your academy</h1>
        <p style={{ fontSize: 14, color: "#607080", marginBottom: 32, lineHeight: 1.5 }}>Start managing players, sessions & billing in minutes.</p>

        {/* Feature chips */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {["✓ Free to start", "✓ No credit card", "✓ Setup in 2 min"].map(t => (
            <span key={t} style={{ fontSize: 12, color: "#18B3A4", background: "rgba(24,179,164,.08)", border: "1px solid rgba(24,179,164,.15)", borderRadius: 20, padding: "4px 12px", fontWeight: 600 }}>{t}</span>
          ))}
        </div>

        <div style={{ background: "#122028", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, padding: "32px" }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={lbl}>Your Name</label>
                <input required value={form.name} onChange={e => set("name", e.target.value)} placeholder="John Smith" style={inp("name")} onFocus={() => setFocused("name")} onBlur={() => setFocused("")} />
              </div>
              <div>
                <label style={lbl}>Academy Name</label>
                <input required value={form.academy} onChange={e => set("academy", e.target.value)} placeholder="Miami Tennis" style={inp("academy")} onFocus={() => setFocused("academy")} onBlur={() => setFocused("")} />
              </div>
            </div>
            <div>
              <label style={lbl}>Email</label>
              <input required type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@academy.com" style={inp("email")} onFocus={() => setFocused("email")} onBlur={() => setFocused("")} />
            </div>
            <div>
              <label style={lbl}>Password</label>
              <input required type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min 6 characters" style={inp("password")} onFocus={() => setFocused("password")} onBlur={() => setFocused("")} />
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "#f87171", display: "flex", alignItems: "center", gap: 8 }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{ width: "100%", background: "#1F6B45", color: "#F5F7FA", fontWeight: 700, fontSize: 15, padding: "14px", borderRadius: 12, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1, transition: "all .2s", marginTop: 4 }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#186038"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#1F6B45"; }}
            >
              {loading ? "Creating account…" : "Create Academy →"}
            </button>

            <p style={{ fontSize: 13, color: "#607080", textAlign: "center", marginTop: 4 }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#18B3A4", textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
            </p>
          </form>
        </div>

        <p style={{ fontSize: 11, color: "#3d5260", textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
          By signing up you agree to our Terms of Service & Privacy Policy.
        </p>
      </div>
    </div>
  );
}
