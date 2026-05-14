import { Resend } from "resend";

function getResend() {
  const key = process.env["RESEND_API_KEY"];
  console.log("RESEND key present:", !!key, "| length:", key?.length ?? 0);
  if (!key) throw new Error("RESEND_API_KEY missing from environment");
  return new Resend(key);
}

export interface InvoiceEmailData {
  to: string;
  playerName: string;
  academyName: string;
  month: string;
  amount: number;
  dueDate: string;
  sessions: { date: string; duration: number; type: string; coach_name: string; notes: string }[];
}

export interface TrainingReportData {
  to: string;
  playerName: string;
  academyName: string;
  sessions: { date: string; duration: number; type: string; coach_name: string; notes: string }[];
}

export async function sendTrainingReport(data: TrainingReportData) {
  const totalMinutes = data.sessions.reduce((s, r) => s + (r.duration || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const sessionsRows = data.sessions.map((s, i) => `
    <tr style="background:${i % 2 === 0 ? '#fafafa' : '#fff'}">
      <td style="padding:12px 20px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6">${s.date}</td>
      <td style="padding:12px 20px;font-size:13px;border-bottom:1px solid #f3f4f6">
        <span style="background:#ede9fe;color:#6d28d9;padding:3px 10px;border-radius:20px;font-weight:600;font-size:12px">${s.type}</span>
      </td>
      <td style="padding:12px 20px;font-size:13px;color:#111827;font-weight:600;border-bottom:1px solid #f3f4f6">${s.duration} min</td>
      <td style="padding:12px 20px;font-size:13px;color:#6b7280;border-bottom:1px solid #f3f4f6">${s.coach_name || "—"}</td>
      <td style="padding:12px 20px;font-size:13px;color:#9ca3af;border-bottom:1px solid #f3f4f6">${s.notes || "—"}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif">
  <div style="max-width:620px;margin:0 auto;padding:40px 20px">
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-flex;align-items:center;gap:10px">
        <div style="width:38px;height:38px;background:linear-gradient(135deg,#4f46e5,#2563eb);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:17px;vertical-align:middle">A</div>
        <span style="font-weight:800;color:#111827;font-size:18px;letter-spacing:-.3px;vertical-align:middle">${data.academyName}</span>
      </div>
    </div>
    <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:24px;padding:40px 36px;margin-bottom:20px;text-align:center">
      <p style="font-size:12px;font-weight:700;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.12em;margin:0 0 10px">Training Report</p>
      <p style="font-size:32px;font-weight:900;color:#fff;letter-spacing:-.5px;margin:0 0 6px">${data.playerName}</p>
      <p style="font-size:15px;color:rgba(255,255,255,.7);margin:0 0 28px">Summary of all training sessions</p>
      <div style="display:inline-flex;gap:16px">
        <div style="background:rgba(255,255,255,.12);border-radius:14px;padding:16px 24px;text-align:center">
          <p style="font-size:28px;font-weight:900;color:#fff;margin:0;letter-spacing:-.5px">${data.sessions.length}</p>
          <p style="font-size:11px;color:rgba(255,255,255,.6);font-weight:700;margin:0;text-transform:uppercase;letter-spacing:.06em">Sessions</p>
        </div>
        <div style="background:rgba(255,255,255,.12);border-radius:14px;padding:16px 24px;text-align:center">
          <p style="font-size:28px;font-weight:900;color:#fff;margin:0;letter-spacing:-.5px">${totalHours}h</p>
          <p style="font-size:11px;color:rgba(255,255,255,.6);font-weight:700;margin:0;text-transform:uppercase;letter-spacing:.06em">Total Hours</p>
        </div>
        <div style="background:rgba(255,255,255,.12);border-radius:14px;padding:16px 24px;text-align:center">
          <p style="font-size:28px;font-weight:900;color:#fff;margin:0;letter-spacing:-.5px">${Math.round(totalMinutes / Math.max(data.sessions.length, 1))}</p>
          <p style="font-size:11px;color:rgba(255,255,255,.6);font-weight:700;margin:0;text-transform:uppercase;letter-spacing:.06em">Avg Min</p>
        </div>
      </div>
    </div>
    ${data.sessions.length > 0 ? `
    <div style="background:#fff;border-radius:16px;overflow:hidden;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,.06)">
      <div style="padding:20px 24px;border-bottom:1px solid #f3f4f6">
        <p style="font-size:14px;font-weight:700;color:#111827;margin:0">Session Details</p>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:#f9fafb">
          <th style="padding:10px 20px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em">Date</th>
          <th style="padding:10px 20px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em">Type</th>
          <th style="padding:10px 20px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em">Duration</th>
          <th style="padding:10px 20px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em">Coach</th>
          <th style="padding:10px 20px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em">Notes</th>
        </tr></thead>
        <tbody>${sessionsRows}</tbody>
      </table>
    </div>` : ""}
    <p style="font-size:13px;color:#9ca3af;text-align:center;margin:24px 0 0">Sent by <strong style="color:#6b7280">${data.academyName}</strong> via AcademyOS</p>
  </div>
</body>
</html>`;

  const { error } = await getResend().emails.send({
    from: `${data.academyName} <onboarding@resend.dev>`,
    to: data.to,
    subject: `Training Report — ${data.playerName} — ${data.sessions.length} sessions · ${totalHours}h`,
    html,
  });
  if (error) throw new Error(typeof error === "object" ? JSON.stringify(error) : String(error));
}

export async function sendInvoiceEmail(data: InvoiceEmailData) {
  const totalMinutes = data.sessions.reduce((s, r) => s + (r.duration || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const sessionsRows = data.sessions.map((s, i) => `
    <tr style="background:${i % 2 === 0 ? '#fafafa' : '#fff'}">
      <td style="padding:12px 20px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6">${s.date}</td>
      <td style="padding:12px 20px;font-size:13px;border-bottom:1px solid #f3f4f6">
        <span style="background:#ede9fe;color:#6d28d9;padding:3px 10px;border-radius:20px;font-weight:600;font-size:12px">${s.type}</span>
      </td>
      <td style="padding:12px 20px;font-size:13px;color:#111827;font-weight:600;border-bottom:1px solid #f3f4f6">${s.duration} min</td>
      <td style="padding:12px 20px;font-size:13px;color:#6b7280;border-bottom:1px solid #f3f4f6">${s.coach_name || "—"}</td>
      <td style="padding:12px 20px;font-size:13px;color:#9ca3af;border-bottom:1px solid #f3f4f6">${s.notes || "—"}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif">
  <div style="max-width:620px;margin:0 auto;padding:40px 20px">
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-flex;align-items:center;gap:10px">
        <div style="width:38px;height:38px;background:linear-gradient(135deg,#4f46e5,#2563eb);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:17px;vertical-align:middle">A</div>
        <span style="font-weight:800;color:#111827;font-size:18px;letter-spacing:-.3px;vertical-align:middle">${data.academyName}</span>
      </div>
    </div>
    <div style="background:linear-gradient(135deg,#4f46e5,#2563eb);border-radius:24px;padding:40px 36px;margin-bottom:20px;text-align:center">
      <p style="font-size:12px;font-weight:700;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.12em;margin:0 0 12px">Invoice · ${data.month}</p>
      <p style="font-size:56px;font-weight:900;color:#fff;letter-spacing:-2px;margin:0 0 8px;line-height:1">\$${data.amount.toLocaleString()}</p>
      <p style="font-size:15px;color:rgba(255,255,255,.7);margin:0">Due by ${data.dueDate}</p>
    </div>
    <div style="background:#fff;border-radius:16px;padding:24px 28px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,.06)">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;width:40%">
            <p style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;margin:0 0 4px">Player</p>
            <p style="font-size:15px;font-weight:700;color:#111827;margin:0">${data.playerName}</p>
          </td>
          <td style="padding:10px 0 10px 24px;border-bottom:1px solid #f3f4f6">
            <p style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;margin:0 0 4px">Academy</p>
            <p style="font-size:15px;font-weight:700;color:#111827;margin:0">${data.academyName}</p>
          </td>
        </tr>
      </table>
    </div>
    ${data.sessions.length > 0 ? `
    <div style="background:#fff;border-radius:16px;overflow:hidden;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,.06)">
      <div style="padding:22px 28px;border-bottom:1px solid #f3f4f6">
        <p style="font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;margin:0 0 4px">Training This Month</p>
        <p style="font-size:16px;font-weight:800;color:#111827;margin:0">${data.sessions.length} sessions · ${totalHours} hours</p>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:#f9fafb">
          <th style="padding:10px 20px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em">Date</th>
          <th style="padding:10px 20px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em">Type</th>
          <th style="padding:10px 20px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em">Duration</th>
          <th style="padding:10px 20px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em">Coach</th>
          <th style="padding:10px 20px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em">Notes</th>
        </tr></thead>
        <tbody>${sessionsRows}</tbody>
      </table>
    </div>` : ""}
    <p style="font-size:13px;color:#9ca3af;text-align:center;margin:24px 0 0">Sent by <strong style="color:#6b7280">${data.academyName}</strong> via AcademyOS</p>
  </div>
</body>
</html>`;

  const { error } = await getResend().emails.send({
    from: `${data.academyName} <onboarding@resend.dev>`,
    to: data.to,
    subject: `Invoice — ${data.playerName} — ${data.month} — $${data.amount}`,
    html,
  });
  if (error) throw new Error(typeof error === "object" ? JSON.stringify(error) : String(error));
}
