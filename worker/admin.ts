// /admin — sign in with a one-time email code, see basic stats, edit site settings.
import { DEFAULTS, getEvents, getSettings, saveSettings, sessionKey, today, ensureSchema, type Settings } from './db';

export interface AdminEnv {
  DB: D1Database;
  RESEND_API_KEY: string;
  ADMIN_EMAILS: string;
  DEV_MODE?: string;
}

const COOKIE = 'hobbs_admin';
const SESSION_DAYS = 30;
const CODE_MINUTES = 10;

const enc = new TextEncoder();
const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

async function hmac(key: string, data: string) {
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', k, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=+$/, '');
}

function allowed(env: AdminEnv, email: string) {
  return env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean).includes(email);
}

async function currentUser(req: Request, env: AdminEnv): Promise<string | null> {
  const raw = (req.headers.get('Cookie') || '').split(/;\s*/).find((c) => c.startsWith(COOKIE + '='));
  if (!raw) return null;
  const [payload, sig] = decodeURIComponent(raw.slice(COOKIE.length + 1)).split('.');
  if (!payload || !sig) return null;
  if ((await hmac(await sessionKey(env.DB), payload)) !== sig) return null;
  const [email, exp] = atob(payload).split('|');
  if (!email || Date.now() > Number(exp) || !allowed(env, email)) return null;
  return email;
}

async function sessionCookie(env: AdminEnv, email: string) {
  const payload = btoa(`${email}|${Date.now() + SESSION_DAYS * 86_400_000}`);
  const value = `${payload}.${await hmac(await sessionKey(env.DB), payload)}`;
  return `${COOKIE}=${encodeURIComponent(value)}; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DAYS * 86_400}`;
}

async function sendCode(env: AdminEnv, email: string, code: string) {
  if (env.DEV_MODE) {
    console.log(`[dev] admin code for ${email}: ${code}`);
    return true;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Hobbs Website <quotes@hobbsjunkremoval.com>',
      to: [email],
      subject: `Your Hobbs website sign-in code: ${code}`,
      html: `<div style="font-family:Arial,sans-serif;font-size:16px;color:#1a1a1a"><p>Your sign-in code for the Hobbs Junk Removal website admin is:</p><p style="font-size:32px;font-weight:bold;letter-spacing:6px">${code}</p><p style="color:#666">It works for ${CODE_MINUTES} minutes. If you didn't ask for it, ignore this email.</p></div>`,
    }),
  });
  return res.ok;
}

const redirect = (to: string, cookie?: string) =>
  new Response(null, { status: 303, headers: { Location: to, ...(cookie ? { 'Set-Cookie': cookie } : {}) } });

export async function handleAdmin(req: Request, env: AdminEnv): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '') || '/admin';

  // Forms must come from this site.
  if (req.method === 'POST') {
    const origin = req.headers.get('Origin');
    if (origin && origin !== url.origin) return new Response('Forbidden', { status: 403 });
  }

  if (path === '/admin/login' && req.method === 'POST') {
    const form = await req.formData();
    const email = String(form.get('email') || '').trim().toLowerCase();
    if (allowed(env, email)) {
      await ensureSchema(env.DB);
      const prev = await env.DB.prepare('SELECT sent_at FROM login_codes WHERE email = ?').bind(email).first<{ sent_at: number }>();
      if (!prev || Date.now() - prev.sent_at > 60_000) {
        const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, '0');
        const hash = await hmac(await sessionKey(env.DB), `${email}:${code}`);
        await env.DB.prepare(
          'INSERT INTO login_codes (email, code_hash, expires, attempts, sent_at) VALUES (?, ?, ?, 0, ?) ON CONFLICT(email) DO UPDATE SET code_hash = excluded.code_hash, expires = excluded.expires, attempts = 0, sent_at = excluded.sent_at'
        )
          .bind(email, hash, Date.now() + CODE_MINUTES * 60_000, Date.now())
          .run();
        if (!(await sendCode(env, email, code))) return page('Sign in', loginForm('We couldn’t send the email just now. Try again in a minute.'));
      }
    }
    // Same answer whether or not the email is allowed.
    return page('Enter your code', codeForm(email));
  }

  if (path === '/admin/verify' && req.method === 'POST') {
    const form = await req.formData();
    const email = String(form.get('email') || '').trim().toLowerCase();
    const code = String(form.get('code') || '').replace(/\D/g, '');
    await ensureSchema(env.DB);
    const row = await env.DB.prepare('SELECT code_hash, expires, attempts FROM login_codes WHERE email = ?')
      .bind(email)
      .first<{ code_hash: string; expires: number; attempts: number }>();
    if (!row || Date.now() > row.expires || row.attempts >= 5) {
      return page('Sign in', loginForm('That code has expired. Enter your email to get a new one.'));
    }
    const ok = (await hmac(await sessionKey(env.DB), `${email}:${code}`)) === row.code_hash;
    if (!ok) {
      await env.DB.prepare('UPDATE login_codes SET attempts = attempts + 1 WHERE email = ?').bind(email).run();
      return page('Enter your code', codeForm(email, 'That code isn’t right. Check the email and try again.'));
    }
    await env.DB.prepare('DELETE FROM login_codes WHERE email = ?').bind(email).run();
    return redirect('/admin', await sessionCookie(env, email));
  }

  if (path === '/admin/logout' && req.method === 'POST') {
    return redirect('/admin', `${COOKIE}=; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
  }

  const user = await currentUser(req, env);
  if (!user) return page('Sign in', loginForm());

  if (path === '/admin/settings' && req.method === 'POST') {
    const form = await req.formData();
    const next: Settings = { ...DEFAULTS };
    for (const k of Object.keys(DEFAULTS) as (keyof Settings)[]) next[k] = String(form.get(k) ?? '').trim();
    const problems: string[] = [];
    if (next.phone.replace(/\D/g, '').length < 10) problems.push('Enter a full phone number, like 843-499-0950.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) problems.push('Enter a valid email address.');
    if (next.googleTag && !/^(G|AW|GT|DC|GTM)-[A-Z0-9-]+$/i.test(next.googleTag))
      problems.push('The Google tag ID should look like G-XXXXXXX, AW-XXXXXXX or GTM-XXXXXXX.');
    if (next.adsConversion && !/^AW-\d+\/[\w-]+$/.test(next.adsConversion))
      problems.push('The Google Ads conversion should look like AW-123456789/AbCdEf123.');
    if (next.metaPixel && !/^\d{6,20}$/.test(next.metaPixel)) problems.push('The Meta pixel ID is a number, like 123456789012345.');
    if (problems.length) return dashboard(env, user, next, problems);
    await saveSettings(env.DB, next);
    return redirect('/admin?saved=1');
  }

  return dashboard(env, user, await getSettings(env.DB), [], url.searchParams.has('saved'));
}

async function dashboard(env: AdminEnv, user: string, s: Settings, problems: string[], saved = false) {
  const rows = await getEvents(env.DB, 30);
  const sum = (type: string, days: number) =>
    rows.filter((r) => r.type === type && r.day >= today(days - 1)).reduce((a, r) => a + r.n, 0);
  const stat = (label: string, type: string, hint: string) => `
    <div class="stat"><div class="label">${label}</div>
      <div class="nums"><div><b>${sum(type, 1)}</b><span>today</span></div><div><b>${sum(type, 7)}</b><span>7 days</span></div><div><b>${sum(type, 30)}</b><span>30 days</span></div></div>
      <div class="hint">${hint}</div></div>`;

  // 14-day bars for leads (calls + quotes)
  const days = Array.from({ length: 14 }, (_, i) => today(13 - i));
  const leadsByDay = days.map((d) => rows.filter((r) => r.day === d && r.type !== 'visit').reduce((a, r) => a + r.n, 0));
  const max = Math.max(1, ...leadsByDay);
  const bars = days
    .map((d, i) => `<div class="bar" title="${d}: ${leadsByDay[i]} leads"><i style="height:${Math.round((leadsByDay[i] / max) * 100)}%"></i><span>${d.slice(8)}</span></div>`)
    .join('');

  const field = (name: keyof Settings, label: string, help: string, placeholder = '') => `
    <label><span>${label}</span><input name="${name}" value="${esc(s[name])}" placeholder="${esc(placeholder)}" autocomplete="off"><small>${help}</small></label>`;

  return page(
    'Website admin',
    `
    <header class="top"><div><h1>Hobbs website</h1><p class="muted">Signed in as ${esc(user)}</p></div>
      <form method="post" action="/admin/logout"><button class="ghost">Sign out</button></form></header>
    ${saved ? '<p class="ok">Saved. The website shows the changes on the next page load.</p>' : ''}
    ${problems.length ? `<div class="err">${problems.map((p) => `<p>${esc(p)}</p>`).join('')}</div>` : ''}
    <section><h2>Leads and visits</h2>
      <div class="stats">
        ${stat('Call taps', 'call', 'People who tapped a phone number on the site.')}
        ${stat('Quote requests', 'quote', 'Quote forms sent to your email.')}
        ${stat('Visits', 'visit', 'Page views from people, not bots.')}
      </div>
      <h3>Leads per day, last 14 days</h3><div class="bars">${bars}</div>
    </section>
    <section><h2>Settings</h2>
      <form method="post" action="/admin/settings" class="settings">
        ${field('phone', 'Phone number', 'Shown on every Call button and link on the site.', '843-499-0950')}
        ${field('email', 'Email', 'Quote requests are sent here, and it’s shown on the site.', 'you@example.com')}
        ${field('googleTag', 'Google tag ID', 'From Google Analytics or Google Ads (G-…, AW-…) or Tag Manager (GTM-…). Leave blank if you don’t use it.', 'G-XXXXXXXXXX')}
        ${field('adsConversion', 'Google Ads conversion', 'Counts a conversion in Google Ads each time someone taps Call or sends a quote. From Google Ads: the send_to value, like AW-123456789/AbCdEf123.', 'AW-123456789/AbCdEf123')}
        ${field('metaPixel', 'Meta (Facebook) pixel ID', 'The number from Meta Events Manager. Leave blank if you don’t use it.', '123456789012345')}
        <label><span>Other tracking code</span><textarea name="headCode" rows="6" placeholder="&lt;script&gt;…&lt;/script&gt;">${esc(s.headCode)}</textarea>
          <small>Paste any other code an ad company gives you for the &lt;head&gt; of the site. It goes on every page exactly as pasted.</small></label>
        <button class="primary">Save settings</button>
        <p class="muted">Call taps and quote requests are also reported to Google and Meta when their IDs are set (as phone_call_click / generate_lead and Contact / Lead).</p>
      </form>
    </section>`
  );
}

function loginForm(message = '') {
  return `
    <div class="card"><h1>Hobbs website</h1><p class="muted">Sign in with your email. We’ll send you a 6-digit code.</p>
      ${message ? `<p class="err">${esc(message)}</p>` : ''}
      <form method="post" action="/admin/login"><label><span>Email</span><input type="email" name="email" required autocomplete="email" inputmode="email"></label>
      <button class="primary">Email me a code</button></form></div>`;
}

function codeForm(email: string, message = '') {
  return `
    <div class="card"><h1>Check your email</h1>
      <p class="muted">If ${esc(email)} can sign in, a 6-digit code is on its way. It works for ${CODE_MINUTES} minutes.</p>
      ${message ? `<p class="err">${esc(message)}</p>` : ''}
      <form method="post" action="/admin/verify"><input type="hidden" name="email" value="${esc(email)}">
        <label><span>Code</span><input name="code" required inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" class="code"></label>
        <button class="primary">Sign in</button></form>
      <form method="get" action="/admin"><button class="ghost">Use a different email</button></form></div>`;
}

function page(title: string, body: string) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>${esc(title)} · Hobbs</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Oswald:wght@600;700&display=swap" rel="stylesheet">
<style>
:root{--ink:#1a1a1a;--muted:#5f5b55;--line:#e4e0d8;--bg:#f6f4ef;--card:#fff;--yellow:#FFD700;--ok:#1f6b45;--bad:#b3261e}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 Inter,system-ui,sans-serif;padding:24px 16px 64px}
main{max-width:860px;margin:0 auto;display:grid;gap:24px}
h1,h2,h3{font-family:Oswald,Impact,sans-serif;text-transform:uppercase;letter-spacing:.02em;margin:0}h1{font-size:30px}h2{font-size:22px;margin-bottom:14px}h3{font-size:15px;margin:22px 0 8px;color:var(--muted)}
.muted{color:var(--muted);margin:4px 0 0;font-size:14px}
.top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
section,.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:20px}
.card{max-width:420px;margin:8vh auto 0;display:grid;gap:14px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
.stat{border:1px solid var(--line);border-radius:10px;padding:14px}.stat .label{font-weight:700}
.nums{display:flex;gap:18px;margin:8px 0 4px}.nums b{font:700 28px/1 Oswald,sans-serif;display:block;font-variant-numeric:tabular-nums}.nums span{font-size:12px;color:var(--muted)}
.hint{font-size:12px;color:var(--muted)}
.bars{display:grid;grid-template-columns:repeat(14,1fr);gap:4px;align-items:end;height:110px}
.bar{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:4px}.bar i{display:block;width:100%;background:var(--yellow);border:1px solid #d9b800;border-radius:3px 3px 0 0;min-height:2px}.bar span{font-size:10px;color:var(--muted)}
form{display:grid;gap:14px}label{display:grid;gap:5px}label span{font-weight:600}small{color:var(--muted);font-size:13px}
input,textarea{font:inherit;padding:11px 12px;border:1px solid #cfc9bd;border-radius:8px;background:#fff;color:var(--ink);width:100%}
textarea{font-family:ui-monospace,Menlo,monospace;font-size:13px}input:focus,textarea:focus{outline:3px solid rgba(255,215,0,.6);border-color:#b89c00}
.code{font:700 26px/1 Oswald,sans-serif;letter-spacing:8px;text-align:center}
button{font:700 15px/1 Oswald,sans-serif;text-transform:uppercase;letter-spacing:.06em;border-radius:8px;padding:14px 18px;cursor:pointer;border:1px solid transparent}
.primary{background:var(--yellow);color:var(--ink)}.primary:hover{background:#ffe34d}
.ghost{background:transparent;border-color:var(--line);color:var(--ink)}
.ok{background:#e6f3ea;color:var(--ok);border-radius:8px;padding:10px 14px;margin:0}
.err{background:#fbeaea;color:var(--bad);border-radius:8px;padding:10px 14px;margin:0}.err p{margin:0}
</style></head><body><main>${body}</main></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Frame-Options': 'DENY' } }
  );
}
