import re

with open(r'C:\Users\sprab\Documents\GitHub\dolphin-centrifuge-website\LW.xml', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

items = content.split('<item>')
target = None
for item in items:
    if '<link>https://dolphincentrifuge.com/industrial-centrifuge/</link>' in item:
        target = item
        break

content_block = re.search(r'<content:encoded><!\[CDATA\[(.*?)\]\]></content:encoded>', target, re.DOTALL)
body = content_block.group(1)

# Extract ALL figure captions (image captions in WP)
captions = re.findall(r'<figcaption[^>]*>(.*?)</figcaption>', body, re.DOTALL | re.IGNORECASE)
print("=== IMAGE CAPTIONS IN LEGACY ===")
for i, cap in enumerate(captions, 1):
    clean = re.sub(r'<[^>]+>', '', cap).strip()
    print(f"  Caption {i}: {clean}")

# Get FAQ questions
faq_schema = re.search(r'<wp:meta_key><!\[CDATA\[rank_math_schema_FAQPage\]\]></wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(.*?)\]\]></wp:meta_value>', target, re.DOTALL)
if faq_schema:
    raw = faq_schema.group(1)
    questions = re.findall(r's:\d+:"name";s:\d+:"(.*?)"', raw)
    print("\n=== FAQ QUESTIONS IN LEGACY RANKMATH ===")
    for i, q in enumerate(questions, 1):
        print(f"  Q{i}: {q}")

# Check for canonical
canonical = re.search(r'<wp:meta_key><!\[CDATA\[_yoast_wpseo_canonical\]\]></wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(.*?)\]\]></wp:meta_value>', target, re.DOTALL)
print("\n=== CANONICAL FROM YOAST ===")
print(canonical.group(1).strip() if canonical else "NOT SET (no override - defaults to post URL)")

# Check robots
robots = re.search(r'<wp:meta_key><!\[CDATA\[rank_math_robots\]\]></wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(.*?)\]\]></wp:meta_value>', target, re.DOTALL)
print("\n=== ROBOTS ===")
print(robots.group(1).strip() if robots else "NOT FOUND")

# Get hero image (first image info)
print("\n=== HERO IMAGE (first img in post) ===")
first_img = re.search(r'<img[^>]+>', body, re.IGNORECASE)
if first_img:
    tag = first_img.group(0)
    src = re.search(r'src=["\']([^"\']+)["\']', tag, re.IGNORECASE)
    alt = re.search(r'alt=["\']([^"\']*)["\']', tag, re.IGNORECASE)
    print("  src:", src.group(1) if src else "NO SRC")
    print("  alt:", alt.group(1) if alt else "NO ALT")

# Check OG image meta
og_img = re.search(r'<wp:meta_key><!\[CDATA\[_yoast_wpseo_opengraph-image\]\]></wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(.*?)\]\]></wp:meta_value>', target, re.DOTALL)
print("\n=== OG IMAGE ===")
print(og_img.group(1).strip() if og_img else "NOT SET")

# Meta key: _thumbnail_id for featured image
thumb_id = re.search(r'<wp:meta_key><!\[CDATA\[_thumbnail_id\]\]></wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(.*?)\]\]></wp:meta_value>', target, re.DOTALL)
print("\n=== FEATURED IMAGE ID ===")
print(thumb_id.group(1).strip() if thumb_id else "NOT SET")
