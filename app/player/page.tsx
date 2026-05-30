"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

interface Session { id: number; date: string; start_time: string | null; duration: number; type: string; coach_name: string; notes: string; }
interface Player { name: string; age: number; level: string; coach_name: string; }

export default function PlayerPortal() {
  const supabase = createClient();
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { init(); }, []);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: profile } = await supabase.from("profiles").select("role,player_id,academy_id").eq("id", user.id).single();
    if (!profile || profile.role !== "player") { router.push("/login"); return; }

    const [sRes, pRes] = await Promise.all([
      fetch(`/api/portal/sessions?player_id=${profile.player_id}&academy_id=${profile.academy_id}`),
      fetch(`/api/portal/player?player_id=${profile.player_id}&academy_id=${profile.academy_id}`),
    ]);
    const sData = await sRes.json();
    const pData = await pRes.json();
    setSessions(sData.sessions || []);
    setPlayer(pData.player || null);
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTopColor: "#1F6B45", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const totalMin = sessions.reduce((s, x) => s + x.duration, 0);
  const LEVEL_COLOR: Record<string, string> = { Beginner: "#18B3A4", Intermediate: "#1F6B45", Advanced: "#d97706", Competitive: "#ef4444" };
  const color = LEVEL_COLOR[player?.level || ""] || "#1F6B45";

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg,#186038,#1F6B45)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: "rgba(255,255,255,.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: "#FFD447" }}>A</span>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".1em", margin: 0 }}>Портал игрока</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: 0 }}>{player?.name || ""}</p>
          </div>
        </div>
        <button onClick={signOut} style={{ background: "rgba(255,255,255,.15)", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Выйти</button>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20 }}>
        {player && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              { label: "Уровень", value: player.level, color },
              { label: "Тренировок", value: sessions.length, color: "#18B3A4" },
              { label: "Часов", value: `${(totalMin / 60).toFixed(1)}ч`, color: "#d97706" },
            ].map(s => (
              <div key={s.label} style={{ background: "#fff", border: `1px solid #e5e7eb`, borderLeft: `3px solid ${s.color}`, borderRadius: 12, padding: "14px 16px" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 4px" }}>{s.label}</p>
                <p style={{ fontSize: 18, fontWeight: 900, color: "#111827", margin: 0 }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#111827", margin: 0 }}>История тренировок</p>
          </div>
          {sessions.length === 0 ? (
            <div style={{ padding: "24px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>Тренировок пока нет</p>
            </div>
          ) : sessions.slice(0, 20).map(s => (
            <div key={s.id} style={{ padding: "14px 20px", borderBottom: "1px solid #f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 2px" }}>{s.type}</p>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{s.date}{s.start_time ? ` · ${s.start_time}` : ""}{s.coach_name ? ` · ${s.coach_name}` : ""}</p>
                {s.notes && <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>{s.notes}</p>}
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1F6B45", background: "rgba(31,107,69,.08)", padding: "4px 10px", borderRadius: 100, flexShrink: 0 }}>{s.duration} мин</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
