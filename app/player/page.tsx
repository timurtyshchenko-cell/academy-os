"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fmtDateFull, fmtHours } from "@/lib/date-ru";
import { useLang } from "@/lib/i18n/context";
import { LOCALE_MAP } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

interface PlayerData {
  player: { name: string; level: string; coach_name: string; age: number } | null;
  nextSession: { date: string; start_time: string | null; type: string; coach_name: string; duration: number } | null;
  weekTotal: number;
  weekAttended: number;
  allTime: number;
  totalHours: number;
}

const LEVEL_COLOR: Record<string, string> = {
  Beginner: "#18B3A4", Intermediate: "#1F6B45", Advanced: "#d97706", Competitive: "#ef4444",
};

export default function PlayerPortal() {
  const supabase = createClient();
  const router = useRouter();
  const { t, lang } = useLang();
  const p = t.portal;
  const locale = LOCALE_MAP[lang];
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    init();
    const iv = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(iv);
  }, []);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/portal/login"); return; }

    const res = await fetch("/api/portal/player-dashboard");
    if (res.status === 403 || res.status === 401) { router.push("/portal/login"); return; }
    const json = await res.json();
    if (json.error) { setError(json.error); setLoading(false); return; }
    setData(json);
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/portal/login");
  }

  function countdown(dateStr: string, timeStr: string | null): string {
    const target = new Date(dateStr + "T" + (timeStr || "00:00") + ":00");
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return p.now;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return `${days} ${p.daysAbbr} ${hours} ${p.hoursAbbr}`;
    if (hours > 0) return `${hours} ${p.hoursAbbr} ${mins} ${p.minsAbbr}`;
    return `${mins} ${p.minsAbbr}`;
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

  const { player, nextSession, weekTotal, weekAttended, allTime, totalHours } = data!;
  const levelColor = LEVEL_COLOR[player?.level || ""] || "#1F6B45";

  return (
    <div style={{ minHeight:"100vh", background:"var(--c-bg)", fontFamily:"inherit" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#186038,#1F6B45)", padding:"18px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, background:"rgba(255,255,255,.15)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ fontSize:18, fontWeight:900, color:"#FFD447" }}>A</span>
          </div>
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:".1em", margin:0 }}>{p.playerPortal}</p>
            <p style={{ fontSize:18, fontWeight:900, color:"#fff", margin:0, letterSpacing:"-.3px" }}>{player?.name || "—"}</p>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.85)", background:"rgba(255,255,255,.15)", padding:"5px 12px", borderRadius:100 }}>{player?.level}</span>
          <button onClick={signOut} style={{ background:"rgba(255,255,255,.15)", border:"none", color:"#fff", padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600 }}>{p.signOut}</button>
        </div>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"24px 16px", display:"flex", flexDirection:"column", gap:16 }}>

        {/* Nav */}
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => router.push("/player/schedule")}
            style={{ flex:1, padding:"13px", background:"var(--c-card)", border:"1px solid var(--c-border)", borderRadius:12, color:"var(--c-text)", fontWeight:700, cursor:"pointer", fontSize:13 }}>
            📅 {p.schedule}
          </button>
          <button onClick={() => router.push("/player/progress")}
            style={{ flex:1, padding:"13px", background:"var(--c-card)", border:"1px solid var(--c-border)", borderRadius:12, color:"var(--c-text)", fontWeight:700, cursor:"pointer", fontSize:13 }}>
            📈 {p.progress}
          </button>
          <button onClick={() => router.push("/player/achievements")}
            style={{ flex:1, padding:"13px", background:"var(--c-card)", border:"1px solid var(--c-border)", borderRadius:12, color:"var(--c-text)", fontWeight:700, cursor:"pointer", fontSize:13 }}>
            🏆 {p.achievements}
          </button>
        </div>

        {/* Stats grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
          {/* This week */}
          <div style={{ background:"var(--c-card)", border:"1px solid var(--c-border)", borderLeft:`3px solid #1F6B45`, borderRadius:14, padding:"16px 18px" }}>
            <p style={{ fontSize:11, fontWeight:700, color:"var(--c-text-muted)", textTransform:"uppercase", letterSpacing:".07em", margin:"0 0 8px" }}>{p.thisWeek}</p>
            <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
              <p style={{ fontSize:28, fontWeight:900, color:"#1F6B45", margin:0, lineHeight:1 }}>{weekAttended}</p>
              <p style={{ fontSize:14, color:"var(--c-text-muted)", margin:0 }}>/ {weekTotal}</p>
            </div>
            <p style={{ fontSize:11, color:"var(--c-text-dim)", margin:"4px 0 0" }}>{p.trainingsAttended}</p>
            {weekTotal > 0 && (
              <div style={{ marginTop:10, height:6, background:"var(--c-inner)", borderRadius:100, overflow:"hidden" }}>
                <div style={{ width:`${(weekAttended/weekTotal)*100}%`, height:"100%", background:"#1F6B45", borderRadius:100, transition:"width .3s" }} />
              </div>
            )}
          </div>

          {/* All time */}
          <div style={{ background:"var(--c-card)", border:"1px solid var(--c-border)", borderLeft:`3px solid #18B3A4`, borderRadius:14, padding:"16px 18px" }}>
            <p style={{ fontSize:11, fontWeight:700, color:"var(--c-text-muted)", textTransform:"uppercase", letterSpacing:".07em", margin:"0 0 8px" }}>{p.allTime}</p>
            <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
              <p style={{ fontSize:28, fontWeight:900, color:"#18B3A4", margin:0, lineHeight:1 }}>{allTime}</p>
              <p style={{ fontSize:14, color:"var(--c-text-muted)", margin:0 }}>{p.sessions}</p>
            </div>
            <p style={{ fontSize:11, color:"var(--c-text-dim)", margin:"4px 0 0" }}>{fmtHours(totalHours/60, lang)} {p.hoursOnCourt}</p>
          </div>

          {/* Coach */}
          <div style={{ background:"var(--c-card)", border:"1px solid var(--c-border)", borderLeft:`3px solid #d97706`, borderRadius:14, padding:"16px 18px" }}>
            <p style={{ fontSize:11, fontWeight:700, color:"var(--c-text-muted)", textTransform:"uppercase", letterSpacing:".07em", margin:"0 0 8px" }}>{p.coach}</p>
            <p style={{ fontSize:18, fontWeight:900, color:"var(--c-text)", margin:0, letterSpacing:"-.3px" }}>{player?.coach_name || "—"}</p>
          </div>

          {/* Level */}
          <div style={{ background:"var(--c-card)", border:"1px solid var(--c-border)", borderLeft:`3px solid ${levelColor}`, borderRadius:14, padding:"16px 18px" }}>
            <p style={{ fontSize:11, fontWeight:700, color:"var(--c-text-muted)", textTransform:"uppercase", letterSpacing:".07em", margin:"0 0 8px" }}>{p.level}</p>
            <p style={{ fontSize:18, fontWeight:900, color:levelColor, margin:0, letterSpacing:"-.3px" }}>{player?.level || "—"}</p>
          </div>
        </div>

        {/* Next session countdown */}
        <div style={{ background:"var(--c-card)", border:"1px solid var(--c-border)", borderRadius:16, overflow:"hidden" }}>
          <div style={{ background:"linear-gradient(135deg,#186038,#1F6B45)", padding:"20px 20px" }}>
            <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:".1em", margin:"0 0 4px" }}>{p.nextSession}</p>
            {nextSession ? (
              <>
                <p style={{ fontSize:22, fontWeight:900, color:"#fff", margin:"0 0 6px", letterSpacing:"-.5px" }}>{fmtDateFull(nextSession.date, locale)}</p>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
                  {nextSession.start_time && <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,.8)", background:"rgba(255,255,255,.15)", padding:"3px 10px", borderRadius:100 }}>🕐 {nextSession.start_time}</span>}
                  <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,.8)", background:"rgba(255,255,255,.15)", padding:"3px 10px", borderRadius:100 }}>🎾 {nextSession.type}</span>
                  {nextSession.coach_name && <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,.8)", background:"rgba(255,255,255,.15)", padding:"3px 10px", borderRadius:100 }}>👤 {nextSession.coach_name}</span>}
                </div>
                <div style={{ background:"rgba(255,255,255,.1)", borderRadius:12, padding:"12px 16px", display:"inline-flex", flexDirection:"column" }}>
                  <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:".1em", margin:"0 0 2px" }}>{p.countdown}</p>
                  <p style={{ fontSize:24, fontWeight:900, color:"#FFD447", margin:0, letterSpacing:"-.5px" }}>
                    {countdown(nextSession.date, nextSession.start_time)}
                  </p>
                </div>
              </>
            ) : (
              <p style={{ fontSize:15, color:"rgba(255,255,255,.7)", margin:0 }}>{p.noNextSession}</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
