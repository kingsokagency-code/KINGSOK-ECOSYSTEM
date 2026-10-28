import fitz
import re

pdf_path = r"C:\Users\USER\.gemini\antigravity\brain\fe2333b8-6fcc-42f5-b09e-0838199c2703\.user_uploaded\media_1793204316305_0bca2a32.pdf"
doc = fitz.open(pdf_path)

candidates = []

for page_idx in range(5):
    page = doc[page_idx]
    text = page.get_text()
    lines = [l.strip() for l in text.split("\n") if l.strip()]

    # Find where data rows start. Usually after DEPARTMENT or header
    i = 0
    while i < len(lines):
        # Look for JAMB number pattern
        line = lines[i]
        m = re.match(r'^(2026\d{8}[A-Z]{2})$', line, re.IGNORECASE)
        if m:
            reg_no = m.group(1).upper()
            # The line before might be the SN number
            sn = lines[i-1] if i > 0 and lines[i-1].isdigit() else ""
            
            # The lines after: candidate name (could be 1 or 2 lines), then Faculty (ALL CAPS), then Department
            # Let's inspect the next few lines
            remaining = lines[i+1:i+10]
            # In UNN admission list, Faculty is one of known faculties:
            # AGRICULTURE, ARTS, BASIC MEDICAL SCIENCES, BIOLOGICAL SCIENCES, BUSINESS ADMINISTRATION,
            # DENTISTRY, EDUCATION, ENGINEERING, ENVIRONMENTAL STUDIES, HEALTH SCIENCES AND TECHNOLOGY,
            # LAW, MEDICAL SCIENCES, PHARMACEUTICAL SCIENCES, PHYSICAL SCIENCES, SOCIAL SCIENCES,
            # VETERINARY MEDICINE, VOCATIONAL AND TECHNICAL EDUCATION, etc.
            candidates.append({"page": page_idx + 1, "sn": sn, "reg_no": reg_no, "context": remaining[:5]})
        i += 1

print(f"Found {len(candidates)} candidates on first 5 pages")
for c in candidates[:8]:
    print(c)
