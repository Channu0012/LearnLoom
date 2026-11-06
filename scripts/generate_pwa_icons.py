"""
Generate multi-resolution PWA icons, Apple Touch Icon, and multi-size Favicon from master icon.png
"""
from PIL import Image
import os

PUBLIC_DIR = r"c:\Users\chann\OneDrive\Desktop\channu\Learnloom\public"
master_icon_path = os.path.join(PUBLIC_DIR, "icon.png")

if not os.path.exists(master_icon_path):
    print(f"Error: {master_icon_path} not found!")
    exit(1)

icon_512 = Image.open(master_icon_path).convert("RGBA")

# 1. Standard PWA icon: icon-192.png (192x192)
icon_192 = icon_512.resize((192, 192), Image.Resampling.LANCZOS)
icon_192.save(os.path.join(PUBLIC_DIR, "icon-192.png"), format="PNG")
print("Saved icon-192.png")

# 2. Maskable PWA icon (512x512) with safe-zone margin on dark brand background #070b14
# W3C spec: safe area is 80% circle in center.
maskable_512 = Image.new("RGBA", (512, 512), (7, 11, 20, 255)) # #070b14
# Scale icon to fit comfortably inside 80% safe zone (e.g. 400x400)
scaled_v = icon_512.resize((410, 410), Image.Resampling.LANCZOS)
offset = ((512 - 410) // 2, (512 - 410) // 2)
maskable_512.paste(scaled_v, offset, scaled_v)
maskable_512.save(os.path.join(PUBLIC_DIR, "icon-maskable.png"), format="PNG")
print("Saved icon-maskable.png (512x512)")

# 3. Maskable PWA icon (192x192)
maskable_192 = maskable_512.resize((192, 192), Image.Resampling.LANCZOS)
maskable_192.save(os.path.join(PUBLIC_DIR, "icon-maskable-192.png"), format="PNG")
print("Saved icon-maskable-192.png (192x192)")

# 4. Apple Touch Icon: apple-touch-icon.png (180x180)
# iOS standard: solid background, safe zone padding
apple_touch = Image.new("RGBA", (180, 180), (7, 11, 20, 255))
scaled_apple = icon_512.resize((144, 144), Image.Resampling.LANCZOS)
offset_apple = ((180 - 144) // 2, (180 - 144) // 2)
apple_touch.paste(scaled_apple, offset_apple, scaled_apple)
apple_touch.save(os.path.join(PUBLIC_DIR, "apple-touch-icon.png"), format="PNG")
print("Saved apple-touch-icon.png (180x180)")

# 5. Favicons:
# favicon.png (48x48)
fav_48 = icon_512.resize((48, 48), Image.Resampling.LANCZOS)
fav_48.save(os.path.join(PUBLIC_DIR, "favicon.png"), format="PNG")

# favicon-32x32.png
fav_32 = icon_512.resize((32, 32), Image.Resampling.LANCZOS)
fav_32.save(os.path.join(PUBLIC_DIR, "favicon-32x32.png"), format="PNG")

# favicon-16x16.png
fav_16 = icon_512.resize((16, 16), Image.Resampling.LANCZOS)
fav_16.save(os.path.join(PUBLIC_DIR, "favicon-16x16.png"), format="PNG")
print("Saved favicon PNGs (48x48, 32x32, 16x16)")

# 6. Multi-resolution favicon.ico containing 16x16, 32x32, 48x48, 64x64
fav_64 = icon_512.resize((64, 64), Image.Resampling.LANCZOS)
fav_64.save(
    os.path.join(PUBLIC_DIR, "favicon.ico"),
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]
)
print("Saved multi-size favicon.ico (16, 32, 48, 64)")

