"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Player { id: number; name: string; age: number; level: string; coach_name: string; monthly_fee: number; status: string; parent_email: string }

const LEVEL_COLORS: Record<string, string> = { Beginner: "#059669", Intermediate: "#1F6B45", Advanced: "#FFD447", Competitive: "#dc2626" };
const inp: React.CSSProperties = { width: "100%", background: "var(--c-input-bg)", border: "1px solid var(--c-input-border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--c-text)", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", age: "", level: "Intermediate", coach_name: "", parent_email: "", monthly_fee: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const r = await fetch("/api/players");
    const d = await r.json();
    setPlayers(d.players || []);
    setLoading(false);
  }

  async function addPlayer() {
    if (!form.name) return;
    setSaving(true);
    await fetch("/api/players", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, age: parseInt(form.age) || null, monthly_fee: parseInt(form.monthly_fee) || 0 }) });
    await load();
    setShowAdd(false);
    setForm({ name: "", age: "", level: "Intermediate", coach_name: "", parent_email: "", monthly_fee: "" });
    setSaving(false);
  }

  async function deletePlayer(id: number) {
    if (!confirm("Remove this player?")) return;
    await fetch("/api/players", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await load();
  }

  const filtered = players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.coach_name || "").toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}><div style={{ width: 32, height: 32, border: "3px solid var(--c-border)", borderTopColor: "#1F6B45", borderRadius: "50%", animation: "spin 1s linear infinite" }} /></div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--c-text)", letterSpacing: "-1px", marginBottom: 4 }}>Players</h1>
          <p style={{ fontSize: 14, color: "var(--c-text-muted)" }}>{players.filter(p => p.status === "active").length} active · {players.length} total</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ background: "#1F6B45", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(31,107,69,.3)" }}>+ Add Player</button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players or coaches..." style={{ ...inp, width: "min(280px, 100%)" }} />

      {filtered.length === 0 ? (
        <div style={{ background: "var(--c-card)", border: "1px dashed var(--c-border)", borderRadius: 16, padding: 60, textAlign: "center", boxShadow: "var(--c-shadow)" }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>👥</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)", marginBottom: 8 }}>{search ? "No players found" : "No players yet"}</p>
          <p style={{ fontSize: 14, color: "var(--c-text-muted)", marginBottom: 20 }}>{search ? "Try a different search" : "Add your first player to get started"}</p>
          {!search && <button onClick={() => setShowAdd(true)} style={{ background: "#1F6B45", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer" }}>Add First Player →</button>}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filtered.map(p => (
            <div key={p.id} style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 20, transition: "border-color .2s", boxShadow: "var(--c-shadow)" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--c-border-hover)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--c-border)")}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: "var(--c-avatar-bg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "var(--c-avatar-text)" }}>{p.name[0]}</div>
                  <div>
                    <Link href={`/app/players/${p.id}`} style={{ fontSize: 15, fontWeight: 700, color: "var(--c-text)", textDecoration: "none" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#18B3A4")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--c-text)")}>
                      {p.name}
                    </Link>
                    <p style={{ fontSize: 12, color: "var(--c-text-muted)" }}>{p.age ? `Age ${p.age}` : "—"}</p>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: LEVEL_COLORS[p.level] || "var(--c-text-muted)", background: (LEVEL_COLORS[p.level] || "#555") + "18", padding: "3px 10px", borderRadius: 100 }}>{p.level}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                <div style={{ background: "var(--c-inner)", borderRadius: 8, padding: "8px 12px" }}>
                  <p style={{ fontSize: 10, color: "var(--c-text-dim)", marginBottom: 2 }}>Coach</p>
                  <p style={{ fontSize: 13, color: "var(--c-text-3)" }}>{p.coach_name || "—"}</p>
                </div>
                <div style={{ background: "var(--c-inner)", borderRadius: 8, padding: "8px 12px" }}>
                  <p style={{ fontSize: 10, color: "var(--c-text-dim)", marginBottom: 2 }}>Monthly Fee</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)" }}>${p.monthly_fee}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link href={`/app/players/${p.id}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", background: "var(--c-inner)", border: "1px solid var(--c-border)", borderRadius: 8, fontSize: 12, color: "var(--c-text-3)", textDecoration: "none", fontWeight: 600, transition: "all .15s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--c-text)"; el.style.borderColor = "#1F6B45"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--c-text-3)"; el.style.borderColor = "var(--c-border)"; }}>
                  View Profile →
                </Link>
                <button onClick={() => deletePlayer(p.id)} style={{ padding: "8px 12px", background: "none", border: "1px solid var(--c-border)", borderRadius: 8, fontSize: 12, color: "var(--c-text-dim)", cursor: "pointer", transition: "all .15s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#ef4444"; el.style.borderColor = "#ef4444"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--c-text-dim)"; el.style.borderColor = "var(--c-border)"; }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
          <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 480 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--c-text)", marginBottom: 24 }}>Add Player</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { k: "name", label: "Name *", placeholder: "Alex Martinez", type: "text" },
                { k: "age", label: "Age", placeholder: "14", type: "number" },
                { k: "coach_name", label: "Coach Name", placeholder: "Coach Rivera", type: "text" },
                { k: "parent_email", label: "Parent Email", placeholder: "parent@email.com", type: "email" },
                { k: "monthly_fee", label: "Monthly Fee ($)", placeholder: "800", type: "number" },
              ].map(({ k, label, placeholder, type }) => (
                <div key={k}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>{label}</label>
                  <input type={type} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} placeholder={placeholder} style={inp} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Level</label>
                <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))} style={inp}>
                  {["Beginner", "Intermediate", "Advanced", "Competitive"].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-inner)", color: "var(--c-text-muted)", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancel</button>
              <button onClick={addPlayer} disabled={saving} style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: "#1F6B45", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: saving ? .7 : 1 }}>{saving ? "Adding..." : "Add Player"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
