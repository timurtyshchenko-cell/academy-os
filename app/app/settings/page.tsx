"use client";
import { useState, useEffect } from "react";

interface Settings { academy: { id: number; name: string; subscription_status: string; created_at: string }; user: { id: number; name: string; email: string } }

const inp: React.CSSProperties = { width: "100%", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

export default function SettingsPage() {
  const [data, setData] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ academyName: "", userName: "" });

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
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    await load();
  }

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
      <div style={{ width: 32, height: 32, border: "3px solid #1a1a1a", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const subStatus = data?.academy?.subscription_status || "trial";
  const subColors: Record<string, string> = { trial: "#f59e0b", active: "#059669", cancelled: "#ef4444" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 680 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: "-1px", marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 14, color: "#444" }}>Manage your academy and account</p>
      </div>

      {/* Academy info */}
      <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 16, padding: 28 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 20 }}>Academy</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Academy Name</label>
            <input value={form.academyName} onChange={e => setForm(p => ({ ...p, academyName: e.target.value }))} style={inp} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#0c0c0c", borderRadius: 10, border: "1px solid #161616" }}>
            <div>
              <p style={{ fontSize: 12, color: "#555", marginBottom: 2 }}>Subscription Status</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: subColors[subStatus] || "#555", textTransform: "capitalize" }}>{subStatus}</p>
            </div>
            {subStatus === "trial" && (
              <a href="/subscribe" style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: "#2563eb", padding: "8px 18px", borderRadius: 8, textDecoration: "none" }}>
                Upgrade →
              </a>
            )}
          </div>
          <div style={{ padding: "10px 14px", background: "#0c0c0c", borderRadius: 10, border: "1px solid #161616" }}>
            <p style={{ fontSize: 12, color: "#555", marginBottom: 2 }}>Member Since</p>
            <p style={{ fontSize: 13, color: "#888" }}>{data?.academy?.created_at?.split("T")[0] || "—"}</p>
          </div>
        </div>
      </div>

      {/* Account info */}
      <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 16, padding: 28 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 20 }}>Account</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Your Name</label>
            <input value={form.userName} onChange={e => setForm(p => ({ ...p, userName: e.target.value }))} style={inp} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Email</label>
            <div style={{ ...inp, color: "#555", cursor: "not-allowed" }}>{data?.user?.email || "—"}</div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={save} disabled={saving} style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontSize: 14, opacity: saving ? .7 : 1 }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && <span style={{ fontSize: 13, color: "#059669", fontWeight: 600 }}>✓ Saved</span>}
      </div>

      {/* Danger zone */}
      <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 16, padding: 28 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>Danger Zone</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#ccc", marginBottom: 4 }}>Export Data</p>
            <p style={{ fontSize: 12, color: "#444" }}>Download all your academy data as JSON</p>
          </div>
          <button style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #1a1a1a", background: "none", color: "#555", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Export</button>
        </div>
      </div>
    </div>
  );
}
