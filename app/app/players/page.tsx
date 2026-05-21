"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Player { id: number; name: string; age: number; level: string; coach_name: string; monthly_fee: number; status: string; parent_email: string }

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Competitive"];
const LEVEL_META: Record<string, { color: string; bg: string; light: string }> = {
  Beginner:     { color: "#18B3A4", bg: "linear-gradient(135deg,#0d7a72,#18B3A4)", light: "rgba(24,179,164,.12)" },
  Intermediate: { color: "#1F6B45", bg: "linear-gradient(135deg,#186038,#1F6B45)", light: "rgba(31,107,69,.12)" },
  Advanced:     { color: "#d97706", bg: "linear-gradient(135deg,#92400e,#d97706)", light: "rgba(217,119,6,.12)" },
  Competitive:  { color: "#ef4444", bg: "linear-gradient(135deg,#b91c1c,#ef4444)", light: "rgba(239,68,68,.12)" },
};

const inp: React.CSSProperties = { width: "100%", background: "var(--c-input-bg)", border: "1px solid var(--c-input-border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--c-text)", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

function initials(name: string) {
  if (!name) return "?";
  const p = name.trim().split(" ");
  return (p[0][0] + (p[1]?.[0] || "")).toUpperCase();
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
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

  const activeCount = players.filter(p => p.status === "active").length;
  const totalRevenue = players.filter(p => p.status === "active").reduce((s, p) => s + (p.monthly_fee || 0), 0);
  const avgFee = activeCount > 0 ? Math.round(totalRevenue / activeCount) : 0;

  const filtered = players.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.coach_name || "").toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === "all" || p.level === levelFilter;
    return matchSearch && matchLevel;
  });

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
      <div style={{ width: 32, height: 32, border: "3px solid var(--c-border)", borderTopColor: "#1F6B45", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <style>{`
        @media (max-width: 768px) {
          .players-stats { grid-template-columns: repeat(2,1fr) !important; }
          .players-grid { grid-template-columns: 1fr !important; }
          .players-toolbar { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--c-text)", letterSpacing: "-1px", marginBottom: 4 }}>Players</h1>
          <p style={{ fontSize: 14, color: "var(--c-text-muted)" }}>{activeCount} active · {players.length} total</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          style={{ background: "#1F6B45", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(31,107,69,.3)" }}>
          + Add Player
        </button>
      </div>

      {/* Stats */}
      <div className="players-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { label: "Total Players", value: players.length, color: "#1F6B45" },
          { label: "Active", value: activeCount, color: "#18B3A4" },
          { label: "Monthly Revenue", value: `$${totalRevenue.toLocaleString()}`, color: "#FFD447" },
          { label: "Avg Monthly Fee", value: `$${avgFee}`, color: "#d97706" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderLeft: `3px solid ${s.color}`, borderRadius: 14, padding: "14px 18px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".07em", margin: "0 0 4px" }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: "var(--c-text)", margin: 0, letterSpacing: "-1px" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar: search + level filter */}
      <div className="players-toolbar" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or coach..."
          style={{ ...inp, width: "min(260px,100%)", flex: "0 0 auto" }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button onClick={() => setLevelFilter("all")}
            style={{ padding: "7px 14px", borderRadius: 100, border: "1px solid", borderColor: levelFilter === "all" ? "#1F6B45" : "var(--c-border)", background: levelFilter === "all" ? "rgba(31,107,69,.1)" : "transparent", color: levelFilter === "all" ? "#1F6B45" : "var(--c-text-muted)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            All ({players.length})
          </button>
          {LEVELS.map(l => {
            const m = LEVEL_META[l];
            const cnt = players.filter(p => p.level === l).length;
            const active = levelFilter === l;
            return (
              <button key={l} onClick={() => setLevelFilter(l)}
                style={{ padding: "7px 14px", borderRadius: 100, border: `1px solid ${active ? m.color : "var(--c-border)"}`, background: active ? m.light : "transparent", color: active ? m.color : "var(--c-text-muted)", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .15s" }}>
                {l} ({cnt})
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty */}
      {filtered.length === 0 ? (
        <div style={{ background: "var(--c-card)", border: "2px dashed var(--c-border)", borderRadius: 20, padding: 60, textAlign: "center" }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>👥</p>
          <p style={{ fontSize: 16, fontWeight: 800, color: "var(--c-text)", marginBottom: 8 }}>{search || levelFilter !== "all" ? "No players found" : "No players yet"}</p>
          <p style={{ fontSize: 14, color: "var(--c-text-muted)", marginBottom: 20 }}>{search || levelFilter !== "all" ? "Try a different filter" : "Add your first player to get started"}</p>
          {!search && levelFilter === "all" && <button onClick={() => setShowAdd(true)} style={{ background: "#1F6B45", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer" }}>Add First Player →</button>}
        </div>
      ) : (
        <div className="players-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {filtered.map(p => {
            const meta = LEVEL_META[p.level] || LEVEL_META.Intermediate;
            return (
              <div key={p.id} style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, overflow: "hidden", transition: "transform .15s, box-shadow .15s", boxShadow: "var(--c-shadow)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(0,0,0,.14)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--c-shadow)"; }}>
                {/* Level color strip */}
                <div style={{ height: 4, background: meta.bg }} />
                <div style={{ padding: "16px 18px" }}>
                  {/* Top row: avatar + name + level badge */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 44, height: 44, background: meta.light, border: `2px solid ${meta.color}33`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 14, fontWeight: 900, color: meta.color }}>{initials(p.name)}</span>
                      </div>
                      <div>
                        <Link href={`/app/players/${p.id}`} style={{ fontSize: 15, fontWeight: 800, color: "var(--c-text)", textDecoration: "none", display: "block", lineHeight: 1.2 }}
                          onMouseEnter={e => (e.currentTarget.style.color = meta.color)}
                          onMouseLeave={e => (e.currentTarget.style.color = "var(--c-text)")}>
                          {p.name}
                        </Link>
                        <p style={{ fontSize: 12, color: "var(--c-text-muted)", margin: "2px 0 0" }}>
                          {p.age ? `Age ${p.age}` : "—"}
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, background: meta.light, padding: "3px 10px", borderRadius: 100, flexShrink: 0 }}>{p.level}</span>
                  </div>

                  {/* Info grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                    <div style={{ background: "var(--c-inner)", borderRadius: 8, padding: "8px 11px" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: ".05em", margin: "0 0 2px" }}>Coach</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.coach_name || "—"}</p>
                    </div>
                    <div style={{ background: "var(--c-inner)", borderRadius: 8, padding: "8px 11px" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: ".05em", margin: "0 0 2px" }}>Monthly Fee</p>
                      <p style={{ fontSize: 14, fontWeight: 900, color: p.monthly_fee > 0 ? meta.color : "var(--c-text-dim)", margin: 0 }}>{p.monthly_fee > 0 ? `$${p.monthly_fee}` : "—"}</p>
                    </div>
                  </div>

                  {/* Status + actions */}
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Link href={`/app/players/${p.id}`}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", background: meta.light, border: `1px solid ${meta.color}33`, borderRadius: 9, fontSize: 12, color: meta.color, textDecoration: "none", fontWeight: 700, transition: "all .15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = meta.color; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = meta.light; (e.currentTarget as HTMLElement).style.color = meta.color; }}>
                      View Profile →
                    </Link>
                    <button onClick={() => deletePlayer(p.id)}
                      style={{ width: 34, height: 34, background: "transparent", border: "1px solid var(--c-border)", borderRadius: 9, fontSize: 14, color: "var(--c-text-dim)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#ef4444"; el.style.borderColor = "#ef4444"; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--c-text-dim)"; el.style.borderColor = "var(--c-border)"; }}>✕</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Player Modal */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
          <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 24, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ background: "linear-gradient(135deg,#186038,#1F6B45)", padding: "24px 28px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".1em", margin: "0 0 4px" }}>New Player</p>
              <p style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: 0 }}>Add to your roster</p>
            </div>
            <div style={{ padding: 26 }}>
              {/* Level picker */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Level</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                  {LEVELS.map(l => {
                    const m = LEVEL_META[l];
                    const active = form.level === l;
                    return (
                      <button key={l} onClick={() => setForm(f => ({ ...f, level: l }))}
                        style={{ padding: "10px 12px", borderRadius: 10, border: `2px solid ${active ? m.color : "var(--c-border)"}`, background: active ? m.light : "var(--c-inner)", cursor: "pointer", textAlign: "left", transition: "all .15s" }}>
                        <p style={{ fontSize: 13, fontWeight: 800, color: active ? m.color : "var(--c-text-muted)", margin: 0 }}>{l}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { k: "name", label: "Name *", placeholder: "Alex Martinez", type: "text" },
                    { k: "age", label: "Age", placeholder: "14", type: "number" },
                  ].map(({ k, label, placeholder, type }) => (
                    <div key={k}>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>{label}</label>
                      <input type={type} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} placeholder={placeholder} style={inp} autoFocus={k === "name"} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { k: "coach_name", label: "Coach", placeholder: "Coach Rivera", type: "text" },
                    { k: "monthly_fee", label: "Monthly Fee ($)", placeholder: "800", type: "number" },
                  ].map(({ k, label, placeholder, type }) => (
                    <div key={k}>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>{label}</label>
                      <input type={type} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} placeholder={placeholder} style={inp} />
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>Parent Email</label>
                  <input type="email" value={form.parent_email} onChange={e => setForm(p => ({ ...p, parent_email: e.target.value }))} placeholder="parent@email.com" style={inp} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
                <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1px solid var(--c-border)", background: "var(--c-inner)", color: "var(--c-text-muted)", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancel</button>
                <button onClick={addPlayer} disabled={saving || !form.name}
                  style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: LEVEL_META[form.level]?.color || "#1F6B45", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: saving || !form.name ? .6 : 1 }}>
                  {saving ? "Adding..." : "Add Player"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
