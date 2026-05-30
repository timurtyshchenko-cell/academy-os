"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

interface Invitation { email: string; role: "parent" | "player"; player_id: number; academy_id: number; }

export default function InvitePage() {
  const supabase = createClient();
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [inv, setInv] = useState<Invitation | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/invitations/${token}`).then(r => r.json()).then(d => {
      if (d.error) setNotFound(true); else setInv(d);
    });
  }, [token]);

  async function accept() {
    if (password.length < 8) { setError("Минимум 8 символов"); return; }
    setLoading(true); setError("");
    const res = await fetch(`/api/invitations/${token}/accept`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Ошибка"); setLoading(false); return; }

    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: inv!.email, password });
    if (signInErr) { setError(signInErr.message); setLoading(false); return; }

    setDone(true);
    setTimeout(() => router.push(data.role === "parent" ? "/parent" : "/player"), 1500);
  }

  const inp: React.CSSProperties = { width: "100%", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "11px 14px", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

  if (notFound) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
      <div style={{ textAlign: "center", padding: 40 }}>
        <p style={{ fontSize: 48, margin: "0 0 16px" }}>🔗</p>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>Приглашение не найдено</h2>
        <p style={{ color: "#6b7280", fontSize: 14 }}>Ссылка устарела или уже была использована.</p>
      </div>
    </div>
  );

  if (!inv) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTopColor: "#1F6B45", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  const roleLabel = inv.role === "parent" ? "Родитель" : "Игрок";

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", padding: 24 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ background: "#fff", borderRadius: 24, overflow: "hidden", width: "100%", maxWidth: 420, boxShadow: "0 4px 24px rgba(0,0,0,.08)" }}>
        <div style={{ background: "linear-gradient(135deg,#186038,#1F6B45)", padding: "32px 36px", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, background: "rgba(255,255,255,.15)", borderRadius: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#FFD447" }}>A</span>
          </div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".12em", margin: "0 0 8px" }}>AcademyOS · {roleLabel}</p>
          <p style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: 0 }}>Создайте аккаунт</p>
        </div>
        <div style={{ padding: "32px 36px" }}>
          {done ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 36, margin: "0 0 12px" }}>✅</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Аккаунт создан!</p>
              <p style={{ fontSize: 13, color: "#6b7280" }}>Переходим в портал...</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Email</label>
                <input value={inv.email} disabled style={{ ...inp, background: "#f3f4f6", color: "#9ca3af" }} />
              </div>
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Пароль</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Минимум 8 символов" style={inp} onKeyDown={e => e.key === "Enter" && accept()} autoFocus />
              </div>
              {error && <p style={{ fontSize: 13, color: "#ef4444", fontWeight: 600, marginBottom: 14 }}>⚠ {error}</p>}
              <button onClick={accept} disabled={loading} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "#1F6B45", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Создаём аккаунт..." : "Создать аккаунт и войти →"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
