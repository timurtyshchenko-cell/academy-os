import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const academy = db.prepare("SELECT * FROM academies WHERE id = ?").get(session.academyId) as any;
  const user = db.prepare("SELECT id, name, email FROM users WHERE id = ?").get(academy.owner_id) as any;
  return NextResponse.json({ academy, user });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { academyName, userName } = await req.json();
  const db = getDb();
  const academy = db.prepare("SELECT * FROM academies WHERE id = ?").get(session.academyId) as any;
  if (academyName) db.prepare("UPDATE academies SET name = ? WHERE id = ?").run(academyName, session.academyId);
  if (userName) db.prepare("UPDATE users SET name = ? WHERE id = ?").run(userName, academy.owner_id);
  return NextResponse.json({ success: true });
}
