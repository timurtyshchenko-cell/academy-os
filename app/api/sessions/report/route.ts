import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendTrainingReport } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { playerId } = await req.json();
  const db = getDb();

  const player = db.prepare("SELECT * FROM players WHERE id = ? AND academy_id = ?").get(playerId, session.academyId) as any;
  if (!player) return NextResponse.json({ error: "Player not found" }, { status: 404 });
  if (!player.parent_email) return NextResponse.json({ error: "no_email" }, { status: 400 });

  const sessions = db.prepare("SELECT * FROM sessions WHERE player_id = ? ORDER BY date DESC").all(playerId) as any[];
  const academy = db.prepare("SELECT * FROM academies WHERE id = ?").get(session.academyId) as any;

  try {
    await sendTrainingReport({
      to: player.parent_email,
      playerName: player.name,
      academyName: academy?.name || session.academyName,
      sessions,
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Email error:", err);
    return NextResponse.json({ error: err.message || "Failed to send" }, { status: 500 });
  }
}
