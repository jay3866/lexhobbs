// Adds the admin settings to every HTML page: contact info for the app, the Google tag,
// the Meta pixel and any extra head code, all inside <head> before the page loads.
import type { Settings } from './db';

const json = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c');

function googleTag(id: string) {
  if (/^GTM-[A-Z0-9]+$/i.test(id)) {
    return {
      head: `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${json(id)});</script>`,
      body: `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(id)}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`,
    };
  }
  if (/^(G|AW|GT|DC)-[A-Z0-9-]+$/i.test(id)) {
    return {
      head: `<script async src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${json(id)});</script>`,
      body: '',
    };
  }
  return { head: '', body: '' };
}

function metaPixel(id: string) {
  if (!/^\d{6,20}$/.test(id)) return { head: '', body: '' };
  return {
    head: `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${json(id)});fbq('track','PageView');</script>`,
    body: `<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1"/></noscript>`,
  };
}

export function injectSite(res: Response, s: Settings): Response {
  const g = googleTag(s.googleTag.trim());
  const m = metaPixel(s.metaPixel.trim());
  const head =
    `<script>window.__HOBBS__=${json({ phone: s.phone, email: s.email, adsConversion: s.adsConversion })};</script>` + g.head + m.head + (s.headCode || '');
  const body = g.body + m.body;
  const out = new HTMLRewriter()
    .on('head', { element: (el) => el.append(head, { html: true }) })
    .on('body', { element: (el) => { if (body) el.prepend(body, { html: true }); } })
    .transform(res);
  const headers = new Headers(out.headers);
  headers.set('Cache-Control', 'no-cache'); // settings changes show up on the next visit
  return new Response(out.body, { status: out.status, headers });
}
