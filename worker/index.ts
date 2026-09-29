// Cloudflare Worker entry: serves the Vite build from ASSETS and runs the quote API.
// The quote handler lives in functions/api/quote.ts (Pages-style); it only reads
// context.request and context.env, so it runs unchanged here.
import { onRequestPost } from '../functions/api/quote';

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  RESEND_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/quote') {
      if (request.method === 'POST') {
        return onRequestPost({ request, env } as any);
      }
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
    }
    return env.ASSETS.fetch(request);
  },
};
