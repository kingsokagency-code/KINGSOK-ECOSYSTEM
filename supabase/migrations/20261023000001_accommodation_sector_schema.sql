-- ==============================================================================
-- KINGSOK Workforce System: Migration 20261023000001
-- Scope: Accommodation Sector Operational MVP - Assets, Roles & Field Logs
-- ==============================================================================

-- 1. Create org_units table if not exists
CREATE TABLE IF NOT EXISTS public.org_units (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed Accommodation Sector
INSERT INTO public.org_units (name, description, status)
VALUES ('Accommodation', 'Residential housing, facility management, and area controller operations.', 'active')
ON CONFLICT (name) DO NOTHING;

-- Attach audit trigger to org_units
DROP TRIGGER IF EXISTS trg_audit_org_units ON public.org_units;
CREATE TRIGGER trg_audit_org_units
AFTER INSERT OR UPDATE OR DELETE ON public.org_units
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log_tracker();

-- 2. Create locations (House Assets) table
CREATE TABLE IF NOT EXISTS public.locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_unit_id uuid REFERENCES public.org_units(id) ON DELETE CASCADE,
    name text NOT NULL,
    area text NOT NULL,
    address text,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'vacant', 'maintenance', 'archived')),
    notes text,
    assigned_controller_name text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_locations_org_unit ON public.locations(org_unit_id);
CREATE INDEX IF NOT EXISTS idx_locations_area ON public.locations(area);
CREATE INDEX IF NOT EXISTS idx_locations_status ON public.locations(status);

-- Attach audit trigger to locations
DROP TRIGGER IF EXISTS trg_audit_locations ON public.locations;
CREATE TRIGGER trg_audit_locations
AFTER INSERT OR UPDATE OR DELETE ON public.locations
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log_tracker();

-- 3. Create asset_field_logs (House Visit Records) table
CREATE TABLE IF NOT EXISTS public.asset_field_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
    controller_id uuid,
    controller_name text NOT NULL DEFAULT 'Area Controller',
    visit_date timestamptz NOT NULL DEFAULT now(),
    occupancy_status text NOT NULL CHECK (occupancy_status IN ('occupied', 'vacant', 'partial')),
    condition_rating text NOT NULL CHECK (condition_rating IN ('excellent', 'good', 'fair', 'poor')),
    summary text,
    issues_reported text,
    urgent_flag boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_field_logs_location ON public.asset_field_logs(location_id);
CREATE INDEX IF NOT EXISTS idx_field_logs_visit_date ON public.asset_field_logs(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_field_logs_urgent ON public.asset_field_logs(urgent_flag);

-- Attach audit trigger to asset_field_logs
DROP TRIGGER IF EXISTS trg_audit_asset_field_logs ON public.asset_field_logs;
CREATE TRIGGER trg_audit_asset_field_logs
AFTER INSERT OR UPDATE OR DELETE ON public.asset_field_logs
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log_tracker();

-- 4. Create work_roles and duties tables
CREATE TABLE IF NOT EXISTS public.work_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_unit_id uuid REFERENCES public.org_units(id) ON DELETE SET NULL,
    name text NOT NULL UNIQUE,
    purpose text,
    is_temporary boolean NOT NULL DEFAULT false,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_audit_work_roles ON public.work_roles;
CREATE TRIGGER trg_audit_work_roles
AFTER INSERT OR UPDATE OR DELETE ON public.work_roles
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log_tracker();

CREATE TABLE IF NOT EXISTS public.duties (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    work_role_id uuid NOT NULL REFERENCES public.work_roles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    expected_output text NOT NULL,
    success_measure text NOT NULL,
    frequency text NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'event')),
    created_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_audit_duties ON public.duties;
CREATE TRIGGER trg_audit_duties
AFTER INSERT OR UPDATE OR DELETE ON public.duties
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log_tracker();

-- 5. Create field_feedback table (Daily Field Reports / Feedback from Controllers)
CREATE TABLE IF NOT EXISTS public.field_feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id uuid,
    author_name text NOT NULL,
    role_title text NOT NULL DEFAULT 'Area Controller',
    accomplished text NOT NULL,
    blockers text,
    urgent_needs text,
    created_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_audit_field_feedback ON public.field_feedback;
CREATE TRIGGER trg_audit_field_feedback
AFTER INSERT OR UPDATE OR DELETE ON public.field_feedback
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log_tracker();

-- 6. Row-Level Security Policies
ALTER TABLE public.org_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_field_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_feedback ENABLE ROW LEVEL SECURITY;

-- Permissive authenticated read and write for operational MVP
CREATE POLICY "authenticated_select_org_units" ON public.org_units FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "authenticated_all_locations" ON public.locations FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_asset_field_logs" ON public.asset_field_logs FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_select_work_roles" ON public.work_roles FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "authenticated_select_duties" ON public.duties FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "authenticated_all_field_feedback" ON public.field_feedback FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 7. Seed initial roles, duties, and house assets for Accommodation
DO $$
DECLARE
    v_acc_id uuid;
    v_controller_role_id uuid;
    v_supervisor_role_id uuid;
BEGIN
    SELECT id INTO v_acc_id FROM public.org_units WHERE name = 'Accommodation' LIMIT 1;

    -- Seed Work Roles
    INSERT INTO public.work_roles (org_unit_id, name, purpose, is_temporary)
    VALUES 
        (v_acc_id, 'Area Controller', 'Inspect assigned houses, record asset conditions, identify tenant needs, and maintain on-site order.', false)
    ON CONFLICT (name) DO UPDATE SET purpose = EXCLUDED.purpose
    RETURNING id INTO v_controller_role_id;

    INSERT INTO public.work_roles (org_unit_id, name, purpose, is_temporary)
    VALUES 
        (v_acc_id, 'Accommodation Supervisor', 'Lead and coordinate area controllers, resolve maintenance escalations, and verify house records.', false)
    ON CONFLICT (name) DO UPDATE SET purpose = EXCLUDED.purpose
    RETURNING id INTO v_supervisor_role_id;

    -- Seed Duties for Area Controller
    IF v_controller_role_id IS NOT NULL THEN
        DELETE FROM public.duties WHERE work_role_id = v_controller_role_id;

        INSERT INTO public.duties (work_role_id, title, description, expected_output, success_measure, frequency)
        VALUES
            (v_controller_role_id, 'Daily House & Asset Inspection', 'Visit each assigned house, inspect structural & utility condition, and verify occupancy.', 'Real-time asset log entry submitted on the web for every visited house.', '100% of assigned houses logged with verified status by 5:00 PM daily.', 'daily'),
            (v_controller_role_id, 'Urgent Maintenance & Hazard Flagging', 'Identify broken plumbing, electrical faults, leaks, or security breaches and report immediately.', 'Immediate field log marked as urgent with photos and specific issue description.', 'Zero unflagged critical repairs lasting over 24 hours.', 'daily'),
            (v_controller_role_id, 'End-of-Round Feedback & Alignment', 'Submit end-of-day summary of accomplished house visits, blockers, and supervisor support needed.', 'Completed daily field feedback submission taking under 2 minutes.', 'Daily feedback submitted before leaving the sector.', 'daily');
    END IF;

    -- Seed Initial Sample House Assets
    IF v_acc_id IS NOT NULL THEN
        INSERT INTO public.locations (org_unit_id, name, area, address, status, notes, assigned_controller_name)
        VALUES
            (v_acc_id, 'Unit 101 - Green Ridge Lodge', 'Phase 1 - North Sector', '14 King Avenue, Phase 1', 'active', '4-bedroom shared housing. Water supply fully functioning.', 'Area Controller 1'),
            (v_acc_id, 'Unit 102 - Apex Heights', 'Phase 1 - North Sector', '16 King Avenue, Phase 1', 'active', '3-bedroom executive flat. Tenant inspection due this week.', 'Area Controller 1'),
            (v_acc_id, 'Unit 201 - Sunrise Villa', 'Phase 2 - South Wing', '22 Sunrise Crescent, Phase 2', 'vacant', 'Cleaned and ready for new intake. Keys with site foreman.', 'Area Controller 2'),
            (v_acc_id, 'Unit 202 - Palm Court Block A', 'Phase 2 - South Wing', '25 Palm Grove, Phase 2', 'maintenance', 'Plumbing maintenance in master bath underway.', 'Area Controller 2'),
            (v_acc_id, 'Unit 305 - Oasis Chambers', 'Phase 3 - Central', '8 Oasis Way, Phase 3', 'active', 'Fully occupied. Routine check completed last week.', 'Area Controller 3')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
