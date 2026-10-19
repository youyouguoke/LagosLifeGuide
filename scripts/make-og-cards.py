#!/usr/bin/env python3
"""Generate per-page 1200x630 OG share cards (P0-2)."""
import json
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (13, 31, 22)          # deep green-black
ACCENT = (22, 163, 74)     # brand green
TEXT = (244, 244, 242)
MUTED = (168, 190, 176)
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def card(title, subtitle, out):
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    # accent band
    d.rectangle([0, 0, 14, H], fill=ACCENT)
    # subtle bottom band
    d.rectangle([0, H - 90, W, H], fill=(9, 24, 17))
    t = ImageFont.truetype(FONT, 72)
    s = ImageFont.truetype(FONT_REG, 34)
    b = ImageFont.truetype(FONT_REG, 30)
    # wrap title to <= 20 chars/line
    words = title.split()
    lines, cur = [], ""
    for w in words:
        if len(cur) + len(w) + 1 > 20:
            lines.append(cur)
            cur = w
        else:
            cur = (cur + " " + w).strip()
    lines.append(cur)
    y = 150
    for line in lines[:3]:
        d.text((70, y), line, font=t, fill=TEXT)
        y += 88
    d.text((70, y + 24), subtitle, font=s, fill=MUTED)
    d.text((70, H - 62), "LagosLifeGuide.app — independent, field-verified game data", font=b, fill=MUTED)
    im.save(out, "JPEG", quality=88)
    print(out.split("/")[-1])


guides = json.load(open("src/data/guides.json"))
jobs = "Jobs & Pay"
card("Lagos Life Jobs & Pay", "All 33 careers · L1–L5 ladders · three cities", "public/images/og-jobs.jpg")
card("Lagos Life First Week Planner", "Budget your first 7 days against verified data", "public/images/og-planner.jpg")
card("Lagos Life Game Data", "472 records · per-field verification · Data Pending rules", "public/images/og-game-data.jpg")
card("Lagos Life Guides", "Walkthroughs & data deep dives with check dates", "public/images/og-guides.jpg")
card("Lagos Life Starting Origins", "Nepo Baby vs LAPO vs UNILAG Fresher compared", "public/images/og-origins.jpg")
card("Lagos Life Login Help", "Troubleshooting & official support channels", "public/images/og-login-help.jpg")
# P0-4: entry pages, updates hub, new short pages (third plan round)
card("Lagos Life Official Link", "The one address to bookmark · sign-in help", "public/images/og-play.jpg")
card("Lagos Life App", "Install the web app on Android, iPhone or PC", "public/images/og-app.jpg")
card("Lagos Life Download", "How to get the game on any device", "public/images/og-download.jpg")
card("Lagos Life Recent Updates", "Recently reviewed records & guides, by date", "public/images/og-updates.jpg")
card("Lagos Life Locations", "28 places · hours & every action at each", "public/images/og-locations.jpg")
card("Lagos Life Age Limit: 18+", "Official rule, quoted & dated", "public/images/og-age-limit.jpg")
card("Lagos Life Payments & Withdrawal", "Top-ups in, no cash-out — official terms", "public/images/og-payments.jpg")
card("Lagos Life Account & Recovery", "Who can actually reset or recover accounts", "public/images/og-account-help.jpg")
card("Lagos Life Action Finder", "All 325 actions · search, filter, verified", "public/images/og-actions.jpg")
card("Lagos Life Hacks & Unlimited Naira", "What actually works — and what never will", "public/images/og-hack.jpg")
for g in guides:
    slug = g.get("slug")
    title = g.get("title", "Guide").replace("Lagos Life: ", "").replace(" in Lagos Life", "")
    card(title[:60], "Guide · verification status & check date on page", f"public/images/og-guide-{slug}.jpg")

# P0-4: per-record share cards — unified template, name + location printed.
skills = json.load(open("src/data/skills-actions.json"))
locations = json.load(open("src/data/locations.json"))
housing = json.load(open("src/data/housing-costs.json"))
loc_name = {}
for l in locations:
    v = l.get("name") or {}
    loc_name[l.get("id")] = v.get("value") if isinstance(v, dict) else None
n = 0
generated = []
for r in skills:
    rid = r.get("id")
    loc = loc_name.get((r.get("locationId") or {}).get("value"))
    card((r.get("name") or {}).get("value", "Game action")[:60],
         f"Action at {loc}" if loc else "Game action record",
         f"public/images/og/records/{rid}.jpg")
    generated.append(rid)
    n += 1
for r in locations:
    card((r.get("name") or {}).get("value", "Location")[:60], "Location · hours & actions on page",
         f"public/images/og/records/{r.get('id')}.jpg")
    generated.append(r.get("id"))
    n += 1
for r in housing:
    rid = r.get("id")
    card((r.get("name") or {}).get("value", "Housing")[:60], "Housing record · rent & buy verified",
         f"public/images/og/records/{rid}.jpg")
    generated.append(rid)
    n += 1
json.dump(generated, open("src/data/og-records.json", "w"))
print(f"record cards: {n}")
