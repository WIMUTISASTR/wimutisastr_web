-- Create audit_logs table for tracking sensitive operations
-- This table is append-only and should never be modified or deleted

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  target_id UUID,
  target_type TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created ON public.audit_logs(actor_id, created_at DESC);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_action_created 
  ON public.audit_logs(actor_id, action, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
  );

-- Policy: Service role can insert audit logs (for server-side logging)
CREATE POLICY "Service role can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Policy: No updates or deletes allowed (append-only table)
-- This ensures audit trail integrity

-- Create a view for easier querying
CREATE OR REPLACE VIEW public.audit_logs_summary AS
SELECT 
  actor_id,
  actor_email,
  action,
  COUNT(*) as count,
  MAX(created_at) as last_occurrence,
  MIN(created_at) as first_occurrence
FROM public.audit_logs
GROUP BY actor_id, actor_email, action;

-- Grant access to the view for admins
ALTER VIEW public.audit_logs_summary OWNER TO postgres;

-- Create a function to get audit logs for a specific user (admin only)
CREATE OR REPLACE FUNCTION public.get_user_audit_trail(user_id UUID)
RETURNS TABLE (
  id UUID,
  action TEXT,
  actor_email TEXT,
  target_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT ((auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin') THEN
    RAISE EXCEPTION 'Only admins can view audit trails';
  END IF;

  RETURN QUERY
  SELECT 
    al.id,
    al.action,
    al.actor_email,
    al.target_id,
    al.details,
    al.ip_address,
    al.created_at
  FROM public.audit_logs al
  WHERE al.actor_id = user_id OR al.target_id = user_id
  ORDER BY al.created_at DESC
  LIMIT 1000;
END;
$$;

-- Create a function to clean up old audit logs (keep 2 years)
-- Run this periodically via cron job
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Only service role can run this
  IF auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Only service role can cleanup audit logs';
  END IF;

  -- Delete audit logs older than 2 years
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - INTERVAL '2 years';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Add comment to table
COMMENT ON TABLE public.audit_logs IS 'Audit trail for sensitive operations. Append-only table for compliance.';
COMMENT ON COLUMN public.audit_logs.action IS 'Type of action performed (e.g., MEMBERSHIP_APPROVED, PAYMENT_VERIFIED)';
COMMENT ON COLUMN public.audit_logs.actor_id IS 'User who performed the action';
COMMENT ON COLUMN public.audit_logs.target_id IS 'User or resource affected by the action';
COMMENT ON COLUMN public.audit_logs.details IS 'Additional context about the action (JSON)';
