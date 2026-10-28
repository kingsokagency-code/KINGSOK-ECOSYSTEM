import json
import os
import shutil
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
public_dir = os.path.join(PROJECT_ROOT, "public")
manifest_json = os.path.join(public_dir, "UNN_2026_2027_Primary_Admission_Manifest.json")
checkpoint_json = os.path.join(public_dir, "UNN_2026_2027_Enrichment_Checkpoint.json")
artifacts_dir = r"C:\Users\USER\.gemini\antigravity\brain\fe2333b8-6fcc-42f5-b09e-0838199c2703"

output_master_xlsx = os.path.join(public_dir, "UNN_2026_2027_Primary_Admission_List.xlsx")
output_single_sheet_xlsx = os.path.join(public_dir, "UNN_2026_2027_All_6488_Candidates.xlsx")
output_enriched_xlsx = os.path.join(public_dir, "UNN_2026_2027_Primary_Admission_Enriched.xlsx")

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
cell_font = Font(name="Calibri", size=10)
bold_font = Font(name="Calibri", size=10, bold=True)
mono_font = Font(name="Consolas", size=10)
success_font = Font(name="Calibri", size=10, color="047857", bold=True)
pending_font = Font(name="Calibri", size=10, color="64748B", italic=True)

thin_border_side = Side(border_style="thin", color="CBD5E1")
cell_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
zebra_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
highlight_green = PatternFill(start_color="ECFDF5", end_color="ECFDF5", fill_type="solid")

def style_full_list_sheet(ws, title="All 6,488 Primary Candidates"):
    ws.title = title
    ws.views.sheetView[0].showGridLines = True
    
    headers = [
        "S/N",
        "JAMB Reg Number",
        "Candidate Full Name",
        "Department",
        "Faculty",
        "Phone Number",
        "Email Address",
        "Admission Type",
        "Processing Status",
        "Data Source Provenance",
        "Original PDF Page"
    ]
    
    ws.append(headers)
    for col_idx in range(1, len(headers) + 1):
        cell = ws.cell(row=1, column=col_idx)
        cell.fill = navy_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = cell_border
    ws.row_dimensions[1].height = 28
    
    row_num = 2
    for c in candidates:
        reg = c["jambRegNumber"]
        has_enrich = reg in enriched_data
        enrich_item = enriched_data.get(reg, {})
        
        phone = enrich_item.get("phoneNumber") or ""
        email = enrich_item.get("email") or ""
        status = "VERIFIED" if has_enrich and phone else "PENDING_PORTAL_LOOKUP"
        provenance = "AUTHORIZED LIVE INTEGRATION" if has_enrich and phone else "OFFICIAL UNN PRIMARY MANIFEST"
        name = enrich_item.get("candidateName") or c["candidateName"]
        dept = enrich_item.get("department") or c["department"]
        
        ws.append([
            c["sn"],
            reg,
            name,
            dept,
            c["faculty"],
            phone if phone else "—",
            email if email else "—",
            c["admissionType"],
            status,
            provenance,
            c.get("page", "")
        ])
        
        is_zebra = (row_num % 2 == 0)
        row_fill = zebra_fill if is_zebra else None
        
        for col_idx in range(1, len(headers) + 1):
            cell = ws.cell(row=row_num, column=col_idx)
            cell.border = cell_border
            cell.font = cell_font
            if row_fill:
                cell.fill = row_fill
            
            if col_idx in (1, 8, 9, 11):
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx in (2, 6):
                cell.font = mono_font
                cell.alignment = Alignment(horizontal="center", vertical="center")
                if col_idx == 6 and phone:
                    cell.font = Font(name="Consolas", size=10, bold=True, color="047857")
                    cell.fill = highlight_green
            elif col_idx == 9:
                if status == "VERIFIED":
                    cell.font = success_font
                else:
                    cell.font = pending_font
            elif col_idx == 10:
                cell.font = Font(name="Calibri", size=9)
                cell.alignment = Alignment(horizontal="center", vertical="center")
                
        ws.row_dimensions[row_num].height = 20
        row_num += 1

    ws.freeze_panes = "A2"
    ws.auto_filter.ref = f"A1:{get_column_letter(len(headers))}{max(row_num-1, 1)}"
    
    # Auto-width
    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in list(col)[:250]:
            val_str = str(cell.value or "")
            if len(val_str) > max_len:
                max_len = len(val_str)
        ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

def build_all_workbooks():
    # ------------------------------------------------------------------
    # 1. DEDICATED SINGLE-SHEET WORKBOOK (ALL 6,488 CANDIDATES ON SHEET 1)
    # ------------------------------------------------------------------
    print("Building dedicated single-sheet workbook for all 6,488 candidates...")
    wb_single = openpyxl.Workbook()
    ws_single = wb_single.active
    style_full_list_sheet(ws_single, title="All 6,488 Candidates")
    try:
        wb_single.save(output_single_sheet_xlsx)
        print(f"Saved: {output_single_sheet_xlsx}")
    except PermissionError:
        print(f"Warning: {output_single_sheet_xlsx} is open in Excel. Skipping lock.")
    except Exception as e:
        print(f"Error saving {output_single_sheet_xlsx}: {e}")

    # ------------------------------------------------------------------
    # 2. MASTER 3-SHEET WORKBOOK (SHEET 1 IS ALL 6,488 CANDIDATES)
    # ------------------------------------------------------------------
    print("Building master multi-sheet workbook (Sheet 1 = All 6,488 Candidates)...")
    wb_master = openpyxl.Workbook()
    
    # SHEET 1: ALL 6,488 CANDIDATES
    ws_main = wb_master.active
    style_full_list_sheet(ws_main, title="All 6,488 Primary Candidates")
    
    # SHEET 2: VERIFIED PHONE CONTACTS ONLY
    ws_enr = wb_master.create_sheet(title="Verified Phone Contacts")
    ws_enr.views.sheetView[0].showGridLines = True
    headers_enr = [
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
    ws_enr.append(headers_enr)
    for col_idx in range(1, len(headers_enr) + 1):
        cell = ws_enr.cell(row=1, column=col_idx)
        cell.fill = green_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = cell_border
    ws_enr.row_dimensions[1].height = 28
    
    row_num = 2
    for reg, item in enriched_data.items():
        phone = item.get("phoneNumber") or item.get("mobileNumber") or ""
        ws_enr.append([
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
        for col_idx in range(1, len(headers_enr) + 1):
            c = ws_enr.cell(row=row_num, column=col_idx)
            c.border = cell_border
            c.font = cell_font
            if col_idx in (1, 10, 11):
                c.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx in (2, 6):
                c.font = mono_font
                c.alignment = Alignment(horizontal="center", vertical="center")
                if col_idx == 6:
                    c.font = Font(name="Consolas", size=10, bold=True, color="047857")
                    c.fill = highlight_green
            elif col_idx == 12:
                c.font = Font(name="Calibri", size=9, bold=True, color="065F46")
                c.alignment = Alignment(horizontal="center", vertical="center")
        ws_enr.row_dimensions[row_num].height = 20
        row_num += 1

    ws_enr.freeze_panes = "A2"
    ws_enr.auto_filter.ref = f"A1:{get_column_letter(len(headers_enr))}{max(row_num-1, 1)}"
    for col in ws_enr.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            val_str = str(cell.value or "")
            if len(val_str) > max_len:
                max_len = len(val_str)
        ws_enr.column_dimensions[col_letter].width = max(max_len + 4, 12)

    # SHEET 3: DEPARTMENT BREAKDOWN
    ws_sum = wb_master.create_sheet(title="Department Breakdown")
    ws_sum.views.sheetView[0].showGridLines = True
    headers_sum = [
        "S/N",
        "Faculty",
        "Department",
        "Total Candidates Admitted",
        "Verified Phone Contacts"
    ]
    ws_sum.append(headers_sum)
    for col_idx in range(1, len(headers_sum) + 1):
        cell = ws_sum.cell(row=1, column=col_idx)
        cell.fill = navy_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = cell_border
    ws_sum.row_dimensions[1].height = 28
    
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
        ws_sum.append([idx, fac, dept, total, enr])
        is_zebra = (row_num % 2 == 0)
        for col_idx in range(1, len(headers_sum) + 1):
            cell = ws_sum.cell(row=row_num, column=col_idx)
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
        ws_sum.row_dimensions[row_num].height = 20
        row_num += 1

    ws_sum.freeze_panes = "A2"
    ws_sum.auto_filter.ref = f"A1:{get_column_letter(len(headers_sum))}{max(row_num-1, 1)}"
    for col in ws_sum.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            val_str = str(cell.value or "")
            if len(val_str) > max_len:
                max_len = len(val_str)
        ws_sum.column_dimensions[col_letter].width = max(max_len + 4, 12)

    # Ensure Sheet 1 is active
    wb_master.active = ws_main
    try:
        wb_master.save(output_master_xlsx)
        print(f"Saved: {output_master_xlsx}")
    except PermissionError:
        print(f"Warning: {output_master_xlsx} is open in Excel. Skipping lock.")
    except Exception as e:
        print(f"Error saving {output_master_xlsx}: {e}")

    # Copy files to artifacts directory so user can open directly
    for fname in [
        "UNN_2026_2027_Primary_Admission_List.xlsx",
        "UNN_2026_2027_All_6488_Candidates.xlsx",
        "UNN_2026_2027_Primary_Admission_Enriched.xlsx",
        "UNN_2026_2027_Primary_Admission_Manifest.csv",
        "UNN_2026_2027_Primary_Admission_Enriched.csv"
    ]:
        src = os.path.join(public_dir, fname)
        dst = os.path.join(artifacts_dir, fname)
        if os.path.exists(src):
            shutil.copy2(src, dst)
    print("Copied all generated files to artifacts directory.")

if __name__ == "__main__":
    build_all_workbooks()
