import pdfplumber

pdf_path = r"C:\Users\USER\.gemini\antigravity\brain\fe2333b8-6fcc-42f5-b09e-0838199c2703\.user_uploaded\media_1793204316305_0bca2a32.pdf"

with pdfplumber.open(pdf_path) as pdf:
    p0 = pdf.pages[0]
    tables = p0.extract_tables()
    for r in tables[0][:8]:
        print(r)
