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

# Strip ALL html tags — get only raw text
def strip_html(text):
    # Replace block tags with newlines so content is readable
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</(p|li|h[1-6]|td|th|tr|div|blockquote|figcaption|figure)>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', '', text)
    # Decode HTML entities
    text = text.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&nbsp;', ' ').replace('&#038;', '&').replace('&quot;', '"').replace('&#8217;', "'").replace('&#8216;', "'").replace('&#8220;', '"').replace('&#8221;', '"').replace('&#8211;', '-').replace('&#8212;', '-')
    # Remove WP block comments
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    # Collapse whitespace lines but keep paragraph breaks
    lines = [line.strip() for line in text.split('\n')]
    # Remove empty lines clusters but keep single blank line as paragraph break
    result = []
    prev_empty = False
    for line in lines:
        if line == '':
            if not prev_empty:
                result.append('')
            prev_empty = True
        else:
            result.append(line)
            prev_empty = False
    return '\n'.join(result).strip()

clean = strip_html(body)
print(clean)
