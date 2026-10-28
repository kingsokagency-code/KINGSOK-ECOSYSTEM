# KINGSOK Ecosystem & Workforce System

The formation ground and operational platform for **KINGSOK Apex Enterprise Ltd**, featuring the **KINGSOK Admission Intelligence System** (UTME & Direct Entry), the **KINGSOK Contact Organizer & Messaging Assistant**, alongside the **Accommodation Sector** and workforce infrastructure.

---

## 🎓 NEW: KINGSOK Admission Intelligence System (UTME & Direct Entry)

An authorized candidate verification and admission processing system built specifically for the University of Nigeria, Nsukka (UNN) admissions pipeline. It supports independent and combined processing for:

1. **UTME / Post-UTME Admissions**
2. **Direct Entry (DE) Admissions**
3. **Combined Admissions with Cross-Category Duplicate Auditing**

### 🌟 Key Admission Intelligence Features

1. **Admission Type Selection**
   - **UTME / Post-UTME**: 100-level undergraduate screening applications.
   - **Direct Entry (DE)**: 200-level direct entry candidates with prior tertiary qualifications (OND/HND/NCE/A-Levels).
   - **Combined Results**: Unified view and export retaining each candidate's exact Admission Type.

2. **Verified Portal Workflows & Structural Distinctions**
   - **UTME Workflow**:
     - Official Portal: `https://unnportal.unn.edu.ng/putme_application_details`
     - Login Form: `/putme_login` titled `"ADMISSION SCREENING APPLICATION FORM"`
     - Input Field: `jambRegNumber` (`id="reg_no"`)
     - Target Route: `/putme_application_details`
     - Backend API: `https://schmgrunn.azurewebsites.net/api/PostUtme/load-application-form?regNumber={regNumber}`
   - **Direct Entry Workflow**:
     - Official Portal: `https://unnportal.unn.edu.ng/ScrenningApplication.aspx`
     - Login Form: `/direct_entry_login` titled `"DIRECT ENTRY APPLICATION FORM"`
     - Input Field: `jambRegNumber` (`id="reg_no"`)
     - Target Route: `/direct_entry_application/preview` (or `/direct_entry_application`)
     - Backend API: `https://schmgrunn.azurewebsites.net/api/DirectEntryApplication/load-direct-entry-application-form?regNumber={regNumber}`
     - *Verified difference*: Direct Entry navigates to `/direct_entry_application/preview` rather than `/putme_application_details`.

3. **Strict Authorized Common Fields Policy**
   To safeguard student privacy and maintain compliance, only the following 6 authorized fields are gathered:
   - JAMB Registration Number
   - Candidate Full Name
   - Department
   - Phone Number
   - Admission Type (`UTME` | `Direct Entry`)
   - Processing Status (`Success` | `Pending` | `Missing Phone` | `Missing Department` | `Unmatched` | `Flagged for Review` | `Failed`)
   *No unrelated personal details (e.g. passwords, dates of birth, state of origin) are stored.*

4. **Cross-Category Duplicate Review Engine**
   - Detects when a JAMB registration number appears in **both** UTME and Direct Entry lists.
   - **Zero Silent Merging**: Preserves both entries with their respective category, marking them `status = "flagged_review"` for administrative clearance.

5. **Compliant Bulk Retrieval Policy**
   - Verified that UNN SM Core Portal sits behind Netlify Edge and Azure rate limits. Automated mass scraping without institutional authorization is blocked.
   - The engine validates official institutional manifests, handles network timeouts gracefully, and throttles lookup requests.

6. **Excel & CSV Export Suite**
   - Individual **UTME Export** (.csv with UTF-8 BOM for Microsoft Excel)
   - Individual **Direct Entry Export** (.csv)
   - Unified **Combined Results Export** with explicit `Admission Type` column on every record
   - Dedicated **Flagged for Review Audit Export** for quick resolution of duplicate registrations.

---

## 🚀 NEW: KINGSOK Contact Organizer & Messaging Assistant

A simple, high-performance full-stack application built to organize **5,000+ phone contacts** exported from Android devices and prepare them for controlled, compliant WhatsApp messaging.

### 🌟 Key Highlights & Capabilities

1. **100% Client-Side Local Processing & Privacy Shield**
   - Zero contact data, names, or phone numbers are ever transmitted across the internet to external APIs or third-party servers.
   - All parsing, cleaning, deduplication, batching, and template generation run in the local browser / Node runtime memory.
   - Safe for managing sensitive student, caretaker, and client directories.

2. **Nigerian Mobile Number Normalization (+234 E.164)**
   - Automatically detects and normalizes 11-digit local Nigerian numbers (`080...`, `070...`, `081...`, `090...`, `091...`) to international E.164 format (`+234...` and `234...`).
   - Automatically strips spaces, hyphens, parentheses (e.g. `+234 (0) 803 123 4567`), dots, and metadata labels (`::: Mobile`).
   - Intelligently restores missing leading zeros on 10-digit numbers (`8031234567` → `+2348031234567`).
   - Identifies Nigerian telecom carriers: **MTN, Airtel, Glo, 9mobile**, and **International**.
   - **Zero Guessing Policy:** Ambiguous, incomplete, or corrupted numbers are never guessed; they are explicitly flagged with detailed diagnostic reasons (e.g., *"Incomplete number: only 7 digits found"*, *"Unrecognized Nigerian prefix (050...)"*).

3. **Intelligent Deduplication**
   - Detects duplicate records across different representations (e.g. matching `08031234567` with `+234 803 123 4567`).
   - Preserves the primary record while cleanly isolating and reporting all duplicates for auditing.

4. **Configurable Automatic Batching (Default: 256 Limit)**
   - Divides unique valid contacts into numbered sequential batches (e.g., *Batch 01 (1 - 256)*, *Batch 02 (257 - 512)*, etc.).
   - Default batch size matches the official **WhatsApp Broadcast List limit of 256 contacts**.
   - Download individual batches with one click in two distinct formats:
     - **Standard CSV:** `Name, Phone, International Phone, Network, Consent, Batch, Notes`
     - **Google Contacts / Android Import CSV:** Formatted with `Group Membership: * myContacts ::: KINGSOK_Batch_01` for instant import into [contacts.google.com](https://contacts.google.com) or Android phone address books.
   - Bulk *"Download All Batches"* action downloads all batch CSVs sequentially.

5. **WhatsApp Broadcast Rules & Anti-Ban Education**
   - Prominently clarifies that these are **organizational batches** to structure outreach, not automatically created WhatsApp broadcast lists.
   - **WhatsApp's Delivery Rule:** Broadcast messages *only deliver* if the recipient has your phone number saved in their personal address book.
   - Educates operators against unauthorized mass-messaging bots that violate WhatsApp Terms of Service and trigger account bans.

6. **Personalized Message Template Assistant**
   - Pre-loaded, high-converting templates for:
     - **KINGSOK ACCOMMODATIONS:** UNN Nsukka (Ofulonu, Hilltop, Odim, Behind Flat, Green House) & UNEC student lodge scouting and verified room vacancies.
     - **KINGSOK ENTERPRISES UNN Admission Updates:** Post-UTME screening, cut-off guidelines, and clearance alerts.
     - **KINGSOK Subscription & Contact Save Confirmation:** Asking students to save the official number to ensure broadcast delivery.
   - Dynamic tag personalization: `{{first_name}}`, `{{name}}`, `{{phone}}`, and `{{batch}}` with intelligent title stripping (`Dr. Ngozi Okonkwo` → `Ngozi`).
   - **Live WhatsApp Chat Simulator:** Shows the message inside a realistic WhatsApp chat bubble with timestamp and verified checkmarks before sending.
   - One-click **Copy Personalized Message** to clipboard.
   - One-click safe **`wa.me` Click-to-Chat Link** generation (`https://wa.me/234XXXXXXXXXX?text=...`) for controlled 1-on-1 manual engagement.

7. **Consent & Opt-Out Management (Privacy Rule: Phone ≠ Consent)**
   - Three distinct consent tiers: **Opted In**, **Unknown / Unconfirmed**, and **Opted Out (Suppressed)**.
   - Strict default: Raw phone contact dumps default to `Unknown`—never treating the presence of a phone number as proof of consent.
   - Opted-out contacts are **automatically excluded** from promotional batch exports.
   - Dedicated Opted-Out Suppression List CSV export.

8. **High-Performance Executive Dashboard**
   - KPI metric cards for Total Imported, Unique Valid, Duplicates, Valid (+234), Invalid/Ambiguous, and Batches.
   - Fast multi-facet search & filtering across Name, Local Phone, International E.164, Carrier, Validity, Consent, and Batch.
   - Paginated table rendering 5,000+ records smoothly without freezing.
   - Built-in **"Load 5,000 UNN Demo Contacts"** button to test the entire pipeline in 1 click.

---

## 🏃 Quick Start & Launch Instructions

### 1. Prerequisites
- **Node.js**: v20+ or v24+
- **npm** or **npx**

### 2. Launch the Application
Run the local development server:
```bash
npm run dev
```

Open your browser to:
- **Contact Organizer & Messaging Assistant:** [http://localhost:3000/contacts](http://localhost:3000/contacts)
- **KINGSOK Ecosystem Hub:** [http://localhost:3000/](http://localhost:3000/)

### 3. Run the Automated Test Suites
Execute the Admission Intelligence 41-check verification suite:
```bash
npm run test:admissions
```

Execute the 40-check Contact Organizer verification suite:
```bash
npm run test:contacts
```

Output:
```
==============================================================================
KINGSOK CONTACT ORGANIZER & MESSAGING ASSISTANT - TEST SUITE
==============================================================================
1. Testing Nigerian Number Normalization & Carrier Identification:
  [PASS] Standard 11-digit MTN format (0803...)
  [PASS] Airtel prefix identification (0802...)
  ...
6. Testing Full Pipeline with 5,000 Contacts Benchmark:
  Processed 5,000 contacts in ~150ms
  [PASS] Total imported is exactly 5,000
  [PASS] Over 90% valid Nigerian numbers
  [PASS] Created 18 batches of max 256 contacts
==============================================================================
TEST SUMMARY: 40 PASSED, 0 FAILED
ALL ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!
```

---

## 📱 How to Use the Contact Organizer

### Step 1: Export Contacts from Your Android Phone
1. On your Android phone, open the **Contacts** app.
2. Tap **Settings / Manage Contacts** → **Export to .VCF / .CSV** (or go to [contacts.google.com](https://contacts.google.com) and click **Export → Google CSV**).
3. Transfer the exported `.csv` file to your computer.

### Step 2: Import & Preview
1. Navigate to the **Import & Clean** tab in the application.
2. Drag and drop your `.csv` file (or click **"Load 5,000 UNN Demo Contacts"** for an immediate test).
3. The application previews the first 5 rows and automatically detects your **Name** and **Phone** columns.
4. Click **"Confirm & Process All Contacts"**.

### Step 3: Review Cleaning & Deduplication in Dashboard
1. Review the dashboard summary cards to see:
   - Total contacts imported
   - Clean unique contacts vs. duplicates
   - Nigerian telecom breakdown (MTN, Airtel, Glo, 9mobile)
   - Invalid numbers flagged with specific reasons
2. Switch to **Contacts Directory** to search, sort, or manually inspect records.

### Step 4: Download Batches & Sync to Android
1. Go to **Batches & Exports**.
2. To import directly into your Android phone:
   - Click **"Google Import"** on any batch (e.g. *Batch 01*).
   - Go to [contacts.google.com](https://contacts.google.com) and click **Import**.
   - Select the downloaded file. All 256 contacts will be tagged with the label `KINGSOK_Batch_01` and immediately sync to WhatsApp on your phone!
3. Alternatively, click **"Standard CSV"** to use the clean data in spreadsheets.

### Step 5: Prepare & Personalize Messages
1. Go to **Message Assistant**.
2. Select a template:
   - *KINGSOK ACCOMMODATIONS (UNN Lodge Finder)*
   - *KINGSOK ENTERPRISES (UNN Admission & Clearance Alerts)*
   - *KINGSOK Contact Save & Subscription Confirmation*
   - Or click **"New Template"** to create a custom one.
3. Select any contact from the dropdown to preview how the message personalizes with their name and phone.
4. Click **"Copy Personalized Message"** or click **"Send via WhatsApp (wa.me)"** to open a direct, safe 1-on-1 chat without bot automation.

---

## 🛡️ WhatsApp Best Practices & Anti-Ban Rules

> [!WARNING]
> **Why Unofficial Bulk WhatsApp Senders Get Banned:**
> WhatsApp actively detects automated browser scripts, rapid bulk message blasts, and unsolicited messages sent to recipients who do not have the sender saved in their contacts.

Follow KINGSOK's 4-step compliance protocol:
1. **Send the Save Request First:** Before sending promotional broadcasts, ask recipients to save your number as *"KINGSOK Official"*.
2. **Respect the 256 Cap:** Create broadcast lists directly inside WhatsApp on your mobile device using the 256-contact batches.
3. **Always Offer Opt-Out:** Every KINGSOK template includes *"Reply STOP to opt out"*.
4. **Instant Suppression:** If a contact replies STOP, change their consent to *Opted Out* in the Directory; they will be excluded from all subsequent batch exports.

---

## 🏗️ Workforce System & Database Migrations (Staging)

For administrative workforce and accommodation sector infrastructure:
- Staging environment variables reside in `.env.local` (derived from `.env.example`).
- Migrations reside in `supabase/migrations/`.
- Run Task 1A workforce verification via:
  ```bash
  npm run test:1a
  ```
