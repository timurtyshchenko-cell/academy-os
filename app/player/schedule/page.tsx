"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/context";

export const dynamic = "force-dynamic";

interface Session {
  id: number; player_name: string; date: string; start_time: string | null;
  duration: number; type: string; coach_name: string; notes: string;
}

const SESSION_META: Record<string, { color: string; light: string }> = {
  Training:         { color: "#1F6B45", light: "rgba(31,107,69,.12)" },
  Match:            { color: "#b8960a", light: "rgba(184,150,10,.12)" },
  Fitness:          { color: "#18B3A4", light: "rgba(24,179,164,.12)" },
  "Serve Practice": { color: "#e07b4f", light: "rgba(224,123,79,.12)" },
  Doubles:          { color: "#9b59b6", light: "rgba(155,89,182,.12)" },
  "Video Analysis": { color: "#607080", light: "rgba(96,112,128,.12)" },
};
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const HOUR_H = 64;
const START_H = 7;
const END_H = 21;
const HOURS = Array.from({ length: END_H - START_H + 1 }, (_, i) => START_H + i);

function weekStart(d: Date) {
  const s = new Date(d);
  const dow = s.getDay();
  s.setDate(s.getDate() - (dow === 0 ? 6 : dow - 1));
  s.setHours(0, 0, 0, 0);
  return s;
}
function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function timeToMin(t: string) {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function nowTop() {
  const now = new Date();
  return Math.max(0, (now.getHours() * 60 + now.getMinutes() - START_H * 60) / 60 * HOUR_H);
}

export default function PlayerSchedule() {
  const supabase = createClient();
  const router = useRouter();
  const { t } = useLang();
  const s = t.schedule;
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOf, setWeekOf] = useState(() => weekStart(new Date()));
  const [nowY, setNowY] = useState(nowTop());
  const bodyRef = useRef<HTMLDivElement>(null);
  const today = fmt(new Date());

  useEffect(() => {
    init();
    const iv = setInterval(() => setNowY(nowTop()), 60000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!loading && bodyRef.current) bodyRef.current.scrollTop = Math.max(0, nowTop() - 120);
  }, [loading]);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const res = await fetch("/api/portal/schedule");
    if (!res.ok) { router.push("/login"); return; }
    const data = await res.json();
    setSessions(data.sessions || []);
    setLoading(false);
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekOf); d.setDate(weekOf.getDate() + i); return d;
  });

  const sessionsByDay: Record<string, Session[]> = {};
  for (const sess of sessions) {
    if (!sessionsByDay[sess.date]) sessionsByDay[sess.date] = [];
    sessionsByDay[sess.date].push(sess);
  }

  const weekLabel = `${MONTHS[days[0].getMonth()]} ${days[0].getDate()} – ${MONTHS[days[6].getMonth()]} ${days[6].getDate()}, ${days[6].getFullYear()}`;

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--c-bg)" }}>
      <div style={{ width:32, height:32, border:"3px solid var(--c-border)", borderTopColor:"#1F6B45", borderRadius:"50%", animation:"spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--c-bg)", fontFamily:"inherit" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:768px){.cal-wrap{display:none!important}.mob-list{display:flex!important}}
      `}</style>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#186038,#1F6B45)", padding:"18px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, background:"rgba(255,255,255,.15)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:16, fontWeight:900, color:"#FFD447" }}>A</span>
          </div>
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:".1em", margin:0 }}>Портал игрока</p>
            <p style={{ fontSize:16, fontWeight:800, color:"#fff", margin:0 }}>{s.title}</p>
          </div>
        </div>
        <button onClick={() => router.push("/player")} style={{ background:"rgba(255,255,255,.15)", border:"none", color:"#fff", padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600 }}>← Назад</button>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"20px 16px", display:"flex", flexDirection:"column", gap:16 }}>

        {/* Week nav */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
          <p style={{ fontSize:14, color:"var(--c-text-muted)", margin:0 }}>{weekLabel}</p>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={() => setWeekOf(d => { const n=new Date(d); n.setDate(n.getDate()-7); return n; })}
              style={{ width:34, height:34, background:"var(--c-inner)", border:"1px solid var(--c-border)", borderRadius:8, color:"var(--c-text-muted)", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
            <button onClick={() => setWeekOf(weekStart(new Date()))}
              style={{ padding:"7px 14px", background:"var(--c-inner)", border:"1px solid var(--c-border)", borderRadius:8, color:"var(--c-text-muted)", cursor:"pointer", fontSize:13, fontWeight:600 }}>{s.today}</button>
            <button onClick={() => setWeekOf(d => { const n=new Date(d); n.setDate(n.getDate()+7); return n; })}
              style={{ width:34, height:34, background:"var(--c-inner)", border:"1px solid var(--c-border)", borderRadius:8, color:"var(--c-text-muted)", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>→</button>
          </div>
        </div>

        {/* Desktop calendar */}
        <div className="cal-wrap" style={{ background:"var(--c-card)", border:"1px solid var(--c-border)", borderRadius:16, overflow:"hidden", boxShadow:"var(--c-shadow)" }}>
          <div style={{ display:"grid", gridTemplateColumns:"52px repeat(7,1fr)", borderBottom:"1px solid var(--c-border)", background:"var(--c-card)", position:"sticky", top:0, zIndex:10 }}>
            <div style={{ borderRight:"1px solid var(--c-border)" }} />
            {days.map((day, i) => {
              const dStr = fmt(day); const isT = dStr === today; const cnt = sessionsByDay[dStr]?.length || 0;
              return (
                <div key={i} style={{ padding:"10px 8px", textAlign:"center", borderRight: i<6?"1px solid var(--c-border)":"none", background: isT?"rgba(31,107,69,.05)":"transparent" }}>
                  <p style={{ fontSize:10, fontWeight:700, color: isT?"#1F6B45":"var(--c-text-dim)", textTransform:"uppercase", letterSpacing:".08em", margin:"0 0 2px" }}>{DAYS_SHORT[day.getDay()]}</p>
                  <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:30, height:30, borderRadius:"50%", background: isT?"#1F6B45":"transparent" }}>
                    <p style={{ fontSize:16, fontWeight:900, color: isT?"#fff":"var(--c-text)", margin:0, lineHeight:1 }}>{day.getDate()}</p>
                  </div>
                  {cnt > 0 && <p style={{ fontSize:10, color: isT?"#1F6B45":"var(--c-text-dim)", margin:"2px 0 0", fontWeight:600 }}>{cnt} {cnt!==1?s.sessions:s.session}</p>}
                </div>
              );
            })}
          </div>

          <div ref={bodyRef} style={{ overflowY:"auto", maxHeight:600, position:"relative" }}>
            <div style={{ display:"grid", gridTemplateColumns:"52px repeat(7,1fr)", minHeight: HOURS.length * HOUR_H }}>
              <div style={{ borderRight:"1px solid var(--c-border)", position:"relative" }}>
                {HOURS.map((h, i) => (
                  <div key={h} style={{ position:"absolute", top: i*HOUR_H-8, left:0, right:0, paddingRight:6, textAlign:"right" }}>
                    <span style={{ fontSize:10, color:"var(--c-text-dim)", fontWeight:600 }}>{h<10?`0${h}`:h}:00</span>
                  </div>
                ))}
              </div>
              {days.map((day, di) => {
                const dStr = fmt(day); const isT = dStr === today;
                const daySessions = (sessionsByDay[dStr] || []).filter(sx => sx.start_time);
                return (
                  <div key={di} style={{ position:"relative", borderRight: di<6?"1px solid var(--c-border)":"none", background: isT?"rgba(31,107,69,.02)":"transparent", minHeight: HOURS.length*HOUR_H }}>
                    {HOURS.map((_,i) => <div key={i} style={{ position:"absolute", left:0, right:0, top: i*HOUR_H, height:1, background:"var(--c-border)", opacity: i===0?0:.5 }} />)}
                    {HOURS.map((_,i) => <div key={`h${i}`} style={{ position:"absolute", left:0, right:0, top: i*HOUR_H+HOUR_H/2, height:1, background:"var(--c-border)", opacity:.2 }} />)}
                    {isT && (
                      <div style={{ position:"absolute", left:0, right:0, top: nowY, height:2, background:"#FFD447", zIndex:5, pointerEvents:"none" }}>
                        <div style={{ position:"absolute", left:-4, top:-4, width:10, height:10, borderRadius:"50%", background:"#FFD447" }} />
                      </div>
                    )}
                    {daySessions.map(sess => {
                      const meta = SESSION_META[sess.type] || SESSION_META.Training;
                      const topPx = (timeToMin(sess.start_time!) - START_H*60) / 60 * HOUR_H;
                      const heightPx = Math.max(24, sess.duration/60*HOUR_H - 4);
                      return (
                        <div key={sess.id} style={{ position:"absolute", left:3, right:3, top: topPx+2, height: heightPx, background: meta.light, borderLeft:`3px solid ${meta.color}`, borderRadius:"0 7px 7px 0", padding:"4px 8px 4px 6px", overflow:"hidden", zIndex:3, boxShadow:`0 1px 4px rgba(0,0,0,.15)`, border:`1px solid ${meta.color}30`, borderLeftWidth:3 }}>
                          <p style={{ fontSize:11, fontWeight:800, color:meta.color, margin:0, lineHeight:1.25, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sess.type}</p>
                          {heightPx > 38 && <p style={{ fontSize:10, color:meta.color, opacity:.7, margin:"2px 0 0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{sess.start_time}{sess.coach_name ? ` · ${sess.coach_name}` : ""}</p>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile list */}
        <div className="mob-list" style={{ display:"none", flexDirection:"column", gap:10 }}>
          {days.map((day, i) => {
            const dStr = fmt(day); const isT = dStr === today;
            const daySessions = (sessionsByDay[dStr] || []).sort((a,b) => (a.start_time||"99:99").localeCompare(b.start_time||"99:99"));
            return (
              <div key={i} style={{ background:"var(--c-card)", border:`1px solid ${isT?"rgba(31,107,69,.35)":"var(--c-border)"}`, borderRadius:14, overflow:"hidden" }}>
                <div style={{ padding:"12px 16px", background: isT?"rgba(31,107,69,.06)":"transparent", borderBottom: daySessions.length>0?"1px solid var(--c-border)":"none" }}>
                  <p style={{ fontSize:13, fontWeight:800, color: isT?"#1F6B45":"var(--c-text)", margin:0 }}>{DAYS_SHORT[day.getDay()]} {day.getDate()}</p>
                </div>
                {daySessions.map((sess, si) => {
                  const meta = SESSION_META[sess.type] || SESSION_META.Training;
                  return (
                    <div key={sess.id} style={{ padding:"12px 16px", borderBottom: si<daySessions.length-1?"1px solid var(--c-border)":"none", display:"flex", gap:12 }}>
                      <div style={{ width:4, height:36, borderRadius:100, background:meta.color, flexShrink:0 }} />
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:13, fontWeight:800, color:"var(--c-text)", margin:0 }}>{sess.type}</p>
                        <p style={{ fontSize:11, color:"var(--c-text-muted)", margin:"2px 0 0" }}>{sess.start_time && `${sess.start_time} · `}{sess.duration}m{sess.coach_name && ` · ${sess.coach_name}`}</p>
                      </div>
                    </div>
                  );
                })}
                {daySessions.length === 0 && <div style={{ padding:"12px 16px" }}><p style={{ fontSize:12, color:"var(--c-text-dim)", margin:0 }}>{s.noSessions}</p></div>}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {Object.entries(SESSION_META).map(([type, m]) => (
            <div key={type} style={{ display:"flex", alignItems:"center", gap:6, background:"var(--c-card)", border:"1px solid var(--c-border)", borderRadius:100, padding:"4px 12px" }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:m.color, display:"inline-block" }} />
              <span style={{ fontSize:12, color:"var(--c-text-muted)", fontWeight:600 }}>{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
