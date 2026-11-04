// Matching poules.com team names to The Odds API team names.
// Both sides are normalised, then looked up through ALIASES (poules -> odds-api).
(function () {
  const norm = (s) =>
    s.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/ø/g, 'o').replace(/ı/g, 'i')
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\b(fc|fk|sk|sc|cf|afc|bk|ac|as|ss|osc|rc|club|de|1907|s k)\b/g, ' ')
      .replace(/\s+/g, ' ').trim();

  // normalised poules name -> normalised odds-api name
  const ALIASES = {
    'man city': 'manchester city',
    'manchester utd': 'manchester united',
    'paris sg': 'paris saint germain',
    'leipzig': 'rb leipzig',
    'dortmund': 'borussia dortmund',
    'bayern': 'bayern munich',
    'atletico': 'atletico madrid',
    'betis': 'real betis',
    'brugge': 'brugge',
    'slavia praha': 'slavia prague',
    'shakhtar don': 'shakhtar donetsk',
    'aek': 'aek athens',
    'lille': 'lille',
    'psv': 'psv eindhoven',
    'inter': 'inter milan',
    'bodo glimt': 'bodo glimt',
    'lens': 'lens',
    'como': 'como',
  };

  function canon(name) {
    const n = norm(name);
    return ALIASES[n] || n;
  }

  function sameTeam(a, b) {
    const x = canon(a), y = canon(b);
    if (x === y) return true;
    // tolerate "club brugge" vs "brugge", "internazionale" vs "inter", etc.
    return x.length >= 4 && y.length >= 4 && (x.includes(y) || y.includes(x));
  }

  window.PoulesOddsTeams = { norm, canon, sameTeam };
})();
