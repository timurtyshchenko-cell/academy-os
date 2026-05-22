import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ background: "#081418", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", padding: 24, color: "#F5F7FA" }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
      <div style={{ textAlign: "center", maxWidth: 480, position: "relative" }}>
        {/* Glow */}
        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 300, background: "radial-gradient(ellipse,rgba(31,107,69,.1) 0%,transparent 70%)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ width: 64, height: 64, background: "#1F6B45", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#FFD447", fontSize: 26, margin: "0 auto 32px", boxShadow: "0 8px 32px rgba(31,107,69,.35)", animation: "float 4s ease-in-out infinite" }}>A</div>

        {/* 404 */}
        <p style={{ fontSize: 110, fontWeight: 900, color: "rgba(31,107,69,.18)", letterSpacing: "-6px", lineHeight: 1, marginBottom: 8, userSelect: "none" }}>404</p>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#F5F7FA", letterSpacing: "-.5px", marginBottom: 12 }}>Page not found</h1>
        <p style={{ fontSize: 15, color: "#97A6B2", lineHeight: 1.7, marginBottom: 40 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FFD447", color: "#081418", fontWeight: 800, fontSize: 15, padding: "13px 32px", borderRadius: 12, textDecoration: "none", boxShadow: "0 4px 20px rgba(255,212,71,.2)" }}>
            Go home →
          </Link>
          <Link href="/app" style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid rgba(255,255,255,.1)", color: "#97A6B2", fontWeight: 600, fontSize: 15, padding: "13px 32px", borderRadius: 12, textDecoration: "none" }}>
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
