import json
import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

manifest_json = r"c:\Users\USER\Downloads\KINGSOK ECOSYSTEM\public\UNN_2026_2027_Primary_Admission_Manifest.json"
checkpoint_json = r"c:\Users\USER\Downloads\KINGSOK ECOSYSTEM\public\UNN_2026_2027_Enrichment_Checkpoint.json"
output_xlsx = r"c:\Users\USER\Downloads\KINGSOK ECOSYSTEM\public\UNN_2026_2027_Primary_Admission_List.xlsx"
output_enriched_xlsx = r"c:\Users\USER\Downloads\KINGSOK ECOSYSTEM\public\UNN_2026_2027_Primary_Admission_Enriched.xlsx"

# Load Manifest
with open(manifest_json, "r", encoding="utf-8") as f:
    candidates = json.load(f)

# Load Checkpoint (Enriched live data)
enriched_data = {}
if os.path.exists(checkpoint_json):
    with open(checkpoint_json, "r", encoding="utf-8") as f:
        enriched_data = json.load(f)

print(f"Loaded {len(candidates)} candidates from manifest.")
print(f"Loaded {len(enriched_data)} live-enriched candidates from checkpoint.")

# Styles
navy_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
green_fill = PatternFill(start_color="065F46", end_color="065F46", fill_type="solid")
header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
sub_header_font = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
cell_font = Font(name="Calibri", size=10)
bold_font = Font(name="Calibri", size=10, bold=True)
mono_font = Font(name="Consolas", size=10)
success_font = Font(name="Calibri", size=10, color="047857", bold=True)
pending_font = Font(name="Calibri", size=10, color="64748B", italic=True)

thin_border_side = Side(border_style="thin", color="CBD5E1")
cell_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
zebra_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
highlight_green = PatternFill(start_color="ECFDF5", end_color="ECFDF5", fill_type="solid")

def build_master_workbook():
    wb = openpyxl.Workbook()
    
    # -------------------------------------------------------------
    # SHEET 1: VERIFIED PHONE NUMBERS (LIVE ENRICHED)
    # -------------------------------------------------------------
    ws1 = wb.active
    ws1.title = "Verified Phone Contacts"
    ws1.views.sheetView[0].showGridLines = True
    
    headers1 = [
        "S/N",
        "JAMB Reg Number",
        "Candidate Full Name",
        "Department",
        "Faculty",
        "Phone Number",
        "Email Address",
        "State of Origin",
        "L.G.A.",
        "Admission Type",
        "Processing Status",
        "Data Source Provenance"
    ]
    
    ws1.append(headers1)
    for col_idx in range(1, len(headers1) + 1):
        cell = ws1.cell(row=1, column=col_idx)
        cell.fill = green_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = cell_border
    ws1.row_dimensions[1].height = 28
    
    row_num = 2
    for reg, item in enriched_data.items():
        phone = item.get("phoneNumber") or item.get("mobileNumber") or ""
        ws1.append([
            row_num - 1,
            item.get("jambRegNumber", reg),
            item.get("candidateName", ""),
            item.get("department", ""),
            item.get("faculty", ""),
            phone,
            item.get("email", ""),
            item.get("state", ""),
            item.get("lga", ""),
            item.get("admissionType", "UTME"),
            "VERIFIED",
            "AUTHORIZED LIVE INTEGRATION"
        ])
        
        is_zebra = (row_num % 2 == 0)
        row_fill = highlight_green if is_zebra else None
        
        for col_idx in range(1, len(headers1) + 1):
            c = ws1.cell(row=row_num, column=col_idx)
            c.border = cell_border
            c.font = cell_font
            if row_fill:
                c.fill = row_fill
            
            # Alignments
            if col_idx in (1, 10, 11):
                c.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx in (2, 6):
                c.font = mono_font
                c.alignment = Alignment(horizontal="center", vertical="center")
                if col_idx == 6:
                    c.font = Font(name="Consolas", size=10, bold=True, color="047857")
            elif col_idx == 12:
                c.font = Font(name="Calibri", size=9, bold=True, color="065F46")
                c.alignment = Alignment(horizontal="center", vertical="center")
                
        ws1.row_dimensions[row_num].height = 20
        row_num += 1

    ws1.freeze_panes = "A2"
    ws1.auto_filter.ref = f"A1:{get_column_letter(len(headers1))}{max(row_num-1, 1)}"
    
    # -------------------------------------------------------------
    # SHEET 2: COMPLETE PRIMARY ADMISSION LIST (6,488 CANDIDATES)
    # -------------------------------------------------------------
    ws2 = wb.create_sheet(title="Primary UTME Admission List")
    ws2.views.sheetView[0].showGridLines = True
    
    headers2 = [
        "S/N",
        "JAMB Reg Number",
        "Candidate Full Name",
        "Department",
        "Faculty",
        "Phone Number",
        "Admission Type",
        "Processing Status",
        "Data Source Provenance",
        "Original PDF Page"
    ]
    
    ws2.append(headers2)
    for col_idx in range(1, len(headers2) + 1):
        cell = ws2.cell(row=1, column=col_idx)
        cell.fill = navy_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = cell_border
    ws2.row_dimensions[1].height = 28
    
    row_num = 2
    for c in candidates:
        reg = c["jambRegNumber"]
        has_enrich = reg in enriched_data
        enrich_item = enriched_data.get(reg, {})
        
        phone = enrich_item.get("phoneNumber") or ""
        status = "VERIFIED" if has_enrich and phone else "PENDING_VERIFICATION"
        provenance = "AUTHORIZED LIVE INTEGRATION" if has_enrich and phone else "UPLOADED MANIFEST"
        name = enrich_item.get("candidateName") or c["candidateName"]
        dept = enrich_item.get("department") or c["department"]
        
        ws2.append([
            c["sn"],
            reg,
            name,
            dept,
            c["faculty"],
            phone if phone else "—",
            c["admissionType"],
            status,
            provenance,
            c.get("page", "")
        ])
        
        is_zebra = (row_num % 2 == 0)
        row_fill = zebra_fill if is_zebra else None
        
        for col_idx in range(1, len(headers2) + 1):
            cell = ws2.cell(row=row_num, column=col_idx)
            cell.border = cell_border
            cell.font = cell_font
            if row_fill:
                cell.fill = row_fill
            
            if col_idx in (1, 7, 8, 10):
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx in (2, 6):
                cell.font = mono_font
                cell.alignment = Alignment(horizontal="center", vertical="center")
                if col_idx == 6 and phone:
                    cell.font = Font(name="Consolas", size=10, bold=True, color="047857")
                    cell.fill = highlight_green
            elif col_idx == 8:
                if status == "VERIFIED":
                    cell.font = success_font
                else:
                    cell.font = pending_font
            elif col_idx == 9:
                cell.font = Font(name="Calibri", size=9)
                cell.alignment = Alignment(horizontal="center", vertical="center")
                
        ws2.row_dimensions[row_num].height = 20
        row_num += 1

    ws2.freeze_panes = "A2"
    ws2.auto_filter.ref = f"A1:{get_column_letter(len(headers2))}{max(row_num-1, 1)}"

    # -------------------------------------------------------------
    # SHEET 3: DEPARTMENT ANALYTICS & FACULTY BREAKDOWN
    # -------------------------------------------------------------
    ws3 = wb.create_sheet(title="Department Breakdown")
    ws3.views.sheetView[0].showGridLines = True
    
    headers3 = [
        "S/N",
        "Faculty",
        "Department",
        "Total Candidates Admitted",
        "Verified Phone Contacts"
    ]
    
    ws3.append(headers3)
    for col_idx in range(1, len(headers3) + 1):
        cell = ws3.cell(row=1, column=col_idx)
        cell.fill = navy_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = cell_border
    ws3.row_dimensions[1].height = 28
    
    # Calculate aggregation
    dept_map = {}
    for c in candidates:
        fac = c.get("faculty") or "UNKNOWN"
        dept = c.get("department") or "GENERAL"
        key = (fac, dept)
        if key not in dept_map:
            dept_map[key] = {"total": 0, "enriched": 0}
        dept_map[key]["total"] += 1
        if c["jambRegNumber"] in enriched_data:
            dept_map[key]["enriched"] += 1
            
    sorted_depts = sorted(dept_map.keys(), key=lambda k: (k[0], -dept_map[k]["total"]))
    
    row_num = 2
    for idx, (fac, dept) in enumerate(sorted_depts, start=1):
        total = dept_map[(fac, dept)]["total"]
        enr = dept_map[(fac, dept)]["enriched"]
        ws3.append([idx, fac, dept, total, enr])
        
        is_zebra = (row_num % 2 == 0)
        for col_idx in range(1, len(headers3) + 1):
            cell = ws3.cell(row=row_num, column=col_idx)
            cell.border = cell_border
            cell.font = cell_font
            if is_zebra:
                cell.fill = zebra_fill
            if col_idx in (1, 4, 5):
                cell.alignment = Alignment(horizontal="center", vertical="center")
                if col_idx == 4:
                    cell.font = bold_font
                if col_idx == 5 and enr > 0:
                    cell.font = success_font
                    cell.fill = highlight_green
        ws3.row_dimensions[row_num].height = 20
        row_num += 1
        
    ws3.freeze_panes = "A2"
    ws3.auto_filter.ref = f"A1:{get_column_letter(len(headers3))}{max(row_num-1, 1)}"

    # Auto-adjust column widths on all sheets
    for ws in [ws1, ws2, ws3]:
        for col in ws.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            # Sample first 200 rows for speed
            for cell in list(col)[:200]:
                val_str = str(cell.value or "")
                if len(val_str) > max_len:
                    max_len = len(val_str)
            ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

    wb.save(output_xlsx)
    print(f"Master Excel saved successfully to: {output_xlsx}")

    # Also build standalone enriched workbook for fast lightweight download
    wb_enriched = openpyxl.Workbook()
    ws_e = wb_enriched.active
    ws_e.title = "UNN 2026 Verified Contacts"
    ws_e.views.sheetView[0].showGridLines = True
    ws_e.append(headers1)
    for col_idx in range(1, len(headers1) + 1):
        cell = ws_e.cell(row=1, column=col_idx)
        cell.fill = green_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = cell_border
    ws_e.row_dimensions[1].height = 28
    
    r_idx = 2
    for reg, item in enriched_data.items():
        phone = item.get("phoneNumber") or item.get("mobileNumber") or ""
        ws_e.append([
            r_idx - 1,
            item.get("jambRegNumber", reg),
            item.get("candidateName", ""),
            item.get("department", ""),
            item.get("faculty", ""),
            phone,
            item.get("email", ""),
            item.get("state", ""),
            item.get("lga", ""),
            item.get("admissionType", "UTME"),
            "VERIFIED",
            "AUTHORIZED LIVE INTEGRATION"
        ])
        for col_idx in range(1, len(headers1) + 1):
            cell = ws_e.cell(row=r_idx, column=col_idx)
            cell.border = cell_border
            cell.font = cell_font
            if col_idx in (1, 10, 11):
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx in (2, 6):
                cell.font = mono_font
                cell.alignment = Alignment(horizontal="center", vertical="center")
                if col_idx == 6:
                    cell.font = Font(name="Consolas", size=10, bold=True, color="047857")
            elif col_idx == 12:
                cell.font = Font(name="Calibri", size=9, bold=True, color="065F46")
                cell.alignment = Alignment(horizontal="center", vertical="center")
        ws_e.row_dimensions[r_idx].height = 20
        r_idx += 1
        
    for col in ws_e.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            val_str = str(cell.value or "")
            if len(val_str) > max_len:
                max_len = len(val_str)
        ws_e.column_dimensions[col_letter].width = max(max_len + 4, 12)
        
    ws_e.freeze_panes = "A2"
    ws_e.auto_filter.ref = f"A1:{get_column_letter(len(headers1))}{max(r_idx-1, 1)}"
    wb_enriched.save(output_enriched_xlsx)
    print(f"Enriched Excel saved successfully to: {output_enriched_xlsx}")

if __name__ == "__main__":
    build_master_workbook()
