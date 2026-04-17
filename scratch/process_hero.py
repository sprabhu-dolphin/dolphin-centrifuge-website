from PIL import Image
import os

source_path = r'C:\Users\sprab\.gemini\antigravity\brain\a4bcc62c-9d93-4000-aab1-900dcb1ee917\wastewater_hero_extended_left_1776365095620.png'
target_dir = r'c:\Users\sprab\Documents\GitHub\dolphin-centrifuge-website\public\images\wastewater-centrifuge'
target_path = os.path.join(target_dir, 'wastewater-hero-v2.2.webp')

if not os.path.exists(target_dir):
    os.makedirs(target_dir)

# Load image
img = Image.open(source_path)

# 1. Scale to width 1400 (maintaining aspect ratio)
target_width = 1400
w_percent = (target_width / float(img.size[0]))
h_size = int((float(img.size[1]) * float(w_percent)))
img = img.resize((target_width, h_size), Image.Resampling.LANCZOS)

# 2. Crop to height 550 (centrally)
target_height = 550
left = 0
top = (img.size[1] - target_height) // 2
right = target_width
bottom = top + target_height

img_cropped = img.crop((left, top, right, bottom))

# 3. Save as WebP
img_cropped.save(target_path, 'WEBP', quality=90)
print(f"Success: Image saved to {target_path}")
print(f"Final Dimensions: {img_cropped.size}")
