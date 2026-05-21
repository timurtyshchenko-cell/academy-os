import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Resend } from "resend";

const NOTIFY_EMAIL = "slimbet@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, academy, phone, players, message } = body;
    if (!name || !email || !academy) return NextResponse.json({ error: "Name, email and academy required" }, { status: 400 });

    const leadsPath = path.join(process.cwd(), "leads.json");
    let leads: object[] = [];
    if (fs.existsSync(leadsPath)) {
      try { leads = JSON.parse(fs.readFileSync(leadsPath, "utf-8")); } catch { leads = []; }
    }
    const lead = { id: Date.now().toString(), name, email, academy, phone, players, message, createdAt: new Date().toISOString(), status: "new" };
    leads.unshift(lead);
    fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2));
    console.log("New demo lead:", lead);

    const resendKey = process.env["RESEND_API_KEY"];
    if (resendKey) {
      const resend = new Resend(resendKey);
      const html = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb">
          <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
            <div style="background:linear-gradient(135deg,#186038,#1F6B45);padding:28px 32px">
              <p style="font-size:11px;font-weight:700;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.12em;margin:0 0 6px">AcademyOS</p>
              <p style="font-size:22px;font-weight:900;color:#fff;margin:0;letter-spacing:-.5px">New Demo Request</p>
            </div>
            <div style="padding:28px 32px">
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;width:40%">Name</td><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-weight:700;font-size:13px">${name}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px">Email</td><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px"><a href="mailto:${email}" style="color:#1F6B45;font-weight:700">${email}</a></td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px">Academy</td><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-weight:700;font-size:13px">${academy}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px">Phone</td><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px">${phone || "—"}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px">Players</td><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px">${players || "—"}</td></tr>
                <tr><td style="padding:10px 0;color:#6b7280;font-size:13px;vertical-align:top;padding-top:14px">Message</td><td style="padding:10px 0;font-size:13px;padding-top:14px;color:#374151">${message || "—"}</td></tr>
              </table>
              <a href="mailto:${email}" style="display:inline-block;margin-top:24px;background:#1F6B45;color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px">Reply to ${name} →</a>
            </div>
          </div>
        </div>`;

      const { error } = await resend.emails.send({
        from: "AcademyOS <onboarding@resend.dev>",
        to: NOTIFY_EMAIL,
        subject: `New Demo Request — ${academy}`,
        html,
      });
      if (error) console.error("Resend error:", error);
      else console.log("Demo notification sent to", NOTIFY_EMAIL);
    } else {
      console.warn("RESEND_API_KEY not set — skipping email notification");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("book-demo error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
