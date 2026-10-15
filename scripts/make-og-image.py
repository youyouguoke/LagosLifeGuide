from PIL import Image
import os
im = Image.open("public/images/home-hero.jpg").convert("RGB")
w, h = im.size
tr = 1200 / 630
if w / h > tr:
    nw = int(h * tr); x = (w - nw) // 2; im = im.crop((x, 0, x + nw, h))
else:
    nh = int(w / tr); y = (h - nh) // 2; im = im.crop((0, y, w, y + nh))
im = im.resize((1200, 630), Image.LANCZOS)
im.save("public/images/og-default.jpg", "JPEG", quality=85, optimize=True)
print("og-default.jpg", os.path.getsize("public/images/og-default.jpg") // 1024, "KB")
