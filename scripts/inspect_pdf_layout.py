import fitz
import re
import csv
import json

pdf_path = r"C:\Users\USER\.gemini\antigravity\brain\fe2333b8-6fcc-42f5-b09e-0838199c2703\.user_uploaded\media_1793204316305_0bca2a32.pdf"
doc = fitz.open(pdf_path)

# Let's inspect page 0 text lines
print("=== Page 1 Lines ===")
lines = [l.strip() for l in doc[0].get_text().split("\n") if l.strip()]
for idx, l in enumerate(lines[:40]):
    print(f"{idx}: {l}")
