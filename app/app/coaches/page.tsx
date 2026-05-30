"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n/context";

interface Coach { id: number; name: string; email: string; specialty: string; status: string; created_at: string }
interface Player { id: number; name: string; coach_name: string; status: string }

const inp: React.CSSProperties = { width: "100%", background: "var(--c-input-bg)", border: "1px solid var(--c-input-border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--c-text)", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

const SPECIALTIES = ["Singles", "Doubles", "Fitness & Conditioning", "Mental Coaching", "Junior Development", "Serve & Volleys", "Tactics & Strategy", "All-Round"];

const SPECIALTY_META: Record<string, { color: string; light: string }> = {
  "Singles":               { color: "#1F6B45", light: "rgba(31,107,69,.12)" },
  "Doubles":               { color: "#18B3A4", light: "rgba(24,179,164,.12)" },
  "Fitness & Conditioning":{ color: "#e07b4f", light: "rgba(224,123,79,.12)" },
  "Mental Coaching":       { color: "#9b59b6", light: "rgba(155,89,182,.12)" },
  "Junior Development":    { color: "#FFD447", light: "rgba(255,212,71,.12)" },
  "Serve & Volleys":       { color: "#d97706", light: "rgba(217,119,6,.12)" },
  "Tactics & Strategy":    { color: "#635bff", light: "rgba(99,91,255,.12)" },
  "All-Round":             { color: "#059669", light: "rgba(5,150,105,.12)" },
};

const AVATAR_COLORS = ["#1F6B45","#18B3A4","#9b59b6","#d97706","#635bff","#e07b4f","#059669","#ef4444"];

function initials(name: string) {
  if (!name) return "?";
  const p = name.trim().split(" ");
  return (p[0][0] + (p[1]?.[0] || "")).toUpperCase();
}

export default function CoachesPage() {
  const { t } = useLang();
  const co = t.coaches;
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", specialty: "All-Round" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const [cr, pr] = await Promise.all([fetch("/api/coaches"), fetch("/api/players")]);
    const [cd, pd] = await Promise.all([cr.json(), pr.json()]);
    setCoaches(cd.coaches || []);
    setPlayers(pd.players || []);
    setLoading(false);
  }

  async function addCoach() {
    if (!form.name) return;
    setSaving(true);
    await fetch("/api/coaches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    await loadAll();
    setShowAdd(false);
    setForm({ name: "", email: "", specialty: "All-Round" });
    setSaving(false);
  }

  async function deleteCoach(id: number) {
    if (!confirm("Remove this coach?")) return;
    await fetch("/api/coaches", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await loadAll();
  }

  const activeCount = coaches.filter(c => c.status === "active").length;
  const specialtiesCovered = new Set(coaches.map(c => c.specialty).filter(Boolean)).size;

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
      <div style={{ width: 32, height: 32, border: "3px solid var(--c-border)", borderTopColor: "#1F6B45", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <style>{`
        @media (max-width: 768px) {
          .coaches-stats { grid-template-columns: repeat(2,1fr) !important; }
          .coaches-grid { grid-template-columns: 1fr !important; }
          .spec-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--c-text)", letterSpacing: "-1px", marginBottom: 4 }}>{co.title}</h1>
          <p style={{ fontSize: 14, color: "var(--c-text-muted)" }}>{activeCount} {co.active_label} · {coaches.length} {co.total_label}</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          style={{ background: "#1F6B45", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(31,107,69,.3)" }}>
          {co.addCoach}
        </button>
      </div>

      {/* Stats */}
      <div className="coaches-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {[
          { label: "Total Coaches", value: coaches.length, color: "#1F6B45" },
          { label: "Active", value: activeCount, color: "#18B3A4" },
          { label: "Specialties", value: specialtiesCovered, color: "#9b59b6" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderLeft: `3px solid ${s.color}`, borderRadius: 14, padding: "14px 18px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".07em", margin: "0 0 4px" }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: "var(--c-text)", margin: 0, letterSpacing: "-1px" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Empty */}
      {coaches.length === 0 ? (
        <div style={{ background: "var(--c-card)", border: "2px dashed var(--c-border)", borderRadius: 20, padding: 60, textAlign: "center" }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🎾</p>
          <p style={{ fontSize: 16, fontWeight: 800, color: "var(--c-text)", marginBottom: 8 }}>{co.noCoachesYet}</p>
          <p style={{ fontSize: 14, color: "var(--c-text-muted)", marginBottom: 20 }}>{co.noCoachesDesc}</p>
          <button onClick={() => setShowAdd(true)} style={{ background: "#1F6B45", color: "#fff", fontWeight: 700, fontSize: 14, padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer" }}>{co.addFirstCoachBtn}</button>
        </div>
      ) : (
        <div className="coaches-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {coaches.map((c, idx) => {
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const specMeta = SPECIALTY_META[c.specialty] || { color: "#607080", light: "rgba(96,112,128,.12)" };
            const playerCount = players.filter(p => (p.coach_name || "").toLowerCase() === c.name.toLowerCase() && p.status === "active").length;
            return (
              <div key={c.id} style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, overflow: "hidden", transition: "transform .15s, box-shadow .15s", boxShadow: "var(--c-shadow)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(0,0,0,.14)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--c-shadow)"; }}>
                {/* Colored top strip */}
                <div style={{ height: 4, background: `linear-gradient(90deg, ${avatarColor}, ${specMeta.color})` }} />
                <div style={{ padding: "18px 18px 16px" }}>
                  {/* Avatar + name */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: avatarColor + "22", border: `2px solid ${avatarColor}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 15, fontWeight: 900, color: avatarColor }}>{initials(c.name)}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 800, color: "var(--c-text)", margin: 0, lineHeight: 1.2 }}>{c.name}</p>
                        <p style={{ fontSize: 12, color: "var(--c-text-muted)", margin: "3px 0 0" }}>{c.email || co.noEmail}</p>
                      </div>
                    </div>
                    <button onClick={() => deleteCoach(c.id)}
                      style={{ width: 30, height: 30, background: "transparent", border: "1px solid var(--c-border)", borderRadius: 8, fontSize: 13, color: "var(--c-text-dim)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#ef4444"; el.style.borderColor = "#ef4444"; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--c-text-dim)"; el.style.borderColor = "var(--c-border)"; }}>✕</button>
                  </div>

                  {/* Specialty + player count */}
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    {c.specialty ? (
                      <span style={{ fontSize: 12, fontWeight: 700, color: specMeta.color, background: specMeta.light, padding: "4px 12px", borderRadius: 100 }}>{c.specialty}</span>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--c-text-dim)", background: "var(--c-inner)", border: "1px solid var(--c-border)", padding: "4px 12px", borderRadius: 100 }}>General</span>
                    )}
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--c-text-muted)", background: "var(--c-inner)", border: "1px solid var(--c-border)", padding: "4px 10px", borderRadius: 100 }}>
                      {playerCount} {playerCount !== 1 ? co.players : co.player}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Coach Modal */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
          <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 24, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ background: "linear-gradient(135deg,#186038,#1F6B45)", padding: "24px 28px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".1em", margin: "0 0 4px" }}>{co.newCoach}</p>
              <p style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: 0 }}>{co.addToStaff}</p>
            </div>
            <div style={{ padding: 26 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { k: "name", label: co.name, placeholder: "Coach Rivera", type: "text" },
                    { k: "email", label: co.email, placeholder: "coach@academy.com", type: "email" },
                  ].map(({ k, label, placeholder, type }) => (
                    <div key={k}>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>{label}</label>
                      <input type={type} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} placeholder={placeholder} style={inp} autoFocus={k === "name"} />
                    </div>
                  ))}
                </div>
                {/* Specialty picker */}
                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>{co.specialty}</label>
                  <div className="spec-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6 }}>
                    {SPECIALTIES.map(s => {
                      const m = SPECIALTY_META[s] || { color: "#607080", light: "rgba(96,112,128,.12)" };
                      const active = form.specialty === s;
                      return (
                        <button key={s} onClick={() => setForm(f => ({ ...f, specialty: s }))}
                          style={{ padding: "9px 12px", borderRadius: 10, border: `2px solid ${active ? m.color : "var(--c-border)"}`, background: active ? m.light : "var(--c-inner)", cursor: "pointer", textAlign: "left", transition: "all .15s" }}>
                          <p style={{ fontSize: 12, fontWeight: 800, color: active ? m.color : "var(--c-text-muted)", margin: 0 }}>{s}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
                <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1px solid var(--c-border)", background: "var(--c-inner)", color: "var(--c-text-muted)", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>{co.cancel}</button>
                <button onClick={addCoach} disabled={saving || !form.name}
                  style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: "#1F6B45", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: saving || !form.name ? .6 : 1 }}>
                  {saving ? co.adding : co.addCoachBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
