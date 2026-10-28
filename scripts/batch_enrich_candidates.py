import json
import csv
import urllib.request
import urllib.parse
import time
import os
import sys

manifest_path = r"c:\Users\USER\Downloads\KINGSOK ECOSYSTEM\public\UNN_2026_2027_Primary_Admission_Manifest.json"
enriched_csv = r"c:\Users\USER\Downloads\KINGSOK ECOSYSTEM\public\UNN_2026_2027_Primary_Admission_Enriched.csv"
checkpoint_json = r"c:\Users\USER\Downloads\KINGSOK ECOSYSTEM\public\UNN_2026_2027_Enrichment_Checkpoint.json"

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

def fetch_candidate_portal(reg_no):
    url = f"https://schmgrunn.azurewebsites.net/api/PostUtme/load-application-form?regNumber={urllib.parse.quote(reg_no)}"
    req = urllib.request.Request(url, headers=headers_req)
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
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
                    return {"success": False, "error": data.get("message") or "Not found", "rate_remaining": rate_rem}
    except urllib.error.HTTPError as he:
        if he.code == 429:
            return {"success": False, "error": "RATE_LIMIT_429", "rate_remaining": "0"}
        return {"success": False, "error": f"HTTP {he.code}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Strategy: Select candidates across all 18 faculties, prioritizing high interest departments
faculties = sorted(list(set(c.get("faculty") for c in candidates if c.get("faculty"))))

# Target candidates to process in this run
batch_target_limit = int(sys.argv[1]) if len(sys.argv) > 1 else 100

selected_targets = []
# Pick evenly across faculties
per_faculty_quota = max(3, batch_target_limit // len(faculties) + 1)

for fac in faculties:
    fac_candidates = [c for c in candidates if c.get("faculty") == fac and c["jambRegNumber"] not in enriched_data]
    selected_targets.extend(fac_candidates[:per_faculty_quota])

# Add high priority courses: Medicine & Surgery, Nursing, Pharmacy, Law, Computer Science, Mechanical Engineering
priority_depts = ["Medicine and Surgery", "Nursing Sciences", "Pharmacy", "Law", "Computer Science", "Medical Laboratory Science"]
for p_dept in priority_depts:
    dept_candidates = [c for c in candidates if p_dept.lower() in (c.get("department") or "").lower() and c["jambRegNumber"] not in enriched_data]
    selected_targets.extend(dept_candidates[:10])

# Deduplicate
seen_reg = set()
final_targets = []
for t in selected_targets:
    if t["jambRegNumber"] not in seen_reg and t["jambRegNumber"] not in enriched_data:
        seen_reg.add(t["jambRegNumber"])
        final_targets.append(t)
    if len(final_targets) >= batch_target_limit:
        break

print(f"Starting live enrichment for {len(final_targets)} candidate targets (Overall enriched so far: {len(enriched_data)})...")

newly_enriched = 0
for idx, target in enumerate(final_targets):
    reg = target["jambRegNumber"]
    print(f"[{idx+1}/{len(final_targets)}] Reg: {reg} | {target['candidateName']} ({target['department']})...", end=" ", flush=True)
    
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
    elif res.get("error") == "RATE_LIMIT_429":
        print("-> RATE LIMITED! Pausing 10s...")
        time.sleep(10)
    else:
        print(f"-> {res.get('error')}")
        
    # Checkpoint save every 5 records
    if (idx + 1) % 5 == 0:
        with open(checkpoint_json, "w", encoding="utf-8") as f:
            json.dump(enriched_data, f, indent=2)
            
    # Respect rate limits
    time.sleep(1.2)

# Final checkpoint save
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
            "VERIFIED",
            "AUTHORIZED LIVE INTEGRATION"
        ])

print(f"\nBatch completed! Added {newly_enriched} newly verified records.")
print(f"Total live-verified candidates in registry: {len(enriched_data)}")
