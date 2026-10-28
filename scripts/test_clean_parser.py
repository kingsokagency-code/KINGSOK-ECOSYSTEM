import fitz
import re
import csv
import json

pdf_path = r"C:\Users\USER\.gemini\antigravity\brain\fe2333b8-6fcc-42f5-b09e-0838199c2703\.user_uploaded\media_1793204316305_0bca2a32.pdf"
doc = fitz.open(pdf_path)

# Normalized known faculties
CANONICAL_FACULTIES = [
    "VOCATIONAL AND TECHNICAL EDUCATION",
    "VOCATIONAL AND TEC HNICAL EDUCATION",
    "HEALTH SCIENCES AND TECHNOLOGY",
    "BASIC CLINICAL SCIENCES",
    "BASIC MEDICAL SCIENCES",
    "PHARMACEUTICAL SCIENCES",
    "BUSINESS ADMINISTRATION",
    "ENVIRONMENTAL STUDIES",
    "BIOLOGICAL SCIENCES",
    "PHYSICAL SCIENCES",
    "VETERINARY MEDICINE",
    "SOCIAL SCIENCES",
    "MEDICAL SCIENCES",
    "AGRICULTURE",
    "ENGINEERING",
    "DENTISTRY",
    "EDUCATION",
    "ARTS",
    "LAW",
]

def parse_record_lines(lines_chunk):
    # lines_chunk starts with name lines, followed by faculty, followed by department
    chunk_text = " ".join(lines_chunk)
    
    # Find matching faculty in the text
    matched_faculty = None
    fac_start_idx = -1
    fac_end_idx = -1
    
    for fac in CANONICAL_FACULTIES:
        idx = chunk_text.upper().find(fac)
        if idx != -1:
            matched_faculty = fac
            fac_start_idx = idx
            fac_end_idx = idx + len(fac)
            break
            
    if matched_faculty and fac_start_idx != -1:
        name = chunk_text[:fac_start_idx].strip()
        dept = chunk_text[fac_end_idx:].strip()
        # Clean faculty name
        clean_fac = matched_faculty.replace("TEC HNICAL", "TECHNICAL")
        return name, clean_fac, dept
    else:
        # Fallback
        return chunk_text, "", ""

candidates = []

for page_idx in range(len(doc)):
    page = doc[page_idx]
    text = page.get_text()
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        m = re.match(r'^(2026\d{8}[A-Z]{2})$', line, re.IGNORECASE)
        if m:
            reg_no = m.group(1).upper()
            
            # Collect lines until next candidate or footer
            j = i + 1
            chunk = []
            while j < len(lines):
                next_line = lines[j]
                if next_line.isdigit() and len(next_line) <= 4 and j + 1 < len(lines) and re.match(r'^(2026\d{8}[A-Z]{2})$', lines[j+1], re.IGNORECASE):
                    break
                if re.match(r'^(2026\d{8}[A-Z]{2})$', next_line, re.IGNORECASE):
                    break
                if "UNIVERSITY OF NIGERIA" in next_line or "OFFICE OF THE REGISTRAR" in next_line or "PRIMARY ADMISSION LIST" in next_line:
                    break
                chunk.append(next_line)
                j += 1
                
            name, fac, dept = parse_record_lines(chunk)
            
            candidates.append({
                "jambRegNumber": reg_no,
                "candidateName": name,
                "faculty": fac,
                "department": dept,
                "page": page_idx + 1
            })
            
            i = j - 1
        i += 1

print(f"Total extracted: {len(candidates)}")
print("\nSample 1-5:")
for c in candidates[:5]:
    print(c)
print("\nSample Law (page 163):")
for c in [c for c in candidates if c["faculty"] == "LAW"][:5]:
    print(c)
print("\nSample Medicine (page 100):")
for c in [c for c in candidates if "MEDICINE" in c["department"].upper()][:5]:
    print(c)
print("\nSample Voc/Tech (page 237):")
for c in candidates[-5:]:
    print(c)
