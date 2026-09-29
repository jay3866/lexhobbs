import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { reportLead } from './services/leads';

// Every tap on a phone link counts as a call lead in the admin panel,
// and is reported to the Google tag / Meta pixel when those are installed.
document.addEventListener('click', (e) => {
  const link = (e.target as Element | null)?.closest?.('a[href^="tel:"]');
  if (!link) return;
  try { navigator.sendBeacon('/api/event?t=call'); } catch {}
  reportLead('call');
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);