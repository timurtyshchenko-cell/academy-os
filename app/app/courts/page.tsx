"use client";
import { useState, useEffect } from "react";

interface Court { id: number; name: string; surface: string; status: string }
interface Booking { id: number; court_id: number; court_name: string; player_name: string; coach_name: string; date: string; start_time: string; end_time: string; notes: string }

const SURFACE_COLORS: Record<string, string> = { Hard: "#2563eb", Clay: "#d97706", Grass: "#059669", Indoor: "#7c3aed" };

const inp: React.CSSProperties = { width: "100%", background: "var(--c-input-bg)", border: "1px solid var(--c-input-border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--c-text)", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

export default function CourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCourt, setShowAddCourt] = useState(false);
  const [showBooking, setShowBooking] = useState<Court | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  });
  const [courtForm, setCourtForm] = useState({ name: "", surface: "Hard" });
  const [bookingForm, setBookingForm] = useState({ player_name: "", coach_name: "", date: "", start_time: "09:00", end_time: "10:00", notes: "" });
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    const res = await fetch("/api/court-bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...bookingForm, court_id: showBooking.id, court_name: showBooking.name }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || "Failed"); setSaving(false); return; }
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--c-text)", letterSpacing: "-1px", marginBottom: 4 }}>Courts</h1>
          <p style={{ fontSize: 14, color: "var(--c-text-muted)" }}>{courts.filter(c => c.status === "available").length} available · {courts.length} total</p>
        </div>
        <button onClick={() => setShowAddCourt(true)} style={{ background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(37,99,235,.3)" }}>+ Add Court</button>
      </div>

      {courts.length === 0 ? (
        <div style={{ background: "var(--c-card)", border: "1px dashed var(--c-border)", borderRadius: 16, padding: 60, textAlign: "center" }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>🎾</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)", marginBottom: 8 }}>No courts yet</p>
          <p style={{ fontSize: 14, color: "var(--c-text-muted)", marginBottom: 20 }}>Add your courts to start booking</p>
          <button onClick={() => setShowAddCourt(true)} style={{ background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer" }}>Add First Court →</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {courts.map(court => {
            const color = SURFACE_COLORS[court.surface] || "#2563eb";
            const avail = court.status === "available";
            return (
              <div key={court.id} style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 20, boxShadow: "var(--c-shadow)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, background: color + "18", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎾</div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 800, color: "var(--c-text)", margin: 0 }}>{court.name}</p>
                      <span style={{ fontSize: 11, fontWeight: 700, color, background: color + "18", padding: "2px 8px", borderRadius: 100 }}>{court.surface}</span>
                    </div>
                  </div>
                  <button onClick={() => toggleStatus(court)} style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 100, border: "none", cursor: "pointer", background: avail ? "#05966918" : "#dc262618", color: avail ? "#059669" : "#dc2626" }}>
                    {avail ? "Available" : "Maintenance"}
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setBookingForm(f => ({ ...f, date: selectedDate })); setShowBooking(court); }}
                    disabled={!avail}
                    style={{ flex: 1, padding: "8px", background: avail ? "#2563eb" : "var(--c-inner)", border: `1px solid ${avail ? "#2563eb" : "var(--c-border)"}`, borderRadius: 8, fontSize: 12, color: avail ? "#fff" : "var(--c-text-dim)", cursor: avail ? "pointer" : "not-allowed", fontWeight: 700 }}>
                    Book
                  </button>
                  <button onClick={() => deleteCourt(court.id)} style={{ padding: "8px 12px", background: "none", border: "1px solid var(--c-border)", borderRadius: 8, fontSize: 12, color: "var(--c-text-dim)", cursor: "pointer" }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#ef4444"; el.style.borderColor = "#ef4444"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--c-text-dim)"; el.style.borderColor = "var(--c-border)"; }}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bookings for selected date */}
      <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 24, boxShadow: "var(--c-shadow)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", margin: 0 }}>Bookings</p>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ ...inp, width: "auto", padding: "6px 12px" }} />
        </div>
        {bookings.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--c-text-dim)", textAlign: "center", padding: "20px 0" }}>No bookings for this date</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {bookings.map(b => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--c-inner)", borderRadius: 10, border: "1px solid var(--c-border)" }}>
                <span style={{ fontSize: 16 }}>🎾</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)", margin: 0 }}>{b.court_name} · {b.start_time}–{b.end_time}</p>
                  <p style={{ fontSize: 12, color: "var(--c-text-muted)", margin: 0 }}>{b.player_name || "—"}{b.coach_name ? ` · Coach: ${b.coach_name}` : ""}{b.notes ? ` · ${b.notes}` : ""}</p>
                </div>
                <button onClick={() => deleteBooking(b.id)} style={{ background: "none", border: "none", color: "var(--c-text-dim)", cursor: "pointer", fontSize: 14 }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--c-text-dim)")}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Court Modal */}
      {showAddCourt && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
          <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 400 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--c-text)", marginBottom: 24 }}>Add Court</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Court Name *</label>
                <input value={courtForm.name} onChange={e => setCourtForm(f => ({ ...f, name: e.target.value }))} placeholder="Court 1" style={inp} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Surface</label>
                <select value={courtForm.surface} onChange={e => setCourtForm(f => ({ ...f, surface: e.target.value }))} style={inp}>
                  {["Hard", "Clay", "Grass", "Indoor"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setShowAddCourt(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-inner)", color: "var(--c-text-muted)", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancel</button>
              <button onClick={addCourt} disabled={saving} style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: saving ? .7 : 1 }}>{saving ? "Adding..." : "Add Court"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Book Court Modal */}
      {showBooking && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
          <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 440 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--c-text)", marginBottom: 4 }}>Book {showBooking.name}</h2>
            <p style={{ fontSize: 13, color: "var(--c-text-muted)", marginBottom: 24 }}>{showBooking.surface} court</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { k: "date", label: "Date *", type: "date" },
                { k: "start_time", label: "Start Time *", type: "time" },
                { k: "end_time", label: "End Time *", type: "time" },
                { k: "player_name", label: "Player", type: "text", placeholder: "Alex Martinez" },
                { k: "coach_name", label: "Coach", type: "text", placeholder: "Coach Rivera" },
                { k: "notes", label: "Notes", type: "text", placeholder: "Optional" },
              ].map(({ k, label, type, placeholder }) => (
                <div key={k}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>{label}</label>
                  <input type={type} value={(bookingForm as any)[k]} onChange={e => setBookingForm(f => ({ ...f, [k]: e.target.value }))} placeholder={placeholder} style={inp} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setShowBooking(null)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-inner)", color: "var(--c-text-muted)", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancel</button>
              <button onClick={addBooking} disabled={saving} style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: saving ? .7 : 1 }}>{saving ? "Booking..." : "Confirm Booking"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
