# In-game verification session — 2026-10-19

Evidence ID: `ev-in-game-2026-10-19` · Method: **in_game_test** · Game: https://lagoslife.app (official instance)

Logged-in session on the dedicated test account (same account as the 2026-10-14 session).
Goal of this session: verify the Lagos housing mechanics the lagoslifewiki.com comparison
called out — buyout prices, move-in totals, and the resale ratio — directly from the
in-game **Phone → Houses** browser.

## Artifacts

- `houses-browse-lagos.png` — the in-game Lagos homes browser (Houses → Homes tab): all 7
  rentable Lagos homes plus the UNILAG Hall of Residence, each showing weekly rent, the
  abbreviated buyout price, and the "Move in" total.
- `house-detail-mushin.png` — the Face-me-I-face-you (Mushin) detail dialog: the full
  move-in breakdown (2 weeks' rent upfront ₦4,800 + agent & agreement ₦2,400 = ₦7,200),
  the exact buyout price (₦113,000), and the explicit resale line ("sells back for
  ₦90,400 (80%)").

Every Lagos home's detail dialog was opened and its numbers read from the live UI during
this session (only two screenshots are kept; the remaining five dialogs were read and
recorded in the same session):

| Home | Rent/week | Move in (3× rent) | Buyout | Resale (80%) |
| --- | --- | --- | --- | --- |
| Face-me-I-face-you, Mushin | ₦2,400 | ₦7,200 | ₦113,000 | ₦90,400 |
| Self-contain, Yaba | ₦6,000 | ₦18,000 | ₦312,000 | ₦249,600 |
| Mini-flat, Lekki Phase 1 | ₦17,000 | ₦51,000 | ₦910,000 | ₦728,000 |
| Terrace duplex, Ikate | ₦45,000 | ₦135,000 | ₦2,470,000 | ₦1,976,000 |
| Family duplex, Magodo GRA | ₦110,000 | ₦330,000 | ₦6,067,000 | ₦4,853,600 |
| Duplex, Ikoyi | ₦250,000 | ₦750,000 | ₦14,733,000 | ₦11,786,400 |
| Mansion, Banana Island | ₦1,500,000 | ₦4,500,000 | ₦91,000,000 | ₦72,800,000 |

## Mechanics confirmed

- **Move-in total = 3 × weekly rent**, everywhere: 2 weeks' rent upfront + agent &
  agreement of 1 week (matches the UNILAG hostel breakdown verified on 2026-10-14).
- **Resale is uniformly 80% of the buyout price**, stated explicitly in every detail dialog.
- Buyout prices are abbreviated in the browse list ("₦15m", "₦2.5m"); the exact naira
  figures above come from the detail dialogs.
- Rents displayed on 2026-10-19 match the client-bundle base values exactly (the 1.25×
  drift observed on 2026-10-14 was not in effect — live rents move with governor policy).
- The UNILAG Hall of Residence shows no buyout option (student housing; rent-only).
- The "Invest" tab (player-to-player buying/renting) displays "Opening soon" — not live.

## Not tested

- Actually buying a home and completing a resale transaction end-to-end (the 80% figure is
  the game's own stated value, read from the UI, not executed).
- Abuja and Port Harcourt homes (separate in-game city browsers; same mechanics presumed
  but not read this session).
- Whether policy multipliers ever move buyout/resale figures the way they move rent.
