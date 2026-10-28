import fitz
import re
import csv
import json
import os

pdf_path = r"C:\Users\USER\.gemini\antigravity\brain\fe2333b8-6fcc-42f5-b09e-0838199c2703\.user_uploaded\media_1793204316305_0bca2a32.pdf"
doc = fitz.open(pdf_path)

CANONICAL_FACULTIES = [
    "VOCATIONAL AND TECHNICAL EDUCATION",
    "VOCATIONAL AND TEC HNICAL EDUCATION",
    "HEALTH SCIENCES AND TECHNOLOGY",
    "BASIC CLINICAL SCIENCES",
    "CLINICAL SCIENCES",
    "BASIC MEDICAL SCIENCES",
    "MEDICAL SCIENCES",
    "PHARMACEUTICAL SCIENCES",
    "BUSINESS ADMINISTRATION",
    "ENVIRONMENTAL STUDIES",
    "BIOLOGICAL SCIENCES",
    "PHYSICAL SCIENCES",
    "VETERINARY MEDICINE",
    "SOCIAL SCIENCES",
    "AGRICULTURE",
    "ENGINEERING",
    "DENTISTRY",
    "EDUCATION",
    "ARTS",
    "LAW",
]

def parse_record_lines(lines_chunk):
    cleaned_chunk = []
    for l in lines_chunk:
        up = l.upper()
        if any(h in up for h in ["FACULTY OF", "JAMB NO", "FULLNAME", "PRIMARY ADMISSION", "OFFICE OF THE REGISTRAR"]):
            break
        cleaned_chunk.append(l)
    chunk_text = " ".join(cleaned_chunk).strip()
    
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
        clean_fac = matched_faculty.replace("TEC HNICAL", "TECHNICAL")
        for h in ["FACULTY OF", "SN JAMB", "JAMB NO", "FULLNAME"]:
            if h in dept.upper():
                dept = dept[:dept.upper().find(h)].strip()
        return name, clean_fac, dept
    else:
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
            
            j = i + 1
            chunk = []
            while j < len(lines):
                next_line = lines[j]
                if next_line.isdigit() and len(next_line) <= 4 and j + 1 < len(lines) and re.match(r'^(2026\d{8}[A-Z]{2})$', lines[j+1], re.IGNORECASE):
                    break
                if re.match(r'^(2026\d{8}[A-Z]{2})$', next_line, re.IGNORECASE):
                    break
                if any(hdr in next_line.upper() for hdr in ["UNIVERSITY OF NIGERIA", "OFFICE OF THE REGISTRAR", "PRIMARY ADMISSION LIST", "FACULTY OF", "JAMB NO"]):
                    break
                chunk.append(next_line)
                j += 1
                
            name, fac, dept = parse_record_lines(chunk)
            
            # Standardize name title casing
            cleaned_name = " ".join([w.capitalize() if not w.isupper() or len(w) > 2 else w for w in name.split()])
            
            candidates.append({
                "sn": len(candidates) + 1,
                "jambRegNumber": reg_no,
                "candidateName": name,
                "faculty": fac,
                "department": dept,
                "admissionType": "UTME",
                "page": page_idx + 1
            })
            
            i = j - 1
        i += 1

print(f"Successfully extracted {len(candidates)} candidates from all 238 pages.")

# Ensure public dir exists
out_dir = r"c:\Users\USER\Downloads\KINGSOK ECOSYSTEM\public"
os.makedirs(out_dir, exist_ok=True)

csv_path = os.path.join(out_dir, "UNN_2026_2027_Primary_Admission_Manifest.csv")
with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.writer(f)
    writer.writerow(["SN", "JAMB Registration Number", "Candidate Full Name", "Faculty", "Department", "Admission Type", "PDF Page"])
    for c in candidates:
        writer.writerow([c["sn"], c["jambRegNumber"], c["candidateName"], c["faculty"], c["department"], c["admissionType"], c["page"]])

print(f"Saved CSV manifest to {csv_path}")

json_path = os.path.join(out_dir, "UNN_2026_2027_Primary_Admission_Manifest.json")
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(candidates, f, indent=2)

print(f"Saved JSON manifest to {json_path}")
