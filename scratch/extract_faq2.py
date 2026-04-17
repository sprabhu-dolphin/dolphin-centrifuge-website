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

# Better approach: find each Question block individually
# PHP serialized: a:3:{s:5:"@type";s:8:"Question";s:4:"name";s:NN:"...";s:14:"acceptedAnswer";a:2:{s:5:"@type";s:6:"Answer";s:4:"text";s:NN:"..."
# Each mainEntity entry looks like: i:N;a:3:{...}

# Split on the Question @type marker to find each Q block
question_blocks = re.split(r'i:\d+;a:3:\{s:5:"@type";s:8:"Question"', raw)

print(f"Found {len(question_blocks)-1} question blocks\n")
print("=" * 60)

faqs = []
for i, block in enumerate(question_blocks[1:], 1):  # skip first split (before first question)
    q_match = re.search(r's:4:"name";s:\d+:"(.*?)"', block)
    a_match = re.search(r's:4:"text";s:\d+:"(.*?)"', block)
    
    question = q_match.group(1) if q_match else "NOT FOUND"
    answer = a_match.group(1) if a_match else "NOT FOUND"
    
    print(f"Q{i}: {question}")
    print(f"A{i}: {answer}")
    print()
    faqs.append((question, answer))

print(f"\nTotal Q&A pairs: {len(faqs)}")
