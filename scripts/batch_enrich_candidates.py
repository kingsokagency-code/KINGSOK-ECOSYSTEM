import json
import csv
import urllib.request
import urllib.parse
import time
import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
manifest_path = os.path.join(PROJECT_ROOT, "public", "UNN_2026_2027_Primary_Admission_Manifest.json")
enriched_csv = os.path.join(PROJECT_ROOT, "public", "UNN_2026_2027_Primary_Admission_Enriched.csv")
checkpoint_json = os.path.join(PROJECT_ROOT, "public", "UNN_2026_2027_Enrichment_Checkpoint.json")

# Load manifest
with open(manifest_path, "r", encoding="utf-8") as f:
    candidates = json.load(f)

# Load existing checkpoint
enriched_data = {}
if os.path.exists(checkpoint_json):
    try:
        with open(checkpoint_json, "r", encoding="utf-8") as f:
            enriched_data = json.load(f)
        print(f"Loaded {len(enriched_data)} existing verified records from checkpoint.")
    except Exception as e:
        print("Error reading checkpoint:", e)

headers_req = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Referer": "https://unnportal.unn.edu.ng/putme_application_details",
    "Origin": "https://unnportal.unn.edu.ng"
}

def fetch_candidate_portal(reg_no, max_retries=3):
    url = f"https://schmgrunn.azurewebsites.net/api/PostUtme/load-application-form?regNumber={urllib.parse.quote(reg_no)}"
    for attempt in range(1, max_retries + 1):
        req = urllib.request.Request(url, headers=headers_req)
        try:
            with urllib.request.urlopen(req, timeout=35) as resp:
                rate_rem = resp.headers.get("X-Rate-Limit-Remaining")
                if resp.status == 200:
                    body = resp.read().decode('utf-8')
                    data = json.loads(body)
                    if data.get("success") and data.get("data"):
                        d = data["data"]
                        post_utme = d.get("postUtmeResponse") or {}
                        personal = d.get("personalInfoResponse") or {}
                        prog = d.get("programmeInfoResponse") or {}
                        
                        full_name = post_utme.get("fullName") or f"{personal.get('surname', '')} {personal.get('firstname', '')} {personal.get('middlename', '')}".strip()
                        dept = prog.get("department") or post_utme.get("department") or ""
                        phone = personal.get("mobileNumber") or ""
                        email = personal.get("email") or ""
                        state = personal.get("state") or ""
                        lga = personal.get("lga") or ""
                        
                        return {
                            "success": True,
                            "fullName": full_name,
                            "department": dept,
                            "phoneNumber": phone,
                            "email": email,
                            "state": state,
                            "lga": lga,
                            "rate_remaining": rate_rem
                        }
                    else:
                        msg = data.get("message") or ""
                        if "not found" in msg.lower() or not data.get("data"):
                            return {"success": False, "error": msg or "Not found", "is_final": True}
                        return {"success": False, "error": msg or "Not found", "is_final": False}
        except urllib.error.HTTPError as he:
            if he.code == 429:
                print(f"[429 Rate Limit - attempt {attempt}/{max_retries}] Sleeping 12s...", end=" ", flush=True)
                time.sleep(12)
            else:
                print(f"[HTTP {he.code} - attempt {attempt}/{max_retries}] Sleeping 4s...", end=" ", flush=True)
                time.sleep(4)
        except Exception as e:
            print(f"[Timeout/Network Error: {e} - attempt {attempt}/{max_retries}] Sleeping 5s...", end=" ", flush=True)
            time.sleep(5)
            
    return {"success": False, "error": "MAX_RETRIES_EXCEEDED", "is_final": False}

# Determine target limit
# If limit is 0 or not passed, target all remaining candidates!
arg_limit = int(sys.argv[1]) if len(sys.argv) > 1 else 0

# Candidates queue: anyone not yet enriched with a valid phone number
remaining_targets = [
    c for c in candidates 
    if c["jambRegNumber"] not in enriched_data 
    or not enriched_data[c["jambRegNumber"]].get("phoneNumber")
    or enriched_data[c["jambRegNumber"]].get("phoneNumber") == "Not Listed"
]
# Enforce strict sequential order by S/N (1, 2, 3...)
remaining_targets.sort(key=lambda c: c.get("sn", 0))

if arg_limit > 0:
    targets_to_run = remaining_targets[:arg_limit]
else:
    targets_to_run = remaining_targets

total_total = len(candidates)
already_done = sum(1 for v in enriched_data.values() if v.get("phoneNumber") and v.get("phoneNumber") != "Not Listed")
needed = len(targets_to_run)

print(f"===========================================================")
print(f"KINGSOK UNN Live Portal Continuous Phone Enrichment Worker")
print(f"Total primary candidates: {total_total}")
print(f"Already enriched with phone: {already_done}")
print(f"Queue for this run: {needed}")
print(f"===========================================================\n")

def trigger_excel_rebuild(data=None):
    try:
        from export_to_excel import build_all_workbooks
        build_all_workbooks(custom_enriched=data or enriched_data)
        print(">>> [Auto-Export] Excel workbooks updated successfully with latest phone contacts.")
    except Exception as ex:
        print(">>> [Auto-Export Note]", ex)

newly_enriched = 0
for idx, target in enumerate(targets_to_run):
    reg = target["jambRegNumber"]
    curr_overall = already_done + newly_enriched + 1
    print(f"[{idx+1}/{needed}] ({curr_overall}/{total_total}) S/N {target.get('sn')} | Reg: {reg} | {target['candidateName']} ({target['department']})...", end=" ", flush=True)
    
    res = fetch_candidate_portal(reg)
    if res.get("success"):
        phone = res["phoneNumber"]
        enriched_data[reg] = {
            "sn": target["sn"],
            "jambRegNumber": reg,
            "candidateName": res["fullName"] or target["candidateName"],
            "faculty": target["faculty"],
            "department": res["department"] or target["department"],
            "phoneNumber": phone,
            "email": res.get("email", ""),
            "state": res.get("state", ""),
            "lga": res.get("lga", ""),
            "status": "success",
            "dataSource": "authorized_live_integration"
        }
        newly_enriched += 1
        print(f"-> PHONE: {phone} (Email: {res.get('email', 'N/A')})")
    elif res.get("is_final"):
        # Server officially returned Not Found
        enriched_data[reg] = {
            "sn": target["sn"],
            "jambRegNumber": reg,
            "candidateName": target["candidateName"],
            "faculty": target["faculty"],
            "department": target["department"],
            "phoneNumber": "Not Listed",
            "email": "",
            "state": "",
            "lga": "",
            "status": "missing_phone",
            "dataSource": "authorized_live_integration"
        }
        print(f"-> Officially Not Listed on Portal")
    else:
        print(f"-> Skipped temporarily due to network: {res.get('error')}")
        
    # Checkpoint save every 5 records
    if (idx + 1) % 5 == 0:
        with open(checkpoint_json, "w", encoding="utf-8") as f:
            json.dump(enriched_data, f, indent=2)
            
    # Periodically update Excel workbook every 25 records
    if (idx + 1) % 25 == 0:
        trigger_excel_rebuild(enriched_data)
            
    # Pacing: 1.2s delay keeps us safely under the 20 requests / 20s rate limit
    time.sleep(1.2)

# Final checkpoint save
with open(checkpoint_json, "w", encoding="utf-8") as f:
    json.dump(enriched_data, f, indent=2)

# Rebuild Excel workbooks
trigger_excel_rebuild()

print(f"\nCompleted! Newly verified in this run: {newly_enriched}")
print(f"Total candidates verified in registry: {len(enriched_data)} / {total_total}")
