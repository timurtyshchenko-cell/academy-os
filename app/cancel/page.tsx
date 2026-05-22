import Link from "next/link";

export default function Cancel() {
  return (
    <div style={{ minHeight: "100vh", background: "#081418", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(245,158,11,.1)", border: "2px solid rgba(245,158,11,.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", fontSize: 34 }}>✕</div>

        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#F5F7FA", letterSpacing: "-1px", marginBottom: 12 }}>Payment Cancelled</h1>
        <p style={{ fontSize: 15, color: "#97A6B2", lineHeight: 1.75, marginBottom: 40 }}>
          No worries — your payment was not processed. You can try again when you&apos;re ready, or book a demo first to see AcademyOS in action.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/#pricing" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FFD447", color: "#081418", fontWeight: 800, fontSize: 15, padding: "13px 28px", borderRadius: 12, textDecoration: "none", boxShadow: "0 4px 20px rgba(255,212,71,.2)" }}>
            Try Again →
          </Link>
          <Link href="/book-demo" style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid rgba(255,255,255,.1)", color: "#97A6B2", fontWeight: 600, fontSize: 14, padding: "13px 24px", borderRadius: 12, textDecoration: "none" }}>
            Book a Demo Instead
          </Link>
        </div>
      </div>
    </div>
  );
}
