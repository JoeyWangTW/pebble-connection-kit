// STARTING tools
tool({ id: 'drill', sec: 'starting', title: '60-second connection drill', sub: 'One minute, both of you all in.',
  why: 'Short, mutual, structured exchanges where both people take turns sharing feel safer than open-ended small talk. Aron et al. (1997) found that gradually escalating self-disclosure in pairs produced closeness between strangers in under an hour; this is a one-minute starter version.',
  render(el) {
    const openers = ['What made you smile this week?', 'What are you looking forward to right now?', 'What is something small you are proud of lately?', 'Where would you go tomorrow if you could go anywhere?', 'What has been on your mind more than usual?', 'Who taught you something you still use?'];
    let left = 60, h = null;
    el.innerHTML = `<div class="card"><h3>Say it out loud first</h3><p>“We both want to connect for one minute. Phones down, no fixing, just curious.”</p>
      <div class="timer" id="tm">60</div><div class="bar"><i id="tb" style="width:100%"></i></div>
      <div class="row" style="justify-content:center;margin-top:8px"><div style="flex:none"><button class="btn" id="go">Start</button><button class="btn s" id="rs">Reset</button></div></div></div>
      <div class="card"><h3>Suggested opener</h3><p id="op" style="font:500 1.2rem Fraunces,serif">${pick(openers)}</p><button class="btn s" id="no">Another opener</button>
      <p class="mute">Take turns: one person asks, the other answers for ~30 seconds, then swap.</p></div>`;
    const paint = () => { $('#tm').textContent = left; $('#tb').style.width = (left / 60 * 100) + '%'; };
    $('#go').onclick = () => {
      if (h) { clearInterval(h); h = null; $('#go').textContent = 'Resume'; return; }
      $('#go').textContent = 'Pause';
      h = setInterval(() => { left--; paint(); if (left === 30) toast('Halfway — swap roles'); if (left <= 0) { clearInterval(h); h = null; $('#go').textContent = 'Start'; left = 60; toast('🎉 Minute done. How did that feel?'); } }, 1000);
    };
    $('#rs').onclick = () => { clearInterval(h); h = null; left = 60; paint(); $('#go').textContent = 'Start'; };
    $('#no').onclick = () => $('#op').textContent = pick(openers);
    return () => clearInterval(h);
  } });

tool({ id: 'swap', sec: 'starting', title: 'Better-opener swap', sub: 'Trade autopilot questions for real ones.',
  why: 'Kardas, Kumar & Epley (2022) found people expect deep conversations with strangers to be more awkward and less enjoyable than they really are. People also underestimate how interested the other person is. Asking a slightly deeper question is a small risk with a reliable payoff.',
  render(el) {
    const P = [['What do you do?', ['What have you loved doing lately?', 'What part of your week gives you energy?']],
      ['How was your weekend?', ['What was the best moment of your weekend?', 'Did anything surprise you this weekend?']],
      ['Where are you from?', ['What place shaped you the most?', 'Where do you feel most like yourself?']],
      ['Busy lately?', ['What has been taking up your headspace?', 'What are you trying to make more time for?']],
      ['Seen any good shows?', ['What story stuck with you longer than expected?', 'What would you recommend to your younger self?']],
      ['How long have you lived here?', ['What would you redo if you could?', 'What is something this city taught you?']]];
    const paint = () => {
      el.innerHTML = `<div class="card"><p class="mute">Tap a swap to mark it as one you'll try. Tap the deeper question to copy it.</p>${P.map(([o, n], i) => `<div class="swap"><span class="old">${o}</span><span>→</span><span class="new" data-i="${i}" style="cursor:pointer">${n[S.swaps[i] || 0]}</span></div><div class="row" style="padding:6px 0"><div style="flex:none"><button class="btn s alt" data-i="${i}">Another version</button></div></div>`).join('')}</div>`;
      $$('.alt', el).forEach(b => b.onclick = () => { const i = b.dataset.i; S.swaps[i] = ((S.swaps[i] || 0) + 1) % P[i][1].length; save(); paint(); });
      $$('.new', el).forEach(s => s.onclick = () => copyText(s.textContent));
    };
    paint();
  } });

tool({ id: 'deck', sec: 'starting', title: 'Deep-talk deck', sub: '21 prompts from warm-up to deepest.',
  why: 'Closeness grows when disclosure is reciprocal and escalates step by step (Aron et al., 1997; Altman & Taylor’s social penetration theory, 1973). Starting light and moving deeper keeps it comfortable while still getting somewhere.',
  render(el) {
    const D = { 'Warm-up': ['What is a small thing that made today better?', 'What food could you eat every week and never tire of?', 'What is a hobby you would try if no one was watching?', 'What was your favorite place as a kid?', 'Which song would you put on a road trip first?', 'What is the best advice you got this year?', 'What is something you are weirdly good at?'],
      'Deeper': ['When did you last change your mind about something important?', 'What are you quietly working toward?', 'Who in your life do you wish you saw more?', 'What do you need more of right now?', 'What is a memory you return to when things are hard?', 'What would your friends say you are underrating about yourself?', 'What does a good day look like for you, honestly?'],
      'Deepest': ['What is something you have never said out loud but believe?', 'When have you felt most understood?', 'What do you hope people say about how you treated them?', 'What fear has shaped your choices the most?', 'What would you want to be forgiven for?', 'What part of yourself are you still learning to accept?', 'What do you want our friendship to be like in ten years?'] };
    let lvl = 'Warm-up', deck = [], k = 0;
    const build = () => { deck = [...D[lvl]]; k = 0; };
    build();
    el.innerHTML = `<div class="chips" id="lv"></div><div class="flip" id="fl"><div class="in"><div class="fc front" id="ff"></div><div class="fc backf" id="fb"></div></div></div>
      <div class="row"><div style="flex:none"><button class="btn" id="nx">Next card</button><button class="btn s" id="sh">Shuffle</button></div><span class="mute" id="ct" style="text-align:right"></span></div>`;
    const show = () => { $('#fl').classList.remove('f'); setTimeout(() => { $('#ff').innerHTML = `${lvl}<br><small style="font:400 .85rem Inter">tap to flip</small>`; $('#fb').textContent = deck[k]; $('#ct').textContent = `${k + 1} / ${deck.length}`; }, 150); };
    chips($('#lv'), Object.keys(D), lvl, v => { lvl = v; build(); show(); });
    $('#fl').onclick = () => $('#fl').classList.toggle('f');
    $('#nx').onclick = () => { k = (k + 1) % deck.length; show(); };
    $('#sh').onclick = () => { deck.sort(() => Math.random() - .5); k = 0; show(); toast('Shuffled'); };
    show();
  } });

tool({ id: 'shared', sec: 'starting', title: 'Shared-experience planner', sub: 'Do something intense together, then relive it.',
  why: 'Couples who did novel, arousing activities together reported more relationship satisfaction than those doing pleasant-but-familiar ones (Aron et al., 2000). Talking it over afterward matters too: sharing good news and reliving moments together builds closeness (Gable et al., 2004).',
  render(el) {
    const A = ['Haunted house', 'Sunrise hike', 'Escape room', 'Beginner dance class', 'Cook something hard', 'Rock-climbing gym', 'Karaoke duet', 'Night kayak'];
    el.innerHTML = `<div class="card"><label>Friend</label><select id="sf">${friendOpts()}</select><label>Pick something vivid, novel or sweaty</label><div class="chips" id="sa"></div><label>When</label><input type="date" id="sd" value="${ahead(14)}"><button class="btn" id="sp">Plan it</button></div><div id="out"></div>`;
    const g = chips($('#sa'), A, A[0]);
    $('#sp').onclick = () => {
      const f = F($('#sf').value), a = g();
      $('#out').innerHTML = `<div class="card"><h3>${esc(a)} with ${esc(first(f))} · ${fmt($('#sd').value)}</h3><b>Debrief afterward (over food, ideally):</b><ol><li>What was the moment your heart rate spiked?</li><li>What did you notice about me that surprised you?</li><li>Which part are we going to retell for years?</li><li>What would make the sequel even better?</li></ol><div id="db"></div></div>`;
      draftBox($('#db'), () => [`Hey ${first(f)}! Wild idea: ${a.toLowerCase()} on ${fmt($('#sd').value)}? Something new for both of us. Food after, my treat for the first round.`, `${first(f)}, I want to do something slightly scary/fun with you. ${a}? I'm thinking ${fmt($('#sd').value)}. In?`, `Okay ${first(f)}, I'm putting "${a.toLowerCase()}" on our calendar unless you veto it. ${fmt($('#sd').value)} work?`], { to: () => f.name, onSend: () => touch(f.id) });
    };
  } });

tool({ id: 'chem', sec: 'starting', title: 'Chemistry is co-created', sub: 'Design good interactions, not perfect matches.',
  why: 'In speed-dating studies, Eastwick & Finkel (2008) and later Joel, Eastwick & Finkel (2017) found that matching on stated preferences or profiles predicted very little about who actually clicked. Chemistry depended mostly on the specific interaction between two people.',
  render(el) {
    el.innerHTML = `<div class="card hero"><p>Chemistry isn't something you find. It's something two people make.</p></div>
    <div class="card"><h3>What this means for you</h3><ul><li><b>Stop pre-screening for the perfect profile.</b> On-paper compatibility barely predicts who you'll click with.</li><li><b>Set up a good interaction.</b> Ask a real question, share something back, do something together.</li><li><b>Give it a few rounds.</b> Liking grows with repeated, positive contact. One awkward coffee isn't a verdict.</li><li><b>Be the responsive one.</b> Showing you understand and care about what they said is one of the strongest drivers of closeness.</li></ul>
    <a class="btn" href="#/t/deck">Try the deep-talk deck</a><a class="btn s" href="#/t/drill">60-second drill</a></div>`;
  } });
