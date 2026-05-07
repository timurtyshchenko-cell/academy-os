import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const coaches = db.prepare("SELECT * FROM coaches WHERE academy_id = ? ORDER BY created_at DESC").all(session.academyId);
  return NextResponse.json({ coaches });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, email, specialty } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const db = getDb();
  const result = db.prepare("INSERT INTO coaches (academy_id, name, email, specialty) VALUES (?, ?, ?, ?)").run(session.academyId, name, email || null, specialty || null);
  const coach = db.prepare("SELECT * FROM coaches WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json({ coach });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const db = getDb();
  db.prepare("DELETE FROM coaches WHERE id = ? AND academy_id = ?").run(id, session.academyId);
  return NextResponse.json({ success: true });
}
