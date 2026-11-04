(function () {
  const { sameTeam } = window.PoulesOddsTeams;
  let events = null;
  let status = 'loading';

  function median(arr) {
    const s = [...arr].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  // Median odds across bookmakers for home / draw / away of one event.
  function summarise(ev, homeName, awayName) {
    const h = [], d = [], a = [];
    for (const bm of ev.bookmakers || []) {
      const m = (bm.markets || []).find((x) => x.key === 'h2h');
      if (!m) continue;
      for (const o of m.outcomes) {
        if (o.name === 'Draw') d.push(o.price);
        else if (sameTeam(o.name, ev.home_team)) h.push(o.price);
        else a.push(o.price);
      }
    }
    if (!h.length || !d.length || !a.length) return null;
    const odds = [median(h), median(d), median(a)];
    const inv = odds.map((o) => 1 / o);
    const sum = inv.reduce((x, y) => x + y, 0);
    const probs = inv.map((p) => (p / sum) * 100); // margin removed
    // Odds API home/away may be flipped relative to poules; caller handles via flag.
    return { odds, probs, n: h.length };
  }

  function findEvent(home, away) {
    if (!events) return null;
    for (const ev of events) {
      if (sameTeam(home, ev.home_team) && sameTeam(away, ev.away_team)) return { ev, flipped: false };
      if (sameTeam(home, ev.away_team) && sameTeam(away, ev.home_team)) return { ev, flipped: true };
    }
    return null;
  }

  function badge(el, html, cls) {
    el.className = 'poules-odds ' + (cls || '');
    const li = el.parentElement;
    if (li) li.classList.toggle('has-poules-odds', cls !== 'hidden');
    el.innerHTML = html;
  }

  const MSG = {
    loading: 'odds laden…',
    'no-key': 'Odds: API-key ontbreekt — klik op het extensie-icoon',
    'bad-key': 'Odds: API-key ongeldig',
    quota: 'Odds: API-limiet bereikt',
    network: 'Odds: netwerkfout',
  };

  function render(row) {
    const home = row.querySelector('.home.name')?.textContent.trim();
    const away = row.querySelector('.away.name')?.textContent.trim();
    if (!home || !away) return;
    const li = row.closest('li') || row.parentElement;
    let el = li.querySelector(':scope > .poules-odds');
    if (!el) {
      el = document.createElement('div');
      li.appendChild(el);
    }
    const key = home + '|' + away + '|' + status + '|' + (events ? events.length : 0);
    if (el.dataset.key === key) return;
    el.dataset.key = key;

    if (!events) return badge(el, MSG[status] || 'Odds: fout (' + status + ')', 'muted');
    const hit = findEvent(home, away);
    const finished = (() => {
      const r = row.querySelector('.match-result-container');
      return !!r && getComputedStyle(r).display !== 'none';
    })();
    const none = () => finished ? badge(el, '', 'hidden') : badge(el, 'Nog geen odds beschikbaar', 'muted');
    if (!hit) return none();
    const s = summarise(hit.ev);
    if (!s) return none();
    let { odds, probs } = s;
    if (hit.flipped) { odds = [odds[2], odds[1], odds[0]]; probs = [probs[2], probs[1], probs[0]]; }
    const fav = probs.indexOf(Math.max(...probs));
    const cell = (label, i) =>
      `<span class="c${fav === i ? ' fav' : ''}"><b>${label}</b> ${odds[i].toFixed(2)}` +
      `<i>${probs[i].toFixed(0)}%</i></span>`;
    badge(el, cell('1', 0) + cell('X', 1) + cell('2', 2) +
      `<span class="src" title="Mediaan van ${s.n} bookmakers; kans = zonder marge">${s.n} bk</span>`);
  }

  function scan() {
    document.querySelectorAll('a.match-item').forEach(render);
  }

  let t = null;
  const schedule = () => { clearTimeout(t); t = setTimeout(scan, 150); };
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });

  chrome.runtime.sendMessage({ type: 'getOdds' }, (res) => {
    if (chrome.runtime.lastError) { status = 'network'; }
    else if (res && res.events) { events = res.events; status = 'ok'; }
    else status = (res && res.error) || 'network';
    document.querySelectorAll('.poules-odds').forEach((e) => delete e.dataset.key);
    scan();
  });
  scan();
})();
