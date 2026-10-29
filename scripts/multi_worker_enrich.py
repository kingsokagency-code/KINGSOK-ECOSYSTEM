import json
import urllib.request
import urllib.parse
import time
import os
import sys
import threading
from concurrent.futures import ThreadPoolExecutor

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
manifest_path = os.path.join(PROJECT_ROOT, "public", "UNN_2026_2027_Primary_Admission_Manifest.json")
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

lock = threading.Lock()
processed_count = 0
newly_enriched = 0
total_candidates = len(candidates)

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
                print(f"[429 Rate Limit - retry {attempt}/{max_retries}] Sleeping 12s...", flush=True)
                time.sleep(12)
            else:
                time.sleep(3)
        except Exception as e:
            time.sleep(4)
            
    return {"success": False, "error": "MAX_RETRIES_EXCEEDED", "is_final": False}

def trigger_excel_rebuild():
    with lock:
        data_snapshot = dict(enriched_data)
    def _run_export():
        try:
            from export_to_excel import build_all_workbooks
            build_all_workbooks(custom_enriched=data_snapshot)
            print(">>> [Auto-Export] Single Master Excel workbook updated with newest contacts.", flush=True)
        except Exception as ex:
            print(">>> [Auto-Export Note]", ex, flush=True)
    # Run in background thread so workers NEVER pause their network requests!
    threading.Thread(target=_run_export, daemon=True).start()

def worker_task(worker_id, target_queue):
    global processed_count, newly_enriched
    total_in_worker = len(target_queue)
    for idx, target in enumerate(target_queue):
        reg = target["jambRegNumber"]
        sn = target.get("sn")
        
        # Check if already done by another worker
        with lock:
            if reg in enriched_data and enriched_data[reg].get("phoneNumber") and enriched_data[reg].get("phoneNumber") != "Not Listed":
                continue
                
        res = fetch_candidate_portal(reg)
        
        with lock:
            processed_count += 1
            if res.get("success"):
                phone = res["phoneNumber"]
                enriched_data[reg] = {
                    "sn": sn,
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
                verified_total = sum(1 for v in enriched_data.values() if v.get("phoneNumber") and v.get("phoneNumber") != "Not Listed")
                print(f"[Worker {worker_id} | {idx+1}/{total_in_worker}] Verified {verified_total}/{total_candidates} | S/N {sn}: {target['candidateName']} -> PHONE: {phone}", flush=True)
            elif res.get("is_final"):
                enriched_data[reg] = {
                    "sn": sn,
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
                print(f"[Worker {worker_id} | {idx+1}/{total_in_worker}] S/N {sn}: {target['candidateName']} -> Not Listed", flush=True)
            else:
                print(f"[Worker {worker_id} | {idx+1}/{total_in_worker}] S/N {sn}: {target['candidateName']} -> Skipped temporarily", flush=True)

            # Checkpoint save every 10 processed
            if processed_count % 10 == 0:
                with open(checkpoint_json, "w", encoding="utf-8") as f:
                    json.dump(enriched_data, f, indent=2)

            # Excel auto-rebuild every 60 records (non-blocking)
            should_rebuild = (processed_count % 60 == 0)

        if should_rebuild:
            trigger_excel_rebuild()

        # Polite per-worker delay: 1.8s
        time.sleep(1.8)

def main():
    num_workers = int(sys.argv[1]) if len(sys.argv) > 1 else 3
    
    # Unverified targets
    unverified = [
        c for c in candidates 
        if c["jambRegNumber"] not in enriched_data 
        or not enriched_data[c["jambRegNumber"]].get("phoneNumber") 
        or enriched_data[c["jambRegNumber"]].get("phoneNumber") == "Not Listed"
    ]
    unverified.sort(key=lambda c: c.get("sn", 0))
    
    total_unverified = len(unverified)
    print(f"===========================================================")
    print(f"KINGSOK Multi-Worker Unified Master Harvester ({num_workers} Workers)")
    print(f"Total primary candidates: {total_candidates}")
    print(f"Already verified with phone: {sum(1 for v in enriched_data.values() if v.get('phoneNumber') and v.get('phoneNumber') != 'Not Listed')}")
    print(f"Total remaining to enrich: {total_unverified}")
    print(f"Destination: Single Unified Master Excel Sheet (S/N 1 to 6488)")
    print(f"===========================================================\n")
    
    # Partition into equal non-overlapping slices
    chunk_size = (total_unverified + num_workers - 1) // num_workers
    slices = [unverified[i * chunk_size : (i + 1) * chunk_size] for i in range(num_workers)]
    
    for i, s in enumerate(slices, start=1):
        if s:
            print(f"Worker {i} Queue: {len(s)} candidates (S/N {s[0]['sn']} to S/N {s[-1]['sn']})")
    
    print("\nStarting multi-worker threads now...\n")
    
    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        futures = [executor.submit(worker_task, i + 1, slices[i]) for i in range(num_workers)]
        for f in futures:
            f.result()
            
    # Final save and master excel generation
    with open(checkpoint_json, "w", encoding="utf-8") as f:
        json.dump(enriched_data, f, indent=2)
        
    trigger_excel_rebuild()
    print("\nAll workers completed! Master Excel sheet fully updated with zero scattered files.")

if __name__ == "__main__":
    main()
