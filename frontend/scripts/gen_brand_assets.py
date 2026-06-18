"""Generate favicons + Open Graph cover image from the company logo.

Run: cd /app/frontend && python3 scripts/gen_brand_assets.py
Outputs into /app/frontend/public/.
"""
import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO = os.path.join(ROOT, "src", "assets", "logo.png")
PUB = os.path.join(ROOT, "public")
FONT_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

logo = Image.open(LOGO).convert("RGBA")

# ---------- Favicons (the logo is already a square dark mark) ----------
png_sizes = {
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
    "favicon-48x48.png": 48,
    "apple-touch-icon.png": 180,
    "android-chrome-192x192.png": 192,
    "android-chrome-512x512.png": 512,
}
for name, size in png_sizes.items():
    img = logo.resize((size, size), Image.LANCZOS)
    img.save(os.path.join(PUB, name))

# Multi-resolution .ico
ico = logo.resize((256, 256), Image.LANCZOS)
ico.save(
    os.path.join(PUB, "favicon.ico"),
    sizes=[(16, 16), (32, 32), (48, 48), (64, 64)],
)

# ---------- Open Graph cover (1200x630) ----------
W, H = 1200, 630
# Seamless dark canvas — the logo sits on solid black, so a black-to-navy
# vertical gradient blends the logo edges invisibly.
bg = Image.new("RGB", (W, H), (0, 0, 0))
top = (8, 13, 28)      # #080D1C
bottom = (16, 26, 57)  # matches the logo's inner navy (#101A39)
for y in range(H):
    t = y / H
    r = int(top[0] + (bottom[0] - top[0]) * t)
    g = int(top[1] + (bottom[1] - top[1]) * t)
    b = int(top[2] + (bottom[2] - top[2]) * t)
    for x in range(W):
        pass
# Faster gradient via paste of a 1px-wide column
grad = Image.new("RGB", (1, H))
for y in range(H):
    t = y / H
    grad.putpixel((0, y), (
        int(top[0] + (bottom[0] - top[0]) * t),
        int(top[1] + (bottom[1] - top[1]) * t),
        int(top[2] + (bottom[2] - top[2]) * t),
    ))
bg = grad.resize((W, H))

draw = ImageDraw.Draw(bg)

# Logo centered-upper
logo_size = 300
lg = logo.resize((logo_size, logo_size), Image.LANCZOS)
lx = (W - logo_size) // 2
ly = 70
bg.paste(lg, (lx, ly), lg)

# Tagline
try:
    f_tag = ImageFont.truetype(FONT_BOLD, 34)
except Exception:
    f_tag = ImageFont.load_default()

tagline = "STRATEGY  ·  MARKETING  ·  E-COMMERCE  ·  INTELLIGENCE"
tb = draw.textbbox((0, 0), tagline, font=f_tag)
tw = tb[2] - tb[0]
ty = ly + logo_size + 40
draw.text(((W - tw) // 2, ty), tagline, font=f_tag, fill=(120, 170, 255))

# Sub-tagline
try:
    f_sub = ImageFont.truetype(FONT_BOLD, 26)
except Exception:
    f_sub = ImageFont.load_default()
sub = "Senior-led consulting for ambitious businesses"
sb = draw.textbbox((0, 0), sub, font=f_sub)
sw = sb[2] - sb[0]
draw.text(((W - sw) // 2, ty + 56), sub, font=f_sub, fill=(220, 228, 240))

# Thin blue accent bar at bottom
draw.rectangle([0, H - 8, W, H], fill=(0, 102, 255))

bg.save(os.path.join(PUB, "og-cover.jpg"), quality=88)
print("Generated:", sorted(os.listdir(PUB)))
