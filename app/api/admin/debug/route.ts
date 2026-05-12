import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  const db = getDb();

  const academies = db.prepare("SELECT * FROM academies").all();
  const sessions = db.prepare("SELECT * FROM sessions ORDER BY created_at DESC LIMIT 10").all();
  const users = db.prepare("SELECT id, email, name FROM users").all();

  return NextResponse.json({
    cookieSession: session,
    academies,
    sessions,
    users,
  });
}
