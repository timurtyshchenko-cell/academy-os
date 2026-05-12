"use client";
import { useState, useEffect } from "react";

interface Invoice { id: number; player_name: string; amount: number; status: string; month: string; due_date: string; paid_at: string; created_at: string }

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "paid">("all");
  const [sending, setSending] = useState<number | null>(null);
  const [sentIds, setSentIds] = useState<Set<number>>(new Set());
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const r = await fetch("/api/invoices");
    const d = await r.json();
    setInvoices(d.invoices || []);
    setLoading(false);
  }

  async function generate() {
    setGenerating(true);
    await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "generate" }) });
    await load();
    setGenerating(false);
  }

  async function markPaid(id: number) {
    await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "markPaid", invoiceId: id }) });
    await load();
  }

  async function sendToParent(id: number) {
    setSending(id); setSendError(null);
    const r = await fetch("/api/invoices/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invoiceId: id }) });
    const d = await r.json();
    if (!r.ok) setSendError(d.error || "Failed to send");
    else setSentIds(prev => new Set([...prev, id]));
    setSending(null);
  }

  const filtered = filter === "all" ? invoices : invoices.filter(i => filter === "paid" ? i.status === "paid" : i.status !== "paid");
  const totalPending = invoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.amount, 0);
  const totalCollected = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const pendingCount = invoices.filter(i => i.status !== "paid").length;

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
      <div style={{ width: 32, height: 32, border: "3px solid var(--c-border)", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--c-text)", letterSpacing: "-1px", marginBottom: 4 }}>Billing</h1>
          <p style={{ fontSize: 14, color: "var(--c-text-muted)" }}>{pendingCount} pending · {invoices.length} total invoices</p>
        </div>
        <button onClick={generate} disabled={generating} style={{ background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 10, border: "none", cursor: generating ? "not-allowed" : "pointer", opacity: generating ? .7 : 1, boxShadow: "0 4px 16px rgba(37,99,235,.3)" }}>
          {generating ? "Generating..." : "⚡ Generate Invoices"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {[
          { label: "Collected", value: `$${totalCollected.toLocaleString()}`, color: "#059669", sub: `${invoices.filter(i => i.status === "paid").length} paid` },
          { label: "Pending", value: `$${totalPending.toLocaleString()}`, color: "#f59e0b", sub: `${pendingCount} invoice${pendingCount !== 1 ? "s" : ""}` },
          { label: "Total Billed", value: `$${(totalCollected + totalPending).toLocaleString()}`, color: "var(--c-text)", sub: `${invoices.length} total` },
        ].map(({ label, value, color, sub }) => (
          <div key={label} style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 14, padding: "18px 20px", boxShadow: "var(--c-shadow)" }}>
            <p style={{ fontSize: 11, color: "var(--c-text-dim)", fontWeight: 600, marginBottom: 8 }}>{label}</p>
            <p style={{ fontSize: 26, fontWeight: 900, color, marginBottom: 4 }}>{value}</p>
            <p style={{ fontSize: 12, color: "var(--c-text-dim)" }}>{sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {(["all", "pending", "paid"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "8px 16px", borderRadius: 8, border: "1px solid",
            borderColor: filter === f ? "#2563eb" : "var(--c-border)",
            background: filter === f ? "rgba(37,99,235,.12)" : "transparent",
            color: filter === f ? "#60a5fa" : "var(--c-text-muted)",
            fontSize: 13, fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
          }}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: "var(--c-card)", border: "1px dashed var(--c-border)", borderRadius: 16, padding: 60, textAlign: "center", boxShadow: "var(--c-shadow)" }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>💳</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)", marginBottom: 8 }}>{invoices.length === 0 ? "No invoices yet" : "No invoices match this filter"}</p>
          <p style={{ fontSize: 14, color: "var(--c-text-muted)", marginBottom: 20 }}>{invoices.length === 0 ? "Click Generate Invoices to bill all active players" : "Try a different filter"}</p>
          {invoices.length === 0 && <button onClick={generate} disabled={generating} style={{ background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer" }}>Generate First Invoices →</button>}
        </div>
      ) : (
        <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--c-shadow)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--c-border)", background: "var(--c-inner)" }}>
                {["Player", "Month", "Amount", "Due Date", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: ".08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id} style={{ borderBottom: "1px solid var(--c-border)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--c-row)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, background: "var(--c-avatar-bg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--c-avatar-text)" }}>{(inv.player_name || "?")[0]}</div>
                      <span style={{ fontSize: 14, color: "var(--c-text-2)", fontWeight: 600 }}>{inv.player_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--c-text-3)" }}>{inv.month || "—"}</td>
                  <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "var(--c-text)" }}>${inv.amount.toLocaleString()}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--c-text-muted)" }}>{inv.due_date || "—"}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100, color: inv.status === "paid" ? "#059669" : "#f59e0b", background: inv.status === "paid" ? "#05966918" : "#f59e0b18" }}>
                      {inv.status === "paid" ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {inv.status !== "paid" && (
                        <button onClick={() => markPaid(inv.id)} style={{ fontSize: 12, color: "#2563eb", background: "none", border: "1px solid rgba(37,99,235,.3)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,99,235,.1)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "none"; }}>
                          Mark Paid
                        </button>
                      )}
                      <button onClick={() => sendToParent(inv.id)} disabled={sending === inv.id}
                        style={{ fontSize: 12, color: sentIds.has(inv.id) ? "#059669" : "var(--c-text-3)", background: "none", border: "1px solid", borderColor: sentIds.has(inv.id) ? "rgba(5,150,105,.3)" : "var(--c-border)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600, opacity: sending === inv.id ? .6 : 1 }}
                        onMouseEnter={e => { if (sending !== inv.id) { const el = e.currentTarget; el.style.color = "var(--c-text)"; el.style.borderColor = "var(--c-border-hover)"; } }}
                        onMouseLeave={e => { const el = e.currentTarget; el.style.color = sentIds.has(inv.id) ? "#059669" : "var(--c-text-3)"; el.style.borderColor = sentIds.has(inv.id) ? "rgba(5,150,105,.3)" : "var(--c-border)"; }}>
                        {sending === inv.id ? "Sending..." : sentIds.has(inv.id) ? "✓ Sent" : "📧 Send"}
                      </button>
                    </div>
                    {sendError && sending === null && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{sendError}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
