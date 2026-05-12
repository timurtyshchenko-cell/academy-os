"use client";
import { useState, useEffect } from "react";

interface Session {
  id: number; player_name: string; date: string; start_time: string | null;
  duration: number; type: string; coach_name: string; notes: string;
}

const SESSION_COLORS: Record<string, string> = {
  Training: "#2563eb", Match: "#059669", Fitness: "#7c3aed",
  "Video Analysis": "#f59e0b", "Serve Practice": "#dc2626", Doubles: "#0891b2",
};
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function weekStart(d: Date) {
  const s = new Date(d);
  s.setDate(d.getDate() - d.getDay());
  s.setHours(0, 0, 0, 0);
  return s;
}

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

  useEffect(() => {
    load();
    fetch("/api/players").then(r => r.json()).then(d => setPlayers(d.players || []));
  }, []);

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

  const sessionsByDay = days.map(d => {
    const key = fmt(d);
    return sessions.filter(s => s.date === key).sort((a, b) => (a.start_time || "99:99").localeCompare(b.start_time || "99:99"));
  });

  async function addSession() {
    setFormError("");
    const playerName = form.player_id
      ? players.find(p => p.id === parseInt(form.player_id))?.name || form.player_name
      : form.player_name;
    if (!playerName) { setFormError("Enter a player name"); return; }
    if (!form.date) { setFormError("Select a date"); return; }
    setSaving(true);
    const body: Record<string, unknown> = {
      ...form,
      player_name: playerName,
      duration: parseInt(form.duration) || 60,
    };
    if (form.player_id) body.player_id = parseInt(form.player_id);
    await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    await load();
    setShowAdd(null);
    setForm({ player_id: "", player_name: "", date: "", start_time: "09:00", duration: "60", type: "Training", coach_name: "", notes: "" });
    setSaving(false);
  }

  async function deleteSession(id: number) {
    if (!confirm("Remove session?")) return;
    await fetch("/api/sessions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await load();
  }

  const inp: React.CSSProperties = { width: "100%", background: "var(--c-input-bg)", border: "1px solid var(--c-input-border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--c-text)", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

  const today = fmt(new Date());
  const weekLabel = `${MONTHS[days[0].getMonth()]} ${days[0].getDate()} – ${days[6].getDate()}, ${days[6].getFullYear()}`;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ width: 32, height: 32, border: "3px solid var(--c-border)", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--c-text)", letterSpacing: "-1px", marginBottom: 4 }}>Schedule</h1>
          <p style={{ fontSize: 14, color: "var(--c-text-muted)" }}>{weekLabel}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setWeekOf(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; })}
            style={{ padding: "8px 16px", background: "var(--c-inner)", border: "1px solid var(--c-border)", borderRadius: 8, color: "var(--c-text-muted)", cursor: "pointer", fontSize: 13 }}>← Prev</button>
          <button onClick={() => setWeekOf(weekStart(new Date()))}
            style={{ padding: "8px 16px", background: "var(--c-inner)", border: "1px solid var(--c-border)", borderRadius: 8, color: "var(--c-text-muted)", cursor: "pointer", fontSize: 13 }}>Today</button>
          <button onClick={() => setWeekOf(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; })}
            style={{ padding: "8px 16px", background: "var(--c-inner)", border: "1px solid var(--c-border)", borderRadius: 8, color: "var(--c-text-muted)", cursor: "pointer", fontSize: 13 }}>Next →</button>
          <button onClick={() => { setForm(f => ({ ...f, date: today })); setShowAdd(today); }}
            style={{ padding: "8px 16px", background: "#2563eb", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>+ Session</button>
        </div>
      </div>

      {/* Desktop grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
        {days.map((day, i) => {
          const isToday = fmt(day) === today;
          const daySessions = sessionsByDay[i];
          return (
            <div key={i} style={{ background: "var(--c-card)", border: `1px solid ${isToday ? "#2563eb55" : "var(--c-border)"}`, borderRadius: 12, overflow: "hidden", boxShadow: "var(--c-shadow)", minHeight: 180 }}>
              <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--c-border)", background: isToday ? "rgba(37,99,235,.08)" : "transparent", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: isToday ? "#60a5fa" : "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", margin: 0 }}>{DAYS[day.getDay()]}</p>
                  <p style={{ fontSize: 18, fontWeight: 900, color: isToday ? "#60a5fa" : "var(--c-text)", margin: 0, lineHeight: 1.2 }}>{day.getDate()}</p>
                </div>
                <button onClick={() => { setForm(f => ({ ...f, date: fmt(day) })); setShowAdd(fmt(day)); }}
                  style={{ width: 22, height: 22, background: "var(--c-inner)", border: "1px solid var(--c-border)", borderRadius: 6, color: "var(--c-text-muted)", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>+</button>
              </div>
              <div style={{ padding: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                {daySessions.map(s => {
                  const color = SESSION_COLORS[s.type] || "#2563eb";
                  return (
                    <div key={s.id} style={{ background: color + "18", border: `1px solid ${color}33`, borderRadius: 6, padding: "5px 8px", cursor: "pointer" }}
                      title={`${s.player_name} · ${s.type} · ${s.duration}m${s.notes ? `\n${s.notes}` : ""}`}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{s.player_name}</p>
                        <button onClick={() => deleteSession(s.id)} style={{ background: "none", border: "none", color: color + "88", cursor: "pointer", fontSize: 10, padding: 0, flexShrink: 0 }}>✕</button>
                      </div>
                      {s.start_time && <p style={{ fontSize: 9, color: color + "99", margin: 0 }}>{s.start_time}</p>}
                      <p style={{ fontSize: 9, color: color + "88", margin: 0 }}>{s.type} · {s.duration}m</p>
                    </div>
                  );
                })}
                {daySessions.length === 0 && (
                  <p style={{ fontSize: 10, color: "var(--c-text-dim)", textAlign: "center", padding: "12px 0" }}>—</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile list view */}
      <div style={{ display: "none" }} className="mobile-schedule">
        {days.map((day, i) => {
          const daySessions = sessionsByDay[i];
          if (daySessions.length === 0) return null;
          return (
            <div key={i} style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--c-border)", background: fmt(day) === today ? "rgba(37,99,235,.08)" : "transparent" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: fmt(day) === today ? "#60a5fa" : "var(--c-text)" }}>
                  {DAYS[day.getDay()]}, {MONTHS[day.getMonth()]} {day.getDate()}
                </p>
              </div>
              {daySessions.map(s => {
                const color = SESSION_COLORS[s.type] || "#2563eb";
                return (
                  <div key={s.id} style={{ padding: "12px 16px", borderBottom: "1px solid var(--c-border)", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 4, height: 36, background: color, borderRadius: 4, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)", margin: 0 }}>{s.player_name}</p>
                      <p style={{ fontSize: 12, color: "var(--c-text-muted)", margin: 0 }}>{s.type} · {s.duration}m{s.start_time ? ` · ${s.start_time}` : ""}</p>
                    </div>
                    <button onClick={() => deleteSession(s.id)} style={{ background: "none", border: "none", color: "var(--c-text-dim)", cursor: "pointer", fontSize: 14 }}>✕</button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
          <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 480 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--c-text)", marginBottom: 24 }}>Add Session</h2>
            {formError && <div style={{ background: "#ef444418", border: "1px solid #ef444433", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#ef4444", fontWeight: 600, marginBottom: 8 }}>⚠ {formError}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Player *</label>
                <input value={form.player_name} onChange={e => setForm(f => ({ ...f, player_name: e.target.value, player_id: "" }))} placeholder="Player name" style={inp} />
                {players.length > 0 && (
                  <select value={form.player_id} onChange={e => {
                    const p = players.find(p => p.id === parseInt(e.target.value));
                    setForm(f => ({ ...f, player_id: e.target.value, player_name: p?.name || f.player_name }));
                  }} style={{ ...inp, marginTop: 6, color: form.player_id ? "var(--c-text)" : "var(--c-text-dim)" }}>
                    <option value="">— or pick from list —</option>
                    {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                )}
              </div>
              {[
                { k: "date", label: "Date *", type: "date" },
                { k: "start_time", label: "Start Time", type: "time" },
                { k: "duration", label: "Duration (min)", type: "number" },
                { k: "coach_name", label: "Coach", type: "text" },
                { k: "notes", label: "Notes", type: "text" },
              ].map(({ k, label, type }) => (
                <div key={k}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>{label}</label>
                  <input type={type} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={inp} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inp}>
                  {["Training", "Match", "Fitness", "Video Analysis", "Serve Practice", "Doubles"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => { setShowAdd(null); setFormError(""); }} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-inner)", color: "var(--c-text-muted)", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancel</button>
              <button onClick={addSession} disabled={saving} style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: saving ? .7 : 1 }}>{saving ? "Saving..." : "Add Session"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
