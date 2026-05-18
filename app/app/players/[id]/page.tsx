"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Player { id: number; name: string; age: number; level: string; coach_name: string; monthly_fee: number; status: string; parent_email: string; parent_name: string; notes: string; created_at: string }
interface Invoice { id: number; amount: number; status: string; month: string; due_date: string; paid_at: string }
interface Session { id: number; date: string; duration: number; type: string; coach_name: string; notes: string }

const LEVEL_COLORS: Record<string, string> = { Beginner: "#059669", Intermediate: "#2563eb", Advanced: "#7c3aed", Competitive: "#dc2626" };
const inp: React.CSSProperties = { width: "100%", background: "var(--c-input-bg)", border: "1px solid var(--c-input-border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--c-text)", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
const SESSION_TYPES = ["Training", "Match", "Fitness", "Serve Practice", "Doubles", "Video Analysis"];

export default function PlayerProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  const [sessionForm, setSessionForm] = useState({ date: new Date().toISOString().split("T")[0], duration: "60", type: "Training", coach_name: "", notes: "" });
  const [savingSession, setSavingSession] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [sendingReminder, setSendingReminder] = useState<number | null>(null);
  const [reminderSent, setReminderSent] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", age: "", level: "Intermediate", coach_name: "", parent_email: "", parent_name: "", monthly_fee: "", notes: "", status: "active" });

  useEffect(() => { load(); }, [id]);

  async function load() {
    const r = await fetch(`/api/players/${id}`);
    if (r.status === 404) { router.push("/app/players"); return; }
    const [d, sr] = await Promise.all([r.json(), fetch(`/api/sessions?player_id=${id}`)]);
    const sd = await sr.json();
    setPlayer(d.player); setInvoices(d.invoices || []); setSessions(sd.sessions || []);
    setForm({ name: d.player.name, age: d.player.age?.toString() || "", level: d.player.level, coach_name: d.player.coach_name || "", parent_email: d.player.parent_email || "", parent_name: d.player.parent_name || "", monthly_fee: d.player.monthly_fee?.toString() || "0", notes: d.player.notes || "", status: d.player.status });
    setLoading(false);
  }

  async function addSession() {
    if (!sessionForm.date) return;
    setSavingSession(true);
    await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ player_id: parseInt(id), player_name: player?.name, ...sessionForm, duration: parseInt(sessionForm.duration) || 60 }) });
    const sr = await fetch(`/api/sessions?player_id=${id}`);
    setSessions((await sr.json()).sessions || []);
    setShowAddSession(false);
    setSessionForm({ date: new Date().toISOString().split("T")[0], duration: "60", type: "Training", coach_name: "", notes: "" });
    setSavingSession(false);
  }

  async function deleteSession(sessionId: number) {
    await fetch("/api/sessions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: sessionId }) });
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/players/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, age: parseInt(form.age) || null, monthly_fee: parseInt(form.monthly_fee) || 0 }) });
    await load(); setEditing(false); setSaving(false);
  }

  async function sendReport() {
    setSendingReport(true); setReportError(null);
    const r = await fetch("/api/sessions/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ playerId: parseInt(id) }) });
    const d = await r.json();
    if (!r.ok) setReportError(d.error === "no_email" ? "No parent email on file" : d.error || "Failed to send");
    else { setReportSent(true); setTimeout(() => setReportSent(false), 3000); }
    setSendingReport(false);
  }

  async function sendReminder(sessionId: number) {
    setSendingReminder(sessionId);
    await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ player_id: parseInt(id), session_id: sessionId }) });
    setSendingReminder(null);
    setReminderSent(sessionId);
    setTimeout(() => setReminderSent(null), 3000);
  }

  async function markPaid(invoiceId: number) {
    await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "markPaid", invoiceId }) });
    await load();
  }

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
      <div style={{ width: 32, height: 32, border: "3px solid var(--c-border)", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (!player) return null;

  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.amount, 0);
  const totalSessionHours = (sessions.reduce((s, r) => s + (r.duration || 0), 0) / 60).toFixed(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        @media (max-width: 768px) {
          .player-2col { grid-template-columns: 1fr !important; }
          .training-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .training-btns { width: 100%; justify-content: flex-start; flex-wrap: wrap; }
        }
      `}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link href="/app/players" style={{ fontSize: 13, color: "var(--c-text-muted)", textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--c-text)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--c-text-muted)")}>Players</Link>
        <span style={{ color: "var(--c-text-dim)", fontSize: 13 }}>/</span>
        <span style={{ fontSize: 13, color: "var(--c-text-3)" }}>{player.name}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, background: "var(--c-avatar-bg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "var(--c-avatar-text)" }}>{player.name[0]}</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--c-text)", letterSpacing: "-0.5px", marginBottom: 4 }}>{player.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: LEVEL_COLORS[player.level] || "var(--c-text-muted)", background: (LEVEL_COLORS[player.level] || "#555") + "18", padding: "3px 10px", borderRadius: 100 }}>{player.level}</span>
              <span style={{ fontSize: 12, color: player.status === "active" ? "#059669" : "var(--c-text-muted)", background: player.status === "active" ? "#05966918" : "var(--c-inner)", padding: "3px 10px", borderRadius: 100, fontWeight: 700 }}>{player.status}</span>
            </div>
          </div>
        </div>
        <button onClick={() => setEditing(true)} style={{ background: "var(--c-inner)", color: "var(--c-text)", fontWeight: 600, fontSize: 13, padding: "10px 20px", borderRadius: 10, border: "1px solid var(--c-border)", cursor: "pointer" }}>Edit Profile</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {[
          { label: "Monthly Fee", value: `$${player.monthly_fee}/mo`, color: "var(--c-text)" },
          { label: "Total Paid", value: `$${totalPaid.toLocaleString()}`, color: "#059669" },
          { label: "Pending", value: `$${totalPending.toLocaleString()}`, color: totalPending > 0 ? "#f59e0b" : "var(--c-text-muted)" },
          { label: "Sessions", value: sessions.length, color: "var(--c-text)" },
          { label: "Hours Trained", value: `${totalSessionHours}h`, color: "#7c3aed" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 14, padding: "16px 20px", boxShadow: "var(--c-shadow)" }}>
            <p style={{ fontSize: 11, color: "var(--c-text-dim)", fontWeight: 600, marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="player-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 24, boxShadow: "var(--c-shadow)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 20 }}>Player Info</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Age", value: player.age ? `${player.age} years old` : "—" },
              { label: "Coach", value: player.coach_name || "—" },
              { label: "Parent Name", value: player.parent_name || "—" },
              { label: "Parent Email", value: player.parent_email || "—" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--c-border)", paddingBottom: 12 }}>
                <span style={{ fontSize: 12, color: "var(--c-text-muted)" }}>{label}</span>
                <span style={{ fontSize: 13, color: "var(--c-text-2)", maxWidth: 200, textAlign: "right" }}>{value}</span>
              </div>
            ))}
            {player.notes && (
              <div>
                <p style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 6 }}>Notes</p>
                <p style={{ fontSize: 13, color: "var(--c-text-3)", lineHeight: 1.5 }}>{player.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 24, boxShadow: "var(--c-shadow)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 20 }}>Invoice History</p>
          {invoices.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--c-text-dim)", textAlign: "center", paddingTop: 20 }}>No invoices yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {invoices.map(inv => (
                <div key={inv.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--c-inner)", borderRadius: 10 }}>
                  <div>
                    <p style={{ fontSize: 13, color: "var(--c-text-2)", fontWeight: 600 }}>{inv.month || "—"}</p>
                    <p style={{ fontSize: 11, color: "var(--c-text-dim)" }}>Due {inv.due_date || "—"}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)" }}>${inv.amount}</span>
                    {inv.status === "paid" ? (
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", background: "#05966918", padding: "2px 8px", borderRadius: 100 }}>Paid</span>
                    ) : (
                      <button onClick={() => markPaid(inv.id)} style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", background: "#f59e0b18", padding: "4px 10px", borderRadius: 100, border: "none", cursor: "pointer" }}>Mark Paid</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 24, boxShadow: "var(--c-shadow)" }}>
        <div className="training-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>Training Log</p>
            <p style={{ fontSize: 13, color: "var(--c-text-muted)" }}>{sessions.length} sessions · {totalSessionHours} hours total</p>
          </div>
          <div className="training-btns" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {reportError && <span style={{ fontSize: 12, color: "#ef4444" }}>{reportError}</span>}
            {reportSent && <span style={{ fontSize: 12, color: "#059669", fontWeight: 700 }}>✓ Sent!</span>}
            <button onClick={sendReport} disabled={sendingReport || sessions.length === 0} style={{ background: "none", color: sendingReport ? "var(--c-text-dim)" : "#7c3aed", fontWeight: 600, fontSize: 12, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--c-border)", cursor: sessions.length === 0 ? "not-allowed" : "pointer", opacity: sessions.length === 0 ? .4 : 1 }}>
              {sendingReport ? "Sending..." : "📧 Send to Parent"}
            </button>
            <button onClick={() => setShowAddSession(true)} style={{ background: "var(--c-inner)", color: "var(--c-text)", fontWeight: 600, fontSize: 12, padding: "8px 16px", borderRadius: 8, border: "1px solid var(--c-border)", cursor: "pointer" }}>+ Log Session</button>
          </div>
        </div>
        {sessions.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--c-text-dim)", textAlign: "center", padding: "24px 0" }}>No sessions logged yet</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sessions.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--c-inner)", borderRadius: 10 }}>
                <div style={{ width: 36, height: 36, background: "var(--c-row)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                  {s.type === "Match" ? "🎾" : s.type === "Fitness" ? "💪" : s.type === "Video Analysis" ? "📹" : "🎯"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text-2)" }}>{s.type}</span>
                    <span style={{ fontSize: 11, color: "#7c3aed", background: "#7c3aed18", padding: "2px 8px", borderRadius: 100, fontWeight: 700 }}>{s.duration} min</span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--c-text-dim)" }}>{s.date}{s.coach_name ? ` · ${s.coach_name}` : ""}{s.notes ? ` · ${s.notes}` : ""}</p>
                </div>
                {player.parent_email && (
                  <button onClick={() => sendReminder(s.id)} disabled={sendingReminder === s.id} title="Send reminder to parent"
                    style={{ padding: "4px 8px", background: "none", border: "none", color: reminderSent === s.id ? "#059669" : "var(--c-text-dim)", cursor: "pointer", fontSize: 13 }}>
                    {reminderSent === s.id ? "✓" : sendingReminder === s.id ? "…" : "🔔"}
                  </button>
                )}
                <button onClick={() => deleteSession(s.id)} style={{ padding: "4px 8px", background: "none", border: "none", color: "var(--c-text-dim)", cursor: "pointer", fontSize: 13 }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--c-text-dim)")}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddSession && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
          <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 440 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--c-text)", marginBottom: 24 }}>Log Training Session</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Date", type: "date", key: "date", val: sessionForm.date },
                { label: "Duration (minutes)", type: "number", key: "duration", val: sessionForm.duration },
                { label: "Coach", type: "text", key: "coach_name", val: sessionForm.coach_name },
                { label: "Notes", type: "text", key: "notes", val: sessionForm.notes },
              ].map(({ label, type, key, val }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>{label}</label>
                  <input type={type} value={val} onChange={e => setSessionForm(p => ({ ...p, [key]: e.target.value }))} style={inp} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Type</label>
                <select value={sessionForm.type} onChange={e => setSessionForm(p => ({ ...p, type: e.target.value }))} style={inp}>
                  {SESSION_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setShowAddSession(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-inner)", color: "var(--c-text-muted)", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancel</button>
              <button onClick={addSession} disabled={savingSession} style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: savingSession ? .7 : 1 }}>{savingSession ? "Saving..." : "Log Session"}</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
          <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--c-text)", marginBottom: 24 }}>Edit Player</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { k: "name", label: "Name *", type: "text" },
                { k: "age", label: "Age", type: "number" },
                { k: "coach_name", label: "Coach Name", type: "text" },
                { k: "parent_name", label: "Parent Name", type: "text" },
                { k: "parent_email", label: "Parent Email", type: "email" },
                { k: "monthly_fee", label: "Monthly Fee ($)", type: "number" },
              ].map(({ k, label, type }) => (
                <div key={k}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>{label}</label>
                  <input type={type} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} style={inp} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Level</label>
                <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))} style={inp}>
                  {["Beginner", "Intermediate", "Advanced", "Competitive"].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={inp}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} style={{ ...inp, resize: "vertical" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setEditing(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-inner)", color: "var(--c-text-muted)", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: saving ? .7 : 1 }}>{saving ? "Saving..." : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
