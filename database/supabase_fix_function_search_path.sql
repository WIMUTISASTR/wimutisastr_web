-- =============================================================================
-- Fix Function Search Path Security Issue
-- =============================================================================
-- Issue: Function `cleanup_old_audit_logs` has a mutable search_path
-- Risk: Attackers could manipulate the search_path to execute malicious code
-- Fix: Set an immutable search_path on the function
-- =============================================================================

-- Must DROP first to change function signature
DROP FUNCTION IF EXISTS public.cleanup_old_audit_logs();

-- Recreate the function with a fixed search_path
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- Fixes the mutable search_path issue
AS $$
BEGIN
  -- Delete audit logs older than 90 days
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Ensure only service role can execute this function
REVOKE EXECUTE ON FUNCTION public.cleanup_old_audit_logs() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_audit_logs() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_audit_logs() FROM anon;

-- =============================================================================
-- Also fix has_approved_membership function if it exists (add search_path)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.has_approved_membership()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public  -- Add fixed search_path
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.id = auth.uid()
      AND up.membership_status = 'approved'
  );
$$;

-- =============================================================================
-- Verification
-- =============================================================================
SELECT 'OK: Fixed function search_path issues' AS status;
