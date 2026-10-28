import fitz
import re

pdf_path = r"C:\Users\USER\.gemini\antigravity\brain\fe2333b8-6fcc-42f5-b09e-0838199c2703\.user_uploaded\media_1793204316305_0bca2a32.pdf"

doc = fitz.open(pdf_path)
print("Total pages:", len(doc))

# Let's inspect page 0
text_page0 = doc[0].get_text()
print("--- Page 1 snippet ---")
print(text_page0[:500])

# Match standard UNN JAMB number pattern: 2026\d{8}[A-Z]{2}
reg_pattern = re.compile(r'\b(2026\d{8}[A-Z]{2})\b', re.IGNORECASE)

all_reg_numbers = []
for i, page in enumerate(doc):
    t = page.get_text()
    found = reg_pattern.findall(t)
    for r in found:
        all_reg_numbers.append(r.upper())

print(f"Total JAMB numbers found across all {len(doc)} pages: {len(all_reg_numbers)}")
unique_regs = list(dict.fromkeys(all_reg_numbers))
print(f"Unique JAMB numbers: {len(unique_regs)}")
print("First 10 numbers:", unique_regs[:10])
print("Last 10 numbers:", unique_regs[-10:])
