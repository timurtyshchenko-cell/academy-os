import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

    const db = getDb();
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const academy = db.prepare("SELECT * FROM academies WHERE owner_id = ?").get(user.id) as any;
    if (!academy) return NextResponse.json({ error: "No academy found" }, { status: 404 });

    await createSession({ id: user.id, email: user.email, name: user.name, academyId: academy.id, academyName: academy.name });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
