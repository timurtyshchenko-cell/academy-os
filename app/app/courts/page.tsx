"use client";
import { useState, useEffect } from "react";

interface Court { id: number; name: string; surface: string; status: string; price_per_hour: number }
interface Booking { id: number; court_id: number; court_name: string; player_name: string; coach_name: string; date: string; start_time: string; end_time: string; notes: string; total_price: number; payment_status: string; }

const SURFACE: Record<string, { color: string; bg: string; light: string; label: string; pattern: string }> = {
  Hard:   { color: "#1F6B45", bg: "linear-gradient(135deg,#186038,#1F6B45)", light: "rgba(31,107,69,.12)", label: "Hard Court", pattern: "#1F6B45" },
  Clay:   { color: "#d97706", bg: "linear-gradient(135deg,#92400e,#d97706)", light: "rgba(217,119,6,.12)", label: "Clay Court", pattern: "#d97706" },
  Grass:  { color: "#059669", bg: "linear-gradient(135deg,#065f46,#059669)", light: "rgba(5,150,105,.12)", label: "Grass Court", pattern: "#059669" },
  Indoor: { color: "#18B3A4", bg: "linear-gradient(135deg,#0d7a72,#18B3A4)", light: "rgba(24,179,164,.12)", label: "Indoor Court", pattern: "#18B3A4" },
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
function weekDays(anchor: string) {
  const d = new Date(anchor + "T12:00:00");
  const dow = d.getDay();
  const monday = new Date(d); monday.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(monday); dd.setDate(monday.getDate() + i);
    return `${dd.getFullYear()}-${String(dd.getMonth()+1).padStart(2,"0")}-${String(dd.getDate()).padStart(2,"0")}`;
  });
}
function timeToMin(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function durationLabel(start: string, end: string) {
  const mins = timeToMin(end) - timeToMin(start);
  return mins >= 60 ? `${(mins/60).toFixed(mins%60===0?0:1)}h` : `${mins}m`;
}
function initials(name: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}
function nowPct() {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes() - 7 * 60;
  const total = 14 * 60;
  return Math.max(0, Math.min(100, (mins / total) * 100));
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7:00 – 21:00
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCourt, setShowAddCourt] = useState(false);
  const [showBooking, setShowBooking] = useState<Court | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [courtForm, setCourtForm] = useState({ name: "", surface: "Hard", price_per_hour: "30" });
  const [bookingForm, setBookingForm] = useState({ player_name: "", player_email: "", coach_name: "", date: "", start_time: "09:00", end_time: "10:00", notes: "" });
  const [saving, setSaving] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [nowLine, setNowLine] = useState(nowPct());

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadBookings(); }, [selectedDate]);
  useEffect(() => {
    const iv = setInterval(() => setNowLine(nowPct()), 60000);
    return () => clearInterval(iv);
  }, []);

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
    await fetch("/api/courts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: courtForm.name, surface: courtForm.surface, price_per_hour: parseInt(courtForm.price_per_hour) || 30 }) });
    await loadAll();
    setShowAddCourt(false);
    setCourtForm({ name: "", surface: "Hard", price_per_hour: "30" });
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
    if (!showBooking || !bookingForm.date || !bookingForm.start_time || !bookingForm.end_time) {
      setBookingError("Fill in date and time"); return;
    }
    setSaving(true); setBookingError("");
    try {
      const res = await fetch("/api/court-bookings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bookingForm, court_id: showBooking.id, court_name: showBooking.name }),
      });
      const data = await res.json();
      if (!res.ok) { setBookingError(data.error || "Failed to book"); setSaving(false); return; }
      setShowBooking(null);
      setBookingForm({ player_name: "", player_email: "", coach_name: "", date: selectedDate, start_time: "09:00", end_time: "10:00", notes: "" });
      await loadBookings();
    } catch { setBookingError("Network error, try again"); }
    setSaving(false);
  }
  async function deleteBooking(id: number) {
    await fetch("/api/court-bookings", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await loadBookings();
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ width: 32, height: 32, border: "3px solid var(--c-border)", borderTopColor: "#1F6B45", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  const isToday = selectedDate === todayStr();
  const bookingsByCourtId: Record<number, Booking[]> = {};
  for (const b of bookings) {
    if (!bookingsByCourtId[b.court_id]) bookingsByCourtId[b.court_id] = [];
    bookingsByCourtId[b.court_id].push(b);
  }
  const availableCount = courts.filter(c => c.status === "available").length;
  const todayRevenue = bookings.reduce((s, b) => s + (b.payment_status === "paid" ? b.total_price : 0), 0);
  const week = weekDays(selectedDate);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <style>{`
        @media (max-width: 768px) {
          .courts-cards { grid-template-columns: 1fr !important; }
          .courts-date-nav { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .booking-time-grid { grid-template-columns: 1fr !important; }
          .booking-player-grid { grid-template-columns: 1fr !important; }
          .courts-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .week-strip { gap: 4px !important; }
          .week-strip-day { padding: 6px 4px !important; min-width: 36px !important; }
          .week-strip-day span:first-child { font-size: 9px !important; }
          .week-strip-day span:last-child { font-size: 14px !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--c-text)", letterSpacing: "-1px", marginBottom: 4 }}>Courts</h1>
          <p style={{ fontSize: 14, color: "var(--c-text-muted)" }}>
            {availableCount} available · {courts.length} total
          </p>
        </div>
        <button onClick={() => setShowAddCourt(true)}
          style={{ background: "#1F6B45", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(31,107,69,.3)", display: "flex", alignItems: "center", gap: 6 }}>
          + Add Court
        </button>
      </div>

      {/* Stats row */}
      {courts.length > 0 && (
        <div className="courts-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "Total Courts", value: courts.length, color: "#1F6B45" },
            { label: "Available Now", value: availableCount, color: "#18B3A4" },
            { label: "Bookings Today", value: bookings.length, color: "#FFD447" },
            { label: "Revenue Today", value: `$${todayRevenue}`, color: "#d97706" },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 14, padding: "14px 18px", borderLeft: `3px solid ${s.color}` }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".07em", margin: "0 0 4px" }}>{s.label}</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: "var(--c-text)", margin: 0, letterSpacing: "-1px" }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Court Cards */}
      {courts.length === 0 ? (
        <div style={{ background: "var(--c-card)", border: "2px dashed var(--c-border)", borderRadius: 20, padding: 64, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎾</div>
          <p style={{ fontSize: 18, fontWeight: 800, color: "var(--c-text)", marginBottom: 8 }}>No courts yet</p>
          <p style={{ fontSize: 14, color: "var(--c-text-muted)", marginBottom: 24 }}>Add your courts to start managing bookings</p>
          <button onClick={() => setShowAddCourt(true)} style={{ background: "#1F6B45", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 28px", borderRadius: 12, border: "none", cursor: "pointer" }}>Add First Court →</button>
        </div>
      ) : (
        <div className="courts-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {courts.map(court => {
            const s = SURFACE[court.surface] || SURFACE.Hard;
            const avail = court.status === "available";
            const todayBks = bookingsByCourtId[court.id]?.length || 0;
            const utilPct = Math.min(100, Math.round((todayBks * 1.5 / 14) * 100));
            return (
              <div key={court.id} style={{ borderRadius: 18, overflow: "hidden", border: "1px solid var(--c-border)", boxShadow: "var(--c-shadow)", opacity: avail ? 1 : .65, transition: "transform .15s, box-shadow .15s", background: "var(--c-card)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 32px rgba(0,0,0,.18)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--c-shadow)"; }}>
                {/* Colored top strip */}
                <div style={{ height: 4, background: s.bg }} />
                {/* Banner */}
                <div style={{ padding: "20px 20px 16px", position: "relative", overflow: "hidden" }}>
                  {/* Faint court lines background */}
                  <div style={{ position: "absolute", right: 12, top: 10, width: 72, height: 56, opacity: .07, border: `2px solid ${s.color}`, borderRadius: 2 }}>
                    <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: s.color }} />
                    <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, background: s.color }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block" }} />
                        <p style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: ".08em", margin: 0 }}>{s.label}</p>
                      </div>
                      <p style={{ fontSize: 20, fontWeight: 900, color: "var(--c-text)", margin: 0, letterSpacing: "-.3px" }}>{court.name}</p>
                    </div>
                    <button onClick={() => toggleStatus(court)}
                      style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 100, border: `1px solid ${avail ? "rgba(5,150,105,.3)" : "rgba(239,68,68,.3)"}`, cursor: "pointer", background: avail ? "rgba(5,150,105,.1)" : "rgba(239,68,68,.1)", color: avail ? "#059669" : "#ef4444" }}>
                      {avail ? "● Available" : "✕ Maint."}
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-dim)", background: "var(--c-inner)", border: "1px solid var(--c-border)", borderRadius: 8, padding: "3px 9px" }}>
                      {todayBks === 0 ? "Free today" : `${todayBks} booking${todayBks !== 1 ? "s" : ""} today`}
                    </span>
                  </div>
                  {/* Utilization bar */}
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: "var(--c-text-dim)", fontWeight: 600 }}>Today's utilization</span>
                      <span style={{ fontSize: 10, color: s.color, fontWeight: 700 }}>{utilPct}%</span>
                    </div>
                    <div style={{ height: 4, background: "var(--c-inner)", borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${utilPct}%`, background: s.bg, borderRadius: 100, transition: "width .5s" }} />
                    </div>
                  </div>
                </div>
                {/* Footer */}
                <div style={{ background: "var(--c-inner)", borderTop: "1px solid var(--c-border)", padding: "12px 16px", display: "flex", gap: 8 }}>
                  <button onClick={() => { setBookingError(""); setBookingForm(f => ({ ...f, date: selectedDate })); setShowBooking(court); }}
                    disabled={!avail}
                    style={{ flex: 1, padding: "9px 0", background: avail ? s.color : "transparent", border: `1px solid ${avail ? s.color : "var(--c-border)"}`, borderRadius: 9, fontSize: 13, color: avail ? "#fff" : "var(--c-text-dim)", cursor: avail ? "pointer" : "not-allowed", fontWeight: 700, transition: "opacity .15s" }}>
                    {avail ? "Book Court" : "Unavailable"}
                  </button>
                  <button onClick={() => deleteCourt(court.id)}
                    style={{ width: 36, background: "transparent", border: "1px solid var(--c-border)", borderRadius: 9, fontSize: 14, color: "var(--c-text-dim)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
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
          {/* Date nav header */}
          <div className="courts-date-nav" style={{ padding: "18px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", margin: "0 0 2px" }}>Daily Schedule</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: "var(--c-text)", margin: 0 }}>
                {fmtDate(selectedDate)}
                {isToday && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: "#18B3A4", background: "rgba(24,179,164,.12)", padding: "2px 8px", borderRadius: 100 }}>Today</span>}
              </p>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button onClick={() => setSelectedDate(d => addDays(d, -7))} style={{ width: 32, height: 32, background: "var(--c-inner)", border: "1px solid var(--c-border)", borderRadius: 8, cursor: "pointer", fontSize: 12, color: "var(--c-text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>«</button>
              <button onClick={() => setSelectedDate(d => addDays(d, -1))} style={{ width: 32, height: 32, background: "var(--c-inner)", border: "1px solid var(--c-border)", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "var(--c-text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
              <button onClick={() => setSelectedDate(todayStr())} style={{ padding: "6px 14px", background: isToday ? "rgba(31,107,69,.1)" : "var(--c-inner)", border: `1px solid ${isToday ? "rgba(31,107,69,.3)" : "var(--c-border)"}`, borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, color: isToday ? "#1F6B45" : "var(--c-text-muted)" }}>Today</button>
              <button onClick={() => setSelectedDate(d => addDays(d, 1))} style={{ width: 32, height: 32, background: "var(--c-inner)", border: "1px solid var(--c-border)", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "var(--c-text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>→</button>
              <button onClick={() => setSelectedDate(d => addDays(d, 7))} style={{ width: 32, height: 32, background: "var(--c-inner)", border: "1px solid var(--c-border)", borderRadius: 8, cursor: "pointer", fontSize: 12, color: "var(--c-text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>»</button>
            </div>
          </div>

          {/* Week strip */}
          <div className="week-strip" style={{ display: "flex", gap: 6, padding: "14px 24px 0", overflowX: "auto" }}>
            {week.map((d, i) => {
              const active = d === selectedDate;
              const isT = d === todayStr();
              const dayNum = new Date(d + "T12:00:00").getDate();
              return (
                <button key={d} className="week-strip-day" onClick={() => setSelectedDate(d)}
                  style={{ flex: 1, minWidth: 44, padding: "8px 6px", borderRadius: 12, border: `1px solid ${active ? "rgba(31,107,69,.4)" : "var(--c-border)"}`, background: active ? "rgba(31,107,69,.1)" : "var(--c-inner)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "all .15s" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: active ? "#1F6B45" : "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: ".05em" }}>{DAY_LABELS[i]}</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: active ? "#1F6B45" : isT ? "#18B3A4" : "var(--c-text)", lineHeight: 1 }}>{dayNum}</span>
                  {isT && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#18B3A4", display: "block" }} />}
                </button>
              );
            })}
          </div>

          {/* Timeline grid */}
          <div style={{ padding: 24, overflowX: "auto" }}>
            {bookings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <p style={{ fontSize: 32, marginBottom: 10 }}>📅</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--c-text)", marginBottom: 6 }}>No bookings for this day</p>
                <p style={{ fontSize: 13, color: "var(--c-text-muted)" }}>Select a court and click "Book Court"</p>
              </div>
            ) : (
              <div style={{ minWidth: 520 }}>
                {/* Hour ruler */}
                <div style={{ display: "flex", marginLeft: 104, marginBottom: 8 }}>
                  {HOURS.map(h => (
                    <div key={h} style={{ flex: 1, fontSize: 10, color: "var(--c-text-dim)", fontWeight: 600, textAlign: "left" }}>
                      {h < 10 ? `0${h}` : h}:00
                    </div>
                  ))}
                </div>
                {/* Court rows */}
                {courts.map(court => {
                  const s = SURFACE[court.surface] || SURFACE.Hard;
                  const cBookings = bookingsByCourtId[court.id] || [];
                  return (
                    <div key={court.id} style={{ display: "flex", alignItems: "center", marginBottom: 10, gap: 8 }}>
                      <div style={{ width: 96, flexShrink: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 800, color: "var(--c-text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{court.name}</p>
                        <p style={{ fontSize: 10, color: s.color, margin: 0, fontWeight: 700 }}>{court.surface}</p>
                      </div>
                      <div style={{ flex: 1, height: 48, background: "var(--c-inner)", borderRadius: 10, position: "relative", border: "1px solid var(--c-border)", overflow: "hidden" }}>
                        {/* Hour grid lines */}
                        {HOURS.map((_, i) => (
                          <div key={i} style={{ position: "absolute", left: `${(i / HOURS.length) * 100}%`, top: 0, bottom: 0, width: 1, background: "var(--c-border)", opacity: .5 }} />
                        ))}
                        {/* Now line */}
                        {isToday && (
                          <div style={{ position: "absolute", left: `${nowLine}%`, top: 0, bottom: 0, width: 2, background: "#FFD447", opacity: .9, zIndex: 2 }}>
                            <div style={{ position: "absolute", top: -3, left: -3, width: 8, height: 8, borderRadius: "50%", background: "#FFD447" }} />
                          </div>
                        )}
                        {/* Bookings */}
                        {cBookings.map(b => {
                          const startMin = timeToMin(b.start_time) - 7 * 60;
                          const endMin = timeToMin(b.end_time) - 7 * 60;
                          const totalMins = HOURS.length * 60;
                          const left = (startMin / totalMins) * 100;
                          const width = ((endMin - startMin) / totalMins) * 100;
                          const paid = b.payment_status === "paid";
                          return (
                            <div key={b.id} style={{ position: "absolute", left: `${left}%`, width: `${width}%`, top: 5, bottom: 5, background: s.bg, borderRadius: 8, padding: "3px 7px", overflow: "hidden", cursor: "pointer", minWidth: 6, opacity: paid ? 1 : .85, zIndex: 1 }}
                              title={`${b.player_name || "—"} · ${b.start_time}–${b.end_time}${b.coach_name ? ` · ${b.coach_name}` : ""}${b.notes ? `\n${b.notes}` : ""}`}>
                              <p style={{ fontSize: 10, fontWeight: 800, color: "#fff", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.2 }}>
                                {b.player_name || "Booked"}
                              </p>
                              <p style={{ fontSize: 9, color: "rgba(255,255,255,.7)", margin: 0, whiteSpace: "nowrap", lineHeight: 1.2 }}>
                                {b.start_time}–{b.end_time}
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
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Booking List — {bookings.length} booking{bookings.length !== 1 ? "s" : ""}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {bookings.sort((a, b) => a.start_time.localeCompare(b.start_time)).map(b => {
                  const courtSurface = courts.find(c => c.id === b.court_id)?.surface || "Hard";
                  const s = SURFACE[courtSurface] || SURFACE.Hard;
                  const paid = b.payment_status === "paid";
                  return (
                    <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", background: "var(--c-inner)", borderRadius: 12, border: "1px solid var(--c-border)", borderLeft: `3px solid ${s.color}` }}>
                      {/* Initials avatar */}
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: s.light, border: `1px solid ${s.color}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 900, color: s.color }}>{initials(b.player_name)}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                          <p style={{ fontSize: 14, fontWeight: 800, color: "var(--c-text)", margin: 0 }}>{b.player_name || "—"}</p>
                          <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.light, padding: "2px 8px", borderRadius: 100 }}>{b.court_name}</span>
                          <span style={{ fontSize: 11, color: "var(--c-text-dim)" }}>{b.start_time}–{b.end_time} · {durationLabel(b.start_time, b.end_time)}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          {b.coach_name && <p style={{ fontSize: 12, color: "var(--c-text-muted)", margin: 0 }}>Coach {b.coach_name}</p>}
                          {b.notes && <p style={{ fontSize: 12, color: "var(--c-text-dim)", margin: 0 }}>· {b.notes}</p>}
                        </div>
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
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Surface Type</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {Object.entries(SURFACE).map(([key, val]) => (
                  <button key={key} onClick={() => setCourtForm(f => ({ ...f, surface: key }))}
                    style={{ padding: "12px 16px", borderRadius: 12, border: `2px solid ${courtForm.surface === key ? val.color : "var(--c-border)"}`, background: courtForm.surface === key ? val.light : "var(--c-inner)", cursor: "pointer", textAlign: "left", transition: "all .15s" }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: courtForm.surface === key ? val.color : "var(--c-text-muted)", margin: 0 }}>{key}</p>
                    <p style={{ fontSize: 11, color: "var(--c-text-dim)", margin: 0 }}>{val.label}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Court Name *</label>
              <input value={courtForm.name} onChange={e => setCourtForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Court 1" style={inp} autoFocus onKeyDown={e => e.key === "Enter" && addCourt()} />
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Price / hour</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[20, 30, 50, 70, 100].map(p => (
                  <button key={p} type="button" onClick={() => setCourtForm(f => ({ ...f, price_per_hour: String(p) }))}
                    style={{ padding: "8px 18px", borderRadius: 10, border: `2px solid ${courtForm.price_per_hour === String(p) ? SURFACE[courtForm.surface].color : "var(--c-border)"}`, background: courtForm.price_per_hour === String(p) ? SURFACE[courtForm.surface].light : "var(--c-inner)", cursor: "pointer", fontSize: 14, fontWeight: 700, color: courtForm.price_per_hour === String(p) ? SURFACE[courtForm.surface].color : "var(--c-text-muted)", transition: "all .15s" }}>
                    ${p}
                  </button>
                ))}
              </div>
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
          <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 24, width: "100%", maxWidth: 460, overflow: "hidden", maxHeight: "90vh", overflowY: "auto" }}>
            {/* Header banner */}
            <div style={{ background: (SURFACE[showBooking.surface] || SURFACE.Hard).bg, padding: "26px 30px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".1em", margin: "0 0 4px" }}>Book Court</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0 }}>{showBooking.name}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.7)", margin: "4px 0 0" }}>{(SURFACE[showBooking.surface] || SURFACE.Hard).label}</p>
            </div>
            <div style={{ padding: 26 }}>
              {bookingError && (
                <div style={{ background: "#ef444418", border: "1px solid #ef444433", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#ef4444", fontWeight: 600 }}>⚠ {bookingError}</div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="booking-time-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
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
                <div className="booking-player-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>
                    Email <span style={{ fontSize: 9, color: "var(--c-text-dim)", fontWeight: 500, textTransform: "none" }}>— confirmation sent</span>
                  </label>
                  <input type="email" value={bookingForm.player_email} onChange={e => setBookingForm(f => ({ ...f, player_email: e.target.value }))} placeholder="player@email.com" style={inp} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>Notes</label>
                  <input value={bookingForm.notes} onChange={e => setBookingForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional" style={inp} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button onClick={() => setShowBooking(null)} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1px solid var(--c-border)", background: "var(--c-inner)", color: "var(--c-text-muted)", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancel</button>
                <button onClick={addBooking} disabled={saving}
                  style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: (SURFACE[showBooking.surface] || SURFACE.Hard).color, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: saving ? .7 : 1 }}>
                  {saving ? "Saving..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
