"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

interface Session { id: number; date: string; start_time: string | null; duration: number; type: string; coach_name: string; notes: string; }
interface Invoice { id: number; amount: number; status: string; month: string; due_date: string; }

export default function ParentPortal() {
  const supabase = createClient();
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: profile } = await supabase.from("profiles").select("role,player_id,academy_id").eq("id", user.id).single();
    if (!profile || profile.role !== "parent") { router.push("/login"); return; }

    const [sRes, iRes, pRes] = await Promise.all([
      fetch(`/api/portal/sessions?player_id=${profile.player_id}&academy_id=${profile.academy_id}`),
      fetch(`/api/portal/invoices?player_id=${profile.player_id}&academy_id=${profile.academy_id}`),
      fetch(`/api/portal/player?player_id=${profile.player_id}&academy_id=${profile.academy_id}`),
    ]);
    const sData = await sRes.json();
    const iData = await iRes.json();
    const pData = await pRes.json();
    setSessions(sData.sessions || []);
    setInvoices(iData.invoices || []);
    setPlayerName(pData.player?.name || "");
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTopColor: "#1F6B45", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const upcoming = sessions.filter(s => s.date >= new Date().toISOString().slice(0, 10)).slice(0, 5);
  const unpaidInvoices = invoices.filter(i => i.status === "pending");

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg,#186038,#1F6B45)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: "rgba(255,255,255,.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: "#FFD447" }}>A</span>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".1em", margin: 0 }}>Родительский портал</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: 0 }}>{playerName}</p>
          </div>
        </div>
        <button onClick={signOut} style={{ background: "rgba(255,255,255,.15)", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Выйти</button>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20 }}>
        {unpaidInvoices.length > 0 && (
          <div style={{ background: "#fffbeb", border: "1px solid #fbbf24", borderRadius: 14, padding: "16px 20px" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#92400e", margin: "0 0 4px" }}>⚠ Неоплаченные счета: {unpaidInvoices.length}</p>
            <p style={{ fontSize: 12, color: "#b45309", margin: 0 }}>Общая сумма: ${unpaidInvoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}</p>
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#111827", margin: 0 }}>Предстоящие тренировки</p>
          </div>
          {upcoming.length === 0 ? (
            <div style={{ padding: "24px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>Нет предстоящих тренировок</p>
            </div>
          ) : upcoming.map(s => (
            <div key={s.id} style={{ padding: "14px 20px", borderBottom: "1px solid #f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 2px" }}>{s.type}</p>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{s.date}{s.start_time ? ` · ${s.start_time}` : ""}{s.coach_name ? ` · ${s.coach_name}` : ""}</p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1F6B45", background: "rgba(31,107,69,.08)", padding: "4px 10px", borderRadius: 100 }}>{s.duration} мин</span>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#111827", margin: 0 }}>Счета</p>
          </div>
          {invoices.length === 0 ? (
            <div style={{ padding: "24px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>Счетов нет</p>
            </div>
          ) : invoices.slice(0, 6).map(i => (
            <div key={i.id} style={{ padding: "14px 20px", borderBottom: "1px solid #f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 2px" }}>{i.month}</p>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>До {i.due_date}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 900, color: "#111827" }}>${i.amount}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: i.status === "paid" ? "#1F6B45" : "#d97706", background: i.status === "paid" ? "rgba(31,107,69,.08)" : "rgba(217,119,6,.08)", padding: "3px 10px", borderRadius: 100 }}>
                  {i.status === "paid" ? "Оплачен" : "Ожидает"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
