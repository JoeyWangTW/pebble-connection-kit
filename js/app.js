// Router + home
let cleanup = null;
function home(el) {
  const stale = [...S.friends].sort((a, b) => new Date(a.last) - new Date(b.last));
  el.innerHTML = `<div class="card hero"><p>Connection isn't kept alive by good intentions — it's kept alive by small, repeated reach-outs.</p></div>
    <div class="grid">${Object.entries(SECTIONS).map(([k, s]) => `<a class="sec c-${k}" href="#/s/${k}"><span class="ic">${s.ic}</span><h3>${s.title}</h3><p>${s.blurb}</p><p class="mute" style="margin-top:6px">${(n => n + (n === 1 ? ' tool' : ' tools'))(TOOLS.filter(t => t.sec === k).length)} →</p></a>`).join('')}</div>
    <div class="card"><h3>Your people</h3><ul class="list">${stale.map(f => `<li><span class="row" style="flex:1;gap:10px">${av(f)}<span style="flex:1"><b>${esc(f.name)}</b><br><span class="mute">${esc(f.city)} · last contact ${since(f.last)}</span></span></span><a class="btn s" href="#/t/pebble?f=${f.id}" style="flex:none">Pebble</a></li>`).join('')}</ul></div>
    <p class="mute" style="text-align:center">Prototype · all data stays in this browser · <a href="#" id="reset">reset demo data</a></p>`;
  $('#reset').onclick = e => { e.preventDefault(); if (confirm('Reset all Pebble data to the demo seed?')) { S = seed(); save(); route(); toast('Demo data restored'); } };
}
function section(el, k) {
  const s = SECTIONS[k];
  el.innerHTML = `<a class="back" href="#/">← Home</a><h1>${s.ic} ${s.title}</h1><p class="mute">${s.blurb}</p>
    ${TOOLS.filter(t => t.sec === k).map(t => `<a class="card tool" href="#/t/${t.id}"><span class="n">${TOOLS.indexOf(t) + 1}</span><span><h3 style="margin:0">${t.title}</h3><p>${t.sub}</p></span></a>`).join('')}`;
}
function route() {
  cleanup && cleanup(); cleanup = null;
  const [path, qs] = location.hash.slice(1).split('?'), parts = path.split('/').filter(Boolean), q = Object.fromEntries(new URLSearchParams(qs || ''));
  const el = $('#app'); let nav = 'home';
  if (parts[0] === 's' && SECTIONS[parts[1]]) { section(el, parts[1]); nav = parts[1]; }
  else if (parts[0] === 't' && TOOLS.find(t => t.id === parts[1])) {
    const t = TOOLS.find(x => x.id === parts[1]); nav = t.sec;
    el.innerHTML = `<a class="back noprint" href="#/s/${t.sec}">← ${SECTIONS[t.sec].title}</a><h1 class="noprint">${t.title}</h1><p class="mute noprint">${t.sub}</p><div id="tb"></div><div class="noprint">${why(t.why)}</div>`;
    cleanup = t.render($('#tb'), q) || null;
  } else home(el);
  $$('#bnav a').forEach(a => a.classList.toggle('on', a.dataset.k === nav));
  scrollTo(0, 0);
}
addEventListener('hashchange', route);
route();
