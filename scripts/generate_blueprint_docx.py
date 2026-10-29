import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
public_dir = os.path.join(PROJECT_ROOT, "public")
docx_output = os.path.join(public_dir, "KINGSOK_AI_WhatsApp_Real_Estate_Automation_Blueprint.docx")
artifacts_dir = r"C:\Users\USER\.gemini\antigravity\brain\fe2333b8-6fcc-42f5-b09e-0838199c2703"

doc = docx.Document()

# Page Margins: 1 inch
sections = doc.sections
for section in sections:
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)

# Color Palette: Deep Royal Navy & Emerald Green
NAVY = RGBColor(30, 58, 138)       # #1E3A8A
SLATE = RGBColor(71, 85, 105)      # #475569
EMERALD = RGBColor(5, 150, 105)    # #059669
CHARCOAL = RGBColor(15, 23, 42)    # #0F172A

# Helpers for styling
def add_title(text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(22)
    run.font.bold = True
    run.font.color.rgb = NAVY
    return p

def add_subtitle(text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(18)
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(11)
    run.font.color.rgb = SLATE
    return p

def add_heading_1(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(6)
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(14)
    run.font.bold = True
    run.font.color.rgb = NAVY
    return p

def add_heading_2(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(12)
    run.font.bold = True
    run.font.color.rgb = EMERALD
    return p

def add_body_p(text, bold_prefix=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Calibri"
        r_pre.font.size = Pt(10.5)
        r_pre.font.bold = True
        r_pre.font.color.rgb = CHARCOAL
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(10.5)
    run.font.color.rgb = CHARCOAL
    return p

def add_bullet(text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Calibri"
        r_pre.font.size = Pt(10.5)
        r_pre.font.bold = True
        r_pre.font.color.rgb = CHARCOAL
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(10.5)
    run.font.color.rgb = CHARCOAL
    return p

# Set Cell Background Color
def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

# DOCUMENT CONTENT
add_title("KINGSOK ECOSYSTEM")
add_subtitle("AI WHATSAPP REAL ESTATE & STUDENT LODGE AUTOMATION BLUEPRINT\nTarget Market: University of Nigeria, Nsukka (UNN) 2026/2027 Academic Session")

# 1. Executive Summary
add_heading_1("1. Executive Summary & Strategic Vision")
add_body_p("The annual admission of over 6,400+ undergraduate students to the University of Nigeria, Nsukka (UNN) creates an immediate, highly concentrated surge in demand for off-campus student accommodation across Nsukka (Hilltop, Odim Gate, Behind Flat, Green House, Ofulonu) and Enugu Campus.")
add_body_p("Traditionally, student real estate agencies struggle with manual WhatsApp messaging, leading to slow response times (often taking hours to reply while students message rival agents), tedious manual searches through gallery folders for lodge videos, and missed high-value bookings during peak clearance weeks.")
add_body_p("The Big Brother KingSok AI Concierge transforms this bottleneck into an automated competitive advantage: a 24/7 autonomous AI system that instantly answers incoming inquiries, qualifies student budgets and location preferences, dispatches matching video walkthroughs and photos, and books physical inspections directly into staff schedules.", bold_prefix="The Solution: ")

# 2. Customer Journey
add_heading_1("2. The 5-Stage Automated Customer Journey")
add_body_p("The system runs a seamless 5-step funnel designed to move freshers from initial inquiry to paying tenant with zero manual effort:")

add_bullet(" Students message KingSok via group invite links, flyers, or referrals. The AI greets them within 2 seconds by name: 'Congratulations on your admission to UNN! I am KingSok 24/7 Housing Concierge. Let us find your ideal room.'", bold_prefix="Stage 1: Inbound Lead Capture —")
add_bullet(" The AI asks 3 structured, conversational questions: Maximum annual budget (e.g., ₦180k, ₦250k, ₦400k), preferred location (Hilltop, Odim, Behind Flat), and required utilities (solar power, borehole water, self-contain vs single room).", bold_prefix="Stage 2: Interactive Qualification —")
add_bullet(" The AI immediately queries the live KingSok Lodge Inventory and filters out fully booked properties, identifying the top 2 matching options.", bold_prefix="Stage 3: Real-Time Catalog Matching —")
add_bullet(" The AI automatically sends 3 high-resolution photos, a compressed 15-20 second video walkthrough, exact pricing breakdown, and walking distance to the student's faculty.", bold_prefix="Stage 4: Dynamic Media Dispatch —")
add_bullet(" The AI asks: 'Would you like our KingSok field team to take you on a physical inspection tomorrow at 2:00 PM?' Once confirmed, it triggers an instant staff alert with all details.", bold_prefix="Stage 5: Physical Inspection Handoff —")

# 3. Community Broadcasting
add_heading_1("3. Automated WhatsApp Community & Group Broadcasting")
add_body_p("To dominate student attention and eliminate advertising costs, the system manages automated multi-group distribution:")
add_bullet(" Create 1 WhatsApp Community per Faculty (e.g., Faculty of Pharmaceutical Sciences), with dedicated sub-groups for each Department (Pharmacy, Pharmacology, etc.).", bold_prefix="Faculty & Department Communities: ")
add_bullet(" Every morning at 8:30 AM, an automated background scheduler selects a vacant property, generates an engaging, emoji-rich student broadcast caption, and dispatches it to all KingSok groups simultaneously.", bold_prefix="Automated Daily 'Lodge of the Day' Broadcast: ")
add_bullet(" Employs 3-5 second randomized delays between group posts to protect the WhatsApp account from spam filters and bans.", bold_prefix="Anti-Ban Safety Protocols: ")

# 4. Tech Stack Table
add_heading_1("4. Technical Architecture & Technology Stack")
add_body_p("The system connects four proven, production-grade components:")

table = doc.add_table(rows=6, cols=3)
table.alignment = WD_TABLE_ALIGNMENT.CENTER
table.autofit = False

headers = ["System Layer", "Recommended Tool", "Core Purpose & Benefit"]
col_widths = [Inches(1.8), Inches(2.0), Inches(2.7)]

hdr_cells = table.rows[0].cells
for idx, text in enumerate(headers):
    hdr_cells[idx].text = text
    set_cell_background(hdr_cells[idx], "1E3A8A")
    for p in hdr_cells[idx].paragraphs:
        for r in p.runs:
            r.font.name = "Calibri"
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)
            r.font.size = Pt(10)

data = [
    ("WhatsApp Gateway", "Evolution API / Baileys", "Connects to existing Nigerian WhatsApp SIM via QR code. Sends text, video, photos, and posts to groups."),
    ("Workflow Engine", "n8n (Self-Hosted)", "Visual orchestrator. Routes webhooks, executes business logic, and schedules broadcasts."),
    ("AI Brain", "Gemini Flash / Antigravity", "Understands Nigerian student slang, location abbreviations, and crafts friendly human responses."),
    ("Lodge Inventory", "Google Sheets / Airtable", "Zero-code database where staff easily manage vacancies, prices, photos, and video links."),
    ("Server Hosting", "Cloud VPS (DigitalOcean/Hetzner)", "Affordable $6/month cloud server running 24/7/365 with uninterrupted power and internet.")
]

for row_idx, row_data in enumerate(data, start=1):
    row_cells = table.rows[row_idx].cells
    bg_color = "F8FAFC" if row_idx % 2 == 0 else "FFFFFF"
    for col_idx, cell_value in enumerate(row_data):
        row_cells[col_idx].text = cell_value
        set_cell_background(row_cells[col_idx], bg_color)
        for p in row_cells[col_idx].paragraphs:
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(4)
            for r in p.runs:
                r.font.name = "Calibri"
                r.font.size = Pt(9.5)
                if col_idx == 0:
                    r.font.bold = True

for row in table.rows:
    for idx, width in enumerate(col_widths):
        row.cells[idx].width = width

# 5. Staff SOP
add_heading_1("5. Staff Standard Operating Procedures (SOP)")
add_heading_2("A. Maintaining the Lodge Inventory")
add_body_p("Staff members do not need programming knowledge. They simply manage a shared Google Sheet with the following columns:")
add_bullet("Lodge Name (e.g., Cornerstone Villa)")
add_bullet("Location Area (e.g., Hilltop, Odim Gate, Behind Flat)")
add_bullet("Room Type (e.g., Self-Contain, Single Room)")
add_bullet("Annual Rent (e.g., ₦240,000)")
add_bullet("Utilities & Perks (e.g., Solar Inverter, Borehole Water, Tiled)")
add_bullet("Photo Links & Video URL (Google Drive / Cloudinary folder)")
add_bullet("Vacancy Status (Set to 'Available' or 'Occupied')")
add_body_p("Critical Rule: As soon as a student pays for a room, staff must change Vacancy Status to 'Occupied'. The AI will instantly stop offering it to new students.", bold_prefix="Important: ")

add_heading_2("B. Handling Hot Lead Inspection Alerts")
add_body_p("When a student confirms an inspection with the AI, the KingSok staff phone receives an automated alert:")
add_body_p("🚨 HOT INSPECTION ALERT — KINGSOK ACCOMMODATION\n• Student Name: Chidera Okonkwo\n• Department: Medical Laboratory Sciences\n• Mobile Number: 0803XXXXXXX\n• Target Property: Cornerstone Villa (Hilltop) — ₦240k\n• Inspection Date & Time: Tomorrow, 2:30 PM\n• Assigned Field Guide: Agent Emeka", bold_prefix="Sample Alert: ")
add_body_p("Protocol: The assigned field agent must call the student 1 hour prior to confirm arrival at the designated meeting point (e.g., Peace Mass Park or Odim Gate) and conduct the physical inspection.", bold_prefix="Staff Action: ")

# 6. Roadmap
add_heading_1("6. Phased Rollout Roadmap")
add_bullet(" Extract 100% of all 6,488 admitted UNN candidates with verified phone numbers (Currently running in background). Generate departmental .vcf contact files for community contact gain.", bold_prefix="Phase 1: Student Foundation (Immediate) — ")
add_bullet(" Film 15-20 second short video tours of KingSok's premier lodges. Populate the Master Google Sheet with media links, rent figures, and amenities.", bold_prefix="Phase 2: Inventory Cataloging (Week 1) — ")
add_bullet(" Antigravity deploys the Evolution API WhatsApp connector and configures n8n qualification workflows. Conduct internal team tests.", bold_prefix="Phase 3: System Deployment (Week 2) — ")
add_bullet(" Launch WhatsApp community broadcast campaigns and activate 24/7 autonomous inquiry handling as freshers arrive for physical clearance.", bold_prefix="Phase 4: Full Campus Launch (Resumption Week) — ")

doc.save(docx_output)
print(f"Successfully generated DOCX: {docx_output}")

# Copy to artifacts directory
import shutil
dst_docx = os.path.join(artifacts_dir, "KINGSOK_AI_WhatsApp_Real_Estate_Automation_Blueprint.docx")
shutil.copy2(docx_output, dst_docx)
print(f"Copied DOCX to artifacts: {dst_docx}")
