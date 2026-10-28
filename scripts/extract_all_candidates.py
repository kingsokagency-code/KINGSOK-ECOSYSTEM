import fitz
import re
import csv
import json

pdf_path = r"C:\Users\USER\.gemini\antigravity\brain\fe2333b8-6fcc-42f5-b09e-0838199c2703\.user_uploaded\media_1793204316305_0bca2a32.pdf"
doc = fitz.open(pdf_path)

KNOWN_FACULTIES = [
    "AGRICULTURE",
    "ARTS",
    "BASIC CLINICAL SCIENCES",
    "BASIC MEDICAL SCIENCES",
    "BIOLOGICAL SCIENCES",
    "BUSINESS ADMINISTRATION",
    "DENTISTRY",
    "EDUCATION",
    "ENGINEERING",
    "ENVIRONMENTAL STUDIES",
    "HEALTH SCIENCES AND TECHNOLOGY",
    "HEALTH SCIENCES & TECHNOLOGY",
    "LAW",
    "MEDICAL SCIENCES",
    "PHARMACEUTICAL SCIENCES",
    "PHYSICAL SCIENCES",
    "SOCIAL SCIENCES",
    "VETERINARY MEDICINE",
    "VOCATIONAL AND TECHNICAL EDUCATION",
    "VOCATIONAL & TECHNICAL EDUCATION",
    "VOCATIONAL AND TEC HNICAL EDUCATION",
]

def is_faculty(text):
    clean = text.strip().upper().replace("  ", " ")
    for f in KNOWN_FACULTIES:
        if clean == f or clean.startswith(f):
            return f
    # Also check if it starts with "FACULTY OF"
    if clean.startswith("FACULTY OF "):
        return clean.replace("FACULTY OF ", "").strip()
    return None

candidates = []
current_faculty = ""

for page_idx in range(len(doc)):
    page = doc[page_idx]
    text = page.get_text()
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Check faculty banner
        fac_check = is_faculty(line)
        if fac_check:
            current_faculty = fac_check
            
        m = re.match(r'^(2026\d{8}[A-Z]{2})$', line, re.IGNORECASE)
        if m:
            reg_no = m.group(1).upper()
            
            # Next lines are candidate name until we hit a faculty or known marker
            name_parts = []
            j = i + 1
            faculty_found = None
            
            while j < len(lines):
                next_line = lines[j]
                
                # Check if this line is a faculty
                fac = is_faculty(next_line)
                if fac:
                    faculty_found = fac
                    j += 1
                    break
                    
                # If we encounter the next number or JAMB reg, break
                if re.match(r'^(2026\d{8}[A-Z]{2})$', next_line, re.IGNORECASE) or (next_line.isdigit() and len(next_line) <= 4 and j + 1 < len(lines) and re.match(r'^(2026\d{8}[A-Z]{2})$', lines[j+1], re.IGNORECASE)):
                    break
                    
                name_parts.append(next_line)
                j += 1
                
            full_name = " ".join(name_parts).strip()
            
            # Now extract department
            dept_parts = []
            while j < len(lines):
                next_line = lines[j]
                # If next line is a digit (SN) followed by a JAMB reg, stop
                if next_line.isdigit() and len(next_line) <= 4 and j + 1 < len(lines) and re.match(r'^(2026\d{8}[A-Z]{2})$', lines[j+1], re.IGNORECASE):
                    break
                # If next line is a JAMB reg, stop
                if re.match(r'^(2026\d{8}[A-Z]{2})$', next_line, re.IGNORECASE):
                    break
                # If next line is a faculty header, stop
                if is_faculty(next_line):
                    break
                # If page footer / header
                if "UNIVERSITY OF NIGERIA" in next_line or "OFFICE OF THE REGISTRAR" in next_line or "PRIMARY ADMISSION LIST" in next_line:
                    break
                    
                dept_parts.append(next_line)
                j += 1
                
            department = " ".join(dept_parts).strip()
            if not department and current_faculty:
                department = current_faculty
                
            faculty = faculty_found or current_faculty
            
            candidates.append({
                "jambRegNumber": reg_no,
                "candidateName": full_name,
                "faculty": faculty,
                "department": department,
                "page": page_idx + 1
            })
            
            i = j - 1
        i += 1

print(f"Total extracted candidates: {len(candidates)}")
print("Sample extracted records:")
for c in candidates[:10]:
    print(c)
print("...\nLast 5 records:")
for c in candidates[-5:]:
    print(c)
