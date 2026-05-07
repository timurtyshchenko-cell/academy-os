import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  const player = db.prepare("SELECT * FROM players WHERE id = ? AND academy_id = ?").get(id, session.academyId);
  if (!player) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const invoices = db.prepare("SELECT * FROM invoices WHERE player_id = ? ORDER BY created_at DESC").all(id);
  return NextResponse.json({ player, invoices });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { name, age, level, coach_name, parent_email, parent_name, monthly_fee, notes, status } = body;
  const db = getDb();
  db.prepare(`
    UPDATE players SET name=?, age=?, level=?, coach_name=?, parent_email=?, parent_name=?, monthly_fee=?, notes=?, status=?
    WHERE id = ? AND academy_id = ?
  `).run(name, age || null, level, coach_name || null, parent_email || null, parent_name || null, monthly_fee || 0, notes || null, status, id, session.academyId);
  const player = db.prepare("SELECT * FROM players WHERE id = ?").get(id);
  return NextResponse.json({ player });
}
