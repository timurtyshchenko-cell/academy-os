"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/context";

export const dynamic = "force-dynamic";

interface DashboardData {
  player: { name: string; coach_name: string } | null;
  nextSession: { date: string; start_time: string | null; type: string; coach_name: string; notes: string } | null;
  lastNote: { notes: string; date: string } | null;
  unpaidCount: number;
  totalSessions: number;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmt(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function ParentPortal() {
  const supabase = createClient();
  const router = useRouter();
  const { t } = useLang();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { init(); }, []);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const res = await fetch("/api/portal/dashboard");
    if (res.status === 403 || res.status === 401) { router.push("/login"); return; }
    const json = await res.json();
    if (json.error) { setError(json.error); setLoading(false); return; }
    setData(json);
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--c-bg)" }}>
      <div style={{ width:32, height:32, border:"3px solid var(--c-border)", borderTopColor:"#1F6B45", borderRadius:"50%", animation:"spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--c-bg)" }}>
      <p style={{ color:"#ef4444", fontSize:14 }}>⚠ {error}</p>
    </div>
  );

  const { player, nextSession, lastNote, unpaidCount, totalSessions } = data!;

  return (
    <div style={{ minHeight:"100vh", background:"var(--c-bg)", fontFamily:"inherit" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#186038,#1F6B45)", padding:"18px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, background:"rgba(255,255,255,.15)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ fontSize:16, fontWeight:900, color:"#FFD447" }}>A</span>
          </div>
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:".1em", margin:0 }}>Родительский портал</p>
            <p style={{ fontSize:16, fontWeight:800, color:"#fff", margin:0 }}>{player?.name || "—"}</p>
          </div>
        </div>
        <button onClick={signOut} style={{ background:"rgba(255,255,255,.15)", border:"none", color:"#fff", padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600 }}>Выйти</button>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"24px 16px", display:"flex", flexDirection:"column", gap:16 }}>

        {/* Nav */}
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => router.push("/parent/schedule")}
            style={{ flex:1, padding:"12px", background:"var(--c-card)", border:"1px solid var(--c-border)", borderRadius:12, color:"var(--c-text)", fontWeight:700, cursor:"pointer", fontSize:13 }}>
            📅 Расписание
          </button>
          <button onClick={() => router.push("/parent/progress")}
            style={{ flex:1, padding:"12px", background:"var(--c-card)", border:"1px solid var(--c-border)", borderRadius:12, color:"var(--c-text)", fontWeight:700, cursor:"pointer", fontSize:13 }}>
            📈 Прогресс
          </button>
          <button onClick={() => router.push("/parent/invoices")}
            style={{ flex:1, padding:"12px", background:"var(--c-card)", border:"1px solid var(--c-border)", borderRadius:12, color:"var(--c-text)", fontWeight:700, cursor:"pointer", fontSize:13 }}>
            🧾 Счета
          </button>
          <button onClick={() => router.push("/parent/achievements")}
            style={{ flex:1, padding:"12px", background:"var(--c-card)", border:"1px solid var(--c-border)", borderRadius:12, color:"var(--c-text)", fontWeight:700, cursor:"pointer", fontSize:13 }}>
            🏆 Награды
          </button>
        </div>

        {/* Unpaid invoices warning */}
        {unpaidCount > 0 && (
          <div style={{ background:"rgba(217,119,6,.1)", border:"1px solid rgba(217,119,6,.3)", borderRadius:14, padding:"14px 18px", display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:20 }}>⚠️</span>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:"#d97706", margin:0 }}>Неоплаченных счетов: {unpaidCount}</p>
              <p style={{ fontSize:12, color:"var(--c-text-muted)", margin:"2px 0 0" }}>Пожалуйста оплатите вовремя</p>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div style={{ background:"var(--c-card)", border:"1px solid var(--c-border)", borderLeft:"3px solid #1F6B45", borderRadius:14, padding:"16px 18px" }}>
            <p style={{ fontSize:11, fontWeight:700, color:"var(--c-text-muted)", textTransform:"uppercase", letterSpacing:".07em", margin:"0 0 4px" }}>Тренер</p>
            <p style={{ fontSize:18, fontWeight:900, color:"var(--c-text)", margin:0 }}>{player?.coach_name || "—"}</p>
          </div>
          <div style={{ background:"var(--c-card)", border:"1px solid var(--c-border)", borderLeft:"3px solid #18B3A4", borderRadius:14, padding:"16px 18px" }}>
            <p style={{ fontSize:11, fontWeight:700, color:"var(--c-text-muted)", textTransform:"uppercase", letterSpacing:".07em", margin:"0 0 4px" }}>Всего тренировок</p>
            <p style={{ fontSize:18, fontWeight:900, color:"var(--c-text)", margin:0 }}>{totalSessions}</p>
          </div>
        </div>

        {/* Next session */}
        <div style={{ background:"var(--c-card)", border:"1px solid var(--c-border)", borderRadius:16, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--c-border)", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:16 }}>📅</span>
            <p style={{ fontSize:14, fontWeight:800, color:"var(--c-text)", margin:0 }}>Следующая тренировка</p>
          </div>
          <div style={{ padding:"18px" }}>
            {nextSession ? (
              <div>
                <p style={{ fontSize:20, fontWeight:900, color:"#1F6B45", margin:"0 0 6px", letterSpacing:"-.5px" }}>{fmt(nextSession.date)}</p>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {nextSession.start_time && <span style={{ fontSize:12, fontWeight:600, color:"var(--c-text-muted)", background:"var(--c-inner)", padding:"4px 10px", borderRadius:100 }}>🕐 {nextSession.start_time}</span>}
                  <span style={{ fontSize:12, fontWeight:600, color:"var(--c-text-muted)", background:"var(--c-inner)", padding:"4px 10px", borderRadius:100 }}>🎾 {nextSession.type}</span>
                  {nextSession.coach_name && <span style={{ fontSize:12, fontWeight:600, color:"var(--c-text-muted)", background:"var(--c-inner)", padding:"4px 10px", borderRadius:100 }}>👤 {nextSession.coach_name}</span>}
                </div>
              </div>
            ) : (
              <p style={{ fontSize:14, color:"var(--c-text-muted)", margin:0 }}>Нет запланированных тренировок</p>
            )}
          </div>
        </div>

        {/* Last coach note */}
        <div style={{ background:"var(--c-card)", border:"1px solid var(--c-border)", borderRadius:16, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--c-border)", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:16 }}>📝</span>
            <p style={{ fontSize:14, fontWeight:800, color:"var(--c-text)", margin:0 }}>Последняя заметка тренера</p>
          </div>
          <div style={{ padding:"18px" }}>
            {lastNote ? (
              <div>
                <p style={{ fontSize:14, color:"var(--c-text)", lineHeight:1.6, margin:"0 0 8px" }}>"{lastNote.notes}"</p>
                <p style={{ fontSize:12, color:"var(--c-text-muted)", margin:0 }}>{fmt(lastNote.date)}</p>
              </div>
            ) : (
              <p style={{ fontSize:14, color:"var(--c-text-muted)", margin:0 }}>Заметок пока нет</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
