// Cloudflare Worker entry: serves the Vite build from ASSETS, runs the quote API,
// counts leads and visits, adds the admin settings to every page, and serves /admin.
import { onRequestPost as quotePost } from '../functions/api/quote';
import { handleAdmin } from './admin';
import { DEFAULTS, getSettings, recordEvent } from './db';
import { injectSite } from './inject';

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  DB: D1Database;
  RESEND_API_KEY: string;
  ADMIN_EMAILS: string;
  DEV_MODE?: string;
}

const BOT = /bot|crawl|spider|slurp|preview|monitor|facebookexternalhit|headless|curl|wget|python|httpclient|lighthouse/i;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    // The public site must never break because of the admin store: fall back to the built-in values.
    const settings = () => getSettings(env.DB).catch((err) => (console.error('settings failed', err), DEFAULTS));
    const count = (type: 'visit' | 'call' | 'quote') =>
      ctx.waitUntil(recordEvent(env.DB, type).catch((err) => console.error('count failed', err)));

    if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
      return handleAdmin(request, env);
    }

    if (url.pathname === '/api/quote') {
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
      }
      const res = await quotePost({ request, env: { ...env, QUOTE_TO: (await settings()).email } } as any);
      if (res.ok) count('quote');
      return res;
    }

    if (url.pathname === '/api/event') {
      if (request.method === 'POST' && url.searchParams.get('t') === 'call') count('call');
      return new Response(null, { status: 204 });
    }

    const res = await env.ASSETS.fetch(request);
    if (!(res.headers.get('Content-Type') || '').includes('text/html')) return res;

    // Count real page loads only: not bots, and not a browser fetching e.g. /favicon.ico.
    const dest = request.headers.get('Sec-Fetch-Dest');
    if (request.method === 'GET' && res.ok && (!dest || dest === 'document') && !BOT.test(request.headers.get('User-Agent') || '')) {
      count('visit');
    }
    return injectSite(res, await settings());
  },
};
