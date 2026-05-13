import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Resend } from "resend";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const courtId = searchParams.get("court_id");
  const db = getDb();
  let query = "SELECT * FROM court_bookings WHERE academy_id = ?";
  const params: (string | number)[] = [session.academyId];
  if (date) { query += " AND date = ?"; params.push(date); }
  if (courtId) { query += " AND court_id = ?"; params.push(courtId); }
  query += " ORDER BY date, start_time";
  const bookings = db.prepare(query).all(...params);
  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { court_id, court_name, player_name, player_email, coach_name, date, start_time, end_time, notes } = await req.json();
  if (!court_id || !date || !start_time || !end_time) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  const db = getDb();
  const conflict = db.prepare(
    "SELECT id FROM court_bookings WHERE academy_id = ? AND court_id = ? AND date = ? AND NOT (end_time <= ? OR start_time >= ?)"
  ).get(session.academyId, court_id, date, start_time, end_time);
  if (conflict) return NextResponse.json({ error: "Court already booked at that time" }, { status: 409 });

  const court = db.prepare("SELECT * FROM courts WHERE id = ? AND academy_id = ?").get(court_id, session.academyId) as any;
  const pricePerHour = court?.price_per_hour || 0;
  const [sh, sm] = start_time.split(":").map(Number);
  const [eh, em] = end_time.split(":").map(Number);
  const hours = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
  const totalPrice = Math.round(pricePerHour * hours);

  const result = db.prepare(
    "INSERT INTO court_bookings (academy_id, court_id, court_name, player_name, player_email, coach_name, date, start_time, end_time, notes, total_price, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(session.academyId, court_id, court_name || null, player_name || null, player_email || null, coach_name || null, date, start_time, end_time, notes || null, totalPrice, "unpaid");
  const booking = db.prepare("SELECT * FROM court_bookings WHERE id = ?").get(result.lastInsertRowid);

  if (player_email) {
    try {
      const durationMins = Math.round(hours * 60);
      const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px">
    <div style="text-align:center;margin-bottom:28px">
      <div style="width:44px;height:44px;background:linear-gradient(135deg,#4f46e5,#2563eb);border-radius:13px;display:inline-flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:20px">A</div>
      <p style="font-size:16px;font-weight:800;color:#111827;margin:10px 0 0">${session.academyName}</p>
    </div>
    <div style="background:linear-gradient(135deg,#1e40af,#2563eb);border-radius:20px;padding:36px;text-align:center;margin-bottom:20px">
      <p style="font-size:13px;font-weight:700;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.1em;margin:0 0 8px">🎾 Court Booking Confirmed</p>
      <p style="font-size:28px;font-weight:900;color:#fff;margin:0 0 6px;letter-spacing:-.5px">${court_name}</p>
      <p style="font-size:15px;color:rgba(255,255,255,.75);margin:0">${date} · ${start_time} – ${end_time}</p>
    </div>
    <div style="background:#fff;border-radius:16px;padding:24px 28px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,.06)">
      <table style="width:100%;border-collapse:collapse">
        ${[
          ["Player", player_name || "—"],
          ["Coach", coach_name || "—"],
          ["Duration", `${durationMins} min`],
          ["Total", totalPrice > 0 ? `$${totalPrice}` : "Free"],
          ["Payment", "Pending"],
          ...(notes ? [["Notes", notes]] : []),
        ].map(([label, value]) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;width:40%">
            <p style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;margin:0">${label}</p>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6">
            <p style="font-size:14px;font-weight:600;color:#111827;margin:0">${value}</p>
          </td>
        </tr>`).join("")}
      </table>
    </div>
    <p style="font-size:13px;color:#9ca3af;text-align:center;margin:0">Sent by <strong style="color:#6b7280">${session.academyName}</strong> via AcademyOS</p>
  </div>
</body>
</html>`;
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error: emailError } = await resend.emails.send({
        from: `${session.academyName} <onboarding@resend.dev>`,
        to: player_email,
        subject: `Court booking confirmed — ${court_name} — ${date}`,
        html,
      });
      if (emailError) console.error("Court booking email error:", emailError);
    } catch {}
  }

  return NextResponse.json({ booking });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, payment_status } = await req.json();
  const db = getDb();
  db.prepare("UPDATE court_bookings SET payment_status = ? WHERE id = ? AND academy_id = ?").run(payment_status, id, session.academyId);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const db = getDb();
  db.prepare("DELETE FROM court_bookings WHERE id = ? AND academy_id = ?").run(id, session.academyId);
  return NextResponse.json({ success: true });
}
