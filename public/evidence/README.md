# Evidence Artifacts

These are the raw files our game data was extracted from, published so every
verified number on LagosLifeGuide.app can be checked independently.

## Files

- `game-client-data-2026-10-09.js` — a JavaScript chunk served by the official
  game client at `https://lagoslife.app` (captured 2026-10-09). It contains the
  game's own static data tables: careers and pay ladders, homes and rents,
  priced objects/actions, UNILAG degrees and courses, and locations with opening
  hours.
- `ll-chunk-airport-2026-10-09.js` — second chunk containing the airport and
  cross-city career tables referenced by the first chunk.

## Verify integrity

```sh
sha256sum -c SHA256SUMS.txt
```

## How to inspect

These are minified production JS files. Search them for readable table names:
`CAREERS`, `HOMES`, `OBJECTS`, `ACTIONS`, `DEPTS`, `LOCATIONS`, `SCHOOL_FEES`.
Every record on this site carries `sourceIds` + `evidenceIds` pointing back to
the registry on `/sources/`, where each evidence record names its artifact and
the SHA-256 hash above.

## Scope and status

Extraction method: document review of the game's own client files. This is
strong evidence of what the game displays, but values can change with game
updates, and client-displayed values can differ from server-side behaviour.
Records extracted this way are marked `partial` until confirmed by in-game
testing. See `/sources/` for the full methodology.
