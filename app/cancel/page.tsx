import Link from "next/link";

export default function Cancel() {
  return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>💳</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "-1px", marginBottom: 12 }}>Payment Cancelled</h1>
        <p style={{ fontSize: 15, color: "#555", lineHeight: 1.7, marginBottom: 36 }}>
          No worries — your payment was not processed. You can try again when you are ready, or book a demo first to see AcademyOS in action.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{ background: "#2563eb", color: "#fff", fontWeight: 800, fontSize: 15, padding: "13px 28px", borderRadius: 12, textDecoration: "none", boxShadow: "0 4px 20px rgba(37,99,235,.3)" }}>
            Try Again
          </Link>
          <Link href="/book-demo" style={{ border: "1px solid #1a1a1a", color: "#555", fontWeight: 600, fontSize: 14, padding: "13px 24px", borderRadius: 12, textDecoration: "none" }}>
            Book a Demo Instead
          </Link>
        </div>
      </div>
    </div>
  );
}
