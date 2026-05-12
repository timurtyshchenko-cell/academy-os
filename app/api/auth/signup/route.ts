import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, academy } = await req.json();
    if (!name || !email || !password || !academy) return NextResponse.json({ error: "All fields required" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

    const db = getDb();
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 400 });

    const hash = await bcrypt.hash(password, 10);
    const userResult = db.prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)").run(name, email, hash);
    const userId = userResult.lastInsertRowid as number;

    const FREE_EMAILS = ["timurtyshchenko@gmail.com", "timurtyshenko@gmail.com"];
    const isOwner = FREE_EMAILS.includes(email.toLowerCase());
    const academyResult = db.prepare("INSERT INTO academies (name, owner_id, subscription_status) VALUES (?, ?, ?)").run(academy, userId, isOwner ? "active" : "trial");
    const academyId = academyResult.lastInsertRowid as number;

    await createSession({ id: userId, email, name, academyId, academyName: academy });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
