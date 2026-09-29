import { CONTACT_INFO } from '../types';

// Tell Google (Analytics / Ads) and Meta about a lead, when their tags are installed.
// The IDs come from the admin settings at /admin.
export function reportLead(kind: 'call' | 'quote') {
  const w = window as any;
  try {
    w.gtag?.('event', kind === 'call' ? 'phone_call_click' : 'generate_lead');
    if (CONTACT_INFO.adsConversion) w.gtag?.('event', 'conversion', { send_to: CONTACT_INFO.adsConversion });
  } catch {}
  try { w.fbq?.('track', kind === 'call' ? 'Contact' : 'Lead'); } catch {}
}
