import json
import csv
import urllib.request
import time
import sys
import os

manifest_path = r"c:\Users\USER\Downloads\KINGSOK ECOSYSTEM\public\UNN_2026_2027_Primary_Admission_Manifest.json"
enriched_csv = r"c:\Users\USER\Downloads\KINGSOK ECOSYSTEM\public\UNN_2026_2027_Primary_Admission_Enriched.csv"
checkpoint_json = r"c:\Users\USER\Downloads\KINGSOK ECOSYSTEM\public\UNN_2026_2027_Enrichment_Checkpoint.json"

with open(manifest_path, "r", encoding="utf-8") as f:
    candidates = json.load(f)

# Load existing checkpoint if exists
enriched_data = {}
if os.path.exists(checkpoint_json):
    try:
        with open(checkpoint_json, "r", encoding="utf-8") as f:
            enriched_data = json.load(f)
        print(f"Loaded {len(enriched_data)} previously enriched candidates from checkpoint.")
    except Exception as e:
        print("Checkpoint load error:", e)

headers_req = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Referer": "https://unnportal.unn.edu.ng/putme_application_details",
    "Origin": "https://unnportal.unn.edu.ng"
}

def fetch_details(reg_no):
    url = f"https://schmgrunn.azurewebsites.net/api/PostUtme/load-application-form?regNumber={urllib.parse.quote(reg_no)}"
    req = urllib.request.Request(url, headers=headers_req)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
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
                        "lga": lga
                    }
                else:
                    return {"success": False, "error": data.get("message") or "Not found"}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Prioritize diverse representation across Medicine, Law, Computer Science, Pharmacy, Engineering, Agriculture
priority_targets = []
# 10 from Medicine (start around index where department is Medicine)
priority_targets.extend([c for c in candidates if "Medicine" in c.get("department", "")][:15])
# 10 from Law
priority_targets.extend([c for c in candidates if c.get("faculty") == "LAW"][:15])
# 10 from Computer Science
priority_targets.extend([c for c in candidates if "Computer Science" in c.get("department", "")][:15])
# 10 from Pharmacy
priority_targets.extend([c for c in candidates if "Pharmacy" in c.get("department", "")][:15])
# 10 from Engineering
priority_targets.extend([c for c in candidates if c.get("faculty") == "ENGINEERING"][:15])
# 10 from Agriculture
priority_targets.extend([c for c in candidates if c.get("faculty") == "AGRICULTURE"][:15])

# Deduplicate
seen = set()
unique_targets = []
for p in priority_targets:
    if p["jambRegNumber"] not in seen:
        seen.add(p["jambRegNumber"])
        unique_targets.append(p)

print(f"Enriching initial sample batch of {len(unique_targets)} priority candidates across faculties...")

for idx, target in enumerate(unique_targets):
    reg = target["jambRegNumber"]
    if reg in enriched_data:
        continue
    
    print(f"[{idx+1}/{len(unique_targets)}] Fetching {reg} ({target['candidateName']})...")
    res = fetch_details(reg)
    if res.get("success"):
        enriched_data[reg] = {
            "sn": target["sn"],
            "jambRegNumber": reg,
            "candidateName": res["fullName"] or target["candidateName"],
            "faculty": target["faculty"],
            "department": res["department"] or target["department"],
            "phoneNumber": res["phoneNumber"],
            "email": res.get("email", ""),
            "state": res.get("state", ""),
            "lga": res.get("lga", ""),
            "status": "success",
            "dataSource": "authorized_live_integration"
        }
        print(f"   -> Found: {enriched_data[reg]['candidateName']} | Dept: {enriched_data[reg]['department']} | Phone: {enriched_data[reg]['phoneNumber']}")
    else:
        print(f"   -> Failed: {res.get('error')}")
    
    # Throttle 1.8s
    time.sleep(1.8)

# Save checkpoint
with open(checkpoint_json, "w", encoding="utf-8") as f:
    json.dump(enriched_data, f, indent=2)

# Write enriched CSV
with open(enriched_csv, "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.writer(f)
    writer.writerow([
        "SN",
        "JAMB Registration Number",
        "Candidate Full Name",
        "Faculty",
        "Department",
        "Phone Number",
        "Email",
        "State of Origin",
        "LGA",
        "Admission Type",
        "Processing Status",
        "Data Source"
    ])
    for item in enriched_data.values():
        writer.writerow([
            item.get("sn", ""),
            item["jambRegNumber"],
            item["candidateName"],
            item.get("faculty", ""),
            item.get("department", ""),
            item["phoneNumber"],
            item.get("email", ""),
            item.get("state", ""),
            item.get("lga", ""),
            "UTME",
            "SUCCESS",
            "AUTHORIZED LIVE INTEGRATION"
        ])

print(f"\nDone! Enriched {len(enriched_data)} candidates saved to {enriched_csv}")
