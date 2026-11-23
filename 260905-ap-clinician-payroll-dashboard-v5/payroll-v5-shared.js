/* Clinician Payroll Dashboard V5: data, metrics, thresholds, page state and chrome
   shared by the dashboard and the all-clinicians table. Demo data is made up. */

/* ════════════════ Demo data (same seed and stories as V1) ════════════════ */
const DAY = 864e5;
const START = Date.UTC(2023, 11, 31);         // Sunday; covers all of 2024 so "Previous year" has a comparison year
const TODAY = Date.UTC(2026, 10, 11);         // Wed Nov 11, 2026 (fixed for the demo, so "Current month" has 10 days)
const LAST = (TODAY - START) / DAY - 1;       // yesterday = last day with data
const N = LAST + 1;
const idx = (y, m, d) => (Date.UTC(y, m - 1, d) - START) / DAY;

function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const R = rng(260905);

const NAMES = [
  'Adrian Castillo','Priya Raman','Michael O’Connor','Sofia Delgado','James Whitfield','Aisha Bello','Daniel Kim','Rachel Goldstein',
  'Omar Haddad','Laura Bennett','Victor Nguyen','Hannah Brooks','Carlos Ibarra','Meera Kapoor','Thomas Reilly','Grace Okafor',
  'Samuel Ortiz','Natalie Fischer','Kevin Tran','Isabel Moreno','Robert Hayes','Leila Farahani','Andrew Novak','Monica Alvarez',
  'Brian Whitaker','Yuki Tanaka','Elena Petrova','Marcus Green','Fatima Siddiqui','Patrick Doyle','Diana Ruiz','Steven Cho',
  'Olivia Grant','Rajesh Patel','Camila Herrera','Jonathan Price','Nadia Hussain','Gregory Walsh','Teresa Lopez','Ethan Murphy',
  'Amara Nwosu','Christopher Lane','Vanessa Cruz','Henry Liu','Julia Romano','Derek Simmons','Esther Adeyemi','Luis Navarro',
  'Katherine Shaw','Ahmed Karim','Melissa Ford','Ivan Kowalski','Renee Dubois','Paul Sandoval','Lily Chen','Martin Becker',
  'Zara Qureshi','Frank Medina','Alicia Warren','Noah Feldman',
  // V5: terminated clinicians (60-65, 69) and re-hires (66-68). Appended last so the V4 demo stories don't change.
  'Gabriel Rossi','Priscilla Okoye','Walter Hendricks','Sunita Rao','Dennis Marsh','Beatrice Moyo',
  'Tobias Lindqvist','Marisol Vega','Hiroshi Mori','Caroline Pike'
];
const STATES = ['FL','GA','TX','NY','NJ','PA','IL','OH','CA','AZ','NC','MI'];
const NEIGHBOURS = { FL:['GA'], GA:['FL','NC'], TX:['AZ'], NY:['NJ','PA'], NJ:['NY','PA'], PA:['NJ','OH','NY'], IL:['MI'], OH:['PA','MI'], CA:['AZ'], AZ:['CA','TX'], NC:['GA'], MI:['OH','IL'] };

// Scripted patterns so every metric has a story to tell
const RECENT_HIRES = { 5: idx(2026,10,19), 21: idx(2026,10,21), 33: idx(2026,10,6), 46: idx(2026,9,28), 52: idx(2026,9,14), 58: idx(2026,8,24) };
const DECLINE = { 3: [idx(2026,10,18), .25], 14: [idx(2026,10,18), .4], 27: [idx(2026,10,18), .5], 40: [idx(2026,10,4), .35], 9: [idx(2026,10,11), .55] };
const STOPPED = { 18: idx(2026,10,12), 37: idx(2026,10,18), 49: idx(2026,10,20) };
const SLOW = { 7: 31, 22: 26, 12: 21, 44: 18, 30: 15, 55: 13 };
const MULTI = { 1: 1, 4: 2, 8: 1, 11: 1, 15: 2, 19: 1, 24: 1, 26: 1, 29: 2, 34: 1, 38: 1, 42: 1, 47: 1, 50: 1, 53: 1 };
const SEC_ZERO = { 4: [idx(2026,8,1), [0,1]], 11: [idx(2026,9,20), [0]], 29: [idx(2026,10,1), [1]], 38: [idx(2026,10,18), [0]] };
// V5: termDay = day IT removed the clinician's access (deactivation). backDay = first sync after access came back (re-hire).
const TERM = { 60: idx(2026,10,22), 61: idx(2026,10,9), 62: idx(2026,10,27), 63: idx(2026,9,12), 64: idx(2026,5,3), 65: idx(2025,12,14),
               66: idx(2025,6,10), 67: idx(2025,12,5), 68: idx(2026,2,14), 69: idx(2026,11,5) };
const BACK = { 66: idx(2026,10,15), 67: idx(2026,9,28), 68: idx(2026,11,3) };
const FACILITIES = ['Sunrise Care Center','Maple Grove Nursing','Lakeside Rehabilitation','Harbor View SNF','Cedar Ridge Health','Oakwood Manor','Riverbend Care','Willow Creek Center',
  'Pinehurst Nursing','Golden Pines Rehab','Magnolia Court','Bayside Health & Rehab','Summit Hills SNF','Heritage Park Care','Meadowbrook Center','St. Anne’s Nursing'];
const CREDS = ['MD','MD','MD','DO','MD','NP','PA','MD','DO','NP'];

const clinicians = NAMES.map((name, i) => {
  const primary = STATES[i % STATES.length];
  const nSec = MULTI[i] || 0;
  const secondary = NEIGHBOURS[primary].slice(0, nSec);
  const firstDay = RECENT_HIRES[i] !== undefined ? RECENT_HIRES[i] : Math.floor(-2200 + R() * 2400);
  return {
    id: i + 1, name, cred: CREDS[i % CREDS.length], primary, secondary,
    termDay: TERM[i], backDay: BACK[i],
    facs: [0, 1, 2, 3].map(k => (i * 5 + k * 4 + (k > 1 ? 3 : 0)) % FACILITIES.length),
    firstDay, rate: 9 + R() * 7, syncMean: SLOW[i] || (2 + R() * 6),
    secShare: secondary.map(() => .15 + R() * .2),
    enc: new Int16Array(N), sec: secondary.map(() => new Int16Array(N)), syncMin: new Float32Array(N),
    vOff: new Int32Array(N + 1), vMin: []   // V5: every visit's time to sync, so late syncs can be counted and listed
  };
});

clinicians.forEach((c, i) => {
  for (let d = Math.max(0, c.firstDay); d < N; d++) {
    c.vOff[d] = c.vMin.length;
    const wd = d % 7;
    if (wd === 0) continue;
    if (c.termDay !== undefined && d >= c.termDay && !(c.backDay !== undefined && d >= c.backDay)) continue;   // access removed
    if (STOPPED[i] !== undefined && d >= STOPPED[i]) continue;
    let rate = wd === 6 ? (R() < .15 ? 3 : 0) : c.rate;
    if (DECLINE[i] && d >= DECLINE[i][0]) rate *= DECLINE[i][1];
    if (d === c.firstDay || d === c.backDay) rate = Math.max(rate, 4);
    const n = Math.max(0, Math.round(rate + (R() - .5) * rate * .6));
    c.enc[d] = n;
    for (let v = 0; v < n; v++) {
      const m = c.syncMean * 60 * (.4 + R() * 1.2);
      c.syncMin[d] += m; c.vMin.push(m);
      for (let k = 0; k < c.secondary.length; k++) {
        let share = c.secShare[k];
        if (SEC_ZERO[i] && d >= SEC_ZERO[i][0] && SEC_ZERO[i][1].includes(k)) share = 0;
        if (R() < share) { c.sec[k][d]++; break; }
      }
    }
  }
  c.vOff[N] = c.vMin.length;
});

/* ════════════════ Status, new clinicians, late syncs (V5) ════════════════ */
/* Tenure 1 runs from the first encounter to the day access was removed; tenure 2 starts at the first sync after access came back. */
const isActiveOn = (c, d) => (c.firstDay <= d && (c.termDay === undefined || d < c.termDay)) || (c.backDay !== undefined && c.backDay <= d);
/* First sync of the current stretch of work: a re-hire counts from the day they came back. */
const startOn = (c, d) => c.backDay !== undefined && c.backDay <= d ? c.backDay : c.firstDay;
const lastEncounter = c => { for (let d = Math.min(c.termDay === undefined ? LAST : c.termDay - 1, LAST); d >= 0; d--) if (c.enc[d] > 0) return d; return null; };
/* Syncs that took the limit or longer, in the range. Same test as the card: "X hours or longer". */
function lateVisits(c, a, b, limitH) {
  const out = [], lim = limitH * 60;
  for (let d = Math.max(a, 0); d <= b; d++) for (let v = c.vOff[d]; v < c.vOff[d + 1]; v++)
    if (c.vMin[v] >= lim) out.push({ day: d, fac: FACILITIES[c.facs[(d * 31 + (v - c.vOff[d]) * 17 + c.id) % 4]], min: c.vMin[v] });
  return out;
}
function lateCount(c, a, b, limitH) {
  let n = 0; const lim = limitH * 60;
  for (let d = Math.max(a, 0); d <= b; d++) for (let v = c.vOff[d]; v < c.vOff[d + 1]; v++) if (c.vMin[v] >= lim) n++;
  return n;
}

/* ════════════════ Helpers ════════════════ */
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const dt = d => new Date(START + d * DAY);
const fmt = (d, yr) => { const x = dt(d); return MON[x.getUTCMonth()] + ' ' + x.getUTCDate() + (yr ? ', ' + x.getUTCFullYear() : ''); };
const fmtRange = (a, b) => dt(a).getUTCFullYear() === dt(b).getUTCFullYear() ? fmt(a) + ' – ' + fmt(b, true) : fmt(a, true) + ' – ' + fmt(b, true);
const iso = d => dt(d).toISOString().slice(0, 10);
const fromIso = s => (Date.parse(s + 'T00:00:00Z') - START) / DAY;
const hm = min => { const m = Math.round(min); return Math.floor(m / 60) + 'h ' + String(m % 60).padStart(2, '0') + 'm'; };
const pct = p => (p > 0 ? '+' : p < 0 ? '−' : '') + Math.abs(Math.round(p)) + '%';
const ord = n => n + (['th','st','nd','rd'][(n % 100 - 20) % 10] || ['th','st','nd','rd'][n % 100] || 'th');
const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
const sum = (arr, a, b) => { let s = 0; for (let d = Math.max(a, 0); d <= b; d++) s += arr[d]; return s; };
const mean = xs => xs.length ? xs.reduce((s, v) => s + v, 0) / xs.length : 0;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fullName = c => c.name + ', ' + c.cred;
const $ = id => document.getElementById(id);

const EXT = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 2H2v8h8V7M7 2h3v3M10 2L5.5 6.5"/></svg>';
const FLAG = '<svg viewBox="0 0 9 10" fill="currentColor" aria-hidden="true"><path d="M1 0h1.2v10H1zM2.2 .6h6l-1.6 2.2 1.6 2.2h-6z"/></svg>';
const nameLink = c => `<a class="name" href="clinician-profile-placeholder.html?id=${c.id}&name=${encodeURIComponent(fullName(c))}" target="_blank" rel="noopener" title="${esc(fullName(c))}: open profile in a new tab">${esc(fullName(c))}${EXT}</a>`;
const flagged = (text, on) => on ? `<span class="flag" title="Over the limit">${FLAG}${text}</span>` : text;

/* ════════════════ Metrics: one row per active clinician ════════════════ */
function computeRows(a, b, cmp) {
  const len = b - a + 1, [pa, pb] = cmp || [a - len, a - 1];
  const rows = clinicians.filter(c => isActiveOn(c, b)).map(c => {
    const cur = sum(c.enc, a, b), prev = sum(c.enc, pa, pb);
    const start = startOn(c, b);
    const hasBase = prev > 0 && pa >= 0 && start <= pa && isActiveOn(c, pb);   // no full earlier period = no % baseline
    const syncTotal = sum(c.syncMin, a, b);
    const secBy = c.secondary.map((st, k) => ({ state: st, n: sum(c.sec[k], a, b) }));
    return {
      c, start, isNew: start >= a && start <= b, isRehire: c.backDay !== undefined && c.backDay >= a && c.backDay <= b,
      prev, cur, enc: cur,
      drop: hasBase ? (cur - prev) / prev * 100 : null,
      visits: cur, syncTotal, sync: cur ? syncTotal / cur : null,
      secBy, sec: secBy.length ? secBy.reduce((s, x) => s + x.n, 0) : null   // total across all secondary states
    };
  });
  let tMin = 0, tVis = 0;
  rows.forEach(r => { tMin += r.syncTotal; tVis += r.visits; });
  const avg = {
    m2: mean(rows.filter(r => r.drop !== null).map(r => r.drop)),
    m3: tVis ? tMin / tVis : 0,
    m4: mean(rows.map(r => r.enc)),
    m5: mean(rows.filter(r => r.sec !== null).map(r => r.sec))
  };
  const terminated = clinicians.filter(c => c.termDay !== undefined && c.termDay >= a && c.termDay <= b)
    .map(c => ({ c, term: c.termDay, first: c.firstDay, last: lastEncounter(c), back: c.backDay !== undefined && c.backDay <= b ? c.backDay : null }));
  return { a, b, pa, pb, rows, terminated, avg, scale: monthShare(a, b) };
}

/* How many months the range covers: each month counts the share of its days in the range.
   Oct 1–31 = 1, a calendar quarter = 3, Nov 1–10 = 10/30. Encounter thresholds are per month and scale by this. */
function monthShare(a, b) {
  let n = 0;
  for (let d = a; d <= b; d++) { const x = dt(d); n += 1 / new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + 1, 0)).getUTCDate(); }
  return n;
}

/* ════════════════ Thresholds ════════════════ */
const T_DEFAULTS = { m2: 30, m3: 24, m4: 100, m5: 0 };   // placeholders; m4 and m5 are per month (V3)
const T_KEY = 'vohra-payroll-dashboard-v5-thresholds';

// Each metric: how to read it, format it, rank it ("worst first") and test it against its threshold.
const METRICS = {
  m1: {
    title: 'New clinicians', col: 'First encounter',
    get: r => r.isNew ? r.start : null, dir: 'asc',
    fmt: v => fmt(v, true),
    noLimit: 'No limit. Lists every clinician whose first sync is in the date range, including re-hires.'
  },
  m6: {   // card only (V5): the people live in the Terminated view of All clinicians
    title: 'Terminations', cardOnly: true,
    noLimit: 'No limit. Lists every clinician whose access was removed in the date range.'
  },
  m2: {
    title: 'Biggest drop in encounters', col: 'Change in encounters',
    get: r => r.drop, dir: 'asc', fmt: pct,
    over: (v, t) => v <= -t,
    tText: t => `Drop of ${t}% or more`,
    tUnit: '% drop or more', tHelp: 'Encounters in the date range vs. the previous month, quarter or year (the same days of it for a period still in progress). Custom ranges: the same number of days just before.',
    tMin: 1, tMax: 100, tStep: 1
  },
  m3: {
    title: 'Slowest to sync', col: 'Avg. time to sync',
    get: r => r.sync, dir: 'desc', fmt: hm,
    over: (v, t) => v >= t * 60,
    tText: t => `${t}h or longer`,
    tUnit: 'hours or longer', tHelp: 'Average time from visit to sync.',
    tMin: 0, tMax: 240, tStep: .5
  },
  m4: {
    title: 'Fewest encounters', col: 'Encounters',
    get: r => r.enc, dir: 'asc', fmt: v => v,
    over: (v, t) => v <= t,
    tText: t => `${plural(t, 'encounter')} or fewer a month`, perMonth: true,
    tUnit: 'encounters or fewer a month', tHelp: 'Total encounters in the date range. Set for one month; it scales with the date range (a quarter is 3 times).',
    tMin: 0, tMax: 999, tStep: 1
  },
  m5: {
    title: 'Fewest encounters in secondary states', col: 'Secondary-state encounters',
    get: r => r.sec, dir: 'asc', fmt: v => v,
    over: (v, t) => v <= t,
    tText: t => `${plural(t, 'encounter')} or fewer a month`, perMonth: true,
    tUnit: 'encounters or fewer a month', tHelp: 'Total across all of the clinician’s secondary states, in the date range. Set for one month; it scales with the date range.',
    tMin: 0, tMax: 999, tStep: 1
  }
};
const T_KEYS = ['m2', 'm3', 'm4', 'm5'];

/* Metric groups: used on the dashboard, the thresholds pop-up and the table */
const GROUPS = [
  { id: 'clin', title: 'Clinician metrics', keys: ['m1', 'm6', 'm3'] },
  { id: 'enc',  title: 'Encounter metrics', keys: ['m2', 'm4', 'm5'] }
];
const tableKeys = g => g.keys.filter(k => !METRICS[k].cardOnly);   // Terminations is a card only
const GROUP_KEYS = GROUPS.flatMap(tableKeys);
const CARD_KEYS = GROUPS.flatMap(g => g.keys);

/* Thresholds for the selected range: per-month counts scale with the range, rates don't */
function effT(T, D) {
  const E = Object.assign({}, T);
  T_KEYS.forEach(k => { if (METRICS[k].perMonth) E[k] = Math.round(T[k] * D.scale); });
  return E;
}
/* "5 encounters or fewer a month · 2 for this range" */
function thrText(k, T, TE) {
  const m = METRICS[k];
  return m.tText(T[k]) + (m.perMonth && TE[k] !== T[k] ? ` · ${TE[k]} for this range` : '');
}

function loadThresholds() {
  const T = Object.assign({}, T_DEFAULTS);
  try { Object.assign(T, JSON.parse(localStorage.getItem(T_KEY) || '{}')); } catch (e) {}
  const q = new URLSearchParams(location.search);
  T_KEYS.forEach(k => { const v = parseFloat(q.get('t' + k.slice(1))); if (!isNaN(v)) T[k] = v; });
  return T;
}
function saveThresholds(T) { try { localStorage.setItem(T_KEY, JSON.stringify(T)); } catch (e) {} }

const isOver = (key, r, T) => { const v = METRICS[key].get(r); return v !== null && METRICS[key].over(v, T[key]); };
const anyOver = (r, T) => T_KEYS.some(k => isOver(k, r, T));

/* ════════════════ Page state in the URL (dashboard ↔ table) ════════════════ */
/* Calendar presets. "Current" periods run to the last day with data.
   Each preset returns its range and the period it's compared with (Biggest drop in encounters):
   the previous month / quarter / year, or the same days of it when the period is still in progress. */
const PRESETS = ['cm', 'pm', 'cq', 'pq', 'cy', 'py', 'custom'];
const DEFAULT_PRESET = 'pm';
const dayIdx = (y, m0, d) => (Date.UTC(y, m0, d) - START) / DAY;   // month is 0-based; overflow is fine
function periodStart(kind, d, back) {
  const x = dt(d), y = x.getUTCFullYear(), m = x.getUTCMonth();
  if (kind === 'm') return dayIdx(y, m - back, 1);
  if (kind === 'q') return dayIdx(y, m - m % 3 - 3 * back, 1);
  return dayIdx(y - back, 0, 1);
}
function presetRange(p) {
  const kind = p[1], cur = p[0] === 'c';
  const a = periodStart(kind, LAST, cur ? 0 : 1);
  const end = periodStart(kind, LAST, cur ? -1 : 0) - 1;
  const b = cur ? LAST : end;
  const pa = periodStart(kind, a, 1), pEnd = a - 1;
  return { range: [a, b], cmp: [pa, cur ? Math.min(pa + (b - a), pEnd) : pEnd] };
}
const sameLengthBefore = ([a, b]) => [a - (b - a + 1), a - 1];

function readState() {
  const q = new URLSearchParams(location.search);
  const preset = PRESETS.includes(q.get('preset')) ? q.get('preset') : DEFAULT_PRESET;
  let { range, cmp } = presetRange(preset === 'custom' ? DEFAULT_PRESET : preset);
  if (preset === 'custom') {
    const a = fromIso(q.get('from') || ''), b = fromIso(q.get('to') || '');
    if (!isNaN(a) && !isNaN(b) && a <= b) { range = [a, b]; cmp = sameLengthBefore(range); }
  }
  return { preset, range, cmp, n: q.get('n') === '10' ? 10 : 5, sort: q.get('sort'), dir: q.get('dir'), view: q.get('view') === 'terminated' ? 'terminated' : 'active' };
}

function stateQuery(s, T, extra) {
  const q = new URLSearchParams();
  q.set('preset', s.preset);
  if (s.preset === 'custom') { q.set('from', iso(s.range[0])); q.set('to', iso(s.range[1])); }
  q.set('n', s.n);
  T_KEYS.forEach(k => q.set('t' + k.slice(1), T[k]));
  Object.entries(extra || {}).forEach(([k, v]) => q.set(k, v));
  return '?' + q.toString();
}

/* Date-range control: same markup ids on both pages */
function initRange(state, onChange) {
  $('preset').innerHTML = [['cm', 'Current month'], ['pm', 'Previous month'], ['cq', 'Current quarter'], ['pq', 'Previous quarter'],
    ['cy', 'Current year'], ['py', 'Previous year'], ['custom', 'Custom range']].map(([v, t]) => `<option value="${v}">${t}</option>`).join('');
  $('from').min = $('to').min = iso(dayIdx(2025, 0, 1));
  $('from').max = $('to').max = iso(LAST);
  const note = () => { $('rangeNote').className = 'range-note'; $('rangeNote').innerHTML = `<strong>${fmtRange(state.range[0], state.range[1])}</strong> · ${plural(state.range[1] - state.range[0] + 1, 'day')}${['cm', 'cq', 'cy'].includes(state.preset) ? ' so far' : ''}`; };
  const sync = () => {
    $('preset').value = state.preset; $('from').value = iso(state.range[0]); $('to').value = iso(state.range[1]);
    $('from').disabled = $('to').disabled = state.preset !== 'custom';
    note();
  };
  $('preset').addEventListener('change', e => {
    state.preset = e.target.value;
    if (state.preset !== 'custom') Object.assign(state, presetRange(state.preset));
    sync(); onChange();
    if (state.preset === 'custom') $('from').focus();   // keeps the last range's dates as the starting point
  });
  const onDates = () => {
    const a = fromIso($('from').value), b = fromIso($('to').value);
    if (isNaN(a) || isNaN(b)) return;
    if (a > b) { $('rangeNote').className = 'range-note range-note--error'; $('rangeNote').textContent = 'The start date must be on or before the end date.'; return; }
    state.range = [a, b]; state.cmp = sameLengthBefore(state.range); note(); onChange();
  };
  $('from').addEventListener('change', onDates);
  $('to').addEventListener('change', onDates);
  sync();
}

/* ════════════════ Chrome (matches production Admin Portal, QA 2026-10-27) ════════════════ */
function mountChrome(crumbHtml) {
  const chev = '<svg viewBox="0 0 12 12"><path d="M1.5 4l4.5 4.5L10.5 4" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>';
  const nav = [['DASHBOARD'], ['OFFICE ADMIN', 1], ['CODING AND BILLING', 1], ['DEVICE MANAGEMENT'], ['UC VOHRA', 1], ['FORMS', 1], ['ADMIN', 1], ['REPORTS', 1], ['ADVANCED', 1]]
    .map(([t, c]) => `<a href="#">${t}${c ? ' ' + chev : ''}</a>`).join('');
  document.body.insertAdjacentHTML('afterbegin', `
    <header class="ap-header">
      <div class="ap-logo">
        <img src="vohra-logo-white-vhsmdc.svg" alt="Vohra VHSMDC, Medical Documentation &amp; Coding">
      </div>
      <nav class="ap-nav">${nav}</nav>
      <div class="ap-session">
        <div class="ap-session__time">29 : 56<small><span>MIN</span><span>SEC</span></small></div>
        <div class="ap-session__user">
          <svg viewBox="0 0 24 24" fill="#cfe2f3"><circle cx="12" cy="12" r="11"/><circle cx="12" cy="9.5" r="4" fill="#01427c"/><path d="M4.8 19a8.5 8.5 0 0 1 14.4 0A10.6 10.6 0 0 1 12 23a10.6 10.6 0 0 1-7.2-4z" fill="#01427c"/></svg>
          <svg viewBox="0 0 12 12"><path d="M1.5 4l4.5 4.5L10.5 4" stroke="#cfe2f3" stroke-width="1.8" fill="none"/></svg>
        </div>
      </div>
    </header>
    <div class="ap-crumb">${crumbHtml}</div>`);
  document.body.insertAdjacentHTML('beforeend', '<footer class="ap-footer">&copy; 2026 VOHRA. All rights reserved. VHS(R) Medical Documentation &amp; Coding. Version: 1.1.40</footer>');
}

const GEAR = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="2.2"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"/></svg>';

/* ════════════════ Threshold pop-up ════════════════ */
function openThresholds(T, onSave) {
  let scrim = $('tScrim');
  if (!scrim) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal-scrim" id="tScrim">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="tTitle">
          <div class="modal__head">
            <div>
              <div class="modal__title" id="tTitle">Settings</div>
              <div class="modal__desc">Set a limit for each metric. A clinician over a limit is marked in red, and each card counts them. Encounter counts are set for one month and scale with the date range.</div>
            </div>
            <button class="modal__close" id="tClose" aria-label="Close">&times;</button>
          </div>
          <div class="modal__body">
            ${GROUPS.map(g => `<div class="t-group">${g.title}</div>` + g.keys.map(k => { const m = METRICS[k]; return m.noLimit ? `
              <div class="t-row t-row--none">
                <div class="t-row__name">${m.title}</div>
                <div class="t-row__help">${m.noLimit}</div>
              </div>` : `
              <div class="t-row">
                <label class="t-row__name" for="t_${k}">${m.title}</label>
                <div class="t-row__ctrl"><input class="input" type="number" id="t_${k}" min="${m.tMin}" max="${m.tMax}" step="${m.tStep}"><span>${m.tUnit}</span></div>
                <div class="t-row__help">${m.tHelp}</div>
                <div class="t-row__err" id="te_${k}"></div>
              </div>`; }).join('')).join('')}
          </div>
          <div class="modal__foot">
            <button class="link-btn" id="tReset">Restore defaults</button>
            <button class="btn" id="tCancel">Cancel</button>
            <button class="btn btn--primary" id="tSave">Save settings</button>
          </div>
        </div>
      </div>`);
    scrim = $('tScrim');
    const close = () => scrim.classList.remove('open');
    $('tClose').onclick = $('tCancel').onclick = close;
    scrim.addEventListener('mousedown', e => { if (e.target === scrim) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && scrim.classList.contains('open')) close(); });
    $('tReset').onclick = () => T_KEYS.forEach(k => { $('t_' + k).value = T_DEFAULTS[k]; $('te_' + k).textContent = ''; });
    $('tSave').onclick = () => {
      const next = {}; let ok = true;
      T_KEYS.forEach(k => {
        const m = METRICS[k], v = parseFloat($('t_' + k).value);
        const bad = isNaN(v) || v < m.tMin || v > m.tMax;
        $('te_' + k).textContent = bad ? `Enter a number from ${m.tMin} to ${m.tMax}.` : '';
        if (bad) ok = false; else next[k] = v;
      });
      if (!ok) return;
      scrim._onSave(next); close();
    };
  }
  scrim._onSave = onSave;
  T_KEYS.forEach(k => { $('t_' + k).value = T[k]; $('te_' + k).textContent = ''; });
  scrim.classList.add('open');
  $('t_m3').focus();
}

/* ════════════════ Late syncs pop-up (V5) ════════════════ */
/* Opened from "N of V visits over 24h" on the card and the table. Lists the syncs behind that count, longest first. */
const lateLabel = (r, limitH, a, b) => {
  const n = lateCount(r.c, a, b, limitH), t = `${n} of ${r.visits} visits over ${limitH}h`;
  return n ? `<button type="button" class="late-link" data-late="${r.c.id}" title="See the ${plural(n, 'late sync')}">${t}</button>` : `<span class="late-none">${t}</span>`;
};
function openLate(c, a, b, limitH) {
  let scrim = $('lScrim');
  if (!scrim) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal-scrim" id="lScrim">
        <div class="modal modal--late" role="dialog" aria-modal="true" aria-labelledby="lTitle">
          <div class="modal__head">
            <div>
              <div class="modal__title" id="lTitle"></div>
              <div class="modal__desc" id="lDesc"></div>
            </div>
            <button class="modal__close" id="lClose" aria-label="Close">&times;</button>
          </div>
          <div class="modal__body"><table class="late-table"><thead><tr><th>Date</th><th>Facility</th><th class="num">Time to sync</th></tr></thead><tbody id="lBody"></tbody></table></div>
          <div class="modal__foot"><span class="modal__note" id="lNote"></span><button class="btn" id="lDone">Close</button></div>
        </div>
      </div>`);
    scrim = $('lScrim');
    const close = () => scrim.classList.remove('open');
    $('lClose').onclick = $('lDone').onclick = close;
    scrim.addEventListener('mousedown', e => { if (e.target === scrim) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && scrim.classList.contains('open')) close(); });
  }
  const list = lateVisits(c, a, b, limitH).sort((x, y) => y.min - x.min);
  $('lTitle').textContent = 'Late syncs: ' + fullName(c);
  $('lDesc').textContent = `${plural(list.length, 'visit')} took ${limitH}h or longer to sync, ${fmtRange(a, b)}.`;
  $('lBody').innerHTML = list.map(v => `<tr><td>${WD[dt(v.day).getUTCDay()]}, ${fmt(v.day, true)}</td><td>${esc(v.fac)}</td><td class="num"><span class="flag">${FLAG}${hm(v.min)}</span></td></tr>`).join('');
  $('lNote').textContent = 'Longest first';
  scrim.classList.add('open');
  $('lDone').focus();
}
/* One click handler per page; ctx() returns { a, b, limitH } for the current view */
function bindLate(ctx) {
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-late]'); if (!btn) return;
    const x = ctx(); openLate(clinicians[btn.dataset.late - 1], x.a, x.b, x.limitH);
  });
}

/* Prototype stand-in for the Excel download: says what the file would hold */
function toast(html) {
  let t = $('toast');
  if (!t) { document.body.insertAdjacentHTML('beforeend', '<div class="toast" id="toast" role="status"></div>'); t = $('toast'); }
  t.innerHTML = html; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 5000);
}
