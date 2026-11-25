// Pebble core: state, seed data, helpers, shared mock-draft component
const KEY = 'pebble.v1';
const DAY = 864e5;
const ago = d => new Date(Date.now() - d * DAY).toISOString().slice(0, 10);
const ahead = d => new Date(Date.now() + d * DAY).toISOString().slice(0, 10);

const SEED_FRIENDS = [
  ['Mei-Ling Chen', 'Taipei', 3, 'your extra-stinky-tofu order'],
  ['Jordan Okafor', 'Seattle', 41, 'your sunrise runs up Mount Si'],
  ['Priya Raman', 'San Francisco', 12, 'your yearly Spirited Away rewatch'],
  ['Kenji Watanabe', 'Tokyo', 210, 'the time you taught me tamagoyaki (badly)'],
  ['Sofia Alvarez', 'New York', 95, 'the pigeon incident'],
  ['Wei-Ting Lin', 'Taipei', 860, 'the bubble tea you still owe me'],
  ['Marcus Bell', 'Seattle', 7, 'your hatred of losing at Catan'],
  ['Aiko Suzuki', 'Tokyo', 30, 'the wobbly mug you made me'],
  ['Daniel Kim', 'San Francisco', 1200, 'how you mentored me through my first launch'],
  ['Amara Nwosu', 'New York', 18, 'your love of “Golden Hour”'],
  ['Lucas Moreau', 'San Francisco', 60, 'your sourdough evangelism'],
  ['Hana Park', 'New York', 400, 'the dance class we both quit after week 3'],
];
const COLORS = ['#d9825b', '#7fa58b', '#e7b75f', '#9b8bc4', '#c9707a', '#5f9fb0'];

function seed() {
  return {
    friends: SEED_FRIENDS.map(([name, city, d, note], i) => ({ id: 'f' + i, name, city, last: ago(d), note, color: COLORS[i % COLORS.length] })),
    twelve: [{ fid: 'f1', why: 'Want to run together again', met: false }, { fid: 'f8', why: 'He shaped my career; never said thanks', met: false }, { fid: 'f2', why: 'Closest SF friend', met: true }],
    freq: { f0: { often: 'Weekly', ch: 'Voice note' } },
    plans: [{ id: 'p1', fid: 'f4', act: 'Brooklyn bookstore crawl', date: ahead(75), history: [], done: false }],
    rituals: [], roles: { f0: 'Core', f2: 'Core', f6: 'Fun crew', f8: 'Helpers' },
    zines: [], trips: [], intros: [], favors: {}, circles: [],
    ai: { principle: true, log: [] }, swaps: {}, v: 2,
    profile: { onboarded: false, goal: 'old', core: 5, added: [], done: {} },
  };
}
let S;
try { S = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { S = seed(); }
// v2 migration: seed notes became noun phrases so drafts read naturally
if ((S.v || 1) < 2) { S.friends.forEach(f => { const i = +f.id.slice(1); if (/^f\d+$/.test(f.id) && SEED_FRIENDS[i]) f.note = SEED_FRIENDS[i][3]; }); S.v = 2; }
S.profile = S.profile || { onboarded: false, goal: 'old', core: 5, added: [], done: {} };
const save = () => localStorage.setItem(KEY, JSON.stringify(S));
save();

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const F = id => S.friends.find(f => f.id === id);
const first = f => f ? f.name.split(' ')[0] : 'friend';
const daysSince = iso => Math.floor((Date.now() - new Date(iso)) / DAY);
const since = iso => { const d = daysSince(iso); return d < 1 ? 'today' : d < 60 ? d + 'd ago' : d < 730 ? Math.round(d / 30) + 'mo ago' : Math.round(d / 365) + 'y ago'; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = iso => iso ? new Date(iso + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
const av = f => `<span class="av" style="background:${f.color}">${esc(f.name[0])}</span>`;
const friendOpts = (sel, filter = () => true) => S.friends.filter(filter).map(f => `<option value="${f.id}" ${f.id === sel ? 'selected' : ''}>${esc(f.name)} · ${esc(f.city)}</option>`).join('');
const why = t => `<div class="why"><b>Why this works</b>${t}</div>`;
const touch = fid => { const f = F(fid); if (f) { f.last = ago(0); save(); } };

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2400); }
async function copyText(txt) {
  try { await navigator.clipboard.writeText(txt); }
  catch { const a = document.createElement('textarea'); a.value = txt; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); }
  toast('Copied to clipboard');
}
// Chip group: returns getter. opts = array of strings
function chips(el, opts, val, onChange, multi = false) {
  let cur = multi ? new Set(val || []) : val;
  el.innerHTML = opts.map(o => `<span class="chip" data-v="${esc(o)}">${esc(o)}</span>`).join('');
  const paint = () => $$('.chip', el).forEach(c => c.classList.toggle('on', multi ? cur.has(c.dataset.v) : c.dataset.v === cur));
  el.onclick = e => { const c = e.target.closest('.chip'); if (!c) return; const v = c.dataset.v; if (multi) cur.has(v) ? cur.delete(v) : cur.add(v); else cur = v; paint(); onChange && onChange(multi ? [...cur] : cur); };
  paint(); return () => multi ? [...cur] : cur;
}
// Mock AI draft box: variants() returns string[]; Regenerate cycles; editable; Copy; mock Send
function draftBox(el, variants, { to = () => 'your friend', onSend } = {}) {
  let i = 0;
  el.innerHTML = `<label>Draft <span class="pill">mock AI · templated</span></label><textarea class="dt"></textarea>
    <div class="row" style="flex:none"><div style="flex:none"><button class="btn s rg">↻ Regenerate</button><button class="btn s cp">Copy</button><button class="btn g sd">Send (mock)</button></div></div>
    <p class="mute">${S.ai.principle ? 'Pebble drafts, you press send. Edit it so it sounds like you.' : ''}</p>`;
  const ta = $('.dt', el);
  const fill = () => { const v = variants(); ta.value = v[i % v.length]; };
  fill();
  $('.rg', el).onclick = () => { i++; fill(); };
  $('.cp', el).onclick = () => copyText(ta.value);
  $('.sd', el).onclick = () => { if (!ta.value.trim()) return toast('Write something first'); toast(`✓ Sent to ${to()} (mock — nothing left your device)`); onSend && onSend(ta.value); };
  return { refresh: () => { i = 0; fill(); }, value: () => ta.value };
}

// Tool registry
const TOOLS = [];
const SECTIONS = {
  starting: { title: 'Starting', ic: '✦', blurb: 'Turn strangers and acquaintances into real conversations.' },
  sustaining: { title: 'Sustaining', ic: '♡', blurb: 'Small, repeated reach-outs that keep friendships alive.' },
  scaling: { title: 'Scaling', ic: '❋', blurb: 'Connect your friends to each other and grow a web.' },
  ai: { title: 'AI & Connection', ic: '◎', blurb: 'Use tools to reach humans, not to replace them.' },
};
const tool = t => TOOLS.push(t);
