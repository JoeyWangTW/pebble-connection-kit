// SUSTAINING tools
tool({ id: 'pebble', sec: 'sustaining', title: 'Pebble helper', sub: '“This reminded me of you.”',
  why: 'Like penguins giving pebbles, small low-effort signals that you thought of someone keep a tie warm. Liu, Rim, Min & Min (2022) showed people consistently underestimate how much a surprise check-in is appreciated. Naming a specific detail shows you remember them, which makes people feel understood.',
  render(el, q) {
    el.innerHTML = `<div class="card"><label>Friend</label><select id="pf">${friendOpts(q.f)}</select><label>What reminded you?</label><div class="chips" id="pt"></div>
      <label>The detail</label><input id="pd" placeholder="e.g. a new ramen shop on my street (optional)"><label>Memory flex: one specific thing you remember (optional)</label><input id="pm" placeholder="e.g. the pigeon incident"><div id="db"></div></div>`;
    const setMem = () => $('#pm').value = F($('#pf').value).note;
    setMem();
    let box;
    const g = chips($('#pt'), ['a song', 'a place', 'a memory', 'a link'], 'a place', () => box.refresh());
    const LEAD = { 'a song': [d => `“${d}” came on today`, 'A song came on today'], 'a place': [d => `Ended up at ${d} today`, 'I walked past a spot today'],
      'a memory': [d => `I was remembering ${d} today`, 'An old memory popped up today'], 'a link': [d => `I came across ${d}`, 'I came across something online'] };
    const V = () => { const f = F($('#pf').value), d = $('#pd').value.trim().replace(/[.!]+$/, ''), m = $('#pm').value.trim().replace(/[.!]+$/, ''), L = LEAD[g()], lead = d ? L[0](d) : L[1];
      return [`Hey ${first(f)}! ${lead} and immediately thought of you.${m ? ` Still smiling about ${m}.` : ''} Hope you're doing well 🙂`,
        `Quick one: ${lead}, and it made me think of you.${m ? ` It brought back ${m}.` : ''} No need to reply, just wanted you to know you crossed my mind.`,
        `${first(f)}!! ${lead}, and you were the first person I thought of${m ? ` (${m} still makes me laugh)` : ''}. How are you these days?`]; };
    box = draftBox($('#db'), V, { to: () => F($('#pf').value).name, onSend: () => touch($('#pf').value) });
    $('#pf').onchange = () => { setMem(); box.refresh(); };
    $('#pd').oninput = $('#pm').oninput = () => box.refresh();
  } });
const cap = s => s[0].toUpperCase() + s.slice(1), lc = s => s ? s[0].toLowerCase() + s.slice(1) : 'you came to mind';

tool({ id: 'dormant', sec: 'sustaining', title: 'Dormant-tie reconnect wizard', sub: 'Revive someone you haven’t talked to in years.',
  why: 'Levin, Walter & Murnighan (2011) found reconnected “dormant ties” gave advice as useful as current ones, plus fresher perspectives, and reconnecting felt easier than expected. Liu et al. (2022) showed people underestimate how welcome outreach is. Many people write a message and never send it, yet most who do send it are glad they did.',
  render(el) {
    const old = S.friends.filter(f => daysSince(f.last) > 300);
    el.innerHTML = `<div class="card"><b>Step 1 · Who?</b> <span class="mute">(not contacted in 10+ months)</span><select id="df">${friendOpts(old[0]?.id, f => daysSince(f.last) > 300)}</select>
      <b style="display:block;margin-top:14px">Step 2 · How?</b><div class="chips" id="dc"></div><p class="mute" id="dn"></p>
      <b style="display:block;margin-top:14px">Step 3 · Lead with</b><div class="chips" id="dm"></div><div id="db"></div></div>`;
    let box; const R = () => box && box.refresh();
    const ch = chips($('#dc'), ['Text', 'Voice note', 'Call', 'Video'], 'Voice note', v => { $('#dn').textContent = v === 'Text' ? 'Text is fine! But hearing your voice tends to feel warmer and more connecting than text (Kumar & Epley, 2021). Maybe try a voice note?' : 'Nice: voices build more connection than text, and it’s less awkward than people expect.'; R(); });
    $('#dn').textContent = 'Nice: voices build more connection than text, and it’s less awkward than people expect.';
    const md = chips($('#dm'), ['Catching up', 'Give first: “How can I help?”'], 'Catching up', R);
    box = draftBox($('#db'), () => { const f = F($('#df').value), yrs = Math.max(1, Math.round(daysSince(f.last) / 365)), give = md().startsWith('Give'), vo = ch() !== 'Text' ? `(${ch()} script: say it your way)\n` : '', note = f.note ? `I was just thinking about ${f.note} and` : 'You crossed my mind today and I';
      return give ? [`${vo}Hi ${first(f)}, it's been ${yrs > 1 ? yrs + ' years' : 'a while'}! ${f.note ? `I was thinking about ${f.note}. ` : ''}Is there anything you're working on where I could help? An intro, a second pair of eyes, anything.`, `${vo}${first(f)}! Long time. I've always appreciated you, and I'd like to be useful back. Anything on your plate right now where I could lend a hand?`]
        : [`${vo}Hi ${first(f)}! It's been ${yrs > 1 ? yrs + ' years' : 'way too long'}. ${note} wanted to say hi. How's life in ${f.city}?`, `${vo}${first(f)}, random but sincere: I thought of you today and realized how long it's been. Would love to hear what you're up to. Coffee or a quick call sometime?`]; },
      { to: () => F($('#df').value).name, onSend: () => { touch($('#df').value); toast('Sent! Most people are glad they reached out.'); } });
    $('#df').onchange = R;
  } });

tool({ id: 'twelve', sec: 'sustaining', title: '12 people this year', sub: 'A short list worth showing up for.',
  why: 'Roberts & Dunbar (2011) found that emotional closeness drops when contact drops, unless you keep investing. Picking a short, deliberate list turns good intentions into specific people. Reaching out is more welcome than you think (Liu et al., 2022).',
  render(el) {
    const paint = () => {
      const met = S.twelve.filter(t => t.met).length, stale = S.twelve.map(t => F(t.fid)).filter(f => f && daysSince(f.last) > 30).sort((a, b) => new Date(a.last) - new Date(b.last))[0];
      el.innerHTML = `<div class="card"><div class="row"><h2 style="flex:none">${met} / 12 met</h2><span class="mute" style="text-align:right">${S.twelve.length} on the list</span></div><div class="bar"><i style="width:${met / 12 * 100}%"></i></div>
        <ul class="list" style="margin-top:10px">${S.twelve.map((t, i) => { const f = F(t.fid); return `<li><span class="row" style="flex:1;gap:8px">${av(f)}<span style="flex:1"><b>${esc(f.name)}</b><br><span class="mute">${esc(t.why)} · last ${since(f.last)}</span></span></span><span style="flex:none"><button class="btn ${t.met ? 'g' : 's'} mt" data-i="${i}">${t.met ? '✓ Met' : 'Mark met'}</button><button class="btn s rm" data-i="${i}">✕</button></span></li>`; }).join('')}</ul>
        ${S.twelve.length < 12 ? `<label>Add someone</label><div class="row"><select id="tf">${friendOpts(null, f => !S.twelve.some(t => t.fid === f.id))}</select><input id="tw" placeholder="One line: why them?"></div><button class="btn" id="ta">Add</button>` : '<p class="mute">Your 12 are set.</p>'}</div>
        ${stale ? `<div class="card" style="background:#f6d8c6"><h3>It's been ${since(stale.last).replace(' ago', '')} since ${esc(first(stale))}</h3><p>Reaching out is more welcome than you think. A tiny pebble is enough.</p><a class="btn" href="#/t/pebble?f=${stale.id}">Send ${esc(first(stale))} a pebble</a></div>` : ''}`;
      $$('.mt', el).forEach(b => b.onclick = () => { const t = S.twelve[b.dataset.i]; t.met = !t.met; if (t.met) touch(t.fid); save(); paint(); });
      $$('.rm', el).forEach(b => b.onclick = () => { S.twelve.splice(b.dataset.i, 1); save(); paint(); });
      $('#ta') && ($('#ta').onclick = () => { if (!$('#tf').value) return; S.twelve.push({ fid: $('#tf').value, why: $('#tw').value || 'Because they matter', met: false }); save(); paint(); });
    };
    paint();
  } });

tool({ id: 'freq', sec: 'sustaining', title: 'Frequency check-in', sub: 'Say out loud how often feels right.',
  why: 'Mismatched expectations quietly erode friendships: one person feels neglected, the other feels pressured. Friendship maintenance research (Oswald, Clark & Kelly, 2004) points to openness and routine contact as core behaviors. Naming a rhythm takes the guesswork out.',
  render(el) {
    const paint = () => {
      el.innerHTML = `<div class="card"><p>Ask together: <i>“How often would feel good for both of us, and how?”</i></p><label>Friend</label><select id="qf">${friendOpts()}</select><label>How often</label><div class="chips" id="qo"></div><label>Main channel</label><div class="chips" id="qc"></div><button class="btn" id="qs">Save our agreement</button></div>
        <div class="card"><h3>Agreements</h3><ul class="list">${Object.entries(S.freq).map(([id, a]) => `<li>${av(F(id))}<span style="flex:1">${esc(F(id).name)}</span><span class="pill ok">${a.often} · ${a.ch}</span></li>`).join('') || '<li class="mute">None yet</li>'}</ul></div>`;
      const o = chips($('#qo'), ['Weekly', 'Monthly', 'Quarterly', 'Yearly'], 'Monthly'), c = chips($('#qc'), ['Text', 'Voice note', 'Call', 'Video', 'In person'], 'Call');
      $('#qs').onclick = () => { S.freq[$('#qf').value] = { often: o(), ch: c() }; save(); toast('Agreement saved'); paint(); };
    };
    paint();
  } });

tool({ id: 'plan', sec: 'sustaining', title: 'Reschedule-only commitment', sub: 'Plans you can move but never cancel.',
  why: 'Plans with a specific date and activity are far more likely to happen than “we should hang out” (implementation intentions, Gollwitzer, 1999). Taking away the Cancel button flips the default: the plan survives, and only its date moves.',
  render(el) {
    const paint = () => {
      el.innerHTML = `<div class="card"><label>Friend</label><select id="cf">${friendOpts()}</select><div class="row"><div><label>Activity</label><input id="ca" placeholder="e.g. Pottery class"></div><div><label>Date (months out is fine)</label><input type="date" id="cd" value="${ahead(90)}"></div></div><button class="btn" id="cs">Commit</button></div>
        ${S.plans.map(p => `<div class="card"><div class="row"><h3 style="flex:2">${esc(p.act)} with ${esc(first(F(p.fid)))}</h3><span class="pill ${p.done ? 'ok' : ''}" style="flex:none">${p.done ? 'Done' : fmt(p.date)}</span></div>
          ${p.history.length ? `<p class="mute">Rescheduled ${p.history.length}×: ${p.history.map(h => fmt(h.from) + ' → ' + fmt(h.to)).join(', ')}</p>` : ''}
          ${p.done ? `<a class="btn s" href="#/t/zine?f=${p.fid}">Make a zine of it</a>` : `<div class="row"><input type="date" class="nd" data-id="${p.id}"><span style="flex:none"><button class="btn s rs" data-id="${p.id}">Reschedule</button><button class="btn g dn" data-id="${p.id}">Mark done</button></span></div><p class="mute">No cancel button, by design. Pick a new date instead.</p>`}</div>`).join('')}`;
      $('#cs').onclick = () => { if (!$('#ca').value) return toast('Add an activity'); S.plans.unshift({ id: uid(), fid: $('#cf').value, act: $('#ca').value, date: $('#cd').value, history: [], done: false }); save(); toast('Committed. It can move, but it won’t disappear.'); paint(); };
      $$('.rs', el).forEach(b => b.onclick = () => { const p = S.plans.find(x => x.id === b.dataset.id), nd = $(`.nd[data-id="${p.id}"]`).value; if (!nd) return toast('Reschedule needs a new date'); p.history.push({ from: p.date, to: nd }); p.date = nd; save(); paint(); toast('Rescheduled'); });
      $$('.dn', el).forEach(b => b.onclick = () => { const p = S.plans.find(x => x.id === b.dataset.id); p.done = true; touch(p.fid); save(); paint(); toast('🎉 Done! Want to make a zine of it?'); });
    };
    paint();
  } });

tool({ id: 'rituals', sec: 'sustaining', title: 'Rituals picker', sub: 'Make contact automatic.',
  why: 'Friendships fade when contact fades (Roberts & Dunbar, 2011). Rituals put contact on autopilot. Even brief, regular “caring contact” notes measurably helped people in Motto & Bostrom’s (2001) study. Small and regular beats big and rare.',
  render(el) {
    const R = { 'Annual trip': 365, 'New Year tradition': 365, 'Monthly call': 30, 'Admin night (chores together)': 14, 'Short check-in texts': 7 };
    const paint = () => {
      el.innerHTML = `<div class="card"><label>Ritual</label><div class="chips" id="rr"></div><label>With</label><select id="rf">${friendOpts()}</select><label>Next date</label><input type="date" id="rd" value="${ahead(30)}"><button class="btn" id="rs">Save ritual</button></div>
        <div class="card"><h3>Your rituals</h3><ul class="list">${S.rituals.map((r, i) => `<li><span><b>${esc(r.type)}</b> · ${esc(F(r.fid).name)}<br><span class="mute">next ${fmt(r.next)}</span></span><span><button class="btn s did" data-i="${i}">Did it</button></span></li>`).join('') || '<li class="mute">No rituals yet</li>'}</ul></div>`;
      const g = chips($('#rr'), Object.keys(R), 'Monthly call', v => $('#rd').value = ahead(R[v]));
      $('#rs').onclick = () => { S.rituals.push({ type: g(), fid: $('#rf').value, next: $('#rd').value }); save(); toast('Ritual saved'); paint(); };
      $$('.did', el).forEach(b => b.onclick = () => { const r = S.rituals[b.dataset.i]; r.next = new Date(new Date(r.next).getTime() + R[r.type] * DAY).toISOString().slice(0, 10); touch(r.fid); save(); paint(); toast('Nice. Next one scheduled.'); });
    };
    paint();
  } });

tool({ id: 'roles', sec: 'sustaining', title: 'Friendship roles map', sub: 'No one friend has to be everything.',
  why: 'Network research shows we get different kinds of support from different people, and people with more varied networks report better wellbeing (Cohen, 1997; Litwin, 2001). Expecting one person to meet every need overloads the friendship.',
  render(el) {
    const RO = { Helpers: 'trade favors & info', Teammates: 'shared goals', 'Fun crew': 'play together', Core: 'care for each other' };
    const paint = () => {
      el.innerHTML = `<div class="card hero"><p>No single friend has to be everything.</p></div><div class="grid">${Object.entries(RO).map(([r, d]) => `<div class="card" style="margin:0"><h3>${r}</h3><p class="mute">${d}</p>${S.friends.filter(f => S.roles[f.id] === r).map(f => `<div style="margin:4px 0">${av(f)} ${esc(first(f))}</div>`).join('') || '<p class="mute">—</p>'}</div>`).join('')}</div>
        <div class="card"><h3>Assign</h3><ul class="list">${S.friends.map(f => `<li>${av(f)}<span style="flex:1">${esc(f.name)}</span><select data-id="${f.id}" style="width:140px"><option value="">Unassigned</option>${Object.keys(RO).map(r => `<option ${S.roles[f.id] === r ? 'selected' : ''}>${r}</option>`).join('')}</select></li>`).join('')}</ul></div>`;
      $$('select[data-id]', el).forEach(s => s.onchange = () => { S.roles[s.dataset.id] = s.value; save(); paint(); });
    };
    paint();
  } });

tool({ id: 'repair', sec: 'sustaining', title: 'Repair helper', sub: 'Raise a small friction, kindly.',
  why: 'Gottman’s research (e.g., Gottman & Levenson, 1999) shows that it isn’t conflict that predicts a relationship breaking down. It is failed repair. Gentle start-ups (“I felt…” instead of “You always…”) make it far easier to hear. Repairs done well often leave people closer than before.',
  render(el) {
    el.innerHTML = `<div class="card"><p>Repair is a way to get <b>closer</b>, not a confrontation.</p><label>With</label><select id="xf">${friendOpts()}</select><label>What happened (just the facts)</label><input id="xa" placeholder="you canceled dinner last-minute twice"><label>How it felt</label><input id="xb" placeholder="a bit unimportant"><label>What I'd like</label><input id="xc" placeholder="a heads-up earlier if plans change"><div id="db"></div></div>`;
    const V = () => { const f = F($('#xf').value), [a, b, c] = ['#xa', '#xb', '#xc'].map(i => $(i).value.trim().replace(/[.!]+$/, ''));
      const what = a ? `When ${a}` : 'Something small has been on my mind', feel = b ? `, I felt ${b}.` : a ? ', it stuck with me.' : '.', ask = c ? `It'd mean a lot if ${c}.` : 'Could we talk about it sometime?';
      return [`Hey ${first(f)}, can I share something? I really value us, which is why I want to say it. ${what}${feel} ${ask} Totally open to hearing your side too.`,
        `${first(f)}, I'd rather tell you than let it sit. ${what}${feel} Not a big deal, but ${c ? `could we try this: ${c}?` : 'I wanted to clear the air.'} How does that land for you?`]; };
    const box = draftBox($('#db'), V, { to: () => F($('#xf').value).name });
    $$('input,select', el).forEach(i => i.oninput = i.onchange = () => box.refresh());
  } });

tool({ id: 'zine', sec: 'sustaining', title: 'Post-hangout zine', sub: 'A printable one-pager of your time together.',
  why: 'Reliving good shared moments (“capitalization”) strengthens relationships (Gable et al., 2004), and savoring a recent memory makes it last longer (Bryant & Veroff, 2007). A physical keepsake gives you a reason to bring the moment up again.',
  render(el, q) {
    let img = '';
    const form = () => {
      el.innerHTML = `<div class="card noprint"><label>Hangout with</label><select id="zf">${friendOpts(q.f)}</select><label>Funniest moment today</label><input id="z1"><label>Something new I learned about you</label><input id="z2"><label>Next thing we should do together</label><input id="z3"><label>Photo (optional)</label><input type="file" accept="image/*" id="zp"><button class="btn" id="zg">Make the zine</button></div>
        <div class="card noprint"><h3>Saved zines</h3><div class="gal">${S.zines.map((z, i) => `<div class="card zo" data-i="${i}"><b>${esc(z.name)}</b><br><span class="mute">${fmt(z.date)}</span></div>`).join('') || '<span class="mute">None yet</span>'}</div></div>`;
      $('#zp').onchange = e => { const fl = e.target.files[0]; if (!fl) return; const r = new FileReader(); r.onload = () => img = r.result; r.readAsDataURL(fl); };
      $('#zg').onclick = () => { const z = { name: F($('#zf').value).name, date: ago(0), a: $('#z1').value, b: $('#z2').value, c: $('#z3').value, img };
        S.zines.unshift(z); try { save(); } catch { z.img = ''; save(); toast('Photo too large to store; saved without it'); } show(z); };
      $$('.zo', el).forEach(c => c.onclick = () => show(S.zines[c.dataset.i]));
    };
    const show = z => {
      el.innerHTML = `<div class="zine"><h1>Us, today.</h1><div class="date">You & ${esc(z.name)} · ${fmt(z.date)}</div>${z.img ? `<img src="${z.img}" alt="">` : '<div class="ph">a moment worth keeping</div>'}
        <div class="q"><b>Funniest moment</b><p>${esc(z.a) || '…'}</p></div><div class="q"><b>Something new I learned about you</b><p>${esc(z.b) || '…'}</p></div><div class="q"><b>Next thing we should do</b><p>${esc(z.c) || '…'}</p></div></div>
        <div class="noprint" style="text-align:center"><button class="btn" onclick="print()">Print</button><button class="btn s" id="zb">Back</button></div>`;
      $('#zb').onclick = form;
    };
    form();
  } });
