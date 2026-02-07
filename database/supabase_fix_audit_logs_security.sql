-- =============================================================================
-- Fix Security Issues in Audit Logs
-- =============================================================================
-- Issues addressed:
-- 1. SECURITY DEFINER view (audit_logs_summary) - runs with creator's permissions
-- 2. RLS policy referencing user_metadata - editable by end users, insecure
-- =============================================================================

-- =============================================================================
-- ISSUE 1: Fix SECURITY DEFINER View
-- =============================================================================
-- Drop the existing view and recreate without SECURITY DEFINER
-- This ensures the view respects the querying user's permissions

DROP VIEW IF EXISTS public.audit_logs_summary;

-- Recreate the view with SECURITY INVOKER (default, respects caller's permissions)
CREATE OR REPLACE VIEW public.audit_logs_summary AS
SELECT 
  action,
  COUNT(*) as count,
  DATE_TRUNC('day', created_at) as date
FROM public.audit_logs
GROUP BY action, DATE_TRUNC('day', created_at)
ORDER BY date DESC, count DESC;

-- Explicitly set SECURITY INVOKER (optional but makes intent clear)
ALTER VIEW public.audit_logs_summary SET (security_invoker = on);

-- =============================================================================
-- ISSUE 2: Fix RLS Policy Referencing user_metadata
-- =============================================================================
-- user_metadata is editable by end users and should NOT be used for security
-- Instead, use a secure admin check via a separate admin table or app_metadata

-- First, drop the insecure policy
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

-- Option A: Use app_metadata (set by server only, not editable by users)
-- This is the recommended approach if you set admin role via Supabase Auth

-- Create a secure function to check if user is admin via app_metadata
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- Revoke execute from public, grant only to authenticated users
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Create the new secure RLS policy using app_metadata instead
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- Alternative Option B: Use an admin_users table (more explicit control)
-- =============================================================================
-- If you prefer a separate admin table, uncomment the following:

/*
-- Create admin users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only service role can manage admin_users
CREATE POLICY "Service role manages admins"
  ON public.admin_users
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create secure function to check admin status via table
CREATE OR REPLACE FUNCTION public.is_admin_via_table()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
  );
$$;

-- Then use this in the policy instead:
-- CREATE POLICY "Admins can view audit logs"
--   ON public.audit_logs
--   FOR SELECT
--   TO authenticated
--   USING (public.is_admin_via_table());
*/

-- =============================================================================
-- Verification
-- =============================================================================
SELECT 'OK: Fixed audit_logs security issues' AS status;
