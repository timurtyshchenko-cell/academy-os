import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const FREE_EMAILS = ["timurtyshchenko@gmail.com", "timurtyshenko@gmail.com"];
  const isAdmin = FREE_EMAILS.includes(session.email.toLowerCase());
  let subscriptionStatus = "trial";
  if (isAdmin) {
    subscriptionStatus = "active";
  } else {
    const db = getDb();
    const academy = db.prepare("SELECT subscription_status FROM academies WHERE id = ?").get(session.academyId) as any;
    subscriptionStatus = academy?.subscription_status || "trial";
  }
  return NextResponse.json({ name: session.name, email: session.email, academyName: session.academyName, academyId: session.academyId, subscriptionStatus });
}
