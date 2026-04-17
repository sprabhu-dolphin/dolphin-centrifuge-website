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

if not faq_schema:
    print("FAQ SCHEMA NOT FOUND")
    exit()

raw = faq_schema.group(1)

# PHP serialized format: find all Question name + Answer text pairs
# Pattern: s:NN:"name";s:NN:"QUESTION" ... s:NN:"text";s:NN:"ANSWER"
questions = re.findall(r's:\d+:"name";s:\d+:"(.*?)"', raw)
answers = re.findall(r's:\d+:"text";s:\d+:"(.*?)"', raw)

print(f"Found {len(questions)} questions, {len(answers)} answers\n")
print("=" * 60)

for i, (q, a) in enumerate(zip(questions, answers), 1):
    print(f"Q{i}: {q}")
    print(f"A{i}: {a}")
    print()
