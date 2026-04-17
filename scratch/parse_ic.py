import re

with open(r'C:\Users\sprab\Documents\GitHub\dolphin-centrifuge-website\LW.xml', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

items = content.split('<item>')
target = None
for item in items:
    if '<link>https://dolphincentrifuge.com/industrial-centrifuge/</link>' in item:
        target = item
        break

if not target:
    print("ITEM NOT FOUND")
    exit()

# --- Title ---
title = re.search(r'<title><!\[CDATA\[(.*?)\]\]></title>', target, re.DOTALL)
if not title:
    title = re.search(r'<title>(.*?)</title>', target, re.DOTALL)
print("=== TITLE ===")
print(title.group(1).strip() if title else "NOT FOUND")

# --- RankMath title/description ---
rm_title = re.search(r'<wp:meta_key><!\[CDATA\[rank_math_title\]\]></wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(.*?)\]\]></wp:meta_value>', target, re.DOTALL)
rm_desc = re.search(r'<wp:meta_key><!\[CDATA\[rank_math_description\]\]></wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(.*?)\]\]></wp:meta_value>', target, re.DOTALL)
yoast_desc = re.search(r'<wp:meta_key><!\[CDATA\[_yoast_wpseo_metadesc\]\]></wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(.*?)\]\]></wp:meta_value>', target, re.DOTALL)
rm_focus = re.search(r'<wp:meta_key><!\[CDATA\[rank_math_focus_keyword\]\]></wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(.*?)\]\]></wp:meta_value>', target, re.DOTALL)

print("\n=== RANKMATH TITLE ===")
print(rm_title.group(1).strip() if rm_title else "NOT FOUND")
print("\n=== RANKMATH DESCRIPTION (meta desc) ===")
print(rm_desc.group(1).strip() if rm_desc else "NOT FOUND")
print("\n=== YOAST META DESC (fallback) ===")
print(yoast_desc.group(1).strip() if yoast_desc else "NOT FOUND")
print("\n=== FOCUS KEYWORD ===")
print(rm_focus.group(1).strip() if rm_focus else "NOT FOUND")

# --- FAQ schema (check if questions exist) ---
faq_schema = re.search(r'<wp:meta_key><!\[CDATA\[rank_math_schema_FAQPage\]\]></wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(.*?)\]\]></wp:meta_value>', target, re.DOTALL)
print("\n=== FAQ SCHEMA (first 1500 chars) ===")
if faq_schema:
    print(faq_schema.group(1).strip()[:1500])
else:
    print("NOT FOUND")

# --- Content body ---
content_block = re.search(r'<content:encoded><!\[CDATA\[(.*?)\]\]></content:encoded>', target, re.DOTALL)
if content_block:
    body = content_block.group(1)

    # H1
    h1 = re.search(r'<h1[^>]*>(.*?)</h1>', body, re.DOTALL | re.IGNORECASE)
    print("\n=== H1 IN CONTENT ===")
    print(h1.group(1).strip() if h1 else "No H1 in body")

    # Images - find all img tags
    img_tags = re.findall(r'<img[^>]+>', body, re.IGNORECASE)
    print("\n=== IMAGES IN LEGACY CONTENT ===")
    for tag in img_tags:
        src = re.search(r'src=["\']([^"\']+)["\']', tag, re.IGNORECASE)
        alt = re.search(r'alt=["\']([^"\']*)["\']', tag, re.IGNORECASE)
        print("  src:", src.group(1) if src else "NO SRC", "| alt:", alt.group(1) if alt else "NO ALT")

    print("\n=== FIRST 800 chars of BODY ===")
    print(body[:800])
else:
    print("NO CONTENT BLOCK FOUND")
