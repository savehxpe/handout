"""Slice PSA_Archive.png into individual product images for public/merch/."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "PSA_Archive.png"
OUT = ROOT / "public" / "merch"
OUT.mkdir(parents=True, exist_ok=True)

im = Image.open(SRC).convert("RGBA")
W, H = im.size  # 1116 x 1386

# Grid zones (header cropped out above y=115)
crops = {
    "psa-shirt-black-front":  (30,  270,  540,  580),
    "psa-shirt-cities-back":  (576, 270,  1086, 580),
    "psa-shirt-white":        (220, 580,  896,  930),
    "psa-hoodie-front":       (30,  970,  520, 1290),
    "psa-hoodie-back":        (596, 970,  1086, 1290),
}

for name, box in crops.items():
    tile = im.crop(box)
    # trim transparent/white padding uniformly, then save
    bg = Image.new("RGBA", tile.size, (0, 0, 0, 0))
    diff = tile
    path = OUT / f"{name}.png"
    diff.save(path, "PNG", optimize=True)
    print(f"wrote {path.relative_to(ROOT)}  {tile.size}")
