// Storage for the admin panel: settings, daily counters, login codes (Cloudflare D1).

export interface Settings {
  phone: string;
  email: string;
  googleTag: string; // G-…, AW-… or GTM-…
  adsConversion: string; // Google Ads conversion "send_to", e.g. AW-123/AbC…; fired on call taps and quote requests
  metaPixel: string; // numeric Meta pixel ID
  headCode: string; // any other code for <head>, pasted as-is
}

export const DEFAULTS: Settings = {
  phone: '843-499-0950',
  email: 'Hobbsjrhauling@gmail.com',
  googleTag: 'AW-17025076615', // from the client's Google Ads account (Contact conversion), 29 Sept 2026
  adsConversion: 'AW-17025076615/dxjUCP6zofwcEIebmLY_',
  metaPixel: '',
  headCode: '',
};

export type EventType = 'visit' | 'call' | 'quote';

let schemaReady: Promise<unknown> | null = null;

export function ensureSchema(db: D1Database) {
  schemaReady ??= db
    .batch([
      db.prepare('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)'),
      db.prepare(
        'CREATE TABLE IF NOT EXISTS events (day TEXT NOT NULL, type TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, type))'
      ),
      db.prepare(
        'CREATE TABLE IF NOT EXISTS login_codes (email TEXT PRIMARY KEY, code_hash TEXT NOT NULL, expires INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, sent_at INTEGER NOT NULL)'
      ),
    ])
    .catch((err) => {
      schemaReady = null;
      throw err;
    });
  return schemaReady;
}

// Settings are read on every page view, so keep a short per-isolate cache.
let cache: { at: number; value: Settings } | null = null;

export async function getSettings(db: D1Database): Promise<Settings> {
  if (cache && Date.now() - cache.at < 30_000) return cache.value;
  await ensureSchema(db);
  const { results } = await db.prepare('SELECT key, value FROM settings').all<{ key: string; value: string }>();
  const value = { ...DEFAULTS };
  for (const row of results) {
    if (row.key in DEFAULTS) (value as any)[row.key] = row.value;
  }
  cache = { at: Date.now(), value };
  return value;
}

export async function saveSettings(db: D1Database, next: Settings) {
  await ensureSchema(db);
  await db.batch(
    (Object.keys(DEFAULTS) as (keyof Settings)[]).map((k) =>
      db
        .prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
        .bind(k, next[k])
    )
  );
  cache = null;
}

// Business days are counted in the shop's own time zone.
export function today(offsetDays = 0) {
  const d = new Date(Date.now() - offsetDays * 86_400_000);
  return d.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
}

export async function recordEvent(db: D1Database, type: EventType) {
  await ensureSchema(db);
  await db
    .prepare('INSERT INTO events (day, type, n) VALUES (?, ?, 1) ON CONFLICT(day, type) DO UPDATE SET n = n + 1')
    .bind(today(), type)
    .run();
}

export async function getEvents(db: D1Database, days: number) {
  await ensureSchema(db);
  const { results } = await db
    .prepare('SELECT day, type, n FROM events WHERE day >= ? ORDER BY day')
    .bind(today(days - 1))
    .all<{ day: string; type: EventType; n: number }>();
  return results;
}

// A random signing key for admin sessions, created once and kept in the database.
export async function sessionKey(db: D1Database): Promise<string> {
  await ensureSchema(db);
  const row = await db.prepare("SELECT value FROM settings WHERE key = '_session_key'").first<{ value: string }>();
  if (row) return row.value;
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const key = btoa(String.fromCharCode(...bytes));
  await db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('_session_key', ?)").bind(key).run();
  const again = await db.prepare("SELECT value FROM settings WHERE key = '_session_key'").first<{ value: string }>();
  return again!.value;
}
