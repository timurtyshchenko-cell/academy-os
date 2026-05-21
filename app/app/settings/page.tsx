"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Settings { academy: { id: number; name: string; subscription_status: string; created_at: string }; user: { id: number; name: string; email: string } }

const inp: React.CSSProperties = { width: "100%", background: "var(--c-input-bg)", border: "1px solid var(--c-input-border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--c-text)", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

function initials(name: string) {
  if (!name) return "?";
  const p = name.trim().split(" ");
  return (p[0][0] + (p[1]?.[0] || "")).toUpperCase();
}

const SUB_META: Record<string, { color: string; bg: string; label: string; desc: string }> = {
  trial:     { color: "#f59e0b", bg: "rgba(245,158,11,.1)",  label: "Trial",     desc: "14-day free trial — upgrade to keep access" },
  active:    { color: "#1F6B45", bg: "rgba(31,107,69,.1)",   label: "Active",    desc: "Your subscription is active and up to date" },
  cancelled: { color: "#ef4444", bg: "rgba(239,68,68,.1)",   label: "Cancelled", desc: "Access ends at the current billing period" },
};

export default function SettingsPage() {
  const router = useRouter();
  const [data, setData] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [form, setForm] = useState({ academyName: "", userName: "" });
  const [notifs, setNotifs] = useState({ invoiceEmails: true, reminderEmails: true, weeklyReport: false });

  useEffect(() => { load(); }, []);

  async function load() {
    const r = await fetch("/api/settings");
    const d = await r.json();
    setData(d);
    setForm({ academyName: d.academy?.name || "", userName: d.user?.name || "" });
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    await load();
  }

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
      <div style={{ width: 32, height: 32, border: "3px solid var(--c-border)", borderTopColor: "#1F6B45", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  const subStatus = data?.academy?.subscription_status || "trial";
  const sub = SUB_META[subStatus] || SUB_META.trial;
  const memberSince = data?.academy?.created_at?.split("T")[0] || "—";
  const daysAgo = data?.academy?.created_at ? Math.floor((Date.now() - new Date(data.academy.created_at).getTime()) / 86400000) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 680 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--c-text)", letterSpacing: "-1px", marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 14, color: "var(--c-text-muted)" }}>Manage your academy and account</p>
      </div>

      {/* Profile card */}
      <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 18, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#186038,#1F6B45)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#FFD447" }}>{initials(form.userName || data?.user?.name || "")}</span>
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: "var(--c-text)", margin: 0, letterSpacing: "-.3px" }}>{data?.user?.name || "—"}</p>
            <p style={{ fontSize: 13, color: "var(--c-text-muted)", margin: "2px 0 0" }}>{data?.user?.email}</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Your Name</label>
              <input value={form.userName} onChange={e => setForm(p => ({ ...p, userName: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Email</label>
              <div style={{ ...inp, color: "var(--c-text-muted)", cursor: "not-allowed", opacity: .65 }}>{data?.user?.email || "—"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Academy card */}
      <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 18, padding: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 20 }}>Academy</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Academy Name</label>
            <input value={form.academyName} onChange={e => setForm(p => ({ ...p, academyName: e.target.value }))} style={inp} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: "var(--c-inner)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--c-border)" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 4px" }}>Member Since</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--c-text)", margin: 0 }}>{memberSince}</p>
              <p style={{ fontSize: 11, color: "var(--c-text-dim)", margin: "2px 0 0" }}>{daysAgo} days ago</p>
            </div>
            <div style={{ background: "var(--c-inner)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--c-border)" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 4px" }}>Academy ID</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--c-text)", margin: 0 }}>#{data?.academy?.id || "—"}</p>
              <p style={{ fontSize: 11, color: "var(--c-text-dim)", margin: "2px 0 0" }}>Unique identifier</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={save} disabled={saving}
          style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: "#1F6B45", color: "#fff", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontSize: 14, opacity: saving ? .7 : 1, boxShadow: "0 4px 14px rgba(31,107,69,.25)" }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && (
          <span style={{ fontSize: 13, color: "#1F6B45", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 16 }}>✓</span> Saved
          </span>
        )}
      </div>

      {/* Subscription card */}
      <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 18, padding: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 20 }}>Subscription</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: sub.bg, border: `1px solid ${sub.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              {subStatus === "active" ? "✓" : subStatus === "cancelled" ? "✕" : "⏳"}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: "var(--c-text)", margin: 0 }}>AcademyOS {subStatus === "active" ? "Pro" : "Trial"}</p>
                <span style={{ fontSize: 11, fontWeight: 700, color: sub.color, background: sub.bg, padding: "2px 8px", borderRadius: 100 }}>{sub.label}</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--c-text-muted)", margin: "3px 0 0" }}>{sub.desc}</p>
            </div>
          </div>
          {subStatus === "trial" && (
            <a href="/subscribe" style={{ fontSize: 13, fontWeight: 800, color: "#081418", background: "#FFD447", padding: "10px 22px", borderRadius: 10, textDecoration: "none", whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(255,212,71,.3)" }}>Upgrade →</a>
          )}
          {subStatus === "active" && (
            <a href="/subscribe/manage" style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text-muted)", background: "var(--c-inner)", border: "1px solid var(--c-border)", padding: "10px 18px", borderRadius: 10, textDecoration: "none" }}>Manage</a>
          )}
        </div>
        {subStatus === "trial" && (
          <div style={{ marginTop: 16, background: "rgba(245,158,11,.06)", border: "1px solid rgba(245,158,11,.15)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <p style={{ fontSize: 13, color: "var(--c-text-muted)", margin: 0 }}>Upgrade to keep access after your trial. <strong style={{ color: "#f59e0b" }}>$4,000/year</strong> — unlimited everything.</p>
          </div>
        )}
      </div>

      {/* Notifications card */}
      <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 18, padding: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 20 }}>Notifications</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { key: "invoiceEmails", label: "Invoice emails", desc: "Send invoice to parents when generated" },
            { key: "reminderEmails", label: "Payment reminders", desc: "Auto-send reminders for unpaid invoices" },
            { key: "weeklyReport", label: "Weekly summary", desc: "Email summary of sessions and revenue" },
          ].map((n, i) => (
            <div key={n.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < 2 ? "1px solid var(--c-border)" : "none", gap: 12 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--c-text)", margin: 0 }}>{n.label}</p>
                <p style={{ fontSize: 12, color: "var(--c-text-muted)", margin: "2px 0 0" }}>{n.desc}</p>
              </div>
              <button onClick={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key as keyof typeof p] }))}
                style={{ width: 44, height: 24, borderRadius: 100, border: "none", cursor: "pointer", background: (notifs as any)[n.key] ? "#1F6B45" : "var(--c-inner)", position: "relative", transition: "background .2s", flexShrink: 0, outline: "1px solid var(--c-border)" }}>
                <div style={{ position: "absolute", top: 3, left: (notifs as any)[n.key] ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.3)" }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data export */}
      <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 18, padding: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 16 }}>Data</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--c-text)", margin: 0 }}>Export your data</p>
            <p style={{ fontSize: 12, color: "var(--c-text-muted)", margin: "3px 0 0" }}>Download all players, sessions, invoices as JSON</p>
          </div>
          <button style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-inner)", color: "var(--c-text-muted)", fontSize: 13, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>
            Export JSON
          </button>
        </div>
      </div>

      {/* Logout + Danger Zone */}
      <div style={{ background: "var(--c-card)", border: "1px solid rgba(239,68,68,.15)", borderRadius: 18, padding: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 16 }}>Account Actions</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--c-text)", margin: 0 }}>Sign out</p>
              <p style={{ fontSize: 12, color: "var(--c-text-muted)", margin: "3px 0 0" }}>Sign out from your current session</p>
            </div>
            <button onClick={logout} disabled={loggingOut}
              style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-inner)", color: "var(--c-text-muted)", fontSize: 13, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap", opacity: loggingOut ? .6 : 1 }}>
              {loggingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
          <div style={{ borderTop: "1px solid var(--c-border)", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#ef4444", margin: 0 }}>Delete academy</p>
              <p style={{ fontSize: 12, color: "var(--c-text-muted)", margin: "3px 0 0" }}>Permanently delete all data. Cannot be undone.</p>
            </div>
            <button onClick={() => confirm("Delete your entire academy? This CANNOT be undone.") && alert("Contact support to delete your account.")}
              style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(239,68,68,.3)", background: "rgba(239,68,68,.06)", color: "#ef4444", fontSize: 13, cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
