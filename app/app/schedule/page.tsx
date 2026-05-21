"use client";
import { useState, useEffect, useRef } from "react";

interface Session {
  id: number; player_name: string; date: string; start_time: string | null;
  duration: number; type: string; coach_name: string; notes: string;
}

const SESSION_META: Record<string, { color: string; bg: string; light: string }> = {
  Training:        { color: "#1F6B45", bg: "linear-gradient(135deg,#186038,#1F6B45)", light: "rgba(31,107,69,.12)" },
  Match:           { color: "#FFD447", bg: "linear-gradient(135deg,#c9a800,#FFD447)", light: "rgba(255,212,71,.12)" },
  Fitness:         { color: "#18B3A4", bg: "linear-gradient(135deg,#0d7a72,#18B3A4)", light: "rgba(24,179,164,.12)" },
  "Serve Practice":{ color: "#e07b4f", bg: "linear-gradient(135deg,#b85a2e,#e07b4f)", light: "rgba(224,123,79,.12)" },
  Doubles:         { color: "#9b59b6", bg: "linear-gradient(135deg,#6c3483,#9b59b6)", light: "rgba(155,89,182,.12)" },
  "Video Analysis":{ color: "#607080", bg: "linear-gradient(135deg,#3a4a56,#607080)", light: "rgba(96,112,128,.12)" },
};
const SESSION_TYPES = Object.keys(SESSION_META);
const DAYS_LONG = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const HOUR_H = 64;
const START_H = 7;
const END_H = 21;
const HOURS = Array.from({ length: END_H - START_H + 1 }, (_, i) => START_H + i);

function weekStart(d: Date) {
  const s = new Date(d);
  const dow = s.getDay();
  s.setDate(s.getDate() - (dow === 0 ? 6 : dow - 1)); // Monday first
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
  const mins = now.getHours() * 60 + now.getMinutes() - START_H * 60;
  return Math.max(0, (mins / 60) * HOUR_H);
}
function initials(name: string) {
  if (!name) return "?";
  const p = name.trim().split(" ");
  return (p[0][0] + (p[1]?.[0] || "")).toUpperCase();
}

export default function SchedulePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOf, setWeekOf] = useState(() => weekStart(new Date()));
  const [showAdd, setShowAdd] = useState<string | null>(null);
  const [players, setPlayers] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState({ player_id: "", player_name: "", date: "", start_time: "09:00", duration: "60", type: "Training", coach_name: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [nowY, setNowY] = useState(nowTop());
  const bodyRef = useRef<any>(null);

  const today = fmt(new Date());

  useEffect(() => {
    load();
    fetch("/api/players").then(r => r.json()).then(d => setPlayers(d.players || []));
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setNowY(nowTop()), 60000);
    return () => clearInterval(iv);
  }, []);

  // Scroll to current time on load
  useEffect(() => {
    if (!loading && bodyRef.current) {
      const scrollTo = Math.max(0, nowTop() - 120);
      bodyRef.current.scrollTop = scrollTo;
    }
  }, [loading]);

  async function load() {
    const r = await fetch("/api/sessions");
    const d = await r.json();
    setSessions(d.sessions || []);
    setLoading(false);
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekOf);
    d.setDate(weekOf.getDate() + i);
    return d;
  });

  const sessionsByDay: Record<string, Session[]> = {};
  for (const s of sessions) {
    if (!sessionsByDay[s.date]) sessionsByDay[s.date] = [];
    sessionsByDay[s.date].push(s);
  }

  async function addSession() {
    setFormError("");
    const playerName = form.player_id
      ? players.find(p => p.id === parseInt(form.player_id))?.name || form.player_name
      : form.player_name;
    if (!playerName) { setFormError("Enter a player name"); return; }
    if (!form.date) { setFormError("Select a date"); return; }
    setSaving(true);
    const body: Record<string, unknown> = {
      player_name: playerName, date: form.date, start_time: form.start_time,
      duration: parseInt(form.duration) || 60, type: form.type,
      coach_name: form.coach_name, notes: form.notes,
    };
    if (form.player_id) body.player_id = parseInt(form.player_id);
    const resp = await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await resp.json();
    if (!resp.ok) { setFormError(data.error || "Failed"); setSaving(false); return; }
    await load();
    setShowAdd(null); setFormError("");
    setForm({ player_id: "", player_name: "", date: "", start_time: "09:00", duration: "60", type: "Training", coach_name: "", notes: "" });
    setSaving(false);
  }

  async function deleteSession(id: number) {
    if (!confirm("Remove session?")) return;
    await fetch("/api/sessions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await load();
  }

  const inp: React.CSSProperties = { width: "100%", background: "var(--c-input-bg)", border: "1px solid var(--c-input-border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--c-text)", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

  const totalThisWeek = days.reduce((sum, d) => sum + (sessionsByDay[fmt(d)]?.length || 0), 0);
  const totalHours = days.reduce((sum, d) => {
    const ss = sessionsByDay[fmt(d)] || [];
    return sum + ss.reduce((s2, s) => s2 + s.duration, 0);
  }, 0);
  const weekLabel = `${MONTHS[days[0].getMonth()]} ${days[0].getDate()} – ${MONTHS[days[6].getMonth()]} ${days[6].getDate()}, ${days[6].getFullYear()}`;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ width: 32, height: 32, border: "3px solid var(--c-border)", borderTopColor: "#1F6B45", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @media (max-width: 768px) {
          .cal-grid-wrap { display: none !important; }
          .mobile-schedule { display: flex !important; }
          .sched-stats { grid-template-columns: repeat(2,1fr) !important; }
        }
        .day-col:hover .day-add-btn { opacity: 1 !important; }
        .session-chip:hover .session-del { opacity: 1 !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--c-text)", letterSpacing: "-1px", marginBottom: 4 }}>Schedule</h1>
          <p style={{ fontSize: 13, color: "var(--c-text-muted)" }}>{weekLabel}</p>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={() => setWeekOf(d => { const n = new Date(d); n.setDate(n.getDate()-7); return n; })}
            style={{ width: 34, height: 34, background: "var(--c-inner)", border: "1px solid var(--c-border)", borderRadius: 8, color: "var(--c-text-muted)", cursor: "pointer", fontSize: 14, display:"flex",alignItems:"center",justifyContent:"center" }}>←</button>
          <button onClick={() => setWeekOf(weekStart(new Date()))}
            style={{ padding: "7px 14px", background: "var(--c-inner)", border: "1px solid var(--c-border)", borderRadius: 8, color: "var(--c-text-muted)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Today</button>
          <button onClick={() => setWeekOf(d => { const n = new Date(d); n.setDate(n.getDate()+7); return n; })}
            style={{ width: 34, height: 34, background: "var(--c-inner)", border: "1px solid var(--c-border)", borderRadius: 8, color: "var(--c-text-muted)", cursor: "pointer", fontSize: 14, display:"flex",alignItems:"center",justifyContent:"center" }}>→</button>
          <button onClick={() => { setForm(f => ({ ...f, date: today })); setShowAdd(today); }}
            style={{ padding: "7px 18px", background: "#1F6B45", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, boxShadow: "0 4px 14px rgba(31,107,69,.3)" }}>+ Add Session</button>
        </div>
      </div>

      {/* Stats row */}
      <div className="sched-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        {[
          { label: "This week", value: totalThisWeek + " sessions", color: "#1F6B45" },
          { label: "Total hours", value: `${Math.floor(totalHours/60)}h ${totalHours%60}m`, color: "#18B3A4" },
          { label: "Today", value: (sessionsByDay[today]?.length || 0) + " sessions", color: "#FFD447" },
          { label: "Session types", value: SESSION_TYPES.length + " types", color: "#9b59b6" },
        ].map(s => (
          <div key={s.label} style={{ background:"var(--c-card)", border:"1px solid var(--c-border)", borderLeft:`3px solid ${s.color}`, borderRadius:12, padding:"12px 16px" }}>
            <p style={{ fontSize:11, fontWeight:700, color:"var(--c-text-muted)", textTransform:"uppercase", letterSpacing:".07em", margin:"0 0 3px" }}>{s.label}</p>
            <p style={{ fontSize:18, fontWeight:900, color:"var(--c-text)", margin:0, letterSpacing:"-0.5px" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Desktop calendar grid */}
      <div className="cal-grid-wrap" style={{ background:"var(--c-card)", border:"1px solid var(--c-border)", borderRadius:16, overflow:"hidden", boxShadow:"var(--c-shadow)" }}>
        {/* Day headers */}
        <div style={{ display:"grid", gridTemplateColumns:"52px repeat(7,1fr)", borderBottom:"1px solid var(--c-border)", background:"var(--c-card)", position:"sticky", top:0, zIndex:10 }}>
          <div style={{ borderRight:"1px solid var(--c-border)" }} />
          {days.map((day, i) => {
            const dStr = fmt(day);
            const isT = dStr === today;
            const cnt = sessionsByDay[dStr]?.length || 0;
            return (
              <div key={i} style={{ padding:"10px 8px", textAlign:"center", borderRight: i < 6 ? "1px solid var(--c-border)" : "none", background: isT ? "rgba(31,107,69,.05)" : "transparent" }}>
                <p style={{ fontSize:10, fontWeight:700, color: isT ? "#1F6B45" : "var(--c-text-dim)", textTransform:"uppercase", letterSpacing:".08em", margin:"0 0 2px" }}>{DAYS_SHORT[day.getDay()]}</p>
                <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:30, height:30, borderRadius:"50%", background: isT ? "#1F6B45" : "transparent" }}>
                  <p style={{ fontSize:16, fontWeight:900, color: isT ? "#fff" : "var(--c-text)", margin:0, lineHeight:1 }}>{day.getDate()}</p>
                </div>
                {cnt > 0 && <p style={{ fontSize:10, color: isT ? "#1F6B45" : "var(--c-text-dim)", margin:"2px 0 0", fontWeight:600 }}>{cnt} session{cnt!==1?"s":""}</p>}
              </div>
            );
          })}
        </div>

        {/* All-day / no-time row */}
        {days.some(d => (sessionsByDay[fmt(d)] || []).some(s => !s.start_time)) && (
          <div style={{ display:"grid", gridTemplateColumns:"52px repeat(7,1fr)", borderBottom:"1px solid var(--c-border)" }}>
            <div style={{ borderRight:"1px solid var(--c-border)", padding:"4px 6px", display:"flex", alignItems:"center" }}>
              <span style={{ fontSize:9, color:"var(--c-text-dim)", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", writingMode:"vertical-rl", transform:"rotate(180deg)" }}>no time</span>
            </div>
            {days.map((day, di) => {
              const noTime = (sessionsByDay[fmt(day)] || []).filter(s => !s.start_time);
              return (
                <div key={di} style={{ borderRight: di < 6 ? "1px solid var(--c-border)" : "none", padding:"4px 3px", display:"flex", flexDirection:"column", gap:2, minHeight:28 }}>
                  {noTime.map(s => {
                    const meta = SESSION_META[s.type] || SESSION_META.Training;
                    return (
                      <div key={s.id} style={{ background: meta.light, borderLeft:`3px solid ${meta.color}`, borderRadius:"0 5px 5px 0", padding:"2px 6px 2px 5px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:4 }}>
                        <p style={{ fontSize:10, fontWeight:800, color:meta.color, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.player_name}</p>
                        <button onClick={() => deleteSession(s.id)} style={{ background:"none", border:"none", color:meta.color, opacity:.6, cursor:"pointer", fontSize:10, padding:0, flexShrink:0 }}>✕</button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* Scrollable time body */}
        <div ref={bodyRef} style={{ overflowY:"auto", maxHeight:600, position:"relative" }}>
          <div style={{ display:"grid", gridTemplateColumns:"52px repeat(7,1fr)", minHeight: HOURS.length * HOUR_H }}>
            {/* Time labels */}
            <div style={{ borderRight:"1px solid var(--c-border)", position:"relative" }}>
              {HOURS.map((h, i) => (
                <div key={h} style={{ position:"absolute", top: i * HOUR_H - 8, left:0, right:0, paddingRight:6, textAlign:"right" }}>
                  <span style={{ fontSize:10, color:"var(--c-text-dim)", fontWeight:600 }}>{h < 10 ? `0${h}` : h}:00</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day, di) => {
              const dStr = fmt(day);
              const isT = dStr === today;
              const daySessions = (sessionsByDay[dStr] || []).filter(s => s.start_time);
              return (
                <div key={di} className="day-col" onClick={() => { setForm(f => ({ ...f, date: dStr })); setShowAdd(dStr); }}
                  style={{ position:"relative", borderRight: di < 6 ? "1px solid var(--c-border)" : "none", background: isT ? "rgba(31,107,69,.02)" : "transparent", cursor:"pointer", minHeight: HOURS.length * HOUR_H }}>
                  {/* Hour lines */}
                  {HOURS.map((_, i) => (
                    <div key={i} style={{ position:"absolute", left:0, right:0, top: i * HOUR_H, height:1, background:"var(--c-border)", opacity: i === 0 ? 0 : .5 }} />
                  ))}
                  {/* Half-hour lines */}
                  {HOURS.map((_, i) => (
                    <div key={`h${i}`} style={{ position:"absolute", left:0, right:0, top: i * HOUR_H + HOUR_H/2, height:1, background:"var(--c-border)", opacity:.2 }} />
                  ))}
                  {/* Now line */}
                  {isT && (
                    <div style={{ position:"absolute", left:0, right:0, top: nowY, height:2, background:"#FFD447", zIndex:5, pointerEvents:"none" }}>
                      <div style={{ position:"absolute", left:-4, top:-4, width:10, height:10, borderRadius:"50%", background:"#FFD447" }} />
                    </div>
                  )}
                  {/* Sessions */}
                  {daySessions.map(s => {
                    const meta = SESSION_META[s.type] || SESSION_META.Training;
                    const topPx = (timeToMin(s.start_time!) - START_H * 60) / 60 * HOUR_H;
                    const heightPx = Math.max(24, s.duration / 60 * HOUR_H - 4);
                    return (
                      <div key={s.id} className="session-chip"
                        onClick={e => e.stopPropagation()}
                        style={{ position:"absolute", left:3, right:3, top: topPx + 2, height: heightPx, background: meta.light, borderLeft:`3px solid ${meta.color}`, borderRadius:"0 7px 7px 0", padding:"4px 8px 4px 6px", overflow:"hidden", zIndex:3, cursor:"default", boxShadow:`0 1px 4px rgba(0,0,0,.15)`, border:`1px solid ${meta.color}30`, borderLeftWidth:3 }}>
                        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:2 }}>
                          <p style={{ fontSize:11, fontWeight:800, color:meta.color, margin:0, lineHeight:1.25, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{s.player_name}</p>
                          <button className="session-del" onClick={() => deleteSession(s.id)}
                            style={{ opacity:0, background:"none", border:"none", color:meta.color, cursor:"pointer", fontSize:11, padding:0, lineHeight:1, flexShrink:0, transition:"opacity .15s" }}>✕</button>
                        </div>
                        {heightPx > 38 && <p style={{ fontSize:10, color:meta.color, opacity:.7, margin:"2px 0 0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.start_time} · {s.type}</p>}
                        {heightPx > 58 && s.coach_name && <p style={{ fontSize:9, color:meta.color, opacity:.55, margin:"1px 0 0", whiteSpace:"nowrap" }}>{s.coach_name}</p>}
                      </div>
                    );
                  })}
                  {/* Add hover hint */}
                  <div className="day-add-btn" style={{ position:"absolute", bottom:8, right:6, opacity:0, transition:"opacity .15s", pointerEvents:"none", zIndex:4 }}>
                    <span style={{ fontSize:18, color:"var(--c-text-dim)", lineHeight:1 }}>+</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Session type legend */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {SESSION_TYPES.map(t => {
          const m = SESSION_META[t];
          return (
            <div key={t} style={{ display:"flex", alignItems:"center", gap:6, background:"var(--c-card)", border:"1px solid var(--c-border)", borderRadius:100, padding:"4px 12px" }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:m.color, display:"inline-block", flexShrink:0 }} />
              <span style={{ fontSize:12, color:"var(--c-text-muted)", fontWeight:600 }}>{t}</span>
            </div>
          );
        })}
      </div>

      {/* Mobile list */}
      <div style={{ display:"none", flexDirection:"column", gap:12 }} className="mobile-schedule">
        {days.map((day, i) => {
          const dStr = fmt(day);
          const isT = dStr === today;
          const daySessions = (sessionsByDay[dStr] || []).sort((a,b) => (a.start_time||"99:99").localeCompare(b.start_time||"99:99"));
          return (
            <div key={i} style={{ background:"var(--c-card)", border:`1px solid ${isT ? "rgba(31,107,69,.35)" : "var(--c-border)"}`, borderRadius:14, overflow:"hidden" }}>
              <div style={{ padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", background: isT ? "rgba(31,107,69,.06)" : "transparent", borderBottom: daySessions.length > 0 ? "1px solid var(--c-border)" : "none" }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:800, color: isT ? "#1F6B45" : "var(--c-text)", margin:0 }}>{DAYS_LONG[day.getDay()]}</p>
                  <p style={{ fontSize:11, color:"var(--c-text-muted)", margin:0 }}>{MONTHS[day.getMonth()]} {day.getDate()}</p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {daySessions.length > 0 && <span style={{ fontSize:11, fontWeight:700, color: isT ? "#1F6B45" : "var(--c-text-dim)", background: isT ? "rgba(31,107,69,.1)" : "var(--c-inner)", padding:"2px 8px", borderRadius:100 }}>{daySessions.length}</span>}
                  <button onClick={() => { setForm(f => ({ ...f, date: dStr })); setShowAdd(dStr); }}
                    style={{ width:28, height:28, background:"var(--c-inner)", border:"1px solid var(--c-border)", borderRadius:8, color:"var(--c-text-muted)", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
                </div>
              </div>
              {daySessions.map((s, si) => {
                const meta = SESSION_META[s.type] || SESSION_META.Training;
                return (
                  <div key={s.id} style={{ padding:"12px 16px", borderBottom: si < daySessions.length-1 ? "1px solid var(--c-border)" : "none", display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:meta.light, border:`1px solid ${meta.color}33`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:12, fontWeight:900, color:meta.color }}>{initials(s.player_name)}</span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:800, color:"var(--c-text)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.player_name}</p>
                      <p style={{ fontSize:11, color:"var(--c-text-muted)", margin:"2px 0 0" }}>
                        {s.start_time && `${s.start_time} · `}{s.type} · {s.duration}m
                        {s.coach_name && ` · ${s.coach_name}`}
                      </p>
                    </div>
                    <div style={{ width:4, height:36, borderRadius:100, background:meta.color, flexShrink:0 }} />
                    <button onClick={() => deleteSession(s.id)}
                      style={{ background:"none", border:"none", color:"var(--c-text-dim)", cursor:"pointer", fontSize:14, padding:4 }}>✕</button>
                  </div>
                );
              })}
              {daySessions.length === 0 && (
                <div style={{ padding:"14px 16px", textAlign:"center" }}>
                  <p style={{ fontSize:12, color:"var(--c-text-dim)" }}>No sessions</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Session Modal */}
      {showAdd && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:24 }}>
          <div style={{ background:"var(--c-card)", border:"1px solid var(--c-border)", borderRadius:24, width:"100%", maxWidth:500, maxHeight:"90vh", overflowY:"auto" }}>
            {/* Header */}
            <div style={{ background:"linear-gradient(135deg,#186038,#1F6B45)", padding:"24px 28px" }}>
              <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:".1em", margin:"0 0 4px" }}>New Session</p>
              <p style={{ fontSize:20, fontWeight:900, color:"#fff", margin:0 }}>
                {showAdd === today ? "Today" : (() => { const d = new Date(showAdd+"T12:00:00"); return `${DAYS_LONG[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`; })()}
              </p>
            </div>
            <div style={{ padding:26 }}>
              {formError && <div style={{ background:"#ef444418", border:"1px solid #ef444433", borderRadius:10, padding:"9px 14px", fontSize:13, color:"#ef4444", fontWeight:600, marginBottom:16 }}>⚠ {formError}</div>}
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {/* Session type picker */}
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:"var(--c-text-muted)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:8 }}>Session Type</label>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
                    {SESSION_TYPES.map(t => {
                      const m = SESSION_META[t];
                      const active = form.type === t;
                      return (
                        <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                          style={{ padding:"9px 10px", borderRadius:10, border:`2px solid ${active ? m.color : "var(--c-border)"}`, background: active ? m.light : "var(--c-inner)", cursor:"pointer", textAlign:"center", transition:"all .15s" }}>
                          <p style={{ fontSize:12, fontWeight:800, color: active ? m.color : "var(--c-text-muted)", margin:0 }}>{t}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Player */}
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:"var(--c-text-muted)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:6 }}>Player *</label>
                  <input value={form.player_name} onChange={e => setForm(f => ({ ...f, player_name: e.target.value, player_id: "" }))} placeholder="Type player name..." style={inp} />
                  {players.length > 0 && (
                    <select value={form.player_id} onChange={e => {
                      const p = players.find(p => p.id === parseInt(e.target.value));
                      setForm(f => ({ ...f, player_id: e.target.value, player_name: p?.name || f.player_name }));
                    }} style={{ ...inp, marginTop: 6 }}>
                      <option value="">— or pick from list —</option>
                      {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  )}
                </div>
                {/* Date + Time + Duration */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                  {[
                    { k:"date", label:"Date", type:"date" },
                    { k:"start_time", label:"Start Time", type:"time" },
                    { k:"duration", label:"Duration (min)", type:"number" },
                  ].map(({ k, label, type }) => (
                    <div key={k}>
                      <label style={{ display:"block", fontSize:10, fontWeight:700, color:"var(--c-text-muted)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:5 }}>{label}</label>
                      <input type={type} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={inp} />
                    </div>
                  ))}
                </div>
                {/* Coach + Notes */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {[
                    { k:"coach_name", label:"Coach", placeholder:"Coach Rivera" },
                    { k:"notes", label:"Notes", placeholder:"Optional" },
                  ].map(({ k, label, placeholder }) => (
                    <div key={k}>
                      <label style={{ display:"block", fontSize:10, fontWeight:700, color:"var(--c-text-muted)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:5 }}>{label}</label>
                      <input value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} placeholder={placeholder} style={inp} />
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex", gap:10, marginTop:20 }}>
                <button onClick={() => { setShowAdd(null); setFormError(""); }}
                  style={{ flex:1, padding:"13px", borderRadius:12, border:"1px solid var(--c-border)", background:"var(--c-inner)", color:"var(--c-text-muted)", fontWeight:600, cursor:"pointer", fontSize:14 }}>Cancel</button>
                <button onClick={addSession} disabled={saving}
                  style={{ flex:2, padding:"13px", borderRadius:12, border:"none", background: SESSION_META[form.type]?.color || "#1F6B45", color:"#fff", fontWeight:700, cursor:"pointer", fontSize:14, opacity: saving ? .7 : 1 }}>
                  {saving ? "Saving..." : "Add Session"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
