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
for g in guides:
    slug = g.get("slug")
    title = g.get("title", "Guide").replace("Lagos Life: ", "").replace(" in Lagos Life", "")
    card(title[:60], "Guide · verification status & check date on page", f"public/images/og-guide-{slug}.jpg")
