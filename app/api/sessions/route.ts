import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const playerId = searchParams.get("player_id");
  const db = getDb();
  const sessions = playerId
    ? db.prepare("SELECT * FROM sessions WHERE academy_id = ? AND player_id = ? ORDER BY date DESC").all(session.academyId, playerId)
    : db.prepare("SELECT * FROM sessions WHERE academy_id = ? ORDER BY date DESC").all(session.academyId);
  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { player_id, player_name, date, duration, coach_name, type, notes, start_time } = await req.json();
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });
  if (!player_id && !player_name) return NextResponse.json({ error: "player required" }, { status: 400 });
  const db = getDb();
  try {
    const result = db.prepare(
      "INSERT INTO sessions (academy_id, player_id, player_name, date, start_time, duration, coach_name, type, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(session.academyId, player_id || null, player_name || null, date, start_time || null, duration || 60, coach_name || null, type || "Training", notes || null);
    const s = db.prepare("SELECT * FROM sessions WHERE id = ?").get(result.lastInsertRowid);
    return NextResponse.json({ session: s });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "DB error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE id = ? AND academy_id = ?").run(id, session.academyId);
  return NextResponse.json({ success: true });
}
