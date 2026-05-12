import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const courts = db.prepare("SELECT * FROM courts WHERE academy_id = ? ORDER BY name").all(session.academyId);
  return NextResponse.json({ courts });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, surface } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const db = getDb();
  const result = db.prepare("INSERT INTO courts (academy_id, name, surface) VALUES (?, ?, ?)").run(session.academyId, name, surface || "Hard");
  const court = db.prepare("SELECT * FROM courts WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json({ court });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const db = getDb();
  db.prepare("DELETE FROM courts WHERE id = ? AND academy_id = ?").run(id, session.academyId);
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = await req.json();
  const db = getDb();
  db.prepare("UPDATE courts SET status = ? WHERE id = ? AND academy_id = ?").run(status, id, session.academyId);
  return NextResponse.json({ success: true });
}
