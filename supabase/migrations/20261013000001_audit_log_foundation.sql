-- ==============================================================================
-- KINGSOK Workforce System: Migration 20261013000001
-- Scope: Task 1A - Audit Log Foundation & Reusable Tracking Trigger
-- Source of Truth: 02-data-model.md (v1.3) & 03-antigravity-handoff-task-1A.md
-- ==============================================================================

-- 1. Create audit_log table
-- Note: actor_id is an unconstrained UUID (no foreign key cascade/set null)
-- to ensure historical audit records remain immutable even if an auth account is deleted.
CREATE TABLE IF NOT EXISTS public.audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id uuid,
    table_name text NOT NULL,
    record_id text NOT NULL,
    action text NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
    old_data jsonb,
    new_data jsonb,
    at timestamptz NOT NULL DEFAULT now()
);

-- Indexing for fast administrative search and temporal filtering
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON public.audit_log (table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_at ON public.audit_log (at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON public.audit_log (actor_id);

-- 2. Reusable trigger function for automatic audit logging
-- SECURITY DEFINER allows this trusted function to insert into audit_log
-- even when direct client writes are denied.
-- search_path is strictly pinned with pg_catalog leading to prevent function shadowing.
CREATE OR REPLACE FUNCTION public.fn_audit_log_tracker()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
    v_actor_id uuid;
    v_record_id text;
    v_old_data jsonb := null;
    v_new_data jsonb := null;
    v_action text;
BEGIN
    -- Determine actor id from Supabase auth session
    v_actor_id := auth.uid();

    -- Normalize TG_OP to lowercase ('insert', 'update', 'delete') matching CHECK constraint
    v_action := pg_catalog.lower(TG_OP);

    IF v_action = 'insert' THEN
        v_new_data := pg_catalog.to_jsonb(NEW);
        v_record_id := COALESCE(v_new_data->>'id', 'unknown');

        INSERT INTO public.audit_log (actor_id, table_name, record_id, action, old_data, new_data, at)
        VALUES (v_actor_id, TG_TABLE_NAME, v_record_id, v_action, null, v_new_data, pg_catalog.now());
        RETURN NEW;

    ELSIF v_action = 'update' THEN
        v_old_data := pg_catalog.to_jsonb(OLD);
        v_new_data := pg_catalog.to_jsonb(NEW);
        v_record_id := COALESCE(v_new_data->>'id', v_old_data->>'id', 'unknown');

        INSERT INTO public.audit_log (actor_id, table_name, record_id, action, old_data, new_data, at)
        VALUES (v_actor_id, TG_TABLE_NAME, v_record_id, v_action, v_old_data, v_new_data, pg_catalog.now());
        RETURN NEW;

    ELSIF v_action = 'delete' THEN
        v_old_data := pg_catalog.to_jsonb(OLD);
        v_record_id := COALESCE(v_old_data->>'id', 'unknown');

        INSERT INTO public.audit_log (actor_id, table_name, record_id, action, old_data, new_data, at)
        VALUES (v_actor_id, TG_TABLE_NAME, v_record_id, v_action, v_old_data, null, pg_catalog.now());
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$;

-- Strict Least-Privilege: Revoke direct execution from all unprivileged client roles
-- Triggers run within table trigger context and do NOT require direct client EXECUTE privileges.
REVOKE ALL ON FUNCTION public.fn_audit_log_tracker() FROM PUBLIC, anon, authenticated;

-- 3. Append-Only Protection: Trigger-enforced immutability for UPDATE, DELETE, and TRUNCATE
CREATE OR REPLACE FUNCTION public.fn_prevent_audit_log_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
    RAISE EXCEPTION 'audit_log is append-only: updates and deletes are prohibited.';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_mutation ON public.audit_log;
CREATE TRIGGER trg_prevent_audit_log_mutation
BEFORE UPDATE OR DELETE ON public.audit_log
FOR EACH ROW
EXECUTE FUNCTION public.fn_prevent_audit_log_mutation();

-- Dedicated statement-level trigger prohibiting TRUNCATE
CREATE OR REPLACE FUNCTION public.fn_prevent_audit_log_truncate()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
    RAISE EXCEPTION 'audit_log is append-only: truncate is prohibited.';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_truncate ON public.audit_log;
CREATE TRIGGER trg_prevent_audit_log_truncate
BEFORE TRUNCATE ON public.audit_log
FOR EACH STATEMENT
EXECUTE FUNCTION public.fn_prevent_audit_log_truncate();

-- 4. Schema Hardening: Prevent untrusted roles from creating objects in schema public
REVOKE CREATE ON SCHEMA public FROM PUBLIC, anon, authenticated;

-- 5. Row-Level Security & Grants:
-- Allow client SELECT at table level so RLS zero-row policy executes cleanly
GRANT SELECT ON public.audit_log TO anon, authenticated;

-- Strictly revoke direct client writes at SQL privilege level
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.audit_log FROM PUBLIC, anon, authenticated;

-- Privileged backend role retains full table access
GRANT ALL ON public.audit_log TO service_role;

-- Enable RLS: With no permissive SELECT policies added in Task 1A,
-- client SELECT returns 0 rows (empty array), not an authorization error.
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
