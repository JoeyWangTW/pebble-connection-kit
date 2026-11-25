// Onboarding, simplified home, explore, friends, settings, Where AI helps
const GOALS = {
  new: { label: 'Meet new people', ic: '✦', tools: ['swap', 'deck', 'shared'] },
  old: { label: 'Keep up with old friends', ic: '♡', tools: ['pebble', 'dormant', 'plan'] },
  host: { label: 'Host & bring people together', ic: '❋', tools: ['city', 'intro', 'seat'] },
};
const T = id => TOOLS.find(t => t.id === id);
const weekKey = () => { const d = new Date(), j = new Date(d.getFullYear(), 0, 1); return d.getFullYear() + '-W' + Math.ceil(((d - j) / DAY + j.getDay() + 1) / 7); };
const addFriend = (name, city, note, days = 30) => { const f = { id: 'u' + uid(), name, city: city || 'Somewhere', last: ago(days), note: note || '', color: COLORS[S.friends.length % COLORS.length] }; S.friends.unshift(f); return f; };

function onboard(el, step = 0) {
  const P = S.profile, dots = `<div class="dots">${[0, 1, 2, 3].map(i => `<i class="${i === step ? 'on' : ''}"></i>`).join('')}</div>`;
  const next = () => step < 3 ? onboard(el, step + 1) : finish();
  const finish = () => { P.onboarded = true; save(); location.hash = '#/'; route(); toast('You’re all set'); };
  const nav = (cta = 'Continue') => `<div class="obnav"><button class="btn" id="ob-n">${cta}</button><button class="btn s" id="ob-s">${step === 3 ? 'Skip & finish' : 'Skip'}</button></div>`;
  let body = '', onNext = () => {};
  if (step === 0) body = `<div class="obhero"><span class="dot big"></span><h1>Welcome to Pebble</h1><p class="lead">Connection isn't kept alive by good intentions — it's kept alive by small, repeated reach-outs.</p><p class="mute">Pebble gives you tiny, research-backed nudges to start, keep and grow friendships. Two minutes to set up.</p></div>`;
  if (step === 1) body = `<h2>What do you want help with first?</h2><p class="mute">You can change this any time in Settings.</p><div class="goals">${Object.entries(GOALS).map(([k, g]) => `<button class="card goal ${P.goal === k ? 'on' : ''}" data-g="${k}"><span class="ic">${g.ic}</span><b>${g.label}</b></button>`).join('')}</div>`;
  if (step === 2) body = `<h2>How many close friends do you want to invest in this year?</h2><div class="chips big" id="ob-c"></div><div class="why"><b>A small core is enough</b>Most people's innermost circle holds around five people (Dunbar's layered-network research). Depth with a few beats keeping up with everyone.</div>`;
  if (step === 3) body = `<h2>Add up to 3 people</h2><p class="mute">Optional. They'll join your friends list and your “12 people this year”.</p>${[0, 1, 2].map(i => `<div class="card" style="padding:12px"><div class="row"><input class="on-n" placeholder="Name"><input class="on-c" placeholder="City"></div><input class="on-w" placeholder="One line: why them?" style="margin-top:8px"></div>`).join('')}`;
  el.innerHTML = `<div class="ob">${dots}${body}${nav(step === 3 ? 'Finish' : step === 0 ? 'Get started' : 'Continue')}</div>`;
  if (step === 1) $$('.goal', el).forEach(b => b.onclick = () => { P.goal = b.dataset.g; save(); onboard(el, 2); });
  if (step === 2) { const g = chips($('#ob-c'), ['3', '5', '12'], String(P.core)); onNext = () => { P.core = +g(); }; }
  if (step === 3) onNext = () => { $$('.on-n', el).forEach((n, i) => { const name = n.value.trim(); if (!name) return; const f = addFriend(name, $$('.on-c', el)[i].value.trim(), '');
    P.added.push(f.id); if (S.twelve.length < 12) S.twelve.unshift({ fid: f.id, why: $$('.on-w', el)[i].value.trim() || 'They matter to me', met: false }); }); };
  $('#ob-n').onclick = () => { onNext(); save(); next(); };
  $('#ob-s').onclick = next;
}

function greeting() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; }
function thisWeek() {
  const P = S.profile, f = F(P.added.find(id => F(id))) || [...S.friends].sort((a, b) => new Date(a.last) - new Date(b.last))[0], n = first(f), personal = !!P.added.find(id => F(id));
  return {
    old: { txt: `Send ${n} a pebble: one short “this reminded me of you” message.`, href: `#/t/pebble?f=${f.id}`, cta: 'Open Pebble helper' },
    new: { txt: personal ? `Next time you talk to ${n}, swap “What’s new?” for a deeper question.` : 'In your next conversation, swap one autopilot question for a deeper one.', href: '#/t/swap', cta: 'Pick a better opener' },
    host: { txt: `Pick a date and invite ${n} plus two people they haven’t met to one easy dinner.`, href: '#/t/city', cta: 'Plan the dinner' },
  }[P.goal];
}
function home(el) {
  const P = S.profile, G = GOALS[P.goal], wk = weekKey(), tw = thisWeek(), met = S.twelve.filter(t => t.met).length;
  const stale = [...S.friends].sort((a, b) => new Date(a.last) - new Date(b.last)).slice(0, 3);
  el.innerHTML = `<h1>${greeting()}</h1><p class="mute">Your focus: <b>${G.ic} ${G.label}</b> · <a href="#/settings">change</a></p>
    <div class="card hero"><span class="pill">This week, do one thing</span><p style="margin-top:8px">${esc(tw.txt)}</p>
      <div class="row" style="margin-top:10px"><a class="btn" href="${tw.href}" style="flex:none">${tw.cta}</a><label class="check" style="flex:none"><input type="checkbox" id="wd" ${P.done[wk] ? 'checked' : ''}> Done</label></div></div>
    <h3>Recommended for you</h3>${G.tools.map(id => { const t = T(id); return `<a class="card tool" href="#/t/${t.id}"><span class="n">${SECTIONS[t.sec].ic}</span><span><h3 style="margin:0">${t.title}</h3><p>${t.sub}</p></span></a>`; }).join('')}
    <div class="card"><div class="row"><span><b>Your core this year</b><br><span class="mute">${met} of ${P.core} met · small is enough</span></span><a class="btn s" href="#/t/twelve" style="flex:none">View list</a></div><div class="bar" style="margin-top:8px"><i style="width:${Math.min(100, met / P.core * 100)}%"></i></div></div>
    <div class="card"><div class="row"><h3 style="margin:0">Drifting a little</h3><a href="#/friends" class="mute" style="flex:none;text-align:right">All friends →</a></div><ul class="list">${stale.map(f => `<li><span class="row" style="flex:1;gap:10px">${av(f)}<span style="flex:1"><b>${esc(f.name)}</b><br><span class="mute">last contact ${since(f.last)}</span></span></span><a class="btn s" href="#/t/pebble?f=${f.id}" style="flex:none">Pebble</a></li>`).join('')}</ul></div>
    <a class="btn" href="#/explore" style="width:100%;justify-content:center">Explore all ${TOOLS.length} tools</a><a class="btn s" href="#/ai-helps" style="width:100%;justify-content:center">Where AI helps (and where it shouldn’t)</a>`;
  $('#wd').onchange = e => { P.done[wk] = e.target.checked; save(); if (e.target.checked) toast('Nice. That’s a real pebble.'); };
}
function explore(el) {
  el.innerHTML = `<h1>Explore</h1><p class="mute">All ${TOOLS.length} tools, grouped by what they help with.</p>
    <div class="grid">${Object.entries(SECTIONS).map(([k, s]) => `<a class="sec c-${k}" href="#/s/${k}"><span class="ic">${s.ic}</span><h3>${s.title}</h3><p>${s.blurb}</p><p class="mute" style="margin-top:6px">${(n => n + (n === 1 ? ' tool' : ' tools'))(TOOLS.filter(t => t.sec === k).length)} →</p></a>`).join('')}</div>`;
}
function friends(el, q) {
  const f = q.id ? F(q.id) : null;
  el.innerHTML = `<a class="back" href="#/">← Home</a><h1>Your people</h1><div class="card"><h3>${f ? 'Edit ' + esc(first(f)) : 'Add a friend'}</h3>
    <div class="row"><input id="fn" placeholder="Name" value="${esc(f?.name)}"><input id="fc" placeholder="City" value="${esc(f?.city)}"></div>
    <label>Something you remember about them (optional)</label><input id="fm" placeholder="e.g. the pigeon incident" value="${esc(f?.note)}">
    <label>Last contacted</label><input type="date" id="fl" value="${f?.last || ago(30)}">
    <button class="btn" id="fs">${f ? 'Save changes' : 'Add friend'}</button>${f ? '<a class="btn s" href="#/friends">Cancel</a><button class="btn s" id="fx">Remove</button>' : ''}</div>
    <div class="card"><ul class="list">${S.friends.map(x => `<li><span class="row" style="flex:1;gap:10px">${av(x)}<span style="flex:1"><b>${esc(x.name)}</b><br><span class="mute">${esc(x.city)} · ${since(x.last)}</span></span></span><a class="btn s" href="#/friends?id=${x.id}" style="flex:none">Edit</a></li>`).join('')}</ul></div>`;
  $('#fs').onclick = () => { const name = $('#fn').value.trim(); if (!name) return toast('Add a name');
    const o = f || addFriend(name); Object.assign(o, { name, city: $('#fc').value.trim() || 'Somewhere', note: $('#fm').value.trim(), last: $('#fl').value || ago(30) }); save(); toast(f ? 'Saved' : 'Friend added'); location.hash = '#/friends'; route(); };
  $('#fx') && ($('#fx').onclick = () => { if (!confirm(`Remove ${f.name}?`)) return; S.friends = S.friends.filter(x => x.id !== f.id); S.twelve = S.twelve.filter(t => t.fid !== f.id); save(); location.hash = '#/friends'; route(); });
}
function settings(el) {
  const P = S.profile;
  el.innerHTML = `<h1>Settings</h1><div class="card"><h3>Your focus</h3><div class="chips" id="sg"></div><label>Close friends to invest in this year</label><div class="chips" id="sc"></div></div>
    <div class="card"><a class="btn s" href="#/friends">Add or edit friends</a><a class="btn s" href="#/t/reflect">AI principles & human-time log</a></div>
    <div class="card"><button class="btn s" id="ro">Restart onboarding</button><button class="btn s" id="rs">Reset demo data</button><p class="mute">Prototype · everything is stored only in this browser.</p></div>`;
  const keys = Object.keys(GOALS);
  chips($('#sg'), keys.map(k => GOALS[k].label), GOALS[P.goal].label, v => { P.goal = keys.find(k => GOALS[k].label === v); save(); toast('Focus updated'); });
  chips($('#sc'), ['3', '5', '12'], String(P.core), v => { P.core = +v; save(); });
  $('#ro').onclick = () => { P.onboarded = false; save(); location.hash = '#/onboard'; };
  $('#rs').onclick = () => { if (confirm('Reset all friends, plans and logs to the demo data? Your focus stays.')) { S = Object.assign(seed(), { profile: { ...P, added: [], done: {} } }); save(); toast('Demo data restored'); route(); } };
}

const AIROWS = [
  ['pebble', 'High', ['Remembering', 'Timing', 'Finding the words'], 'Spots natural moments (a song you both love, their city in the news, a birthday) and texts you a ready draft that names a detail you once told it.', 'You decide whether to send and add a line in your own voice.'],
  ['dormant', 'High', ['Awkwardness', 'Finding the words'], 'Finds a low-stakes reason to reconnect after years of silence and drafts a short, no-pressure opener, or a voice-note script.', 'You choose who, and you record the voice note yourself.'],
  ['city', 'High', ['Logistics', 'Coordinating a group', 'Awkwardness'], 'Sends invites, collects RSVPs by text, replies warmly to “not this time”, sends reminders and the address.', 'You pick the mix of people and you host.'],
  ['plan', 'High', ['Follow-through', 'Timing'], 'Nudges both of you a week out; when a plan slips, proposes three new dates instead of letting it die.', 'You show up.'],
  ['rituals', 'Medium', ['Remembering', 'Timing'], 'Keeps the recurring dates and pings everyone with a suggested next slot.', 'Being present when it happens.'],
  ['intro', 'Medium', ['Coordinating a group', 'Awkwardness'], 'Asks each person privately, tracks both yeses, then drafts the group intro.', 'Your judgment about who should meet.'],
  ['zine', 'Medium', ['Follow-through', 'Remembering'], 'Texts both of you after a hangout for one photo and one line, then lays out the page.', 'The hangout, and the memories themselves.'],
  ['freq', 'Medium', ['Awkwardness', 'Remembering'], 'Suggests when to raise “how often feels right?” and gently flags drift from what you agreed.', 'The conversation itself.'],
  ['twelve', 'Medium', ['Remembering', 'Timing'], 'Notices who on your list is drifting and suggests a small next step.', 'Deciding who matters to you.'],
  ['favors', 'Medium', ['Follow-through'], 'Matches a five-minute favor to something a friend recently mentioned.', 'Actually doing the favor.'],
  ['seat', 'Low', ['Logistics'], 'Drafts a seating plan that mixes people who don’t know each other.', 'Reading the room on the night.'],
  ['repair', 'Low', ['Awkwardness'], 'Only helps you prepare gentle wording beforehand.', 'The repair conversation must be yours, ideally in person or by voice.'],
  ['deck', 'Low', ['Awkwardness'], 'Can suggest a prompt.', 'The talking, the listening and the vulnerability.'],
  ['drill', 'Low', [], 'Nothing much beyond a timer.', 'All of it: one minute of real attention.'],
];
const TOP = [['pebble', 'Remembering and finding the words are the two biggest blockers to small reach-outs, and both are an agent’s strengths.'],
  ['dormant', 'Silence gets more awkward the longer it lasts. A natural reason plus a draft removes the hardest first step.'],
  ['city', 'Group logistics and gracious declines are tedious for people and easy for an agent over text.'],
  ['plan', 'Most plans die from drift, not from choice. Automatic nudges and new-date proposals keep them alive.'],
  ['rituals', 'Recurring hangouts are pure memory and scheduling work.'],
  ['intro', 'Asking two people separately and lining up both yeses is coordination an agent does well.'],
  ['zine', 'Collecting photos and one-liners by text right after a hangout is easy for an agent and hard for busy people.'],
  ['freq', 'Raising “how often?” feels awkward. An agent can suggest the moment and quietly track drift.']];
function aiHelps(el) {
  const tag = t => `<span class="pill">${t}</span>`, lvl = l => `<span class="pill ${l === 'High' ? 'ok' : l === 'Low' ? 'warn' : ''}">AI value: ${l}</span>`;
  el.innerHTML = `<h1>Where AI helps</h1><div class="card hero"><p>The agent drafts, remembers and reminds. You choose who matters, press send and show up.</p></div>
    <h2>Top opportunities</h2><div class="card"><ol class="toplist">${TOP.map(([id, r]) => `<li><a href="#/t/${id}"><b>${T(id).title}</b></a><br><span class="mute">${r}</span></li>`).join('')}</ol></div>
    <h2>Action by action</h2><p class="mute">Especially for a text or iMessage agent that lives where your conversations already are.</p>
    ${AIROWS.map(([id, l, hard, help, human]) => `<div class="card ai"><div class="row"><a href="#/t/${id}" style="flex:2"><h3 style="margin:0">${T(id).title}</h3></a><span style="flex:none">${lvl(l)}</span></div>
      ${hard.length ? `<div class="chips">${hard.map(tag).join('')}</div>` : ''}<p><b>🤖 Agent helps:</b> ${help}</p><p><b>🙂 Stays human:</b> ${human}</p></div>`).join('')}
    <div class="card"><h3>Keep these human</h3><p>Deep talk, the 60-second drill and repair conversations get their value from two people being present. AI can at most help you prepare the words.</p><a class="btn s" href="#/t/reflect">Log your human time</a></div>`;
}
