import re

with open(r'C:\Users\sprab\Documents\GitHub\dolphin-centrifuge-website\LW.xml', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

items = content.split('<item>')
target = None
for item in items:
    if '<link>https://dolphincentrifuge.com/industrial-centrifuge/</link>' in item:
        target = item
        break

faq_schema = re.search(
    r'<wp:meta_key><!\[CDATA\[rank_math_schema_FAQPage\]\]></wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(.*?)\]\]></wp:meta_value>',
    target, re.DOTALL
)

raw = faq_schema.group(1)
question_blocks = re.split(r'i:\d+;a:3:\{s:5:"@type";s:8:"Question"', raw)

print("=== RAW Q8 BLOCK (1000 chars) ===")
print(question_blocks[8][:1000])
