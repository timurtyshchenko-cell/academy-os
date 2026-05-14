import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendInvoiceEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { invoiceId } = await req.json();
  const db = getDb();

  const invoice = db.prepare("SELECT * FROM invoices WHERE id = ? AND academy_id = ?").get(invoiceId, session.academyId) as any;
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const player = db.prepare("SELECT * FROM players WHERE id = ? AND academy_id = ?").get(invoice.player_id, session.academyId) as any;
  if (!player?.parent_email) return NextResponse.json({ error: "Player has no parent email" }, { status: 400 });

  const academy = db.prepare("SELECT * FROM academies WHERE id = ?").get(session.academyId) as any;

  // Get sessions for this player this month
  const sessions = db.prepare(
    "SELECT * FROM sessions WHERE player_id = ? AND strftime('%Y-%m', date) = strftime('%Y-%m', ?) ORDER BY date ASC"
  ).all(invoice.player_id, invoice.due_date || new Date().toISOString()) as any[];

  console.log("Sending invoice email to:", player.parent_email, "| RESEND_API_KEY length:", process.env.RESEND_API_KEY?.length ?? 0);

  try {
    await sendInvoiceEmail({
      to: player.parent_email,
      playerName: player.name,
      academyName: academy?.name || session.academyName,
      month: invoice.month || "—",
      amount: invoice.amount,
      dueDate: invoice.due_date || "—",
      sessions,
    });
    console.log("Email sent OK to:", player.parent_email);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Email error full:", JSON.stringify(err), err.message, err.statusCode);
    return NextResponse.json({ error: err.message || "Failed to send email" }, { status: 500 });
  }
}
