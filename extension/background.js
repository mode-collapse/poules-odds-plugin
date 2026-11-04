const SPORT = 'soccer_uefa_champs_league';
const TTL_MS = 10 * 60 * 1000;

async function fetchOdds() {
  const { apiKey, cache } = await chrome.storage.local.get(['apiKey', 'cache']);
  if (!apiKey) return { error: 'no-key' };
  if (cache && Date.now() - cache.at < TTL_MS) return { events: cache.events, remaining: cache.remaining };

  const url = `https://api.the-odds-api.com/v4/sports/${SPORT}/odds` +
    `?regions=eu&markets=h2h&oddsFormat=decimal&dateFormat=iso&apiKey=${encodeURIComponent(apiKey)}`;
  let res;
  try { res = await fetch(url); } catch (e) { return { error: 'network' }; }
  if (res.status === 401) return { error: 'bad-key' };
  if (res.status === 429) return { error: 'quota' };
  if (!res.ok) return { error: 'http-' + res.status };
  const events = await res.json();
  const remaining = res.headers.get('x-requests-remaining');
  await chrome.storage.local.set({ cache: { at: Date.now(), events, remaining } });
  return { events, remaining };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === 'getOdds') {
    fetchOdds().then(sendResponse);
    return true; // async
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.apiKey) chrome.storage.local.remove('cache');
});
