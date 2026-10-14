# KINGSOK Workforce System: Data Model (v1.3)

Owner: Okoye (final authority). Author: Claude (pathfinder). Next reader: Gemini (organizer), then Antigravity (builder).

## 0. Rules for every agent

1. This file is the source of truth. Do not change tables, columns or rules without approval from Okoye.
2. **Nothing about KINGSOK's organization is hardcoded.** Sectors, teams, roles, duties, warning limits, point values, levels and deadlines are rows in tables, editable from an admin screen.
3. Only the task status flow (section 5) and the permission keys are fixed in code, because the engine depends on them.
4. Every table has: `id` (uuid, primary key), `created_at`, `updated_at`, `created_by`. Records are archived (`status` or `archived_at`), never hard-deleted.
5. Every change to a configurable table is written to `audit_log` by a database trigger.
6. Security is enforced in the database (row-level security). **Write the security policies together with each table**, never at the end. The final task only tests them.
7. **Every build task includes its own screens**, so data can be entered and tested as it is built. Admin screens come early, not last.
8. Tags: **[MVP]** build in Phase 2, **[V2]** Phase 3, **[V3]** Phase 4 and later.

Suggested stack (not final): Next.js, PostgreSQL, Supabase (auth + row-level security).

## 1. Design principles from KINGSOK's charter and decisions

- Roles are defined by the work required, not by titles.
- Every duty has one named owner.
- One person can hold several roles (the team is small), and some duties are temporary.
- Sector supervisors are strictly accountable, so they need the authority to assign work and demand reports.
- Monitoring is for formation and feedback, not policing.
- Recognition is based on results and quality, not activity counts alone.
- Discipline follows three executive warnings. At each step the cause is investigated first, support is given, and termination is the last step and needs Okoye's approval.

## 2. Group A: People and access

| Table | Key columns | Notes |
|---|---|---|
| `profiles` [MVP] | auth_user_id, full_name, phone, photo_url, status (active, probation, suspended, exited), joined_at, level_id | One row per person |
| `access_roles` [MVP] | key, name, description, is_system (bool) | Named bundles of permissions, separate from work roles. **Okoye can create, rename and edit access roles from the admin screen** and choose which permissions each one has. Seed only: admin, member. Others (exco, supervisor, monitor) are examples he may create |
| `permissions` [MVP] | key, description, is_sensitive (bool) | Fixed list in code, granular per area. Examples: `org.edit`, `roles.edit`, `duties.edit`, `assignments.edit`, `rules.edit`, `points.edit`, `people.invite`, `task.assign`, `report.review`, `announcement.publish`, `results.approve`, `warning.issue`, `access.grant`. Sensitive ones (`access.grant`, `rules.edit`, `points.edit`) are admin-only by default |
| `permission_grants` [MVP] | profile_id, permission_id, scope_type (global, unit, work_role, location), scope_id, granted_by, expires_at (nullable), status | **Delegation.** Lets Okoye give one person one permission over one thing, for example "may edit the Accommodation Foreman role" or "may assign tasks in Properties". Works alongside access roles |
| `access_role_permissions` [MVP] | access_role_id, permission_id | Which access role gets which permission |
| `profile_access_roles` [MVP] | profile_id, access_role_id, org_unit_id (nullable) | Scope a role to one unit, for example supervisor of Properties only |
| `invitations` [MVP] | contact (email or phone), invited_by, access_role_id, org_unit_id, token, expires_at, accepted_at, status | **Signup is invite-only.** There is no public signup. A profile is created only when an invitation is accepted. Only admin and supervisors (with permission) can invite |

**Delegation rules (enforced in the database):**
1. A person can only grant permissions they hold themselves, and only within their own scope. No one can grant more than they have.
2. Sensitive permissions can only be granted by admin.
3. Grants can expire, and every grant or removal is written to `audit_log`.
4. Every edit screen checks permissions through one shared function that considers access roles and grants together.

**Unit membership:** a person belongs to a unit when they hold an access role scoped to that unit (`profile_access_roles.org_unit_id`). "Own unit" in every security rule means this. The invitation carries the unit and role, so membership is created when an invitation is accepted.

## 3. Group B: Organization (configurable)

| Table | Key columns | Notes |
|---|---|---|
| `unit_types` [MVP] | key, name | Editable. Seed: sector, team, central_team |
| `org_units` [MVP] | unit_type_id, parent_id, name, description, goals (text), branding (jsonb), status | A tree: sectors, teams, central teams. Seed: Accommodation, Properties, Publicity (central), Monitoring (central) |
| `work_group_channels` [MVP] | work_group_id, channel_name, invite_link | Visible only to people assigned to the group, unit supervisors and admin |
| `locations` [MVP] | org_unit_id, name, area, notes, status | Used by Accommodation: each foreman is mapped to locations |
| `work_groups` [MVP] | org_unit_id, name, owner_profile_id, status | Used by Properties: groups run by group managers. **Confirmed: a group is a WhatsApp channel.** The channel name or link is stored separately in `work_group_channels`, because row security cannot hide a single column. The system does not integrate with WhatsApp, so proof of posting is a screenshot uploaded as task evidence |

## 4. Group C: Work roles and duties (configurable)

| Table | Key columns | Notes |
|---|---|---|
| `work_roles` [MVP] | name, purpose, org_unit_id (null = organization-wide), reports_to_role_id, authority_notes, is_temporary, status | Defined by the work required |
| `duties` [MVP] | work_role_id, title, description, expected_output, success_measure, frequency (daily, weekly, event), is_temporary, ends_at | Each duty answers: what, why, how, when, how it is measured |
| `role_assignments` [MVP] | profile_id, work_role_id, org_unit_id, location_id (nullable), work_group_id (nullable), is_primary, starts_at, ends_at | A person may hold several; temporary ones end cleanly (for example delivery duty) |
| `skills` [V2] | name, description | Skill catalogue |
| `role_skills` [V2] | work_role_id, skill_id, required_level | Skills a role needs |

## 5. Group D: Tasks, reports and intel

Task status flow (fixed): `assigned` → `accepted` → `in_progress` ⇄ `blocked` → `submitted` → `verified` or `needs_revision` → `done`. Also `cancelled`.

**Transition rules, enforced in the database (not only the interface):**

| From → To | Who may do it |
|---|---|
| assigned → accepted | The task owner only |
| accepted / in_progress ⇄ blocked | The task owner. Blocking requires a reason and who it is waiting on |
| in_progress → submitted | The task owner. Evidence is required if the task's acceptance criteria say so |
| submitted → verified or needs_revision | The verifier only. **The verifier can never be the owner** |
| verified → done | The system, automatically |
| any → cancelled | The assigner or admin, with a reason |

Every transition writes a `task_updates` row. Invalid transitions are rejected.

| Table | Key columns | Notes |
|---|---|---|
| `task_templates` [MVP] | duty_id, title, description, acceptance_criteria, recurrence_rule, default_due_time | Generates recurring tasks |
| `tasks` [MVP] | template_id, org_unit_id, owner_id, assigned_by, verifier_id, title, description, acceptance_criteria, priority, due_at, status, blocked_reason, blocked_on_profile_id, blocked_on_unit_id, location_id, work_group_id, verified_at | One owner per task |
| `task_updates` [MVP] | task_id, author_id, note, from_status, to_status | Full history |
| `task_evidence` [MVP] | task_id (or report_id), file_url, kind (photo, video, screenshot, document, link), note | Proof of work, such as inspection videos |
| `daily_targets` [MVP] | profile_id, target_date, target_text, task_id (nullable), achieved (bool), result_text, confirmed_by, confirmed_at | Daily goals. Points are credited only after a supervisor confirms |
| `daily_reports` [MVP] | profile_id, report_date, planned, accomplished, unfinished, blockers, help_needed, next_action, submitted_at, reviewed_by, review_note, status (submitted, reviewed, late, missed) | One per person per day. Report timing comes from `rule_settings` |
| `intel_reports` [MVP] | org_unit_id, author_id, category, summary, details, urgency, forwarded_at, acknowledged_by, acknowledged_at | Intel and feedback flowing from sectors to headquarters |
| `result_types` [MVP] | name, description, org_unit_id (nullable), active | Editable by admin. Each sector can define what counts as a result |
| `results_log` [MVP] | org_unit_id, result_type_id, description, submitted_by, approved_by, approved_at, status (pending, approved, rejected) | A result entry. Proof is uploaded as files in the private evidence storage, linked through `task_evidence`-style records (`result_evidence`: results_log_id, file_url, kind). Approval needs `results.approve`, and approved_by must differ from submitted_by. `result_logged` points fire only on approval |

## 6. Group E: Communication

| Table | Key columns | Notes |
|---|---|---|
| `announcements` [MVP] | author_id, title, body, audience (all, unit, role), audience_ref, requires_ack, published_at | Official messages |
| `announcement_acks` [MVP] | announcement_id, profile_id, acknowledged_at | Who has read it |
| `task_comments` [MVP] | task_id, author_id, body | Discussion stays attached to the work |
| `escalations` [V2] | task_id, raised_by, raised_to, reason, due_at, status, resolution, resolved_at | For blocked work that is not resolved in time |
| `notifications` [MVP] | profile_id, type, title, body, link, read_at | In-app now, WhatsApp-style push later |

## 7. Group F: Rules and authority (configurable)

| Table | Key columns | Notes |
|---|---|---|
| `rule_settings` [MVP] | key, value (jsonb), scope_unit_id (nullable), description, updated_by | Seed examples: `warning_limit` = 3, `report_due_time`, `late_report_grace_hours`. Unit scope overrides the global value |
| `authority_limits` [V2] | work_role_id, action_key, limit_amount (nullable), approver_role_id | What a role may decide alone (spending, pricing, assigning, bringing in people) |
| `decision_log` [V2] | title, decision, rationale, decided_by, decided_at, affects_unit_id | Decisions that must not get lost |

## 8. Group G: Accountability

| Table | Key columns | Notes |
|---|---|---|
| `warnings` [V2] | profile_id, level (1 to limit), issued_by, issued_at, reason, cause_category (unclear_duty, skill_gap, resource_gap, willingness, other), cause_notes, support_plan, review_date, person_response, status | Written record, cause found first |
| `improvement_plans` [V2] | profile_id, warning_id, goals, support_given, starts_at, ends_at, outcome | The chance to grow |
| `exit_records` [V2] | profile_id, decision, linked_warning_ids, approved_by (must be admin), decided_at, notes | Termination cannot happen without admin approval |
| `reviews` [V2] | profile_id, period, reviewer_id, notes, outcome | Periodic performance review |

## 9. Group H: Rewards, learning and growth (configurable)

| Table | Key columns | Notes |
|---|---|---|
| `point_rules` [MVP] | key, name, points, trigger (learning_done, daily_target_met, task_verified, result_logged, innovation_approved, pattern_approved), conditions (jsonb), weekly_cap (nullable), requires_independent_verifier (bool), active | Values set by Okoye. Any numbers in seed data are drafts only |
| `point_ledger` [MVP] | profile_id, point_rule_id, points, reason, source_type, source_id, awarded_by, awarded_at | Append-only. A person's total is calculated, never edited directly |
| `levels` [V2] | name, sort_order, min_points, requirements (jsonb), perks | Sequential growth. Names set by Okoye |
| `innovations` [V2] | profile_id, kind (solution, pattern), title, description, evidence, status (pending, approved, rejected), reviewed_by, points_awarded | Reviewed by Monitoring before points are given |
| `learning_tasks` [V2] | title, description, skill_id, content_url, due_at | |
| `learning_progress` [V2] | profile_id, learning_task_id, status, completed_at | |
| `profile_skills` [V3] | profile_id, skill_id, level, verified_by | |
| `recognitions` [MVP] | profile_id, kind (weekly, monthly, special), period, note | Recognition board entries |
| `team_goals` [V2] | org_unit_id, title, target, period_start, period_end, status, bonus_points | Shared goals, so recognition is not only individual |

**Point safeguards (enforced in the database):**
1. A point is awarded once per source event (unique on source_type + source_id + rule).
2. Points that depend on verification are never given for work the person verified themselves.
3. Weekly caps apply per rule where set.
4. Self-reported items (for example daily targets) are worth less than independently verified work.
5. Points are only created by system triggers or by an admin with a written reason. Nobody edits the ledger.
6. Leaderboards show level and progress, with team goals alongside individual rank. KINGSOK's charter puts unity over competition, so ranking alone must not be the main display.

## 10. Group I: Feedback, monitoring and knowledge

| Table | Key columns | Notes |
|---|---|---|
| `feedback` [V2] | from_profile_id, to_profile_id, task_id (nullable), kind (peer, leader, monitor), body | Short feedback after major tasks |
| `knowledge_documents` [V3] | title, category, owner_id, current_version, status | Charter, procedures, strategies |
| `knowledge_versions` [V3] | document_id, version, body or file_url, approved_by, approved_at | Version history and approval |

**Views (calculated, not stored)** [V2]: on-time task rate, report submission rate, blocked-task count by unit, points per period, warning counts. The Monitoring team and leaders use these.

## 11. Group J: System

| Table | Key columns | Notes |
|---|---|---|
| `audit_log` [MVP] | actor_id, table_name, record_id, action, old_data, new_data, at | Filled by triggers on every configurable table |

## 11A. Scheduled jobs [MVP]

| Job | When | What it does |
|---|---|---|
| Generate recurring tasks | Daily, early morning | Creates tasks from `task_templates` and daily targets from duties |
| Mark late and missed reports | After the cutoff in `rule_settings` | Sets reports to late or missed, notifies the person and supervisor |
| Overdue task alerts | Hourly | Notifies owner and supervisor of overdue tasks |
| Blocked-task nudge | Daily | Reminds the blocking party of waiting tasks |

Job timing comes from `rule_settings`, not from code.

## 12. Admin screens required (this is what makes it editable)

[MVP] Organization units, work roles and duties, role assignments, rule settings, point rules, people and access, announcements, **access roles and permission grants** (create access roles, choose their permissions, grant a permission to one person for one scope, see and revoke grants).
[V2] Levels, authority limits, warning templates, task templates, decision log.

Each screen supports create, edit, archive, and shows change history from `audit_log`.

## 12A. Member and leader screens [MVP]

- Login (invite-only) and accept-invitation
- Member dashboard: today's priorities, my tasks, my report status, my points and level
- Task list and task detail (accept, update, block, submit with evidence)
- Daily targets and daily report form (short, mobile-first, around two minutes)
- Announcements and notifications
- Recognition board (level, progress and team goals shown with rank)
- Leader dashboard: unit tasks, overdue and blocked items, report status, intel inbox
- Intel report form and intel inbox for headquarters

## 13. Row-level security (summary)

The roles below describe defaults. Actual access comes from each person's access roles plus any permission grants, so Okoye can change who can do what without code.

- **Member:** reads own profile, own tasks, own reports, own points. Writes own reports and task updates.
- **Supervisor:** reads and assigns within own unit. Reviews reports. Sends intel to headquarters.
- **Exco:** reads across units. Monitors foremen. Can issue warnings if granted `warning.issue`.
- **Monitor:** reads effectiveness data and feedback across units. Reviews innovations. Cannot edit configuration.
- **Admin (Okoye):** full access, including all configuration and approval of exits.

## 14. Seed data to load first

These replace the "foundation draft". Names are placeholders until Okoye confirms.

- **org_units:** Accommodation, Properties, Publicity (central), Monitoring (central).
- **work_roles, duties, Excos, level names:** not seeded. Okoye creates them in the admin screens. If sample data is needed for testing, label it clearly as sample and keep it separate from live data.
- **rule_settings:** `warning_limit` = 3. `report_due_time` and `late_report_grace_hours` exist as keys, with values to be set by Okoye.
- **point_rules (from Okoye's criteria):** finishing learning tasks, meeting daily goals or targets, getting results, innovative solutions, new pattern discoveries. Create one rule for each of the five. **Point values are drafts and must be confirmed by Okoye before launch.**
- **access_roles:** admin and member only. Everything else is created by Okoye in the admin screen.
- **first admin:** Okoye, created through the one-time bootstrap step.

## 15. Open items for Okoye

None block the build. Okoye is deciding roles, Excos, temporary duties, point values and level names later and will enter them through the admin screens.

Placeholders to keep clearly marked as unconfirmed: report deadline, grace hours, all point values. Point rules stay inactive until Okoye switches them on.

Resolved: a Properties group is a WhatsApp channel.

## 16. Instructions for Gemini

1. Read this file fully. Do not alter the schema. Raise anything unclear instead of guessing.
2. Produce an ordered build plan for the **[MVP]** items only, as small tasks. Each task must include: goal, tables, **row-level security policies for those tables**, **the screens for that feature**, acceptance checks, and tests.
3. Order:
   1. Foundation A: project setup, staging and live environments, email login, password reset, audit log
   2. Foundation B: unit types and org units, profiles, access roles, permissions, permission grants, invitations, first-admin bootstrap, accept-invitation, private evidence storage, with the admin screens (people and access, access roles and grants, organization units)
   3. Locations, work groups and channels, with admin screen
   4. Work roles, duties and assignments, with admin screens
   5. Rule settings, with admin screen
   6. Tasks, templates, updates, evidence and comments, with database-enforced status transitions and member task screens
   7. Daily targets, daily reports, results log and intel reports, with member and leader screens
   8. Announcements and notifications, with screens
   9. Scheduled jobs (recurring tasks, late and missed reports, overdue alerts)
   10. Points, point rules, ledger with safeguards, recognition board
   11. Member and leader dashboards
   12. Full security and integration testing, including a backup restore drill on staging
4. Each task must say what a tester can see and do when it is finished.
