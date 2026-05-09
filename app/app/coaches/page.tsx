"use client";
import { useState, useEffect } from "react";

interface Coach { id: number; name: string; email: string; specialty: string; status: string; created_at: string }

const inp: React.CSSProperties = { width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#0f172a", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

const SPECIALTIES = ["Singles", "Doubles", "Fitness & Conditioning", "Mental Coaching", "Junior Development", "Serve & Volleys", "Tactics & Strategy", "All-Round"];

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", specialty: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const r = await fetch("/api/coaches");
    const d = await r.json();
    setCoaches(d.coaches || []);
    setLoading(false);
  }

  async function addCoach() {
    if (!form.name) return;
    setSaving(true);
    await fetch("/api/coaches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    await load();
    setShowAdd(false);
    setForm({ name: "", email: "", specialty: "" });
    setSaving(false);
  }

  async function deleteCoach(id: number) {
    if (!confirm("Remove this coach?")) return;
    await fetch("/api/coaches", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await load();
  }

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
      <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", letterSpacing: "-1px", marginBottom: 4 }}>Coaches</h1>
          <p style={{ fontSize: 14, color: "#64748b" }}>{coaches.filter(c => c.status === "active").length} active · {coaches.length} total</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(37,99,235,.25)" }}>
          + Add Coach
        </button>
      </div>

      {coaches.length === 0 ? (
        <div style={{ background: "#fff", border: "1px dashed #cbd5e1", borderRadius: 16, padding: 60, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>🎾</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>No coaches yet</p>
          <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>Add your coaching staff to get started</p>
          <button onClick={() => setShowAdd(true)} style={{ background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer" }}>Add First Coach →</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {coaches.map(c => (
            <div key={c.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 22, transition: "border-color .2s, box-shadow .2s", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = "#cbd5e1"; el.style.boxShadow = "0 4px 12px rgba(0,0,0,.08)"; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = "#e2e8f0"; el.style.boxShadow = "0 1px 4px rgba(0,0,0,.04)"; }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: "#eff6ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#2563eb" }}>{c.name[0]}</div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{c.name}</p>
                    <p style={{ fontSize: 12, color: "#94a3b8" }}>{c.email || "No email"}</p>
                  </div>
                </div>
                <button onClick={() => deleteCoach(c.id)} style={{ padding: "6px 10px", background: "none", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, color: "#94a3b8", cursor: "pointer", transition: "all .15s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#ef4444"; el.style.borderColor = "#ef4444"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#94a3b8"; el.style.borderColor = "#e2e8f0"; }}>✕</button>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 12px" }}>
                <p style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>Specialty</p>
                <p style={{ fontSize: 13, color: "#475569" }}>{c.specialty || "General"}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 32, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,.15)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 24 }}>Add Coach</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { k: "name", label: "Name *", placeholder: "Coach Rivera", type: "text" },
                { k: "email", label: "Email", placeholder: "coach@academy.com", type: "email" },
              ].map(({ k, label, placeholder, type }) => (
                <div key={k}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>{label}</label>
                  <input type={type} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} placeholder={placeholder} style={inp} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Specialty</label>
                <select value={form.specialty} onChange={e => setForm(p => ({ ...p, specialty: e.target.value }))} style={inp}>
                  <option value="">Select specialty...</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancel</button>
              <button onClick={addCoach} disabled={saving} style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: saving ? .7 : 1 }}>
                {saving ? "Adding..." : "Add Coach"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
