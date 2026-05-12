"use client";
import { useState, useEffect } from "react";

interface Court { id: number; name: string; surface: string; status: string }
interface Booking { id: number; court_id: number; court_name: string; player_name: string; coach_name: string; date: string; start_time: string; end_time: string; notes: string }

const SURFACE: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  Hard:   { color: "#2563eb", bg: "linear-gradient(135deg,#1e40af,#2563eb)", icon: "🔵", label: "Hard Court" },
  Clay:   { color: "#d97706", bg: "linear-gradient(135deg,#92400e,#d97706)", icon: "🟤", label: "Clay Court" },
  Grass:  { color: "#059669", bg: "linear-gradient(135deg,#065f46,#059669)", icon: "🟢", label: "Grass Court" },
  Indoor: { color: "#7c3aed", bg: "linear-gradient(135deg,#4c1d95,#7c3aed)", icon: "🟣", label: "Indoor Court" },
};

const inp: React.CSSProperties = { width: "100%", background: "var(--c-input-bg)", border: "1px solid var(--c-input-border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--c-text)", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function addDays(s: string, n: number) {
  const d = new Date(s + "T12:00:00");
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function fmtDate(s: string) {
  const d = new Date(s + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
function timeToMin(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function durationLabel(start: string, end: string) {
  const mins = timeToMin(end) - timeToMin(start);
  return mins >= 60 ? `${(mins/60).toFixed(mins%60===0?0:1)}h` : `${mins}m`;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 – 20:00

export default function CourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCourt, setShowAddCourt] = useState(false);
  const [showBooking, setShowBooking] = useState<Court | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [courtForm, setCourtForm] = useState({ name: "", surface: "Hard" });
  const [bookingForm, setBookingForm] = useState({ player_name: "", coach_name: "", date: "", start_time: "09:00", end_time: "10:00", notes: "" });
  const [saving, setSaving] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadBookings(); }, [selectedDate]);

  async function loadAll() {
    const [cr, br] = await Promise.all([fetch("/api/courts"), fetch(`/api/court-bookings?date=${selectedDate}`)]);
    const [cd, bd] = await Promise.all([cr.json(), br.json()]);
    setCourts(cd.courts || []);
    setBookings(bd.bookings || []);
    setLoading(false);
  }

  async function loadBookings() {
    const r = await fetch(`/api/court-bookings?date=${selectedDate}`);
    const d = await r.json();
    setBookings(d.bookings || []);
  }

  async function addCourt() {
    if (!courtForm.name) return;
    setSaving(true);
    await fetch("/api/courts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(courtForm) });
    await loadAll();
    setShowAddCourt(false);
    setCourtForm({ name: "", surface: "Hard" });
    setSaving(false);
  }

  async function deleteCourt(id: number) {
    if (!confirm("Remove this court?")) return;
    await fetch("/api/courts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await loadAll();
  }

  async function toggleStatus(court: Court) {
    const next = court.status === "available" ? "maintenance" : "available";
    await fetch("/api/courts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: court.id, status: next }) });
    await loadAll();
  }

  async function addBooking() {
    if (!showBooking || !bookingForm.date || !bookingForm.start_time || !bookingForm.end_time) return;
    setSaving(true); setBookingError("");
    const res = await fetch("/api/court-bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...bookingForm, court_id: showBooking.id, court_name: showBooking.name }),
    });
    const data = await res.json();
    if (!res.ok) { setBookingError(data.error || "Failed"); setSaving(false); return; }
    await loadBookings();
    setShowBooking(null);
    setBookingForm({ player_name: "", coach_name: "", date: selectedDate, start_time: "09:00", end_time: "10:00", notes: "" });
    setSaving(false);
  }

  async function deleteBooking(id: number) {
    await fetch("/api/court-bookings", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await loadBookings();
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ width: 32, height: 32, border: "3px solid var(--c-border)", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  const isToday = selectedDate === todayStr();
  const bookingsByCourtId: Record<number, Booking[]> = {};
  for (const b of bookings) {
    if (!bookingsByCourtId[b.court_id]) bookingsByCourtId[b.court_id] = [];
    bookingsByCourtId[b.court_id].push(b);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--c-text)", letterSpacing: "-1px", marginBottom: 4 }}>Courts</h1>
          <p style={{ fontSize: 14, color: "var(--c-text-muted)" }}>
            {courts.filter(c => c.status === "available").length} available · {courts.length} total
          </p>
        </div>
        <button onClick={() => setShowAddCourt(true)}
          style={{ background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(37,99,235,.3)", display: "flex", alignItems: "center", gap: 6 }}>
          + Add Court
        </button>
      </div>

      {/* Court Cards */}
      {courts.length === 0 ? (
        <div style={{ background: "var(--c-card)", border: "2px dashed var(--c-border)", borderRadius: 20, padding: 64, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎾</div>
          <p style={{ fontSize: 18, fontWeight: 800, color: "var(--c-text)", marginBottom: 8 }}>No courts yet</p>
          <p style={{ fontSize: 14, color: "var(--c-text-muted)", marginBottom: 24 }}>Add your courts to start managing bookings</p>
          <button onClick={() => setShowAddCourt(true)} style={{ background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 28px", borderRadius: 12, border: "none", cursor: "pointer" }}>Add First Court →</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {courts.map(court => {
            const s = SURFACE[court.surface] || SURFACE.Hard;
            const avail = court.status === "available";
            const todayBookings = bookingsByCourtId[court.id]?.length || 0;
            return (
              <div key={court.id} style={{ borderRadius: 18, overflow: "hidden", border: "1px solid var(--c-border)", boxShadow: "var(--c-shadow)", opacity: avail ? 1 : .6, transition: "transform .15s, box-shadow .15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(0,0,0,.15)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--c-shadow)"; }}>
                {/* Banner */}
                <div style={{ background: s.bg, padding: "22px 20px 18px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", right: -16, top: -16, fontSize: 80, opacity: .12, transform: "rotate(-15deg)", userSelect: "none" }}>🎾</div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.65)", textTransform: "uppercase", letterSpacing: ".1em", margin: "0 0 4px" }}>{s.label}</p>
                      <p style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-.3px" }}>{court.name}</p>
                    </div>
                    <button onClick={() => toggleStatus(court)}
                      style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 100, border: "1px solid rgba(255,255,255,.25)", cursor: "pointer", background: avail ? "rgba(255,255,255,.15)" : "rgba(255,0,0,.25)", color: "#fff", backdropFilter: "blur(4px)" }}>
                      {avail ? "● Available" : "✕ Maintenance"}
                    </button>
                  </div>
                  {todayBookings > 0 && (
                    <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ background: "rgba(255,255,255,.15)", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "rgba(255,255,255,.85)", fontWeight: 600 }}>
                        {todayBookings} booking{todayBookings !== 1 ? "s" : ""} today
                      </div>
                    </div>
                  )}
                </div>
                {/* Footer */}
                <div style={{ background: "var(--c-card)", padding: "14px 16px", display: "flex", gap: 8 }}>
                  <button onClick={() => { setBookingError(""); setBookingForm(f => ({ ...f, date: selectedDate })); setShowBooking(court); }}
                    disabled={!avail}
                    style={{ flex: 1, padding: "9px 0", background: avail ? s.color : "var(--c-inner)", border: `1px solid ${avail ? s.color : "var(--c-border)"}`, borderRadius: 9, fontSize: 13, color: avail ? "#fff" : "var(--c-text-dim)", cursor: avail ? "pointer" : "not-allowed", fontWeight: 700, transition: "opacity .15s" }}>
                    {avail ? "Book Court" : "Unavailable"}
                  </button>
                  <button onClick={() => deleteCourt(court.id)}
                    style={{ width: 38, background: "var(--c-inner)", border: "1px solid var(--c-border)", borderRadius: 9, fontSize: 14, color: "var(--c-text-dim)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#ef4444"; el.style.borderColor = "#ef4444"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--c-text-dim)"; el.style.borderColor = "var(--c-border)"; }}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Daily Schedule */}
      {courts.length > 0 && (
        <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 20, overflow: "hidden", boxShadow: "var(--c-shadow)" }}>
          {/* Date nav */}
          <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--c-border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", margin: "0 0 2px" }}>Daily Schedule</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: "var(--c-text)", margin: 0 }}>{fmtDate(selectedDate)}{isToday ? <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: "#059669", background: "#05966918", padding: "2px 8px", borderRadius: 100 }}>Today</span> : null}</p>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button onClick={() => setSelectedDate(d => addDays(d, -1))} style={{ width: 32, height: 32, background: "var(--c-inner)", border: "1px solid var(--c-border)", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "var(--c-text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
              <button onClick={() => setSelectedDate(todayStr())} style={{ padding: "6px 14px", background: isToday ? "rgba(37,99,235,.1)" : "var(--c-inner)", border: `1px solid ${isToday ? "rgba(37,99,235,.3)" : "var(--c-border)"}`, borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, color: isToday ? "#60a5fa" : "var(--c-text-muted)" }}>Today</button>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ ...inp, width: "auto", padding: "6px 12px", fontSize: 12 }} />
              <button onClick={() => setSelectedDate(d => addDays(d, 1))} style={{ width: 32, height: 32, background: "var(--c-inner)", border: "1px solid var(--c-border)", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "var(--c-text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>→</button>
            </div>
          </div>

          {/* Timeline grid */}
          <div style={{ padding: 24, overflowX: "auto" }}>
            {bookings.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <p style={{ fontSize: 32, marginBottom: 10 }}>📅</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--c-text)", marginBottom: 6 }}>No bookings for this day</p>
                <p style={{ fontSize: 13, color: "var(--c-text-muted)" }}>Select a court and click "Book Court"</p>
              </div>
            )}
            {bookings.length > 0 && (
              <div style={{ minWidth: 500 }}>
                {/* Hour ruler */}
                <div style={{ display: "flex", marginLeft: 100, marginBottom: 6 }}>
                  {HOURS.map(h => (
                    <div key={h} style={{ flex: 1, fontSize: 10, color: "var(--c-text-dim)", fontWeight: 600, textAlign: "left" }}>
                      {h}:00
                    </div>
                  ))}
                </div>
                {/* Court rows */}
                {courts.map(court => {
                  const s = SURFACE[court.surface] || SURFACE.Hard;
                  const cBookings = bookingsByCourtId[court.id] || [];
                  return (
                    <div key={court.id} style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ width: 96, flexShrink: 0, paddingRight: 12 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--c-text-2)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{court.name}</p>
                        <p style={{ fontSize: 10, color: s.color, margin: 0, fontWeight: 600 }}>{court.surface}</p>
                      </div>
                      <div style={{ flex: 1, height: 44, background: "var(--c-inner)", borderRadius: 8, position: "relative", border: "1px solid var(--c-border)", overflow: "hidden" }}>
                        {/* Hour lines */}
                        {HOURS.map((_, i) => (
                          <div key={i} style={{ position: "absolute", left: `${(i / HOURS.length) * 100}%`, top: 0, bottom: 0, width: 1, background: "var(--c-border)", opacity: .5 }} />
                        ))}
                        {/* Bookings */}
                        {cBookings.map(b => {
                          const startMin = timeToMin(b.start_time) - 7 * 60;
                          const endMin = timeToMin(b.end_time) - 7 * 60;
                          const totalMins = HOURS.length * 60;
                          const left = (startMin / totalMins) * 100;
                          const width = ((endMin - startMin) / totalMins) * 100;
                          return (
                            <div key={b.id} style={{ position: "absolute", left: `${left}%`, width: `${width}%`, top: 4, bottom: 4, background: s.bg, borderRadius: 6, padding: "2px 6px", overflow: "hidden", cursor: "pointer", minWidth: 4 }}
                              title={`${b.player_name || "—"} · ${b.start_time}–${b.end_time}${b.coach_name ? ` · ${b.coach_name}` : ""}${b.notes ? `\n${b.notes}` : ""}`}>
                              <p style={{ fontSize: 10, fontWeight: 700, color: "#fff", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {b.player_name || "Booked"} · {durationLabel(b.start_time, b.end_time)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Booking list */}
          {bookings.length > 0 && (
            <div style={{ padding: "0 24px 24px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Booking List</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {bookings.sort((a, b) => a.start_time.localeCompare(b.start_time)).map(b => {
                  const s = SURFACE[courts.find(c => c.id === b.court_id)?.surface || "Hard"] || SURFACE.Hard;
                  return (
                    <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "var(--c-inner)", borderRadius: 12, border: "1px solid var(--c-border)" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🎾</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <p style={{ fontSize: 14, fontWeight: 800, color: "var(--c-text)", margin: 0 }}>{b.court_name}</p>
                          <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.color + "18", padding: "2px 8px", borderRadius: 100 }}>{b.start_time}–{b.end_time}</span>
                          <span style={{ fontSize: 11, color: "var(--c-text-dim)" }}>{durationLabel(b.start_time, b.end_time)}</span>
                        </div>
                        <p style={{ fontSize: 12, color: "var(--c-text-muted)", margin: 0 }}>
                          {b.player_name || "—"}{b.coach_name ? ` · Coach ${b.coach_name}` : ""}{b.notes ? ` · ${b.notes}` : ""}
                        </p>
                      </div>
                      <button onClick={() => deleteBooking(b.id)}
                        style={{ width: 32, height: 32, background: "none", border: "1px solid var(--c-border)", borderRadius: 8, color: "var(--c-text-dim)", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#ef4444"; el.style.borderColor = "#ef4444"; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--c-text-dim)"; el.style.borderColor = "var(--c-border)"; }}>✕</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Court Modal */}
      {showAddCourt && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
          <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 24, padding: 36, width: "100%", maxWidth: 420 }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--c-text)", marginBottom: 28, letterSpacing: "-.3px" }}>New Court</h2>
            {/* Surface picker */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Surface Type</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {Object.entries(SURFACE).map(([key, val]) => (
                  <button key={key} onClick={() => setCourtForm(f => ({ ...f, surface: key }))}
                    style={{ padding: "12px 16px", borderRadius: 12, border: `2px solid ${courtForm.surface === key ? val.color : "var(--c-border)"}`, background: courtForm.surface === key ? val.color + "18" : "var(--c-inner)", cursor: "pointer", textAlign: "left", transition: "all .15s" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: courtForm.surface === key ? val.color : "var(--c-text-muted)", margin: 0 }}>{key}</p>
                    <p style={{ fontSize: 11, color: "var(--c-text-dim)", margin: 0 }}>{val.label}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Court Name *</label>
              <input value={courtForm.name} onChange={e => setCourtForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Court 1" style={inp} autoFocus onKeyDown={e => e.key === "Enter" && addCourt()} />
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
              <button onClick={() => setShowAddCourt(false)} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1px solid var(--c-border)", background: "var(--c-inner)", color: "var(--c-text-muted)", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancel</button>
              <button onClick={addCourt} disabled={saving || !courtForm.name} style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: SURFACE[courtForm.surface].color, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: saving || !courtForm.name ? .6 : 1 }}>{saving ? "Adding..." : "Add Court"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Book Court Modal */}
      {showBooking && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
          <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 24, padding: 0, width: "100%", maxWidth: 460, overflow: "hidden" }}>
            {/* Header banner */}
            <div style={{ background: (SURFACE[showBooking.surface] || SURFACE.Hard).bg, padding: "28px 32px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".1em", margin: "0 0 4px" }}>Book Court</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0 }}>{showBooking.name}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.7)", margin: "4px 0 0" }}>{(SURFACE[showBooking.surface] || SURFACE.Hard).label}</p>
            </div>
            <div style={{ padding: 28 }}>
              {bookingError && (
                <div style={{ background: "#ef444418", border: "1px solid #ef444433", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#ef4444", fontWeight: 600 }}>⚠ {bookingError}</div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Date + Time row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[
                    { k: "date", label: "Date", type: "date" },
                    { k: "start_time", label: "From", type: "time" },
                    { k: "end_time", label: "To", type: "time" },
                  ].map(({ k, label, type }) => (
                    <div key={k}>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>{label}</label>
                      <input type={type} value={(bookingForm as any)[k]} onChange={e => setBookingForm(f => ({ ...f, [k]: e.target.value }))} style={inp} />
                    </div>
                  ))}
                </div>
                {/* Player + Coach */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { k: "player_name", label: "Player", placeholder: "Alex Martinez" },
                    { k: "coach_name", label: "Coach", placeholder: "Coach Rivera" },
                  ].map(({ k, label, placeholder }) => (
                    <div key={k}>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>{label}</label>
                      <input value={(bookingForm as any)[k]} onChange={e => setBookingForm(f => ({ ...f, [k]: e.target.value }))} placeholder={placeholder} style={inp} />
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>Notes</label>
                  <input value={bookingForm.notes} onChange={e => setBookingForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional" style={inp} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button onClick={() => setShowBooking(null)} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1px solid var(--c-border)", background: "var(--c-inner)", color: "var(--c-text-muted)", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancel</button>
                <button onClick={addBooking} disabled={saving}
                  style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: (SURFACE[showBooking.surface] || SURFACE.Hard).bg, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: saving ? .7 : 1 }}>
                  {saving ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
