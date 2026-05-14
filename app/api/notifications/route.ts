import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { player_id, session_id } = await req.json();
  const db = getDb();

  const player = db.prepare("SELECT * FROM players WHERE id = ? AND academy_id = ?").get(player_id, session.academyId) as any;
  if (!player) return NextResponse.json({ error: "Player not found" }, { status: 404 });
  if (!player.parent_email) return NextResponse.json({ error: "No parent email on file" }, { status: 400 });

  const trainingSession = session_id
    ? db.prepare("SELECT * FROM sessions WHERE id = ? AND academy_id = ?").get(session_id, session.academyId) as any
    : db.prepare("SELECT * FROM sessions WHERE player_id = ? AND academy_id = ? ORDER BY date DESC LIMIT 1").get(player_id, session.academyId) as any;

  if (!trainingSession) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px">
    <div style="text-align:center;margin-bottom:28px">
      <div style="width:44px;height:44px;background:linear-gradient(135deg,#4f46e5,#2563eb);border-radius:13px;display:inline-flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:20px">A</div>
      <p style="font-size:16px;font-weight:800;color:#111827;margin:10px 0 0">${session.academyName}</p>
    </div>
    <div style="background:linear-gradient(135deg,#4f46e5,#2563eb);border-radius:20px;padding:36px;text-align:center;margin-bottom:20px">
      <p style="font-size:13px;font-weight:700;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.1em;margin:0 0 8px">Training Session</p>
      <p style="font-size:28px;font-weight:900;color:#fff;margin:0 0 6px;letter-spacing:-.5px">${player.name}</p>
      <p style="font-size:15px;color:rgba(255,255,255,.75);margin:0">${trainingSession.date}${trainingSession.start_time ? ` at ${trainingSession.start_time}` : ""}</p>
    </div>
    <div style="background:#fff;border-radius:16px;padding:24px 28px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,.06)">
      <table style="width:100%;border-collapse:collapse">
        ${[
          ["Type", trainingSession.type],
          ["Duration", `${trainingSession.duration} minutes`],
          ["Coach", trainingSession.coach_name || "—"],
          ["Notes", trainingSession.notes || "—"],
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

  await getTransporter().sendMail({
    from: `"${session.academyName}" <${process.env.GMAIL_USER}>`,
    to: player.parent_email,
    subject: `Training reminder — ${player.name} — ${trainingSession.date}`,
    html,
  });

  return NextResponse.json({ success: true });
}
