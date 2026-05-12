import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "academy.db");

// Ensure data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = DELETE");
  _db.pragma("busy_timeout = 3000");
  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS academies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      subscription_status TEXT DEFAULT 'trial',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      academy_id INTEGER REFERENCES academies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      age INTEGER,
      level TEXT DEFAULT 'Intermediate',
      coach_name TEXT,
      parent_email TEXT,
      parent_name TEXT,
      monthly_fee INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      academy_id INTEGER REFERENCES academies(id) ON DELETE CASCADE,
      player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
      player_name TEXT,
      amount INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      due_date TEXT,
      paid_at TEXT,
      month TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS coaches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      academy_id INTEGER REFERENCES academies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT,
      specialty TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      academy_id INTEGER REFERENCES academies(id) ON DELETE CASCADE,
      player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
      player_name TEXT,
      date TEXT NOT NULL,
      start_time TEXT,
      duration INTEGER DEFAULT 60,
      coach_name TEXT,
      type TEXT DEFAULT 'Training',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS courts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      academy_id INTEGER REFERENCES academies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      surface TEXT DEFAULT 'Hard',
      status TEXT DEFAULT 'available',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS court_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      academy_id INTEGER REFERENCES academies(id) ON DELETE CASCADE,
      court_id INTEGER REFERENCES courts(id) ON DELETE CASCADE,
      court_name TEXT,
      player_name TEXT,
      coach_name TEXT,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  try { db.exec(`ALTER TABLE sessions ADD COLUMN start_time TEXT`); } catch {}
  try { db.exec(`ALTER TABLE courts ADD COLUMN price_per_hour INTEGER DEFAULT 0`); } catch {}
  try { db.exec(`ALTER TABLE court_bookings ADD COLUMN total_price INTEGER DEFAULT 0`); } catch {}
  try { db.exec(`ALTER TABLE court_bookings ADD COLUMN payment_status TEXT DEFAULT 'unpaid'`); } catch {}
  try { db.exec(`ALTER TABLE court_bookings ADD COLUMN player_email TEXT`); } catch {}
}
