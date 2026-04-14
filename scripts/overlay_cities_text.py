"""Overlay correct cities list onto blank black tee (deterministic text)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/merch/psa-shirt-cities-back-kie.png"
OUT = SRC  # overwrite

CITIES = ["MASERU", "NEW YORK", "CAPE TOWN", "LOS ANGELES", "JOHANNESBURG", "CHICAGO"]

FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/HelveticaNeue.ttc",
    "/System/Library/Fonts/Helvetica.ttc",
    "/Library/Fonts/Arial Bold.ttf",
]

def load_font(size: int) -> ImageFont.FreeTypeFont:
    for p in FONT_CANDIDATES:
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()

im = Image.open(SRC).convert("RGBA")
W, H = im.size

draw = ImageDraw.Draw(im)
font_size = int(W * 0.055)
font = load_font(font_size)

line_gap = int(font_size * 1.15)
total_h = line_gap * len(CITIES)
start_y = int(H * 0.30)  # upper back region
cx = W // 2

for i, city in enumerate(CITIES):
    bbox = draw.textbbox((0, 0), city, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = cx - tw // 2
    y = start_y + i * line_gap
    draw.text((x, y), city, font=font, fill=(255, 255, 255, 255))

im.save(OUT, "PNG", optimize=True)
print(f"overlaid {len(CITIES)} cities on {OUT.relative_to(ROOT)}")
