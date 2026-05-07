"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const inp: React.CSSProperties = { width: "100%", background: "#080808", border: "1px solid #1a1a1a", borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
const lbl: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 };

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", academy: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const fi = (k: string) => ({ ...inp, borderColor: focused === k ? "#2563eb" : "#1a1a1a" });

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

  return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 40 }}>
          <div style={{ width: 32, height: 32, background: "#2563eb", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 14 }}>A</div>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>AcademyOS</span>
        </Link>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: "#fff", letterSpacing: "-1px", marginBottom: 8 }}>Create your academy</h1>
        <p style={{ fontSize: 14, color: "#555", marginBottom: 32 }}>Start your free trial. No credit card required.</p>
        <div style={{ background: "#0c0c0c", border: "1px solid #1a1a1a", borderRadius: 20, padding: 32 }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={lbl}>Your Name *</label>
              <input required value={form.name} onChange={e => set("name", e.target.value)} placeholder="John Smith" style={fi("name")} onFocus={() => setFocused("name")} onBlur={() => setFocused("")} />
            </div>
            <div>
              <label style={lbl}>Academy Name *</label>
              <input required value={form.academy} onChange={e => set("academy", e.target.value)} placeholder="Miami Tennis Academy" style={fi("academy")} onFocus={() => setFocused("academy")} onBlur={() => setFocused("")} />
            </div>
            <div>
              <label style={lbl}>Email *</label>
              <input required type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@academy.com" style={fi("email")} onFocus={() => setFocused("email")} onBlur={() => setFocused("")} />
            </div>
            <div>
              <label style={lbl}>Password *</label>
              <input required type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min 6 characters" style={fi("password")} onFocus={() => setFocused("password")} onBlur={() => setFocused("")} />
            </div>
            {error && <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#f87171" }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: "100%", background: "#2563eb", color: "#fff", fontWeight: 800, fontSize: 15, padding: "14px", borderRadius: 12, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1, transition: "all .2s" }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#1d4ed8"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#2563eb"; }}>
              {loading ? "Creating account..." : "Create Academy →"}
            </button>
            <p style={{ fontSize: 12, color: "#333", textAlign: "center" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#60a5fa", textDecoration: "none" }}>Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
