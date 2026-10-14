# Antigravity Handoff: Task 1A (KINGSOK Workforce System)

You are the builder. Okoye is the final authority. Claude designs and reviews. Gemini plans tasks. **Build only Task 1A in this session.** Do not start Task 1B or anything later.

## 1. Read first (in this order)
1. `THE_KINGSOK_FOUNDATION_CHARTER.docx` (culture and values)
2. `02-data-model.md` (v1.3), the source of truth for tables, rules and permissions
3. This file

If anything is unclear or conflicts with the data model, **stop and ask Okoye**. Do not guess and do not change the data model.

## 2. Project rules
- Stack: Next.js (TypeScript), PostgreSQL on Supabase. Mobile-first interface, clean white and green look.
- Nothing about KINGSOK's organization is hardcoded (sectors, roles, rules, points are data edited by admin). In 1A there is no such data yet, but build with that in mind.
- All database changes go through version-controlled migration files in the repository. Never change the database by hand.
- Two separate Supabase projects: **staging** and **live**. Develop and test on staging only. Nothing touches live until Okoye approves.
- Secrets (keys, passwords) live in environment variables and are never committed. Provide `.env.example`.
- Create a `/docs` folder in the repository and put the charter and `02-data-model.md` in it.

## 3. What Okoye does himself (do not try to do these)
- Creates the two Supabase projects (staging, live) and any hosting account, then gives you the keys through environment variables.
- Confirms that the chosen plan includes daily backups.
- Creates one test user manually in the Supabase dashboard on staging, so login can be tested (public signup is disabled).

## 4. Scope: Task 1A
**Goal:** project foundation, two isolated environments, email login with password reset, and an automatic audit log.

### 4.1 Project and environments
- Set up the Next.js project, linting, TypeScript, and the migrations folder.
- Configure separate environment settings for staging and live.
- Add a short `README.md` explaining how to run the project, apply migrations to staging, and where the environment variables go.

### 4.2 Authentication (email and password only)
- **Disable public signup** in the Supabase auth settings. The system is invite-only. (Invitations are built in Task 1B.)
- Screens:
  - `/login`: email and password.
  - `/forgot-password`: request a reset email.
  - `/reset-password`: set a new password from the emailed link.
- Show friendly error messages. Never show raw database or auth errors to the user.
- Protect all routes except the three above. A logged-out visitor goes to `/login`.
- No phone login.

### 4.3 Audit log
Create `audit_log` with these columns: `id`, `actor_id`, `table_name`, `record_id`, `action` (insert, update, delete), `old_data` (jsonb), `new_data` (jsonb), `at`.
- Create one reusable trigger function that writes a row on insert, update and delete, using `auth.uid()` for the actor.
- The log is **append-only**: revoke update and delete for all roles.
- Security: no client can read or write `audit_log` in 1A. Deny everything with row-level security. Task 1B adds read access for admin.
- Document in the README how to attach the trigger to a table. **Every later migration that creates a configurable table must attach it.**

## 5. Out of scope (do not build)
Profiles, org units, access roles, permissions, invitations, bootstrap admin, evidence storage, and any admin screens. These belong to Task 1B and later.

## 6. Acceptance checks (all must pass)
1. Staging and live are separate projects with separate keys. Live is untouched.
2. Email login works for the test user. A wrong password shows a friendly error.
3. Password reset email arrives and the reset flow works end to end.
4. Public signup attempts are rejected.
5. Logged-out visitors cannot reach any page except the three auth screens.
6. A test write to a throwaway table with the audit trigger attached creates an `audit_log` row with correct old and new JSON and the right actor.
7. A direct attempt to update or delete an `audit_log` row fails.
8. A logged-in client cannot read or write `audit_log`.
9. Migrations apply cleanly to an empty staging database.
10. No secrets are committed.

## 7. Tests to run and report
- Audit trigger test (insert, update, delete on a throwaway table, then remove the table).
- Append-only test (update and delete on `audit_log` are rejected).
- Row-level security test (client access to `audit_log` is denied).
- Auth flow test (login, wrong password, reset, signup blocked).

## 8. Report back to Okoye when finished
Reply in this format:
1. **Done:** what was built, in plain language.
2. **Checks:** each acceptance check 1 to 10, passed or failed, with evidence (test output or screenshot).
3. **Decisions you made** that were not in this brief.
4. **Problems or doubts.**
5. **What you need from Okoye** before Task 1B.
Then stop and wait. Claude will review the result before Task 1B starts.

## 9. Notes for later tasks (do not act on these now)
- Task 1B must make the bootstrap route lock permanently after the first admin is created.
- Results evidence files need their own private storage access rules (submitter, approver, unit supervisor) and a `result_evidence` table.
- Supervisors need a confirm action for daily targets (writes `confirmed_by` and `confirmed_at`).
- Database backups may not include uploaded files. A separate file backup is needed before launch.
