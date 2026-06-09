"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/context";

type Role = "parent" | "player";

export default function PortalLoginPage({ role }: { role: Role }) {
  const supabase = createClient();
  const router = useRouter();
  const { t } = useLang();
  const p = t.portal;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) redirectByRole();
      else setChecking(false);
    });
  }, []);

  async function redirectByRole() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setChecking(false); return; }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role === "parent") router.replace("/parent");
    else if (profile?.role === "player") router.replace("/player");
    else setChecking(false);
  }

  async function signIn() {
    setError(""); setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    await redirectByRole();
  }

  const inp: React.CSSProperties = {
    width: "100%", background: "var(--c-input-bg)", border: "1px solid var(--c-input-border)",
    borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "var(--c-text)",
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };

  if (checking) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--c-bg)" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 32, height: 32, border: "3px solid var(--c-border)", borderTopColor: "#1F6B45", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  const portalLabel = role === "parent" ? p.parentPortal : p.playerPortal;

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "inherit" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: "#1F6B45", borderRadius: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: "#FFD447" }}>A</span>
          </div>
          <p style={{ fontSize: 22, fontWeight: 900, color: "var(--c-text)", margin: "0 0 4px", letterSpacing: "-.5px" }}>AcademyOS</p>
          <p style={{ fontSize: 13, color: "var(--c-text-muted)", margin: 0 }}>{portalLabel}</p>
        </div>

        <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 20, overflow: "hidden", boxShadow: "var(--c-shadow-lg)" }}>
          <div style={{ background: "linear-gradient(135deg,#186038,#1F6B45)", padding: "20px 28px" }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: 0 }}>{p.loginTitle}</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.65)", margin: "4px 0 0" }}>{p.loginSubtitle}</p>
          </div>

          <div style={{ padding: "28px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {error && (
                <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#ef4444", fontWeight: 600 }}>
                  ⚠ {error}
                </div>
              )}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>{p.email}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inp} autoFocus />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>{p.password}</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inp} onKeyDown={e => e.key === "Enter" && signIn()} />
              </div>
              <button onClick={signIn} disabled={loading || !email || !password}
                style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "#1F6B45", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading || !email || !password ? "not-allowed" : "pointer", opacity: loading || !email || !password ? .6 : 1, marginTop: 4 }}>
                {loading ? p.loggingIn : p.loginBtn}
              </button>
            </div>
          </div>
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--c-text-dim)", marginTop: 16 }}>{p.noAccount}</p>
      </div>
    </div>
  );
}
