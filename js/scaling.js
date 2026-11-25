// SCALING + AI tools
tool({ id: 'city', sec: 'scaling', title: '“I’m in your city” dinner', sub: 'One dinner, friends meet each other.',
  why: 'Friends of friends are among the easiest new connections to make, and a shared host lowers the risk for everyone (triadic closure, Granovetter, 1973). Making it easy to say no honestly, without inventing excuses, keeps the invite low-pressure and keeps trust high.',
  render(el) {
    const cities = [...new Set(S.friends.map(f => f.city))];
    const step1 = () => {
      el.innerHTML = `<div class="card"><div class="row"><div><label>City</label><select id="cc">${cities.map(c => `<option>${c}</option>`).join('')}</select></div><div><label>Arrive</label><input type="date" id="c1" value="${ahead(21)}"></div><div><label>Leave</label><input type="date" id="c2" value="${ahead(25)}"></div></div>
        <label>Friends there <span class="mute">(pick 5–15; add more names below if you need them)</span></label><div class="chips" id="cf"></div><input id="cx" placeholder="Extra guests, comma-separated (e.g. Ava, Theo)"><p class="mute" id="cn"></p><div id="db"></div><button class="btn g" id="cr">Generate RSVP page</button></div>`;
      let g; const R = () => { box.refresh(); cnt(); };
      const sel = () => [...g().map(id => F(id).name), ...$('#cx').value.split(',').map(s => s.trim()).filter(Boolean)];
      const cnt = () => { const n = sel().length; $('#cn').textContent = `${n} selected ${n < 5 ? '· aim for at least 5' : n > 15 ? '· max 15' : '· good size'}`; };
      const pf = () => { const ids = S.friends.filter(f => f.city === $('#cc').value).map(f => f.id); g = chips($('#cf'), ids, ids, R, true); $$('#cf .chip').forEach(c => c.textContent = F(c.dataset.v).name); };
      const box = draftBox($('#db'), () => { const c = $('#cc').value, d = fmt($('#c1').value);
        return [`Hi all! I'm in ${c} from ${d} to ${fmt($('#c2').value)} and doing one dinner with people I love there. You don't all know each other yet, and that's the point. Zero pressure: "not this time" is a totally fine answer. RSVP here 👇`,
          `${c} friends! One dinner, one long table, a handful of my favorite humans meeting each other. ${d}-ish. Come if it sounds fun, skip if it doesn't. No explanation needed.`]; }, { to: () => sel().length + ' friends' });
      $('#cc').onchange = () => { pf(); R(); }; $('#cx').oninput = cnt; pf(); cnt();
      $('#cr').onclick = () => { const n = sel(); if (n.length < 1) return toast('Pick some friends'); const t = { id: uid(), city: $('#cc').value, from: $('#c1').value, to: $('#c2').value, guests: n.map(name => ({ name, r: null })), msg: box.value() }; S.trips.unshift(t); save(); rsvp(t); };
    };
    const rsvp = t => {
      const tally = k => t.guests.filter(g => g.r === k).length;
      el.innerHTML = `<div class="card hero"><span class="pill">mock RSVP page</span><h2>Dinner in ${esc(t.city)}</h2><p style="font-size:1rem">${fmt(t.from)} – ${fmt(t.to)} · one table, new faces, zero pressure</p></div>
        <div class="card"><div class="row" style="text-align:center"><div><h2>${tally('in')}</h2>I'm in</div><div><h2>${tally('maybe')}</h2>Maybe</div><div><h2>${tally('no')}</h2>Not this time</div><div><h2>${tally(null)}</h2>Waiting</div></div></div>
        <div class="card"><p class="mute">Simulate each guest's response:</p><ul class="list">${t.guests.map((g, i) => `<li><span>${esc(g.name)}</span><span style="flex:none">${['in', 'maybe', 'no'].map(k => `<button class="btn ${g.r === k ? '' : 's'} rv" data-i="${i}" data-k="${k}">${{ in: "I'm in", maybe: 'Maybe', no: 'Not this time' }[k]}</button>`).join('')}</span></li>`).join('')}</ul><div id="np"></div></div><button class="btn s" id="bk">New trip</button>`;
      $$('.rv', el).forEach(b => b.onclick = () => { const g = t.guests[b.dataset.i]; g.r = b.dataset.k; save(); rsvp(t);
        if (g.r === 'no') { $('#np').innerHTML = `<div class="why" style="border-color:var(--acc2)"><b>Declining is welcome here</b>No excuse needed, ${esc(g.name.split(' ')[0])}. You're still invited next time. Want to send a short honest note?</div><div id="nd"></div>`; draftBox($('#nd'), () => ['Not this time for me, but I love that you\'re doing this. Have the best night!', "I'm going to sit this one out. Nothing's wrong, I'm just low on energy this week. Let's catch up another time?"], { to: () => 'host' }); } });
      $('#bk').onclick = step1;
    };
    step1();
  } });

tool({ id: 'intro', sec: 'scaling', title: 'Double-opt-in intro', sub: 'Both say yes before you connect them.',
  why: 'Introductions are one of the most valuable things friends do for each other (Granovetter, 1973, on weak ties). Asking each person privately first protects everyone’s time and makes a “yes” feel like a real choice. That makes the eventual meeting warmer.',
  render(el) {
    const paint = () => {
      el.innerHTML = `<div class="card"><div class="row"><div><label>Friend A</label><select id="ia">${friendOpts('f2')}</select></div><div><label>Friend B</label><select id="ib">${friendOpts('f10')}</select></div></div><label>Why they should meet</label><input id="iw" placeholder="both obsessed with bread and building startups"><button class="btn" id="is">Ask both separately (mock)</button></div>
        ${S.intros.map((x, i) => { const a = F(x.a), b = F(x.b), ok = x.ya && x.yb; return `<div class="card"><h3>${esc(first(a))} ↔ ${esc(first(b))}</h3><p class="mute">${esc(x.why)}</p>
          <ul class="list"><li>${esc(a.name)}: <button class="btn ${x.ya ? 'g' : 's'} y" data-i="${i}" data-w="ya">${x.ya ? '✓ said yes' : 'Simulate yes'}</button></li><li>${esc(b.name)}: <button class="btn ${x.yb ? 'g' : 's'} y" data-i="${i}" data-w="yb">${x.yb ? '✓ said yes' : 'Simulate yes'}</button></li></ul>
          ${ok ? `<div id="ix${i}"></div>` : '<p class="mute">The group intro unlocks only when both say yes.</p>'}</div>`; }).join('')}`;
      $('#is').onclick = () => { if ($('#ia').value === $('#ib').value) return toast('Pick two different friends'); const a = F($('#ia').value), b = F($('#ib').value), w = $('#iw').value || 'I think you two would get along';
        S.intros.unshift({ a: a.id, b: b.id, why: w, ya: false, yb: false }); save(); toast(`Sent “want an intro?” to ${first(a)} and ${first(b)} separately (mock)`); paint(); };
      $$('.y', el).forEach(btn => btn.onclick = () => { S.intros[btn.dataset.i][btn.dataset.w] = true; save(); paint(); });
      S.intros.forEach((x, i) => { const n = $('#ix' + i); if (n) { const a = F(x.a), b = F(x.b); draftBox(n, () => [`${first(a)}, meet ${first(b)}! ${first(b)}, meet ${first(a)}! You both said yes, so here we are 🙂 Why I think you'll click: ${x.why}. I'll let you two take it from here.`, `Happy to finally connect you two: ${first(a)} (${a.city}) and ${first(b)} (${b.city}). The reason: ${x.why}. Coffee's on whoever's closer!`], { to: () => `${first(a)} & ${first(b)}` }); } });
    };
    paint();
  } });

tool({ id: 'favors', sec: 'scaling', title: '5-minute favor list', sub: 'One small generous act a week.',
  why: 'Adam Grant’s research on givers (2013) highlights the “five-minute favor”: tiny acts of help that cost little but build trust and goodwill. Helping others also boosts the helper’s own happiness (Dunn, Aknin & Norton, 2008).',
  render(el) {
    const L = ['Make an intro between two people', 'Share a useful article or resource', 'Give quick feedback on someone’s draft', 'Send a recommendation (book, doctor, café)', 'Write a LinkedIn recommendation', 'Forward a job post to someone who’d fit', 'Send a thank-you to an old mentor', 'Boost a friend’s project online'];
    const wk = (() => { const d = new Date(); const j = new Date(d.getFullYear(), 0, 1); return d.getFullYear() + '-W' + Math.ceil(((d - j) / DAY + j.getDay() + 1) / 7); })();
    const paint = () => { const cur = S.favors[wk];
      el.innerHTML = `<div class="card"><h3>This week (${wk})</h3>${cur ? `<p><b>${esc(cur.f)}</b></p><button class="btn ${cur.done ? 'g' : ''}" id="fd">${cur.done ? '✓ Done' : 'Mark done'}</button>` : '<p class="mute">Pick one below.</p>'}</div>
        <div class="card"><ul class="list">${L.map((f, i) => `<li><span>${f}</span><button class="btn s fp" data-i="${i}">Pick</button></li>`).join('')}</ul></div>
        <div class="card"><h3>History</h3><ul class="list">${Object.entries(S.favors).map(([w, v]) => `<li><span>${w}: ${esc(v.f)}</span><span class="pill ${v.done ? 'ok' : 'warn'}">${v.done ? 'done' : 'open'}</span></li>`).join('')}</ul></div>`;
      $$('.fp', el).forEach(b => b.onclick = () => { S.favors[wk] = { f: L[b.dataset.i], done: false }; save(); paint(); });
      $('#fd') && ($('#fd').onclick = () => { cur.done = !cur.done; save(); paint(); if (cur.done) toast('Five minutes, well spent.'); });
    };
    paint();
  } });

tool({ id: 'seat', sec: 'scaling', title: 'Gathering mixer & seating', sub: 'Seat strangers together on purpose.',
  why: 'Festinger, Schachter & Back (1950) found friendships formed based on whose doors were nearest, more than on shared interests. Segal (1974) found police trainees befriended whoever sat next to them alphabetically. Where people sit matters more than who seems similar.',
  render(el) {
    el.innerHTML = `<div class="card"><label>Guests: one per line. Put people who already know each other on the same line, separated by commas.</label><textarea id="gl">Priya, Lucas\nMarcus, Jordan\nAmara\nSofia, Hana\nMei-Ling\nKenji, Aiko\nDaniel\nAlex, Sam, Rin</textarea><div class="row"><div><label>Table size</label><select id="ts"><option>3</option><option selected>4</option><option>5</option><option>6</option></select></div></div><button class="btn" id="ga">Auto-arrange</button></div><div id="out"></div>`;
    $('#ga').onclick = () => {
      const groups = $('#gl').value.split('\n').map(l => l.split(',').map(s => s.trim()).filter(Boolean)).filter(g => g.length);
      const all = groups.flat(), size = +$('#ts').value, n = Math.max(1, Math.ceil(all.length / size)), T = Array.from({ length: n }, () => []);
      // deal each known-group round-robin across tables so acquaintances get split up
      let t = 0; groups.sort((a, b) => b.length - a.length).forEach(g => g.forEach(p => { T[t % n].push(p); t++; }));
      $('#out').innerHTML = `<div class="card"><h3>${n} tables · people who already know each other are split up</h3><div class="tables">${T.map((x, i) => `<div class="tbl"><b>Table ${i + 1}</b><br>${x.map(esc).join('<br>')}</div>`).join('')}</div><p class="mute">Tip: give each table one starter question from the deep-talk deck.</p></div>`;
    };
  } });

tool({ id: 'circles', sec: 'scaling', title: 'Circles within circles', sub: 'A small crew inside a big group.',
  why: 'Big groups are easy to join but hard to feel close in. Dunbar’s layered-network research suggests our closest layers hold only a handful of people. A small, recurring sub-group gives you the repeated contact friendship needs (Hall, 2019, estimates casual friendship takes ~50 hours together).',
  render(el) {
    const paint = () => {
      el.innerHTML = `<div class="card"><div class="row"><div><label>Big group</label><input id="cg" placeholder="Design team / climbing gym / MBA class"></div><div><label>Circle name</label><input id="cn" placeholder="Tuesday lunch crew"></div></div><label>Members (3–6)</label><div class="chips" id="cm"></div><label>Recurring thing</label><input id="cr" placeholder="Lunch every other Tuesday"><button class="btn" id="cs">Create circle</button></div>
        ${S.circles.map(c => `<div class="card"><h3>${esc(c.name)}</h3><p class="mute">inside ${esc(c.group)} · ${esc(c.rec)}</p><div class="row" style="justify-content:flex-start">${c.m.map(id => av(F(id))).join('')}</div></div>`).join('')}`;
      const g = chips($('#cm'), S.friends.map(f => f.id), [], null, true); $$('#cm .chip').forEach(c => c.textContent = first(F(c.dataset.v)));
      $('#cs').onclick = () => { const m = g(); if (m.length < 2 || m.length > 5) return toast('Pick 2–5 friends (plus you = 3–6)'); S.circles.unshift({ group: $('#cg').value || 'Big group', name: $('#cn').value || 'Our circle', rec: $('#cr').value || 'Monthly', m }); save(); toast('Circle created'); paint(); };
    };
    paint();
  } });

tool({ id: 'reflect', sec: 'ai', title: 'Reflection: AI that reaches humans', sub: 'Draft, remember, remind. Then you show up.',
  why: 'Social connection is one of the strongest predictors of health and longevity (Holt-Lunstad, Smith & Layton, 2010). Tools can lower the friction to reach out, but the benefit comes from the human exchange itself. In-person and voice contact beat text for feeling connected (Kumar & Epley, 2021).',
  render(el) {
    const paint = () => {
      const wk = S.ai.log.filter(l => daysSince(l.d) < 7), n = wk.reduce((a, l) => a + l.n, 0);
      el.innerHTML = `<div class="card hero"><p>Use AI to help you reach humans, not to replace them.</p></div>
        <div class="card"><div class="row"><span><b>Pebble drafts, you press send</b><br><span class="mute">Every message is a starting point you edit. Nothing sends itself.</span></span><button class="btn ${S.ai.principle ? 'g' : 's'}" id="pp" style="flex:none">${S.ai.principle ? 'On' : 'Off'}</button></div></div>
        <div class="card"><h3>What Pebble's AI is for</h3><ul><li><b>Draft</b>: get past the blank page.</li><li><b>Remember</b>: keep the details that show you care.</li><li><b>Remind</b>: notice who's drifting.</li></ul><p class="mute">What it's not for: being your friend, or being you.</p></div>
        <div class="card"><h3>Human-time check</h3><h2>${n} real conversation${n === 1 ? '' : 's'} this week</h2><div class="bar"><i style="width:${Math.min(100, n / 5 * 100)}%"></i></div><p class="mute">Goal: 5 / week</p>
          <div class="row"><input type="number" id="hn" min="1" value="1"><input id="hw" placeholder="With whom / note"><button class="btn" id="ha" style="flex:none">Log</button></div>
          <ul class="list">${S.ai.log.slice(0, 8).map(l => `<li><span>${l.n}× · ${esc(l.w || 'conversation')}</span><span class="mute">${fmt(l.d)}</span></li>`).join('')}</ul></div>`;
      $('#pp').onclick = () => { S.ai.principle = !S.ai.principle; save(); paint(); };
      $('#ha').onclick = () => { S.ai.log.unshift({ d: ago(0), n: Math.max(1, +$('#hn').value || 1), w: $('#hw').value }); save(); paint(); toast('Logged. That’s the real stuff.'); };
    };
    paint();
  } });
