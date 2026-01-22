-- Fix payment_proofs table permissions
-- Run this if you already created the table and are getting permission errors

-- Drop foreign key constraints if they exist
ALTER TABLE payment_proofs 
  DROP CONSTRAINT IF EXISTS payment_proofs_user_id_fkey;

ALTER TABLE payment_proofs 
  DROP CONSTRAINT IF EXISTS payment_proofs_verified_by_fkey;

-- Drop and recreate admin policies to avoid auth.users access
DROP POLICY IF EXISTS "Admins can view all payment proofs" ON payment_proofs;
DROP POLICY IF EXISTS "Admins can update payment proofs" ON payment_proofs;
DROP POLICY IF EXISTS "Users can view own payment proofs" ON payment_proofs;
DROP POLICY IF EXISTS "Users can insert own payment proofs" ON payment_proofs;

-- Recreate admin policies using JWT metadata (no auth.users access needed)
CREATE POLICY "Admins can view all payment proofs"
  ON payment_proofs
  FOR SELECT
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
  );

CREATE POLICY "Admins can update payment proofs"
  ON payment_proofs
  FOR UPDATE
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
  );

-- Recreate user policies
CREATE POLICY "Users can view own payment proofs"
  ON payment_proofs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment proofs"
  ON payment_proofs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add membership tracking columns (safe to run multiple times)
ALTER TABLE payment_proofs
  ADD COLUMN IF NOT EXISTS membership_starts_at TIMESTAMPTZ;

ALTER TABLE payment_proofs
  ADD COLUMN IF NOT EXISTS membership_ends_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_payment_proofs_membership_ends_at ON payment_proofs(membership_ends_at DESC);

-- Only one pending proof per user at a time
-- If you already have duplicates, clean them up first (keep the newest pending per user).
WITH ranked AS (
  SELECT
    id,
    user_id,
    uploaded_at,
    row_number() OVER (
      PARTITION BY user_id
      ORDER BY uploaded_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
    ) AS rn
  FROM payment_proofs
  WHERE status = 'pending'
)
UPDATE payment_proofs p
SET
  status = 'rejected',
  notes = COALESCE(p.notes, '') || CASE WHEN p.notes IS NULL OR p.notes = '' THEN '' ELSE E'\n' END ||
          'Auto-rejected duplicate pending proof (kept newest pending).'
FROM ranked r
WHERE p.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS ux_payment_proofs_one_pending_per_user
  ON payment_proofs(user_id)
  WHERE status = 'pending';

-- Ensure updated_at trigger exists (re-runnable)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_payment_proofs_updated_at ON payment_proofs;
CREATE TRIGGER update_payment_proofs_updated_at
  BEFORE UPDATE ON payment_proofs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
