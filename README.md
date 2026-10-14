# KINGSOK Workforce System

The formation ground and operational workforce management system for **KINGSOK Apex Enterprise Ltd**.

---

## 1. Project Foundations & Environment Separation

KINGSOK maintains **two strictly isolated Supabase projects**:
* **Staging**: Used exclusively for development, feature testing, and migration verification.
* **Live (Production)**: Untouched during development; updated only upon explicit approval from Okoye.

### Environment Configuration
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Populate the environment variables for **Staging**:
   ```env
   NEXT_PUBLIC_APP_ENV=staging
   EXPECTED_STAGING_PROJECT_REF=your-staging-project-ref
   NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... # Used ONLY by backend verification scripts; NEVER in browser
   ```
> [!IMPORTANT]
> Never commit `.env.local` or any environment secret to version control. The repository `.gitignore` strictly excludes all `.env*` files except `.env.example`.

---

## 2. Running the Next.js Project

Ensure Node.js (v20+ or v24+) and npm are installed.

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```
The application will be accessible at `http://localhost:3000`.

---

## 3. Database Migrations (Staging)

All database schema modifications are version-controlled in `supabase/migrations/`.

### Applying Migrations to Staging
You can apply migrations using the Supabase CLI or directly via the Staging Supabase Dashboard SQL Editor:

**Option A: Via Supabase CLI (linked to Staging)**
```bash
npx supabase link --project-ref <your-staging-project-ref>
npx supabase db push
```

**Option B: Via Supabase SQL Editor**
1. Open your **Staging** project on the Supabase Dashboard.
2. Navigate to **SQL Editor** -> **New Query**.
3. Paste the contents of `supabase/migrations/20261013000001_audit_log_foundation.sql`.
4. Click **Run** and verify clean execution with zero errors.

---

## 4. How to Attach the Audit Trigger to Configurable Tables

Per the KINGSOK Data Model (v1.3, Rule 0.5), **every table storing configurable data must be tracked in `audit_log` via database triggers**.

To attach the audit trigger to any newly created table:

```sql
-- Example: Attaching audit logging to a new table
CREATE TABLE public.example_table (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure the table has an audit trigger
DROP TRIGGER IF EXISTS trg_audit_example_table ON public.example_table;
CREATE TRIGGER trg_audit_example_table
AFTER INSERT OR UPDATE OR DELETE ON public.example_table
FOR EACH ROW
EXECUTE FUNCTION public.fn_audit_log_tracker();
```

### Characteristics of the Audit Trigger:
* **Reusable & Trusted**: Implemented with `SECURITY DEFINER` and pinned search path `SET search_path = pg_catalog, public, pg_temp`.
* **Automatic Actor Tracking**: Captures `auth.uid()` directly from the active Supabase JWT session.
* **Normalized Actions**: Automatically records `'insert'`, `'update'`, or `'delete'` in lowercase.
* **Preserved History**: The `actor_id` column is an unconstrained UUID, permanently preserving the historical identity of who made an edit even if the user's account is later deleted or archived.
* **Immutable & Append-Only**: The `audit_log` table strictly prevents `UPDATE`, `DELETE`, and `TRUNCATE` operations via database triggers and revoked permissions.
* **Least-Privilege Function Execution**: Direct `EXECUTE` on `fn_audit_log_tracker()` is revoked from `PUBLIC`, `anon`, and `authenticated`. Triggers fire within table trigger context without requiring direct client execution privileges.

---

## 5. Backup Verification & Evidence-File Coverage Clarification

### Automated Daily Database Backups
* Okoye confirms in the Supabase Dashboard under **Project Settings -> Database -> Backups** that automated daily backups are active on the chosen plan.
* These backups capture complete point-in-time snapshots of all PostgreSQL tables, including `audit_log` and transactional records.

### Evidence-File Backup Coverage Clarification
* **Database backups do NOT include storage bucket files** (e.g. future task evidence photos, inspection videos, or PDF documents stored in Supabase Storage).
* A separate, scheduled file backup and sync policy for the private evidence bucket will be implemented before production launch.

---

## 6. Running the Task 1A Verification Test Suite

Run the automated verification test suite against the staging database:

```bash
npm run test:1a
```

This verifies:
1. Staging vs Live project separation and fail-closed environment guardrails.
2. Email authentication and friendly error mapping.
3. Password reset token exchange and recovery flow.
4. Blocked public signup attempts.
5. Unauthenticated route redirection to `/login`.
6. Audit trigger tracking (INSERT, UPDATE, DELETE with old/new JSON and actor ID) on a disposable table.
7. Append-only and TRUNCATE protection on `audit_log`.
8. Client RLS & privilege denial: SELECT returns 0 rows via RLS; direct writes fail with SQL 42501 error.
9. Clean migration, schema hardening, and effective privilege validation (`has_schema_privilege`).
10. Dual Git verification: `.env.local` is ignored, `.env.example` is tracked and contains zero secrets.
