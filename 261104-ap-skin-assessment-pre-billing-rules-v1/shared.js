/* Skin Assessment Pre-Billing Audit Rules — prototype v1. Shared chrome and helpers. All data is placeholder. */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function mountChrome(crumb) {
  const chev = '<svg viewBox="0 0 12 12"><path d="M1.5 4l4.5 4.5L10.5 4" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>';
  const nav = [['Dashboard'], ['Office Admin', 1], ['Coding &amp; Billing', 1], ['Device Management', 0, 1], ['Forms', 1], ['Reports', 1], ['Advanced', 1]]
    .map(([t, c, on]) => `<a href="#"${on ? ' class="on"' : ''}>${t}${c ? chev : ''}</a>`).join('');
  document.body.insertAdjacentHTML('afterbegin', `
    <header class="ap-header">
      <div class="ap-logo"><img src="vohra-logo-white-vhsmdc.svg" alt="Vohra VHSMDC, Medical Documentation &amp; Coding"></div>
      <nav class="ap-nav">${nav}</nav>
      <div class="ap-session"><div class="ap-session__time">29 : 56<small><span>MIN</span><span>SEC</span></small></div>
        <div class="ap-session__user"><svg viewBox="0 0 24 24" fill="#cfe2f3"><circle cx="12" cy="12" r="11"/><circle cx="12" cy="9.5" r="4" fill="#01427c"/><path d="M4.8 19a8.5 8.5 0 0 1 14.4 0A10.6 10.6 0 0 1 12 23a10.6 10.6 0 0 1-7.2-4z" fill="#01427c"/></svg><svg viewBox="0 0 12 12"><path d="M1.5 4l4.5 4.5L10.5 4" stroke="#cfe2f3" stroke-width="1.8" fill="none"/></svg></div></div>
    </header>
    <div class="ap-crumb"><a href="index.html">Dashboard</a>&nbsp;/&nbsp;<a href="index.html">Device Management</a></div>`);
  document.body.insertAdjacentHTML('beforeend', '<footer class="ap-footer">&copy; 2020 VOHRA. All rights reserved. VHS(R) Medical Documentation &amp; Coding. Version: 1.0.3</footer>');
}

function mountProto(html) {
  document.body.insertAdjacentHTML('beforeend', `<aside class="proto" id="proto"><div class="proto__head" id="protoHead"><span>Prototype</span><span id="protoTog">&minus;</span></div><div class="proto__body">${html}</div></aside>`);
  $('protoHead').addEventListener('click', () => { const c = $('proto').classList.toggle('proto--closed'); $('protoTog').innerHTML = c ? '+' : '&minus;'; });
}

function openModal({ title, body, foot, center }) {
  closeModal();
  document.body.insertAdjacentHTML('beforeend', `<div class="scrim open" id="scrim"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="modal__head"><span>${esc(title)}</span><button class="modal__close" aria-label="Close" id="mClose">&times;</button></div>
    <div class="modal__body">${body}</div><div class="modal__foot${center ? ' modal__foot--center' : ''}">${foot}</div></div></div>`);
  $('mClose').addEventListener('click', closeModal);
}
function closeModal() { const s = $('scrim'); if (s) s.remove(); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

const ICON = {
  back: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 8H3M7 3L2.5 8 7 13"/></svg>',
  search: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="7" r="5"/><path d="M11 11l3.5 3.5"/></svg>',
  reset: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13.5 8A5.5 5.5 0 1 1 11 3.4M11.5 1v3h-3"/></svg>',
  download: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v9M4 7.5L8 11.5 12 7.5M2.5 14h11"/></svg>',
  info: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="7.25" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 7.2v4.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="8" cy="4.9" r="1" fill="currentColor"/></svg>',
  check: '<svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="40" r="40" fill="#12935c"/><path d="M22 41l12 12 25-26" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

/* ── Rules (placeholder data). kwMode: 'contains' | 'not'. Existing rules read as Contains. ── */
const SEED_RULES = [
  { id: 1, name: 'Billing Rule 01', start: '2026-07-15', end: '2027-07-15', on: true, kwMode: 'contains', keywords: [], freq: null, clinicians: ['Elijah Torres', 'Maria Chen', 'Sam Patel', 'Ana Ruiz', 'Dan Moore', 'Lee Ward'] },
  { id: 2, name: 'Billing Rule 02', start: '2026-07-15', end: null, on: true, kwMode: 'contains', keywords: ['No Drainage', 'Early detection of pressure ulcers'], freq: 21, clinicians: [] },
  { id: 3, name: 'Billing Rule 03', start: '2026-07-15', end: '2027-07-15', on: false, kwMode: 'contains', keywords: ['No Drainage'], freq: 16, clinicians: ['Elijah Torres', 'Maria Chen', 'Sam Patel'] },
  { id: 4, name: 'Billing Rule 04', start: '2026-07-15', end: '2027-07-15', on: false, kwMode: 'contains', keywords: [], freq: 11, clinicians: ['Elijah Torres'] },
  { id: 5, name: 'Billing Rule 05 (demo)', start: '2026-09-01', end: null, on: true, kwMode: 'not', keywords: ['Wound assessed', 'Photo taken'], freq: null, clinicians: ['Elijah Torres'] }
];
function loadRules() { try { return JSON.parse(sessionStorage.getItem('saRulesV1')) || SEED_RULES; } catch (e) { return SEED_RULES; } }
function saveRules(r) { sessionStorage.setItem('saRulesV1', JSON.stringify(r)); }
const fmtDate = iso => { if (!iso) return 'No end date'; const [y, m, d] = iso.split('-'); return `${m}/${d}/${y.slice(2)}`; };
const KW_LABEL = { contains: 'Contains', not: 'Does not contain' };
const KW_HELP = {
  contains: 'Any one of these words or phrases in the note holds the visit.',
  not: 'The visit is held only when none of these words or phrases are in the note.'
};
