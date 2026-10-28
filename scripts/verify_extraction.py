import fitz
import re
import csv
import json

pdf_path = r"C:\Users\USER\.gemini\antigravity\brain\fe2333b8-6fcc-42f5-b09e-0838199c2703\.user_uploaded\media_1793204316305_0bca2a32.pdf"
doc = fitz.open(pdf_path)

FACULTY_STARTS = [
    "AGRICULTURE",
    "ARTS",
    "BASIC CLINICAL",
    "BASIC MEDICAL",
    "BIOLOGICAL",
    "BUSINESS",
    "DENTISTRY",
    "EDUCATION",
    "ENGINEERING",
    "ENVIRONMENTAL",
    "HEALTH SCIENCES",
    "LAW",
    "MEDICAL SCIENCES",
    "PHARMACEUTICAL",
    "PHYSICAL",
    "SOCIAL",
    "VETERINARY",
    "VOCATIONAL AND",
    "VOCATIONAL &",
]

def is_faculty_start(line):
    clean = line.strip().upper().replace("  ", " ")
    for prefix in FACULTY_STARTS:
        if clean == prefix or clean.startswith(prefix + " ") or clean.startswith(prefix):
            return prefix
    return None

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
            
            # Next lines are candidate name until we encounter a line starting with faculty
            name_parts = []
            j = i + 1
            while j < len(lines):
                next_line = lines[j]
                if is_faculty_start(next_line):
                    break
                # If we encounter another JAMB number or SN, stop
                if re.match(r'^(2026\d{8}[A-Z]{2})$', next_line, re.IGNORECASE):
                    break
                if next_line.isdigit() and len(next_line) <= 4 and j + 1 < len(lines) and re.match(r'^(2026\d{8}[A-Z]{2})$', lines[j+1], re.IGNORECASE):
                    break
                name_parts.append(next_line)
                j += 1
                
            candidate_name = " ".join(name_parts).strip()
            
            # Now extract faculty parts
            fac_parts = []
            while j < len(lines):
                next_line = lines[j]
                # If next line is all uppercase and matches faculty keywords
                up = next_line.upper().replace("  ", " ")
                if any(k in up for k in ["AGRICULTURE", "ARTS", "CLINICAL", "MEDICAL", "BIOLOGICAL", "BUSINESS", "ADMINISTRATION", "DENTISTRY", "EDUCATION", "ENGINEERING", "ENVIRONMENTAL", "STUDIES", "HEALTH", "SCIENCES", "TECHNOLOGY", "LAW", "PHARMACEUTICAL", "PHYSICAL", "SOCIAL", "VETERINARY", "MEDICINE", "VOCATIONAL", "TECHNICAL", "HNICAL"]):
                    fac_parts.append(next_line)
                    j += 1
                else:
                    break
                    
            faculty = " ".join(fac_parts).strip()
            
            # Now extract department parts
            dept_parts = []
            while j < len(lines):
                next_line = lines[j]
                if next_line.isdigit() and len(next_line) <= 4 and j + 1 < len(lines) and re.match(r'^(2026\d{8}[A-Z]{2})$', lines[j+1], re.IGNORECASE):
                    break
                if re.match(r'^(2026\d{8}[A-Z]{2})$', next_line, re.IGNORECASE):
                    break
                if "UNIVERSITY OF NIGERIA" in next_line or "OFFICE OF THE REGISTRAR" in next_line or "PRIMARY ADMISSION LIST" in next_line:
                    break
                dept_parts.append(next_line)
                j += 1
                
            department = " ".join(dept_parts).strip()
            
            candidates.append({
                "jambRegNumber": reg_no,
                "candidateName": candidate_name,
                "faculty": faculty,
                "department": department,
                "page": page_idx + 1
            })
            
            i = j - 1
        i += 1

print(f"Total extracted candidates: {len(candidates)}")
print("\nFirst 5:")
for c in candidates[:5]:
    print(c)
print("\nPage 237 sample (Industrial Technical Education):")
for c in candidates[-5:]:
    print(c)
