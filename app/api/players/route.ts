import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const players = db.prepare("SELECT * FROM players WHERE academy_id = ? ORDER BY created_at DESC").all(session.academyId);
  return NextResponse.json({ players });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { name, age, level, coach_name, parent_email, parent_name, monthly_fee, notes } = body;
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const db = getDb();
  const result = db.prepare(
    "INSERT INTO players (academy_id, name, age, level, coach_name, parent_email, parent_name, monthly_fee, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(session.academyId, name, age || null, level || "Intermediate", coach_name || null, parent_email || null, parent_name || null, monthly_fee || 0, notes || null);
  const player = db.prepare("SELECT * FROM players WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json({ player });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const db = getDb();
  db.prepare("DELETE FROM players WHERE id = ? AND academy_id = ?").run(id, session.academyId);
  return NextResponse.json({ success: true });
}
