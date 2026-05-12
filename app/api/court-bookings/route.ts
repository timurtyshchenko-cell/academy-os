import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

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
  const { court_id, court_name, player_name, coach_name, date, start_time, end_time, notes } = await req.json();
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
    "INSERT INTO court_bookings (academy_id, court_id, court_name, player_name, coach_name, date, start_time, end_time, notes, total_price, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(session.academyId, court_id, court_name || null, player_name || null, coach_name || null, date, start_time, end_time, notes || null, totalPrice, "unpaid");
  const booking = db.prepare("SELECT * FROM court_bookings WHERE id = ?").get(result.lastInsertRowid);
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
