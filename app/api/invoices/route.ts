import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const invoices = db.prepare("SELECT * FROM invoices WHERE academy_id = ? ORDER BY created_at DESC").all(session.academyId);
  return NextResponse.json({ invoices });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { action, invoiceId } = await req.json();
  const db = getDb();

  if (action === "generate") {
    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "long", year: "numeric" });
    const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split("T")[0];
    const players = db.prepare("SELECT * FROM players WHERE academy_id = ? AND status = 'active' AND monthly_fee > 0").all(session.academyId) as any[];
    for (const p of players) {
      db.prepare("INSERT INTO invoices (academy_id, player_id, player_name, amount, month, due_date) VALUES (?, ?, ?, ?, ?, ?)").run(session.academyId, p.id, p.name, p.monthly_fee, month, dueDate);
    }
    const invoices = db.prepare("SELECT * FROM invoices WHERE academy_id = ? ORDER BY created_at DESC").all(session.academyId);
    return NextResponse.json({ invoices });
  }

  if (action === "markPaid" && invoiceId) {
    db.prepare("UPDATE invoices SET status = 'paid', paid_at = datetime('now') WHERE id = ? AND academy_id = ?").run(invoiceId, session.academyId);
    return NextResponse.json({ success: true });
  }

  if (action === "delete" && invoiceId) {
    db.prepare("DELETE FROM invoices WHERE id = ? AND academy_id = ?").run(invoiceId, session.academyId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
