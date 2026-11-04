# Poules Odds

Brave/Chrome extension that shows bookmaker odds (1 / X / 2, with margin-free win probabilities) under each Champions League match on poules.com. Odds come from [The Odds API](https://the-odds-api.com) (free tier).

## Install
1. `brave://extensions` → enable Developer mode → **Load unpacked** → select the `extension/` folder.
2. Click the extension icon and paste your Odds API key.
3. Reload poules.com.

Odds are cached for 10 minutes. Matches without odds yet show "Nog geen odds beschikbaar" (bookmakers publish roughly a week ahead). If a team doesn't match, add an alias in `extension/teams.js`.
