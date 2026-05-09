import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const email = req.nextUrl.searchParams.get("email");
  if (secret !== "academy_os_admin_2025") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = getDb();
  if (!email) {
    const users = db.prepare("SELECT u.id, u.name, u.email, a.name as academy, a.subscription_status FROM users u LEFT JOIN academies a ON a.owner_id = u.id").all();
    return NextResponse.json({ users });
  }
  const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as any;
  if (!user) return NextResponse.json({ error: "User not found" });
  db.prepare("DELETE FROM academies WHERE owner_id = ?").run(user.id);
  db.prepare("DELETE FROM users WHERE id = ?").run(user.id);
  return NextResponse.json({ success: true, deleted: email });
}
