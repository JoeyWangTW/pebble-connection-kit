// Router + home
let cleanup = null;
function section(el, k) {
  const s = SECTIONS[k];
  el.innerHTML = `<a class="back" href="#/explore">← Explore</a><h1>${s.ic} ${s.title}</h1><p class="mute">${s.blurb}</p>
    ${TOOLS.filter(t => t.sec === k).map(t => `<a class="card tool" href="#/t/${t.id}"><span class="n">${TOOLS.indexOf(t) + 1}</span><span><h3 style="margin:0">${t.title}</h3><p>${t.sub}</p></span></a>`).join('')}`;
}
function route() {
  cleanup && cleanup(); cleanup = null;
  const [path, qs] = location.hash.slice(1).split('?'), parts = path.split('/').filter(Boolean), q = Object.fromEntries(new URLSearchParams(qs || ''));
  const el = $('#app'); let nav = 'home';
  document.body.classList.toggle('obmode', parts[0] === 'onboard' || !S.profile.onboarded);
  if (parts[0] === 'onboard' || !S.profile.onboarded) { if (parts[0] !== 'onboard') history.replaceState(null, '', '#/onboard'); onboard(el); nav = ''; }
  else if (parts[0] === 'explore') { explore(el); nav = 'explore'; }
  else if (parts[0] === 'ai-helps') { aiHelps(el); nav = 'ai'; }
  else if (parts[0] === 'settings') { settings(el); nav = 'settings'; }
  else if (parts[0] === 'friends') friends(el, q);
  else if (parts[0] === 's' && SECTIONS[parts[1]]) { section(el, parts[1]); nav = 'explore'; }
  else if (parts[0] === 't' && TOOLS.find(t => t.id === parts[1])) {
    const t = TOOLS.find(x => x.id === parts[1]); nav = 'explore';
    el.innerHTML = `<a class="back noprint" href="#/s/${t.sec}">← ${SECTIONS[t.sec].title}</a><h1 class="noprint">${t.title}</h1><p class="mute noprint">${t.sub}</p><div id="tb"></div><div class="noprint">${why(t.why)}</div>`;
    cleanup = t.render($('#tb'), q) || null;
  } else home(el);
  $$('#bnav a').forEach(a => a.classList.toggle('on', a.dataset.k === nav));
  scrollTo(0, 0);
}
addEventListener('hashchange', route);
route();
