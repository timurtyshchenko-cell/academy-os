import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ background: "#030305", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{ width: 80, height: 80, background: "linear-gradient(135deg,#4f46e5,#2563eb)", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 36, margin: "0 auto 32px", boxShadow: "0 8px 32px rgba(79,70,229,.4)" }}>A</div>
        <p style={{ fontSize: 96, fontWeight: 900, color: "#1e1e3a", letterSpacing: "-4px", lineHeight: 1, marginBottom: 16 }}>404</p>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.5px", marginBottom: 12 }}>Page not found</h1>
        <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.7, marginBottom: 40 }}>The page you're looking for doesn't exist or has been moved.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{ display: "inline-block", background: "linear-gradient(135deg,#4f46e5,#2563eb)", color: "#fff", fontWeight: 700, fontSize: 15, padding: "13px 32px", borderRadius: 12, textDecoration: "none", boxShadow: "0 8px 28px rgba(79,70,229,.4)" }}>
            Go home →
          </Link>
          <Link href="/app" style={{ display: "inline-block", border: "1px solid #1a1a2e", color: "#475569", fontWeight: 600, fontSize: 15, padding: "13px 32px", borderRadius: 12, textDecoration: "none" }}>
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
